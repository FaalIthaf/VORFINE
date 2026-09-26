import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";

interface FinanceSummaryProps {
  incomeAmount: number;
  expenseAmount: number;
  monthName: string;
  onPressIncome?: () => void;
  onPressExpense?: () => void;
}

export const FinanceSummary: React.FC<FinanceSummaryProps> = ({
  incomeAmount,
  expenseAmount,
  monthName,
  onPressIncome,
  onPressExpense,
}) => {
  const formatRupiah = (val: number): string => {
    if (val === 0) return "Rp 0";
    const formatted = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formatted},00`;
  };

  return (
    <View style={styles.container}>
      {/* Pemasukan Card */}
      <Pressable
        style={({ pressed }) => [
          styles.card,
          styles.incomeCard,
          pressed && styles.pressedState,
        ]}
        onPress={onPressIncome}
        accessibilityRole="button"
        accessibilityLabel={`Pemasukan bulan ${monthName}: ${formatRupiah(incomeAmount)}`}
      >
        <View style={styles.topRow}>
          <Text
            style={[styles.amountText, styles.incomeText]}
            numberOfLines={1}
          >
            {formatRupiah(incomeAmount)}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.incomeText}
            style={styles.chevron}
          />
        </View>
        <Text style={[styles.label, styles.incomeText]}>
          Pemasukkan ({monthName})
        </Text>
      </Pressable>

      {/* Pengeluaran Card */}
      <Pressable
        style={({ pressed }) => [
          styles.card,
          styles.expenseCard,
          pressed && styles.pressedState,
        ]}
        onPress={onPressExpense}
        accessibilityRole="button"
        accessibilityLabel={`Pengeluaran bulan ${monthName}: ${formatRupiah(expenseAmount)}`}
      >
        <View style={styles.topRow}>
          <Text
            style={[styles.amountText, styles.expenseText]}
            numberOfLines={1}
          >
            {formatRupiah(expenseAmount)}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.expenseText}
            style={styles.chevron}
          />
        </View>
        <Text style={[styles.label, styles.expenseText]}>
          Pengeluaran ({monthName})
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
  },
  incomeCard: {
    backgroundColor: Colors.incomeBg,
    borderColor: Colors.incomeBorder,
  },
  expenseCard: {
    backgroundColor: Colors.expenseBg,
    borderColor: Colors.expenseBorder,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  amountText: {
    fontSize: 14.5,
    fontWeight: "700",
    flexShrink: 1,
  },
  chevron: {
    marginLeft: 4,
  },
  label: {
    fontSize: 11.5,
    fontWeight: "500",
  },
  incomeText: {
    color: Colors.incomeText,
  },
  expenseText: {
    color: Colors.expenseText,
  },
  pressedState: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
