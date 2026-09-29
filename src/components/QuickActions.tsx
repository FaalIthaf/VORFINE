import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";

interface QuickActionsProps {
  onPressScheduleShortcut?: () => void;
  onPressTimerShortcut?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onPressScheduleShortcut,
  onPressTimerShortcut,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.cardContainer}>
        {/* Shortcut 1: Schedule with checkmark */}
        <Pressable
          style={({ pressed }) => [
            styles.shortcutButton,
            pressed && styles.pressedState,
          ]}
          onPress={onPressScheduleShortcut}
          accessibilityRole="button"
          accessibilityLabel="Pintasan Jadwal Harian"
        >
          <View style={styles.calendarIconWrapper}>
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={32}
              color={Colors.white}
            />
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={11} color={Colors.white} />
            </View>
          </View>
        </Pressable>

        {/* Shortcut 2: Stopwatch / Timer */}
        <Pressable
          style={({ pressed }) => [
            styles.shortcutButton,
            pressed && styles.pressedState,
          ]}
          onPress={onPressTimerShortcut}
          accessibilityRole="button"
          accessibilityLabel="Pintasan Stopwatch / Timer"
        >
          <Ionicons name="time-outline" size={32} color={Colors.white} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  cardContainer: {
    backgroundColor: Colors.tealSlate,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xl,
    minHeight: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shortcutButton: {
    padding: Spacing.xs,
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  calendarIconWrapper: {
    position: "relative",
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  checkBadge: {
    position: "absolute",
    bottom: -2,
    right: -4,
    backgroundColor: Colors.successGreen,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.tealSlate,
  },
  pressedState: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
