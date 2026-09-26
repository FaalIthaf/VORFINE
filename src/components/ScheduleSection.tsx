import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { ScheduleCategory, ScheduleItem } from "../types";

interface ScheduleSectionProps {
  currentDateText: string;
  items: ScheduleItem[];
  onToggleComplete: (id: string) => void;
  onPressDateDropdown?: () => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  currentDateText,
  items,
  onToggleComplete,
  onPressDateDropdown,
}) => {
  const getCategoryStyles = (category: ScheduleCategory) => {
    switch (category) {
      case "Rutinitas":
        return Colors.category.rutinitas;
      case "Domestik":
        return Colors.category.domestik;
      case "Pekerjaan":
        return Colors.category.pekerjaan;
      case "Keuangan":
        return Colors.category.keuangan;
      default:
        return Colors.category.rutinitas;
    }
  };

  return (
    <View style={styles.container}>
      {/* Schedule Header */}
      <View style={styles.headerRow}>
        <View style={styles.scheduleBadge}>
          <Text style={styles.scheduleBadgeText}>Schedule</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.dateSelector,
            pressed && styles.pressedState,
          ]}
          onPress={onPressDateDropdown}
          accessibilityRole="button"
          accessibilityLabel={`Pilih Tanggal: ${currentDateText}`}
        >
          <Text style={styles.dateText}>{currentDateText}</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={Colors.textPrimary}
            style={styles.dateChevron}
          />
        </Pressable>
      </View>

      {/* Schedule Items List */}
      <View style={styles.itemsList}>
        {items.map((item) => {
          const catStyle = getCategoryStyles(item.category);

          return (
            <View key={item.id} style={styles.itemCard}>
              {/* Item Top: Time & Category */}
              <View style={styles.itemTopRow}>
                <Text style={styles.timeText}>{item.time}</Text>
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor: catStyle.bg,
                      borderColor: catStyle.border,
                    },
                  ]}
                >
                  <Text style={[styles.categoryText, { color: catStyle.text }]}>
                    {item.category}
                  </Text>
                </View>
              </View>

              {/* Item Bottom: Title & Checkbox */}
              <View style={styles.itemBottomRow}>
                <Text
                  style={[
                    styles.itemTitle,
                    item.completed && styles.itemTitleCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.checkbox,
                    item.completed && styles.checkboxCompleted,
                    pressed && styles.pressedState,
                  ]}
                  onPress={() => onToggleComplete(item.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: item.completed }}
                  accessibilityLabel={`Tandai selesai untuk ${item.title}`}
                >
                  {item.completed && (
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                  )}
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  scheduleBadge: {
    backgroundColor: Colors.tealSlate,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  scheduleBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  dateChevron: {
    marginLeft: 4,
  },
  itemsList: {
    gap: Spacing.sm,
  },
  itemCard: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md + 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
  },
  itemBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemTitleCompleted: {
    color: "#2C3E50",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: Colors.successGreen,
    borderColor: Colors.successGreen,
  },
  pressedState: {
    opacity: 0.7,
  },
});
