// src/PDF_Components/PageOneComponents/DonorDetailsBox.jsx
import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const DonorDetailsBox = ({
  width = "50%",
  height = 200,
  donor = {},
}) => {
  const { name, address, mobile, email, pan, pincode } = donor;

  const styles = StyleSheet.create({
    container: {
      width,
      position: "relative",
      marginBottom: 12,
    },
    labelContainer: {
      position: "absolute",
      top: -10,
      transform: "translateX(+20%)",
      backgroundColor: "#eee",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    labelText: {
      fontSize: 14,
      color: "#ff0a54",
      textAlign: "center",
    },
    inputBox: {
      width: "100%",
      borderWidth: 1,
      borderColor: "red",
      backgroundColor: "#eee",
      borderRadius: 4,
      padding: 12,
      justifyContent: "flex-start",
      zIndex: 0,
    },
    fieldWrapper: {
      marginBottom: 6,
    },
    fieldLabel: {
      fontSize: 15,
      fontWeight: "bold",
      color: "#000",
    },
    fieldValue: {
      fontSize: 15,
      color: "#000",
    },
  });

  const renderField = (label, value) => (
    <View style={styles.fieldWrapper}>
      <Text>
        <Text style={styles.fieldLabel}>{label}: </Text>
        <Text style={styles.fieldValue}>{value || ""}</Text>
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputBox}>
        {renderField("Name", name)}
        {renderField("Address", address)}
        <View style={{ height: address?.trim() ? 8 : 35 }} />
        {renderField("PIN", pincode)}
        {renderField("PAN", pan)}
        {renderField("Mobile", mobile)}
        {renderField("Email", email)}
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{"Donor Details (T&C mentioned backside for 80G/10BE)"}</Text>
      </View>
    </View>
  );
};

export default DonorDetailsBox;
