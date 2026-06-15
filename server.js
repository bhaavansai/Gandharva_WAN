const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const {
  getReceiptByDonationId,
  buildReceiptMessage,
} = require("./services/receiptService");
const { generateReceiptPdfFile } = require("./services/receiptPdfService");
const { execSync } = require("child_process");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT;

const AUTH_DATA_PATH = path.join(__dirname, ".wwebjs_auth");
const MAX_INIT_RETRIES = 5;
const INIT_RETRY_DELAY_MS = 8000;

let client;
let isReady = false;
let isInitializing = false;
let initRetries = 0;
let reinitTimer = null;

function createClient() {
  return new Client({
    authStrategy: new LocalAuth({
      dataPath: AUTH_DATA_PATH,
      rmMaxRetries: 20,
    }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--no-first-run",
        "--no-zygote",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-sync",
        "--disable-translate",
        "--hide-scrollbars",
        "--mute-audio",
      ],
      timeout: 120000,
    },
    webVersionCache: {
      type: "remote",
      remotePath:
        "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/{version}.html",
    },
    authTimeoutMs: 120000,
    qrMaxRetries: 10,
    takeoverOnConflict: true,
    takeoverTimeoutMs: 10000,
  });
}

function killOrphanedChrome() {
  if (process.platform !== "win32") return;
  const marker = ".wwebjs_auth";
  try {
    execSync(
      `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='chrome.exe'\\" | Where-Object { $_.CommandLine -like '*${marker}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`,
      { stdio: "ignore" },
    );
  } catch {
    // No orphaned puppeteer Chrome processes were running.
  }
}

async function removeDirWithRetry(dirPath, maxRetries = 10) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await fs.promises.rm(dirPath, {
        recursive: true,
        force: true,
        maxRetries: 5,
      });
      return true;
    } catch (err) {
      if (attempt === maxRetries) {
        console.warn(`⚠️ Could not remove ${dirPath}: ${err.message}`);
        return false;
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return false;
}

async function clearAuthSession() {
  const sessionDir = path.join(AUTH_DATA_PATH, "session");
  if (!fs.existsSync(sessionDir)) return;

  console.log("🧹 Clearing WhatsApp session data...");
  await destroyClient();
  killOrphanedChrome();
  await new Promise((r) => setTimeout(r, 2000));
  await removeDirWithRetry(sessionDir);
}

async function clearBrowserLockFiles() {
  const sessionDir = path.join(AUTH_DATA_PATH, "session");
  const lockFiles = ["DevToolsActivePort", "SingletonLock", "SingletonCookie"];
  for (const file of lockFiles) {
    const filePath = path.join(sessionDir, file);
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch {
        // Chrome may still be releasing the file on Windows.
      }
    }
  }
}

async function destroyClient() {
  if (!client) return;
  try {
    await client.destroy();
  } catch (err) {
    console.warn(`⚠️ Error while destroying client: ${err.message}`);
  }
}

function scheduleReinit(delayMs = INIT_RETRY_DELAY_MS) {
  if (reinitTimer) clearTimeout(reinitTimer);
  reinitTimer = setTimeout(() => {
    reinitTimer = null;
    startWhatsAppClient();
  }, delayMs);
}

function setupClientEvents(waClient) {
  waClient.on("qr", (qr) => {
    console.log("📲 Scan this QR code to log in:");
    qrcode.generate(qr, { small: true });
  });

  waClient.on("authenticated", () => {
    console.log("🔐 WhatsApp authenticated — waiting for sync...");
  });

  waClient.on("auth_failure", async (msg) => {
    console.error("❌ WhatsApp auth failure:", msg);
    isReady = false;
    await destroyClient();
    await clearAuthSession();
    scheduleReinit();
  });

  waClient.on("ready", () => {
    console.log("✅ WhatsApp Bot is ready!");
    isReady = true;
    initRetries = 0;
  });

  waClient.on("loading_screen", (percent, message) => {
    console.log(`⏳ Loading WhatsApp: ${percent}% — ${message}`);
  });

  waClient.on("disconnected", async (reason) => {
    console.warn(`⚠️ WhatsApp disconnected: ${reason}`);
    isReady = false;
    await destroyClient();
    if (reason === "LOGOUT") {
      await clearAuthSession();
    }
    scheduleReinit();
  });
}

async function startWhatsAppClient() {
  if (isInitializing) return;
  isInitializing = true;

  try {
    await clearBrowserLockFiles();
    killOrphanedChrome();
    client = createClient();
    setupClientEvents(client);
    await client.initialize();
  } catch (err) {
    console.error(
      `❌ WhatsApp initialize failed (attempt ${initRetries + 1}/${MAX_INIT_RETRIES}):`,
      err.message,
    );
    isReady = false;
    await destroyClient();

    const needsSessionReset =
      err.message.includes("browser is already running") ||
      err.message.includes("Execution context was destroyed") ||
      err.message.includes("Protocol error");

    if (initRetries < MAX_INIT_RETRIES) {
      initRetries++;
      if (needsSessionReset || initRetries >= 2) {
        await clearAuthSession();
      }
      scheduleReinit(INIT_RETRY_DELAY_MS * initRetries);
    } else {
      console.error(
        "❌ Max init retries reached. Stop all node/chrome processes and restart.",
      );
    }
  } finally {
    isInitializing = false;
  }
}

process.on("unhandledRejection", (reason) => {
  const message = reason?.message || String(reason);
  if (
    message.includes("Execution context was destroyed") ||
    message.includes("Protocol error")
  ) {
    console.warn("⚠️ Puppeteer navigation race — will retry initialization.");
    isReady = false;
    destroyClient().then(() => scheduleReinit(5000));
    return;
  }
  console.error("Unhandled rejection:", reason);
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  if (reinitTimer) clearTimeout(reinitTimer);
  await destroyClient();
  killOrphanedChrome();
  process.exit(0);
});

startWhatsAppClient();

async function sendMessageToNumber(number, message) {
  if (!isReady) throw new Error("WhatsApp client is not ready.");

  const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
  try {
    await client.sendMessage(chatId, message);
    console.log(`✅ Message sent to ${chatId}`);
    return { success: true, message: "Message sent successfully" };
  } catch (err) {
    console.error(`❌ Failed to send message to ${chatId}`, err);
    return { success: false, message: "Failed to send message", error: err };
  }
}

async function sendPdfToNumber(number, filePath, caption) {
  if (!isReady) throw new Error("WhatsApp client is not ready.");

  const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
  try {
    const media = MessageMedia.fromFilePath(filePath);
    await client.sendMessage(chatId, media, { caption });
    console.log(`✅ PDF receipt sent to ${chatId}: ${path.basename(filePath)}`);
    return { success: true, message: "PDF sent successfully" };
  } catch (err) {
    console.error(`❌ Failed to send PDF to ${chatId}`, err);
    throw err;
  }
}

function normalizeMobileNumber(number) {
  const digits = String(number).replace(/\D/g, "");
  if (!/^\d{10,15}$/.test(digits)) {
    throw new Error(
      "Invalid mobile number. Use country code + number, digits only (10–15 digits). Example: 919876543210",
    );
  }
  return digits;
}

app.post("/send-hello", async (req, res) => {
  const { name, mobileNumber } = req.body;

  if (!name || !mobileNumber) {
    return res.status(400).json({
      error: "Missing required fields: name, mobileNumber",
      format:
        "Country code + number, digits only. Example: 919876543210 (India), 12025550108 (US)",
    });
  }

  let normalizedNumber;
  try {
    normalizedNumber = normalizeMobileNumber(mobileNumber);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const message = `Hello ${name}, welcome to Gandharva School of Music!`;

  try {
    const result = await sendMessageToNumber(normalizedNumber, message);
    return res.json({ success: true, detail: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/send-receipt", async (req, res) => {
  const { donationId, mobileNumber } = req.body;

  if (!donationId || !mobileNumber) {
    return res.status(400).json({
      error: "Missing required fields: donationId, mobileNumber",
      format:
        "mobileNumber: country code + number, digits only. Example: 919876543210",
    });
  }

  let normalizedNumber;
  try {
    normalizedNumber = normalizeMobileNumber(mobileNumber);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  if (!isReady) {
    return res
      .status(503)
      .json({ success: false, error: "WhatsApp client is not ready." });
  }

  try {
    const receiptData = await getReceiptByDonationId(donationId);
    const caption = buildReceiptMessage(receiptData);
    const { filePath, fileName } = await generateReceiptPdfFile(receiptData);

    try {
      await sendPdfToNumber(normalizedNumber, filePath, caption);
      return res.json({
        success: true,
        receiptNumber: receiptData.receiptNumber,
        donorName: receiptData.donorName,
        fileName,
        detail: { success: true, message: "PDF receipt sent successfully" },
      });
    } finally {
      fs.promises.unlink(filePath).catch(() => {});
    }
  } catch (err) {
    const isClientError =
      err.message.includes("not found") ||
      err.message.includes("invalid") ||
      err.message.includes("Invalid donationId") ||
      err.message.includes("Invalid response");
    const status = isClientError ? 404 : 500;
    return res.status(status).json({ success: false, error: err.message });
  }
});

app.post("/send-learner", async (req, res) => {
  const {
    learnerName,
    learnerTimeZone,
    learnerNumber,
    tutorName,
    courseName,
    startTime,
    duration,
    gmeetLink,
  } = req.body;

  if (
    !learnerName ||
    !courseName ||
    !tutorName ||
    !startTime ||
    !duration ||
    !gmeetLink ||
    !learnerNumber ||
    !learnerTimeZone
  ) {
    return res.status(400).json({
      error:
        "Missing one of required fields: learnerName, courseName, tutorName, startTime, duration, gmeetLink, learnerNumber, learnerTimeZone",
    });
  }

  let startFormatted;
  try {
    startFormatted = new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: learnerTimeZone,
    }).format(new Date(startTime));
  } catch (e) {
    return res
      .status(400)
      .json({ error: "Invalid startTime or learnerTimeZone" });
  }

  const message = `
Hello ${learnerName},

Your ${courseName} class with ${tutorName} has been scheduled.

🗓️ Date & Time: ${startFormatted} (${learnerTimeZone})
⏱️ Duration: ${duration} hour(s)
📍 Google Meet Link: ${gmeetLink}

Please be on time. For any issues, feel free to reach out to your tutor.

Best regards,
Gandharva School of Music
  `.trim();

  try {
    const result = await sendMessageToNumber(learnerNumber, message);
    return res.json({ success: true, detail: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/status", (req, res) => {
  res.json({ status: isReady ? "ready" : "not ready" });
});

app.post("/send-tutor", async (req, res) => {
  const {
    learnerName,
    tutorName,
    tutorTimeZone,
    tutorNumber,
    courseName,
    startTime,
    duration,
    gmeetLink,
  } = req.body;

  if (
    !learnerName ||
    !tutorName ||
    !tutorNumber ||
    !courseName ||
    !startTime ||
    !duration ||
    !gmeetLink ||
    !tutorTimeZone
  ) {
    return res.status(400).json({
      error:
        "Missing one of required fields: learnerName, tutorName, tutorNumber, courseName, startTime, duration, gmeetLink, tutorTimeZone",
    });
  }

  let startFormatted;
  try {
    startFormatted = new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tutorTimeZone,
    }).format(new Date(startTime));
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Invalid startTime or tutorTimeZone" });
  }

  const message = `
Hello ${tutorName},

You have a scheduled ${courseName} class with ${learnerName}.

🗓️ Date & Time: ${startFormatted} (${tutorTimeZone})
⏱️ Duration: ${duration} hour(s)
📍 Google Meet Link: ${gmeetLink}

Please be prepared and on time for the session.

Best regards,
Gandharva School of Music
  `.trim();

  try {
    const result = await sendMessageToNumber(tutorNumber, message);
    return res.json({ success: true, detail: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`🌐 Express server running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `❌ Port ${PORT} is already in use. Stop the other process on that port and restart.`,
    );
    console.error(
      "   Tip: Close Live Server / old node instances, or run: netstat -ano | findstr :5500",
    );
  } else {
    console.error("❌ Server failed to start:", err.message);
  }
  process.exit(1);
});
