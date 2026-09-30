import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { ScheduleCategory, ScheduleItem } from "../types";

export interface ScheduleSectionProps {
  currentDateText: string;
  items: ScheduleItem[];
  onToggleComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
  onPressDateDropdown?: () => void;
  sectionTitle?: string;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  currentDateText,
  items,
  onToggleComplete,
  onDelete,
  showDeleteButton = false,
  onPressDateDropdown,
  sectionTitle,
}) => {
  const getCategoryStyles = (category: ScheduleCategory) => {
    switch (category) {
      case "Rutinitas":
        return Colors.category.rutinitas;
      case "Domestik":
        return Colors.category.domestik;
      case "Pekerjaan":
        return Colors.category.pekerjaan;
      case "Lainnya":
        return Colors.category.lainnya;
      default:
        return Colors.category.rutinitas;
    }
  };

  return (
    <View style={styles.outerWrapper}>
      {sectionTitle && (
        <Text style={styles.sectionHeaderTitle}>{sectionTitle}</Text>
      )}

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
          </Pressable>
        </View>

        {/* Schedule Items List */}
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={32} color="#98A2B3" />
            <Text style={styles.emptyText}>
              Belum ada jadwal untuk tanggal ini.
            </Text>
          </View>
        ) : (
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
                      <Text
                        style={[styles.categoryText, { color: catStyle.text }]}
                      >
                        {item.category}
                      </Text>
                    </View>
                  </View>

                  {/* Item Bottom: Title & Action (Delete / Checkbox) */}
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

                    <View style={styles.actionsGroup}>
                      {/* Delete Button (shown in Schedule & Calendar View) */}
                      {showDeleteButton && onDelete && (
                        <Pressable
                          style={({ pressed }) => [
                            styles.deleteButton,
                            pressed && styles.pressedState,
                          ]}
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          onPress={(e) => {
                            e?.stopPropagation?.();
                            onDelete(item.id);
                          }}
                          {...({
                            onClick: (e: any) => {
                              e?.stopPropagation?.();
                              onDelete(item.id);
                            },
                          } as any)}
                          accessibilityRole="button"
                          accessibilityLabel={`Hapus jadwal ${item.title}`}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#667085"
                            style={{ pointerEvents: "none" }}
                          />
                        </Pressable>
                      )}

                      {/* Checkbox Button */}
                      {!showDeleteButton && onToggleComplete && (
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
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={Colors.white}
                            />
                          )}
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    marginBottom: Spacing.md,
  },
  sectionHeaderTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  container: {
    backgroundColor: Colors.white,
    borderWidth: 1.2,
    borderColor: "#D0D5DD",
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  scheduleBadge: {
    backgroundColor: "#507B80",
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
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  dateChevron: {
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    color: "#667085",
    fontSize: 13,
    textAlign: "center",
  },
  itemsList: {
    gap: Spacing.sm,
  },
  itemCard: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E4E7EC",
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
    color: "#667085",
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
    position: "relative",
    zIndex: 2,
  },
  itemTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginRight: Spacing.sm,
    ...(Platform.OS === "web" ? { pointerEvents: "none" as any } : {}),
  },
  itemTitleCompleted: {
    color: "#2C3E50",
  },
  actionsGroup: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    zIndex: 99,
    ...(Platform.OS === "web" ? { pointerEvents: "auto" as any } : {}),
  },
  deleteButton: {
    padding: 6,
    minWidth: 36,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    position: "relative",
    zIndex: 100,
    ...(Platform.OS === "web"
      ? { cursor: "pointer" as any, pointerEvents: "auto" as any }
      : {}),
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D0D5DD",
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  checkboxCompleted: {
    backgroundColor: Colors.successGreen,
    borderColor: Colors.successGreen,
  },
  pressedState: {
    opacity: 0.7,
  },
});

export default ScheduleSection;
