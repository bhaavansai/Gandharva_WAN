import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    color: "#023e7d",
    width: "650px"
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center", // Apply here
  },
  paragraph: {
    fontSize: 12,
    textAlign: "center", // And here
  },
});

const IskconInfo = () => (
  <View style={styles.container}>
    <Text style={styles.heading}>
      International Society for Krishna Consciousness (ISKCON)
    </Text>
    <Text style={styles.paragraph}>
      Founder-Acharya: His Divine Grace A. C. Bhaktivedanta Swami Prabhupada
    </Text>
  </View>
);

export default IskconInfo;
