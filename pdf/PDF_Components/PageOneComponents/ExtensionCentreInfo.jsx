// src/PDF_Components/PageOneComponents/ExtensionCentreInfo.jsx
import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffe566",
    border: "1 solid #d00000",
    width: "300px",
    padding: 10,
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  line: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
});

const ExtensionCentreInfo = () => (
  <View style={styles.container}>
    <Text style={styles.line}>Preaching Centre</Text>
    <Text style={styles.line}>
      Doctor's colony, Near Central Hospital (BCCL),
    </Text>
    <Text style={styles.line}>Jagjiwan Nagar, Dhanbad, Jharkhand</Text>
    <Text style={styles.line}>PIN: 826003</Text>
    <Text style={styles.line}>Mobile No: 7644070770/9903013399</Text>
    <Text style={styles.line}>✉️ Email: acc.iskcondhanbad@gmail.com</Text>
  </View>
);

export default ExtensionCentreInfo;
