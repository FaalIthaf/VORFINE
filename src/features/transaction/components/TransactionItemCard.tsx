import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { TransactionType } from "@/types";

export interface TransactionItemCardProps {
  title: string;
  note?: string;
  date: string;
  amount: string;
  balance: string;
  type: TransactionType;
  onPress?: () => void;
}

export const TransactionItemCard: React.FC<TransactionItemCardProps> = ({
  title,
  note,
  date,
  amount,
  balance,
  type,
  onPress,
}) => {
  const isIncome = type === "income";
  const balanceDisplay = balance.startsWith("Saldo:")
    ? balance
    : `Saldo: ${balance}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${note ? note + ", " : ""}${date}, ${amount}, ${balanceDisplay}`}
    >
      {/* Left Column: Info Transaksi */}
      <View style={styles.leftColumn}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
        {note ? (
          <Text style={styles.noteText} numberOfLines={1}>
            {note}
          </Text>
        ) : null}
        <Text style={styles.dateText}>{date}</Text>
      </View>

      {/* Right Column: Nominal & Saldo */}
      <View style={styles.rightColumn}>
        <Text style={styles.amountText} numberOfLines={1}>
          {amount}
        </Text>
        <View
          style={[
            styles.balanceBadge,
            isIncome ? styles.incomeBadge : styles.expenseBadge,
          ]}
        >
          <Text
            style={[
              styles.balanceText,
              isIncome ? styles.incomeBadgeText : styles.expenseBadgeText,
            ]}
          >
            {balanceDisplay}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: "#374F53",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  leftColumn: {
    flex: 1,
    paddingRight: Spacing.md,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C2E33",
    letterSpacing: 0.1,
  },
  noteText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#4A5B60",
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "400",
    color: "#7C8C91",
    marginTop: 2,
  },
  rightColumn: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  amountText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1C2E33",
    marginBottom: 5,
  },
  balanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  incomeBadge: {
    backgroundColor: Colors.incomeBg,
  },
  expenseBadge: {
    backgroundColor: Colors.expenseBg,
  },
  balanceText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  incomeBadgeText: {
    color: Colors.incomeText,
  },
  expenseBadgeText: {
    color: Colors.expenseText,
  },
});

export default TransactionItemCard;
