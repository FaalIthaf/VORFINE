import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Spacing } from "../constants/theme";

interface PeriodFilterProps {
  currentLabel?: string;
  currentPeriodText?: string;
  onPress?: () => void;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  currentLabel = "Bulan Ini",
  currentPeriodText = "Sep 2026",
  onPress,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.filterPill,
        pressed && styles.pressedState,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter periode: ${currentLabel} ${currentPeriodText}`}
    >
      <View style={styles.leftGroup}>
        <Ionicons
          name="calendar-outline"
          size={16}
          color="#526366"
          style={styles.calendarIcon}
        />
        <Text style={styles.labelText}>{currentLabel}</Text>
      </View>

      <View style={styles.rightGroup}>
        <Text style={styles.periodText}>{currentPeriodText}</Text>
        <Ionicons
          name="chevron-down"
          size={15}
          color="#526366"
          style={styles.chevronIcon}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  filterPill: {
    backgroundColor: "#E2E7E9",
    borderRadius: BorderRadius.round,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: 9,
    marginVertical: Spacing.md,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    marginRight: 8,
  },
  labelText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#2C3E50",
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  periodText: {
    fontSize: 12.5,
    color: "#526366",
    fontWeight: "500",
    marginRight: 4,
  },
  chevronIcon: {
    marginLeft: 2,
  },
  pressedState: {
    opacity: 0.75,
  },
});

export default PeriodFilter;
