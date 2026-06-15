// src/PDF_Components/PageOneComponents/SignatureFieldsBox.jsx
import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import bhim_sign_base64 from "../../assets/BHIM_SIGN_64";
import DGP_SIGN_BASE64 from "../../assets/DGP_SIGN_BASE64";
import NPP_SIGN_BASE64 from "../../assets/NPP_SIGN_BASE64.JS";
import SUNITA_SIGN_BASE64 from "../../assets/SUNITA_SIGN_BASE64.JS";
import NIBEDITA_SIGN_BASE64 from "../../assets/NIBEDITA_SIGN_BASE64";
import RAJEEV_SIGN_BASE64 from "../../assets/RAJEEV_SIGN_BASE64.JS";

const getSignatureByDonorCultivatorId = (id) => {
  switch (String(id)) {
    case "1":
      return SUNITA_SIGN_BASE64;
    case "2":
      return bhim_sign_base64;
    case "3":
      return RAJEEV_SIGN_BASE64;
    case "4":
      return DGP_SIGN_BASE64;
    case "5":
      return DGP_SIGN_BASE64;
    case "6":
      return NIBEDITA_SIGN_BASE64;
    case "8":
      return NPP_SIGN_BASE64;
    case "9":
      return NPP_SIGN_BASE64;
    case "420":
      return NPP_SIGN_BASE64;
    default:
      return bhim_sign_base64; // fallback
  }
};

const SignatureFieldsBox = ({ height = 60, donorCultivatorId = "8" }) => {
  const styles = StyleSheet.create({
    rowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
      marginTop: 10,
    },
fieldContainer: {
  width: "100%",
  height,
  borderWidth: 1,
  borderColor: "red",
  backgroundColor: "#eee",
  borderRadius: 4,
  paddingHorizontal: 12,
  justifyContent: "center",    // vertically center image
  alignItems: "center",        // horizontally center image
  position: "relative",
},

    signatureText: {
      fontSize: 8,
      color: "#000",
    },
    bottomLabel: {
      position: "absolute",
      bottom: -10,
      backgroundColor: "#eee",
      paddingHorizontal: 6,
      fontSize: 10,
      color: "#023e7d",
      borderRadius: 4,
      // left: "50%",
      transform: "translateX(+100%)",
    },
  });

const renderSignatureField = (label, value) => (
  <View style={styles.fieldContainer}>
    {value ? (
      <Image
        src={value}
        style={{ width: "75%", objectFit: "contain" }}
      />
    ) : null}
    <Text style={styles.bottomLabel}>{label}</Text>
  </View>
);


  return (
    <View style={styles.rowContainer}>
      {/* {renderSignatureField("Donor Signature for Cash Payment", donorSignature)} */}
      {renderSignatureField(
        "Signature of ISKCON Representative",
        getSignatureByDonorCultivatorId(donorCultivatorId)
      )}
    </View>
  );
};

export default SignatureFieldsBox;
