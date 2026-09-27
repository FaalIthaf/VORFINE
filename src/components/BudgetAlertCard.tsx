import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";

interface BudgetAlertCardProps {
  budget: string;
  onBudgetChange: (text: string) => void;
  reminderTime: string;
  onPressReminderTime: () => void;
  period: string;
  onPressPeriod: () => void;
  onSaveAlert: () => void;
}

export const BudgetAlertCard: React.FC<BudgetAlertCardProps> = ({
  budget,
  onBudgetChange,
  reminderTime,
  onPressReminderTime,
  period,
  onPressPeriod,
  onSaveAlert,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Header Card dengan garis horizontal */}
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>Tambah Transaksi Baru</Text>
        <View style={styles.cardTitleLine} />
      </View>

      {/* Field: Budget */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Budget</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="IDR"
            placeholderTextColor="#9EAFAF"
            value={budget}
            onChangeText={onBudgetChange}
            keyboardType="numeric"
            accessibilityLabel="Input Budget"
          />
        </View>
      </View>

      {/* Baris Dropdown: Waktu Pengingat & Periode Waktu */}
      <View style={styles.dropdownRow}>
        {/* Kolom 1: Waktu Pengingat */}
        <View style={styles.dropdownCol}>
          <Text style={styles.fieldLabel}>Waktu Pengingat</Text>
          <Pressable
            style={({ pressed }) => [
              styles.dropdownBox,
              pressed && styles.pressedState,
            ]}
            onPress={onPressReminderTime}
            accessibilityRole="button"
            accessibilityLabel={`Pilih waktu pengingat: ${reminderTime}`}
          >
            <Text style={styles.dropdownText}>{reminderTime}</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color="#1B2C2F"
              style={styles.chevronIcon}
            />
          </Pressable>
        </View>

        {/* Kolom 2: Periode Waktu */}
        <View style={styles.dropdownCol}>
          <Text style={styles.fieldLabel}>Periode Waktu</Text>
          <Pressable
            style={({ pressed }) => [
              styles.dropdownBox,
              pressed && styles.pressedState,
            ]}
            onPress={onPressPeriod}
            accessibilityRole="button"
            accessibilityLabel={`Pilih periode waktu: ${period}`}
          >
            <View style={styles.periodLeft}>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={18}
                color="#61787B"
              />
              <Text style={[styles.dropdownText, styles.periodText]}>
                {period}
              </Text>
            </View>
            <Ionicons
              name="chevron-down"
              size={16}
              color="#1B2C2F"
              style={styles.chevronIcon}
            />
          </Pressable>
        </View>
      </View>

      {/* Tombol Aksi: SIMPAN PERINGATAN */}
      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          pressed && styles.pressedButton,
        ]}
        onPress={onSaveAlert}
        accessibilityRole="button"
        accessibilityLabel="Simpan Peringatan"
      >
        <Text style={styles.saveButtonText}>SIMPAN PERINGATAN</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: "#4A6B70",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B2C2F",
    marginRight: 8,
  },
  cardTitleLine: {
    flex: 1,
    height: 1.2,
    backgroundColor: "#8CA5A8",
  },
  fieldGroup: {
    marginBottom: Spacing.md - 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1B2C2F",
    marginBottom: 5,
  },
  inputBox: {
    borderWidth: 1.5,
    borderColor: "#3B6F75",
    borderRadius: 8,
    height: 40,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  textInput: {
    fontSize: 13,
    color: "#1B2C2F",
    paddingVertical: 0,
  },
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dropdownCol: {
    flex: 1,
  },
  dropdownBox: {
    borderWidth: 1.5,
    borderColor: "#3B6F75",
    borderRadius: 8,
    height: 40,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
  },
  dropdownText: {
    fontSize: 12,
    color: "#2C3E50",
    fontWeight: "500",
  },
  periodLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  periodText: {
    marginLeft: 6,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: "#3B6F75",
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 9,
    alignSelf: "center",
    marginTop: Spacing.md + 2,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  pressedState: {
    opacity: 0.75,
  },
  pressedButton: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

export default BudgetAlertCard;
