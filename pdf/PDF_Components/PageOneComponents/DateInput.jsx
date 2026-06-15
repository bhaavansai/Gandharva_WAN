import { View, Text, StyleSheet } from "@react-pdf/renderer";

const DateInput = ({ width = 250, height = 40, value }) => {
  const styles = StyleSheet.create({
    container: {
      width,
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
      justifyContent: "center",
      zIndex: 0,
    },
    labelContainer: {
      position: "absolute",
      top: -9,
      left: "50%",
      transform: "translateX(-25%)",
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
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>{value || ""}</Text>
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{"Date"}</Text>
      </View>
    </View>
  );
};

export default DateInput;
