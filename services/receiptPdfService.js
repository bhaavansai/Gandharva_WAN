const path = require('path');
const fs = require('fs');
const os = require('os');
const React = require('react');

global.React = React;

require('esbuild-register/dist/node').register({
    extensions: ['.jsx', '.js'],
    target: 'node18',
});

const MyPDFDocument = require(path.join(__dirname, '../pdf/PDF_Components/MyPDFDocument.jsx')).default;
const { renderToBuffer } = require('@react-pdf/renderer');

function buildAddress(data) {
    const baseAddress = data?.donorAddress || '';
    const city = data?.city || data?.donorCity || '';
    const state = data?.state || data?.donorState || '';
    const suffix = [city, state].filter(Boolean).join(', ');
    return suffix
        ? `${baseAddress}${baseAddress ? ', ' : ''}${suffix}`
        : baseAddress;
}

function mapReceiptToFormData(receiptData) {
    return {
        receiptNumber: receiptData.receiptNumber,
        receiptDate: receiptData.paymentDate,
        amountWords: receiptData.amount,
        amountNumber: receiptData.amount,
        name: receiptData.donorName,
        address: buildAddress(receiptData),
        pincode: receiptData.donorPIN,
        mobile: receiptData.mobile,
        email: receiptData.email,
        pan: receiptData.pan,
        paymentMode: receiptData.paymentMode,
        paymentDetails: receiptData.transactionID,
        donationPurpose: receiptData.purpose || 'General',
        donorCultivatorId: receiptData.donorCultivatorId,
        donationId: receiptData.donationId || 'NA',
    };
}

function getReceiptPdfFileName(receiptData) {
    const donorName = (receiptData.donorName || 'Receipt').replace(/[^\w.-]+/g, '_');
    return `${donorName}_${receiptData.receiptNumber}_${receiptData.amount}.pdf`;
}

async function generateReceiptPdfBuffer(receiptData) {
    const formData = mapReceiptToFormData(receiptData);
    const element = React.createElement(MyPDFDocument, { formData });
    return renderToBuffer(element);
}

async function generateReceiptPdfFile(receiptData) {
    const buffer = await generateReceiptPdfBuffer(receiptData);
    const fileName = getReceiptPdfFileName(receiptData);
    const filePath = path.join(os.tmpdir(), 'gandharva-receipts', fileName);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, buffer);
    return { filePath, fileName };
}

module.exports = {
    mapReceiptToFormData,
    generateReceiptPdfBuffer,
    generateReceiptPdfFile,
    getReceiptPdfFileName,
};
