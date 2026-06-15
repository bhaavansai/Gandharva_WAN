require("dotenv").config();
const DONATION_API_BASE = process.env.DONATION_API_BASE;
const RECEIPT_PAGE_BASE = process.env.RECEIPT_PAGE_BASE;

function buildAddress(data) {
  const baseAddress = data?.donorAddress || "";
  const city = data?.city || data?.donorCity || "";
  const state = data?.state || data?.donorState || "";
  const suffix = [city, state].filter(Boolean).join(", ");
  return suffix
    ? `${baseAddress}${baseAddress ? ", " : ""}${suffix}`
    : baseAddress;
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString("en-IN");
}

function parseDonationId(donationId) {
  const id = String(donationId).trim();
  if (!/^\d+$/.test(id)) {
    throw new Error("Invalid donationId. It must be a numeric ID.");
  }
  return id;
}

async function parseJsonResponse(response) {
  const text = (await response.text()).trim();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid response from receipt server");
  }
}

async function getReceiptByDonationId(donationId) {
  const normalizedId = parseDonationId(donationId);
  const url = `${DONATION_API_BASE}/donation/receipt/${encodeURIComponent(normalizedId)}`;
  const response = await fetch(url);
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message =
      data?.error ||
      data?.details ||
      data?.message ||
      `Failed to fetch receipt (HTTP ${response.status})`;
    throw new Error(message);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`Receipt not found for donation ID ${normalizedId}`);
  }

  if (!data.receiptNumber || !String(data.receiptNumber).startsWith("ISK")) {
    throw new Error(
      "Receipt number is missing or invalid. Cannot send receipt.",
    );
  }

  return data;
}

function buildReceiptMessage(receiptData) {
  const address = buildAddress(receiptData);
  const pincode = receiptData.donorPIN || "N/A";
  const purpose = receiptData.purpose || "General";

  const lines = [
    "*ISKCON Dhanbad — Donation Receipt*",
    "",
    `Receipt No: ${receiptData.receiptNumber}`,
    `Date: ${formatDate(receiptData.paymentDate)}`,
    "",
    `Received from: ${receiptData.donorName || "N/A"}`,
    `Address: ${address || "N/A"}, PIN: ${pincode}`,
    `Mobile: ${receiptData.mobile || "N/A"}`,
  ];

  if (receiptData.email) lines.push(`Email: ${receiptData.email}`);
  if (receiptData.pan) lines.push(`PAN: ${receiptData.pan}`);

  lines.push(
    "",
    `Amount: ₹${formatAmount(receiptData.amount)} (${receiptData.paymentMode || "N/A"})`,
    `Purpose: ${purpose}`,
  );

  if (receiptData.transactionID) {
    lines.push(`Transaction ID: ${receiptData.transactionID}`);
  }

  lines.push("", "Thank you for your generous donation.", "Hare Krishna!");

  return lines.join("\n");
}

module.exports = {
  getReceiptByDonationId,
  buildReceiptMessage,
  RECEIPT_PAGE_BASE,
};
