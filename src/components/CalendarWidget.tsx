import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "../constants/theme";

interface CalendarWidgetProps {
  currentYear: number;
  currentMonth: number; // 0-indexed (8 = September)
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  monthName: string;
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  currentYear,
  currentMonth,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  monthName,
}) => {
  // Compute days in current month
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // First day of current month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  // Days in previous month
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Build grid items
  const gridCells: {
    day: number;
    isCurrentMonth: boolean;
    isPrevMonth?: boolean;
    isNextMonth?: boolean;
  }[] = [];

  // 1. Leading days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    gridCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPrevMonth: true,
    });
  }

  // 2. Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    gridCells.push({
      day,
      isCurrentMonth: true,
    });
  }

  // 3. Trailing days for next month (fill to multiple of 7, min 35 cells)
  const remainingCells = 35 - gridCells.length;
  const fillCount = remainingCells > 0 ? remainingCells : (42 - gridCells.length) % 7;
  for (let day = 1; day <= fillCount; day++) {
    gridCells.push({
      day,
      isCurrentMonth: false,
      isNextMonth: true,
    });
  }

  return (
    <View style={styles.cardContainer}>
      {/* Month Navigator Header */}
      <View style={styles.headerRow}>
        <Pressable
          style={({ pressed }) => [styles.arrowButton, pressed && styles.pressedState]}
          onPress={onPrevMonth}
          accessibilityRole="button"
          accessibilityLabel="Bulan Sebelumnya"
        >
          <Ionicons name="chevron-back" size={18} color={Colors.textPrimary} />
        </Pressable>

        <Text style={styles.monthTitle}>
          {monthName} {currentYear}
        </Text>

        <Pressable
          style={({ pressed }) => [styles.arrowButton, pressed && styles.pressedState]}
          onPress={onNextMonth}
          accessibilityRole="button"
          accessibilityLabel="Bulan Berikutnya"
        >
          <Ionicons name="chevron-forward" size={18} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {/* Weekday Names */}
      <View style={styles.weekdayRow}>
        {DAY_NAMES.map((name, index) => (
          <View key={index} style={styles.cellWrapper}>
            <Text style={styles.weekdayText}>{name}</Text>
          </View>
        ))}
      </View>

      {/* Days Matrix */}
      <View style={styles.matrixContainer}>
        {gridCells.map((cell, index) => {
          const isSelected = cell.isCurrentMonth && cell.day === selectedDay;

          return (
            <View key={index} style={styles.cellWrapper}>
              {cell.isCurrentMonth ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.dayButton,
                    isSelected && styles.selectedDayButton,
                    pressed && !isSelected && styles.pressedDay,
                  ]}
                  onPress={() => onSelectDay(cell.day)}
                  accessibilityRole="button"
                  accessibilityLabel={`Tanggal ${cell.day} ${monthName}`}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {cell.day}
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.dayButton}>
                  <Text style={styles.fadedDayText}>{cell.day}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  monthTitle: {
    color: Colors.textPrimary,
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  cellWrapper: {
    width: "14.28%",
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "600",
  },
  matrixContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 6,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDayButton: {
    backgroundColor: "#507B80",
    borderRadius: 8,
  },
  dayText: {
    color: Colors.textPrimary,
    fontSize: 12.5,
    fontWeight: "500",
  },
  selectedDayText: {
    color: Colors.white,
    fontWeight: "700",
  },
  fadedDayText: {
    color: "#D0D5DD",
    fontSize: 12.5,
    fontWeight: "400",
  },
  pressedDay: {
    backgroundColor: "#F2F4F7",
  },
  pressedState: {
    opacity: 0.6,
  },
});

export default CalendarWidget;
