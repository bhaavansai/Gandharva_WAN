// src/PDF_Components/MyPDFDocument.jsx
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

export default MyPDFDocument;
