// src/PDF_Components/PageOneComponents/PaymentDetailsBox.jsx
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const PaymentDetailsBox = ({
  height = 40,
  paymentMode = "",
  paymentDetails = "",
  donationPurpose = "",
  donationId="NA"
}) => {
  const styles = StyleSheet.create({
    groupContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 15,
      marginTop: 10,
      width: "100%",
    },
    container: {
      width: "100%",
      position: "relative",
    },
  inputBox: {
  height,
  borderWidth: 1,
  borderColor: "red",
  backgroundColor: "#eee",
  borderRadius: 4,
  paddingLeft: 12,
  paddingRight: 12,
  justifyContent: "center",     // vertically center
  alignItems: "center",         // horizontally center
  zIndex: 0,
},

    labelContainer: {
      position: "absolute",
      top: -9,
      transform: "translateX(+40%)",
      backgroundColor: "#eee",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    labelText: {
      fontSize: 14,
      color: "#ff0a54",
    },
    inputText: {
      fontSize: 18,
      color: "#000",
      textAlign: "center",
    },
  });

  const renderField = (label, value) => (
    <View style={styles.container}>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>{value || ""}</Text>
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
  );
  // Update the label for payment details to include Donation Id
 const paymentDetailsLabel = paymentDetails
  ? `${paymentDetails} (Donation Id: ${donationId})`
  : `Donation Id: ${donationId}`;

  return (
    <View style={styles.groupContainer}>
      {renderField(
        "Mode of Payment (Cheque / Online / UPI / Cash)",
        paymentMode
      )}
      {renderField(
        "Payment Details (Cheque / Transaction Details)",
        paymentDetailsLabel
      )}
      {renderField(
        "Purpose of Donation (Corpus / General / Others)",
        donationPurpose
      )}
    </View>
  );
};

export default PaymentDetailsBox;
