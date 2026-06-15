import React from "react";
import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import RUPEE_Base64 from "../../assets/RUPEE";
import { numberToWords } from "../../utils/mathFunctions";

const DonationAmountInput = ({
  width = "100%",
  height = 40,
  amountNumber = "",
}) => {
  const Currencyformatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });
  const styles = StyleSheet.create({
    container: {
      width,
      position: "relative",
      marginBottom: 10,
    },
    labelContainer: {
      position: "absolute",
      top: -10,
      left: "50%",
      transform: "translateX(-85%)",
      paddingHorizontal: 6,
      paddingVertical: 2,
      backgroundColor: "#eee",
      borderRadius: 4,
    },
    labelText: {
      fontSize: 14,
      color: "#ff0a54",
      textAlign: "center",
    },
    inputBox: {
      height,
      borderWidth: 1,
      borderColor: "red",
      backgroundColor: "#eee",
      borderRadius: 4,
      paddingHorizontal: 10,
      justifyContent: "center",
      zIndex: 0,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    amountWordsText: {
      fontSize: 18,
      color: "#000",
      flexShrink: 1,
    },
    amountNumberContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginRight: 50,
    },
    rupeeBox: {
      backgroundColor: "#ff36ab",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 2,
      height: 30,
      width: 30,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    amountNumberText: {
      fontSize: 18,
      marginLeft: 20,
      fontWeight: "bold",
      color: "#000",
    },
  });

  const amountWords=numberToWords(parseInt(amountNumber||0));
console.log("amountWords", amountWords);
console.log("amountNumber", amountNumber);
  
  return (
    <View style={styles.container}>
      <View style={styles.inputBox}>
        <View style={styles.row}>
          <Text style={styles.amountWordsText}>{amountWords}</Text>
          <View
            style={[
              styles.amountNumberContainer,
              amountNumber === "" && { marginRight: 150 },
            ]}
          >
            <View style={styles.rupeeBox}>
              <Image src={RUPEE_Base64} style={{ width: 24, height: 24 }} />
            </View>
            <Text style={styles.amountNumberText}>
              {amountNumber !== ""
                ? Currencyformatter.format(amountNumber)
                    .replace(/^[^\d]+/, "")
                    .replace(/\.\d{2}$/, "")
                : ""}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>Donation Amount in Rupees</Text>
      </View>
    </View>
  );
};

export default DonationAmountInput;
