import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyPDFDocument from './MyPDFDocument';
import { useLocation } from 'react-router-dom';
import { getReceiptByDonationId } from '../utils/services';
import { whiteListedDonationPurposes } from '../constants/constants';

const FormAndDownload = () => {
  const location = useLocation();
  const initialPdfData = location.state?.pdfData || {};
  const [pdfData, setPdfData] = useState(initialPdfData);

  const buildAddress = (data) => {
    const baseAddress = data?.donorAddress || '';
    const city = data?.city || data?.donorCity || '';
    const state = data?.state || data?.donorState || '';

    const suffix = [city, state].filter(Boolean).join(', ');
    return suffix
      ? `${baseAddress}${baseAddress ? ', ' : ''}${suffix}`
      : baseAddress;
  };

  const [formData, setFormData] = useState({
    receiptNumber: initialPdfData.receiptNumber,
    receiptDate: initialPdfData.paymentDate,
    amountWords: 'dd',
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
    donationId: initialPdfData.donationId || 'NA',
  });

  console.log('PDF Data in FormAndDownload:', pdfData);
  console.log('Form Data in FormAndDownload:', formData);

  const [showDownloadLink, setShowDownloadLink] = useState(
    Boolean(initialPdfData?.receiptNumber)
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
    donationId: initialPdfData.donationId || 'NA',
  });

  console.log('Document Data in FormAndDownload:', documentData);

  useEffect(() => {
    // In new tabs we open `/receipt?donationId=...`,
    // so `location.state` is empty. Fetch receipt data using the query param.
    const needsFetch = !pdfData?.receiptNumber;
    if (!needsFetch) return;

    const params = new URLSearchParams(location.search);
    const donationId = params.get('donationId');
    if (!donationId) return;

    const load = async () => {
      try {
        const fetched = await getReceiptByDonationId(donationId);
        const isWhitelisted = whiteListedDonationPurposes.some(
          (purpose) =>
            purpose.value?.trim().toLowerCase() ===
            fetched.purpose?.trim().toLowerCase()
        );

        if (!isWhitelisted) {
          fetched.purpose = 'General';
        }
        setPdfData(fetched);
      } catch (e) {
        console.error('Error fetching receipt in FormAndDownload:', e);
      }
    };

    load();
  }, [location.search, pdfData?.receiptNumber]);

  useEffect(() => {
    if (!pdfData?.receiptNumber) return;

    setFormData({
      receiptNumber: pdfData.receiptNumber,
      receiptDate: pdfData.paymentDate,
      amountWords: 'dd',
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
      donationId: pdfData.donationId || 'NA',
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
      donationId: pdfData.donationId || 'NA',
    });

    setShowDownloadLink(true);
  }, [pdfData]);
  // Format date to display nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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
            Receipt No:{' '}
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
              ₹{(formData.amountNumber || 0).toLocaleString('en-IN')} (
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
            fileName={`${pdfData.donorName || 'Receipt'}_${
              pdfData.receiptNumber
            }_${pdfData.amount}.pdf`}
            className="inline-block"
          >
            {({ loading }) => (
              <button
                className={`px-6 py-3 rounded-md font-medium text-white ${
                  loading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
                } transition-colors shadow-md`}
                disabled={loading}
              >
                {loading ? 'Generating PDF...' : 'Download Receipt'}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
};

export default FormAndDownload;
