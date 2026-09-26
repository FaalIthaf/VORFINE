import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";

interface NotificationFilterBarProps {
  isChecked: boolean;
  onToggle: () => void;
}

export const NotificationFilterBar: React.FC<NotificationFilterBarProps> = ({
  isChecked,
  onToggle,
}) => {
  return (
    <View
      style={[
        styles.container,
        isChecked ? styles.containerChecked : styles.containerUnchecked,
      ]}
    >
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.pressedState]}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
        accessibilityLabel="Filter notifikasi belum dibaca"
      >
        {/* Custom Square Checkbox */}
        <View
          style={[
            styles.checkboxBase,
            isChecked ? styles.checkboxChecked : styles.checkboxUnchecked,
          ]}
        >
          {isChecked && (
            <Ionicons name="checkmark" size={13} color={Colors.white} />
          )}
        </View>

        {/* Label Teks "Belum Dibaca" */}
        <Text style={styles.labelText}>Belum Dibaca</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md - 2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  containerChecked: {
    backgroundColor: "#E2E8EA",
  },
  containerUnchecked: {
    backgroundColor: "#F2F4F5",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  checkboxBase: {
    width: 19,
    height: 19,
    borderRadius: 3,
    borderWidth: 1.6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },
  checkboxChecked: {
    backgroundColor: "#42767D",
    borderColor: "#32575C",
  },
  checkboxUnchecked: {
    backgroundColor: Colors.white,
    borderColor: "#4A6B70",
  },
  labelText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#2C3E50",
  },
  pressedState: {
    opacity: 0.75,
  },
});

export default NotificationFilterBar;
