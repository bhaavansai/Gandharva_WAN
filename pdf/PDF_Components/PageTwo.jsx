// src/PDF_Components/PageTwo.jsx
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    lineHeight: 1.6,
  },
  heading: {
    fontSize: 13,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  bulletParagraph: {
    marginBottom: 6,
    textAlign: 'justify',
    flexDirection: 'row',
    display: 'flex',
  },
  bullet: {
    marginRight: 6,
  },
  paragraphText: {
    flex: 1,
  },
  centered: {
    marginTop: 10,
    textAlign: 'center',
  },
  mantra: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 13,
  },
});

const PageTwo = () => (
  <Page size="A4" orientation="landscape" style={styles.page}>
    <View>
      <Text style={styles.heading}>Please note Terms and Conditions (T&amp;C):</Text>

      {[
        "This donation receipt is an acknowledgement only and not for the purpose of claiming 80G deduction.",
        "Form No. 10BE, i.e., Certificate of donation under clause (ix) of sub-section (5) of section 80G of the Income Tax Act, 1961, will be issued to you as per provisions of Income-tax Act, 1961, and rules made thereunder. Generally 10BE will be issued by 31st May of the following financial year.",
        "For all type of donations, irrespective of amount and mode of payment, full legal name and address with PIN are required. Further PAN is compulsory to obtain Form No. 10BE. Please ensure that the same are mentioned correctly in the donation receipt.",
        "Form No. 10BE is not available for any cash donation.",
        "10BE will be available in PDF version only. Please ensure to mention correct WhatsApp number and E-mail id to receive the same.",
        "PAN is compulsory for all donation of Rs. 50,000/- or more.",
        "In case of payment by cheque, this donation receipt is valid subject to clearance of the cheque.",
        "ISKCON's Unique Registration Number for 80G-AAAT10017PF20219 is valid till March 31, 2026 and to be renewed thereafter periodically as per provisions of Income-tax Act, 1961, and rules made thereunder.",
        "In case of any error/discrepancy in this receipt, including your Name, address and PAN, E-mail ID, WhatsApp number etc., please contact the receipt issuing centre for correction.",
      ].map((line, idx) => (
        <View style={styles.bulletParagraph} key={idx}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.paragraphText}>{line}</Text>
        </View>
      ))}

      <Text style={styles.centered}>Thank you for your support.</Text>

      <Text style={styles.mantra}>Please chant</Text>

      <Text style={styles.mantra}>
        HARE KRISHNA HARE KRISHNA KRISHNA KRISHNA HARE HARE {"\n"}
        HARE RAMA HARE RAMA RAMA RAMA HARE HARE
      </Text>

      <Text style={styles.mantra}>and be happy.</Text>
    </View>
  </Page>
);

export default PageTwo;
