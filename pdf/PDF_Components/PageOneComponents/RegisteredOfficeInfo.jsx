import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffe566",
    border: "1 solid #d00000",
    width: "100%",
    padding: 10,
    textAlign: "center",
    marginTop: "10px"
  },
  line: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
});

const RegisteredOfficeInfo = () => (
  <View style={styles.container}>
    <Text style={styles.line}>
      Registered Office: Hare Krishna Land, Juhu, Mumbai - 400 049. Mobile:
      72088 46210. E-mail: info@iskconindia.org Registered under Maharashtra
      Public Trust Act 1950, vide Regn. No.: F-2179 (Bom). Unique Regn. No.
      (80G): AAAT10017PF20219
    </Text>
  </View>
);

export default RegisteredOfficeInfo;
