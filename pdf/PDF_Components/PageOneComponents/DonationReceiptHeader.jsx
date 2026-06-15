// src/PDF_Components/PageOneComponents/DonationReceiptHeader.jsx
import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import DateInput from "./DateInput";

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  receiptNoTag: {
    fontSize: 14,
    color: "#ff36ab",
    marginBottom: 4,
    fontWeight: "bold",
  },
  receiptNo: {
    fontSize: 20,
    color: "#000",
    padding: "0 20px",
    fontWeight: "bold"
  },
  donorCopyBox: {
    backgroundColor: "#ff87ab",
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 4,
    marginRight: 4,
    textAlign: "center",
  },
  donorCopyText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
  },
  dateBox: {
    backgroundColor: "#eee",
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignSelf: "center",
    textAlign: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#000",
    textAlign: "center",
  },
});

const DonationReceiptHeader = ({ receiptNumber, receiptDate }) => {
  
  return (
    <View style={styles.container}>
      <View
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <View>
          <Text style={[styles.receiptNoTag, { fontSize: 18 }]}>Donation</Text>
          <Text style={styles.receiptNoTag}>Receipt No.</Text>
        </View>
        <Text style={styles.receiptNo}>{receiptNumber}</Text>
      </View>

      <View
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <View style={styles.donorCopyBox}>
          <Text style={styles.donorCopyText}>DONOR'S</Text>
          <Text style={styles.donorCopyText}>COPY</Text>
        </View>
        <DateInput width="250px" value={receiptDate} />
      </View>
    </View>
  );
};

export default DonationReceiptHeader;
