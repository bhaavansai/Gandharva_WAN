const handleReceiptClick = async (donationId) => {
  try {
    // Open receipt in a new tab. We pass `donationId` via query param,
    // because router `location.state` won't be available in a new tab.
    const url = `/receipt?donationId=${encodeURIComponent(donationId)}`;

    // Some browsers may return `null` when using certain feature strings
    // even though the tab opens. So we avoid passing extra features and
    // clear opener manually for safety.
    const newTab = window.open(url, "_blank");

    // Fallback: if popup is blocked, open in same tab using react-router state.
    if (newTab) {
      try {
        newTab.opener = null;
      } catch (e) {
        // ignore
      }
      return;
    }

    {
      const pdfData = await getReceiptByDonationId(donationId);
      if (
        !pdfData ||
        !pdfData.receiptNumber ||
        !pdfData.receiptNumber.startsWith("ISK")
      ) {
        alert("Receipt number is missing. Cannot generate receipt.");
        return;
      }
      pdfData.purpose = "General";
      navigate("/receipt", { state: { pdfData } });
    }
  } catch (error) {
    console.error("Error fetching receipt data:", error);
  }
};

export const getReceiptByDonationId = async (donationId) => {
  try {
    const response = await axiosInstance.get(`${GET_RECEIPT}/${donationId}`);
    console.log("Receipt response data:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching receipt:",
      error.response?.data?.message || error.message,
    );
    throw new Error(error.response?.data?.message || "Failed to fetch receipt");
  }
};

export const GET_RECEIPT = "/donation/receipt";

import React, { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MyPDFDocument from "./MyPDFDocument";
import { useLocation } from "react-router-dom";
import { getReceiptByDonationId } from "../utils/services";
import { whiteListedDonationPurposes } from "../constants/constants";

const FormAndDownload = () => {
  const location = useLocation();
  const initialPdfData = location.state?.pdfData || {};
  const [pdfData, setPdfData] = useState(initialPdfData);

  const buildAddress = (data) => {
    const baseAddress = data?.donorAddress || "";
    const city = data?.city || data?.donorCity || "";
    const state = data?.state || data?.donorState || "";

    const suffix = [city, state].filter(Boolean).join(", ");
    return suffix
      ? `${baseAddress}${baseAddress ? ", " : ""}${suffix}`
      : baseAddress;
  };

  const [formData, setFormData] = useState({
    receiptNumber: initialPdfData.receiptNumber,
    receiptDate: initialPdfData.paymentDate,
    amountWords: "dd",
    amountNumber: initialPdfData.amount,
    name: initialPdfData.donorName,
    address: buildAddress(initialPdfData),
    pincode: initialPdfData.donorPIN,
    mobile: initialPdfData.mobile,
    email: initialPdfData.email,
    pan: initialPdfData.pan,
    paymentMode: initialPdfData.paymentMode,
    paymentDetails: initialPdfData.transactionID,
    donationPurpose: initialPdfData.purpose,
    donorCultivatorId: initialPdfData.donorCultivatorId,
    donationId: initialPdfData.donationId || "NA",
  });

  console.log("PDF Data in FormAndDownload:", pdfData);
  console.log("Form Data in FormAndDownload:", formData);

  const [showDownloadLink, setShowDownloadLink] = useState(
    Boolean(initialPdfData?.receiptNumber),
  );
  const [documentData, setDocumentData] = useState({
    receiptNumber: initialPdfData.receiptNumber,
    receiptDate: initialPdfData.paymentDate,
    amountWords: initialPdfData.amount,
    amountNumber: initialPdfData.amount,
    name: initialPdfData.donorName,
    address: buildAddress(initialPdfData),
    pincode: initialPdfData.donorPIN,
    mobile: initialPdfData.mobile,
    email: initialPdfData.email,
    pan: initialPdfData.pan,
    paymentMode: initialPdfData.paymentMode,
    paymentDetails: initialPdfData.transactionID,
    donationPurpose: initialPdfData.purpose,
    donorCultivatorId: initialPdfData.donorCultivatorId,
    donationId: initialPdfData.donationId || "NA",
  });

  console.log("Document Data in FormAndDownload:", documentData);

  useEffect(() => {
    // In new tabs we open `/receipt?donationId=...`,
    // so `location.state` is empty. Fetch receipt data using the query param.
    const needsFetch = !pdfData?.receiptNumber;
    if (!needsFetch) return;

    const params = new URLSearchParams(location.search);
    const donationId = params.get("donationId");
    if (!donationId) return;

    const load = async () => {
      try {
        const fetched = await getReceiptByDonationId(donationId);
        const isWhitelisted = whiteListedDonationPurposes.some(
          (purpose) =>
            purpose.value?.trim().toLowerCase() ===
            fetched.purpose?.trim().toLowerCase(),
        );

        if (!isWhitelisted) {
          fetched.purpose = "General";
        }
        setPdfData(fetched);
      } catch (e) {
        console.error("Error fetching receipt in FormAndDownload:", e);
      }
    };

    load();
  }, [location.search, pdfData?.receiptNumber]);

  useEffect(() => {
    if (!pdfData?.receiptNumber) return;

    setFormData({
      receiptNumber: pdfData.receiptNumber,
      receiptDate: pdfData.paymentDate,
      amountWords: "dd",
      amountNumber: pdfData.amount,
      name: pdfData.donorName,
      address: buildAddress(pdfData),
      pincode: pdfData.donorPIN,
      mobile: pdfData.mobile,
      email: pdfData.email,
      pan: pdfData.pan,
      paymentMode: pdfData.paymentMode,
      paymentDetails: pdfData.transactionID,
      donationPurpose: pdfData.purpose,
      donorCultivatorId: pdfData.donorCultivatorId,
      donationId: pdfData.donationId || "NA",
    });

    setDocumentData({
      receiptNumber: pdfData.receiptNumber,
      receiptDate: pdfData.paymentDate,
      amountWords: pdfData.amount,
      amountNumber: pdfData.amount,
      name: pdfData.donorName,
      address: buildAddress(pdfData),
      pincode: pdfData.donorPIN,
      mobile: pdfData.mobile,
      email: pdfData.email,
      pan: pdfData.pan,
      paymentMode: pdfData.paymentMode,
      paymentDetails: pdfData.transactionID,
      donationPurpose: pdfData.purpose,
      donorCultivatorId: pdfData.donorCultivatorId,
      donationId: pdfData.donationId || "NA",
    });

    setShowDownloadLink(true);
  }, [pdfData]);
  // Format date to display nicely
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-5">
      {/* Receipt Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-red-500">
        {/* Receipt Header */}
        <div className="text-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">ISKCON Dhanbad</h2>
          <p className="text-lg text-gray-600 mt-1">Donation Receipt</p>
          <div className="mt-4 text-gray-700">
            Receipt No:{" "}
            <span className="font-semibold">{formData.receiptNumber}</span>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4">
          <div className="flex">
            <div className="w-1/3 font-medium text-gray-700">Date:</div>
            <div className="w-2/3 text-gray-800">
              {formatDate(formData.receiptDate)}
            </div>
          </div>

          <div className="flex">
            <div className="w-1/3 font-medium text-gray-700">
              Received from:
            </div>
            <div className="w-2/3 text-gray-800">{formData.name}</div>
          </div>

          <div className="flex">
            <div className="w-1/3 font-medium text-gray-700">Address:</div>
            <div className="w-2/3 text-gray-800">
              {formData.address}, PIN: {formData.pincode}
            </div>
          </div>

          <div className="flex">
            <div className="w-1/3 font-medium text-gray-700">Mobile:</div>
            <div className="w-2/3 text-gray-800">{formData.mobile}</div>
          </div>

          {formData.email && (
            <div className="flex">
              <div className="w-1/3 font-medium text-gray-700">Email:</div>
              <div className="w-2/3 text-gray-800">{formData.email}</div>
            </div>
          )}

          {formData.pan && (
            <div className="flex">
              <div className="w-1/3 font-medium text-gray-700">PAN:</div>
              <div className="w-2/3 text-gray-800">{formData.pan}</div>
            </div>
          )}

          <div className="flex">
            <div className="w-1/3 font-medium text-gray-700">Amount:</div>
            <div className="w-2/3 text-gray-800">
              ₹{(formData.amountNumber || 0).toLocaleString("en-IN")} (
              {formData.paymentMode})
            </div>
          </div>

          <div className="flex">
            <div className="w-1/3 font-medium text-gray-700">Purpose:</div>
            <div className="w-2/3 text-gray-800">
              {formData.donationPurpose}
            </div>
          </div>

          {formData.paymentDetails && (
            <div className="flex">
              <div className="w-1/3 font-medium text-gray-700">
                Transaction ID:
              </div>
              <div className="w-2/3 text-gray-800">
                {formData.paymentDetails}
              </div>
            </div>
          )}
        </div>

        {/* Receipt Footer */}
        <div className="bg-gray-50 p-6 text-center">
          <p className="text-gray-700">Thank you for your generous donation</p>
          <p className="text-gray-700 font-medium mt-1">Hare Krishna!</p>
        </div>
      </div>

      {/* Download Section */}
      {showDownloadLink && (
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Generate and download your receipt
          </p>
          <PDFDownloadLink
            document={<MyPDFDocument formData={documentData} />}
            fileName={`${pdfData.donorName || "Receipt"}_${
              pdfData.receiptNumber
            }_${pdfData.amount}.pdf`}
            className="inline-block"
          >
            {({ loading }) => (
              <button
                className={`px-6 py-3 rounded-md font-medium text-white ${
                  loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
                } transition-colors shadow-md`}
                disabled={loading}
              >
                {loading ? "Generating PDF..." : "Download Receipt"}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
};

export default FormAndDownload;

import React from "react";
import { Document } from "@react-pdf/renderer";
import PageOne from "./PageOne";
import PageTwo from "./PageTwo";

const MyPDFDocument = ({ formData }) => (
  <Document>
    <PageOne formData={formData} />
    <PageTwo />
  </Document>
);

// export default MyPDFDocument;

import { Page, View, StyleSheet, Image } from "@react-pdf/renderer";
import ISKCON_DHANBAD_BG_Base64 from "../assets/ISKCON_DHANBAD_BG";
import ISKCON_DHANBAD_LOGO_Base64 from "../assets/ISKCON_DHANBAD_LOGO";
import IskconInfo from "./PageOneComponents/IskonInfo";
import ExtensionCentreInfo from "./PageOneComponents/ExtensionCentreInfo";
import DonationReceiptHeader from "./PageOneComponents/DonationReceiptHeader";
import DonationAmountInput from "./PageOneComponents/DonationAmountInput";
import RegisteredOfficeInfo from "./PageOneComponents/RegisteredOfficeInfo";
import DonorDetailsBox from "./PageOneComponents/DonorDetailsBox";
import PaymentDetailsBox from "./PageOneComponents/PaymentDetailsBox";
import SignatureFieldsBox from "./PageOneComponents/SignatureFieldsBox";
import formatDate from "../utils/formatDate";

// const styles = StyleSheet.create({
//   page: {
//     position: "relative",
//     width: "100%",
//     height: "100%",
//   },
//   backgroundImage: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   content: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     width: "100%",
//     padding: 20,
//     display: "flex",
//     gap: 5,
//   },
//   header: {
//     width: "100%",
//     flexDirection: "row",
//     display: "flex",
//     alignItems: "center",
//   },
//   logo: {
//     width: "150px",
//   },
//   field: {
//     marginBottom: 16,
//     fontSize: 18,
//     color: "#000",
//   },
// });

const PageOne = ({ formData }) => {
  const {
    receiptNumber,
    receiptDate,
    amountNumber,
    name,
    address,
    pincode,
    mobile,
    email,
    pan,
    paymentMode,
    paymentDetails,
    donationPurpose,
    donorCultivatorId,
    donationId,
  } = formData;

  console.log(formData);
  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Image src={ISKCON_DHANBAD_BG_Base64} style={styles.backgroundImage} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Image src={ISKCON_DHANBAD_LOGO_Base64} style={styles.logo} />
          <View>
            <IskconInfo />
            <View style={styles.header}>
              <ExtensionCentreInfo />
              <DonationReceiptHeader
                receiptNumber={receiptNumber}
                receiptDate={formatDate(receiptDate)}
              />
            </View>
          </View>
        </View>
        <View>
          <DonationAmountInput amountNumber={amountNumber} />
        </View>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <DonorDetailsBox
            donor={{
              name: name,
              address: address,
              pincode: pincode,
              mobile: mobile,
              email: email,
              pan: pan,
            }}
          />
          <View style={{ width: "50%" }}>
            <PaymentDetailsBox
              width={300}
              paymentMode={paymentMode}
              paymentDetails={paymentDetails}
              donationPurpose={donationPurpose}
              donationId={donationId}
            />
            <SignatureFieldsBox donorCultivatorId={donorCultivatorId} />
          </View>
        </View>
        <View>
          <RegisteredOfficeInfo />
        </View>
      </View>
    </Page>
  );
};

// export default PageOne;

// src/PDF_Components/PageTwo.jsx
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    lineHeight: 1.6,
  },
  heading: {
    fontSize: 13,
    marginBottom: 10,
    fontWeight: "bold",
  },
  bulletParagraph: {
    marginBottom: 6,
    textAlign: "justify",
    flexDirection: "row",
    display: "flex",
  },
  bullet: {
    marginRight: 6,
  },
  paragraphText: {
    flex: 1,
  },
  centered: {
    marginTop: 10,
    textAlign: "center",
  },
  mantra: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
  },
});

const PageTwo = () => (
  <Page size="A4" orientation="landscape" style={styles.page}>
    <View>
      <Text style={styles.heading}>
        Please note Terms and Conditions (T&amp;C):
      </Text>

      {[
        "This donation receipt is an acknowledgement only and not for the purpose of claiming 80G deduction.",
        "Form No. 10BE, i.e., Certificate of donation under clause (ix) of sub-section (5) of section 80G of the Income Tax Act, 1961, will be issued to you as per provisions of Income-tax Act, 1961, and rules made thereunder. Generally 10BE will be issued by 31st May of the following financial year.",
        "For all type of donations, irrespective of amount and mode of payment, full legal name and address with PIN are required. Further PAN is compulsory to obtain Form No. 10BE. Please ensure that the same are mentioned correctly in the donation receipt.",
        "Form No. 10BE is not available for any cash donation.",
        "10BE will be available in PDF version only. Please ensure to mention correct WhatsApp number and E-mail id to receive the same.",
        "PAN is compulsory for all donation of Rs. 50,000/- or more.",
        "In case of payment by cheque, this donation receipt is valid subject to clearance of the cheque.",
        "ISKCON's Unique Registration Number for 80G-AAAT10017PF20219 is valid till March 31, 2026 and to be renewed thereafter periodically as per provisions of Income-tax Act, 1961, and rules made thereunder.",
        "In case of any error/discrepancy in this receipt, including your Name, address and PAN, E-mail ID, WhatsApp number etc., please contact the receipt issuing centre for correction.",
      ].map((line, idx) => (
        <View style={styles.bulletParagraph} key={idx}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.paragraphText}>{line}</Text>
        </View>
      ))}

      <Text style={styles.centered}>Thank you for your support.</Text>

      <Text style={styles.mantra}>Please chant</Text>

      <Text style={styles.mantra}>
        HARE KRISHNA HARE KRISHNA KRISHNA KRISHNA HARE HARE {"\n"}
        HARE RAMA HARE RAMA RAMA RAMA HARE HARE
      </Text>

      <Text style={styles.mantra}>and be happy.</Text>
    </View>
  </Page>
);

// export default PageTwo;
