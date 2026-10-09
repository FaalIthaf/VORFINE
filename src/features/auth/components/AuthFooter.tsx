import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";

export const AuthFooter: React.FC = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="shield-checkmark" size={13} color="#64748B" />
      <Text style={styles.text}>KEAMANAN TERENKRIPSI & TERLINDUNGI</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 18,
    marginTop: "auto",
  },
  text: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.8,
  },
});

export default AuthFooter;

