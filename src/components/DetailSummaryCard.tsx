import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";

interface DetailSummaryCardProps {
  title: string;
  amount: string;
  statPercentage?: string;
  transactionCount?: number;
}

export const DetailSummaryCard: React.FC<DetailSummaryCardProps> = ({
  title,
  amount,
  transactionCount = 2,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Title */}
      <Text style={styles.titleText}>{title}</Text>

      {/* Main Nominal */}
      <Text style={styles.amountText} numberOfLines={1} adjustsFontSizeToFit>
        {amount}
      </Text>

      {/* Badges Sub-info Row */}
      <View style={styles.subInfoRow}>
        <Text style={styles.transactionCountText}>
          {transactionCount} Transaksi
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg + 2,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  titleText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  amountText: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "800",
    marginVertical: Spacing.md,
    letterSpacing: 0.5,
  },
  subInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statPill: {
    backgroundColor: "#429A6E",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    flexDirection: "row",
    alignItems: "center",
  },
  arrowIcon: {
    marginRight: 4,
  },
  statPillText: {
    color: Colors.white,
    fontSize: 11.5,
    fontWeight: "600",
  },
  transactionCountText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: "500",
  },
});

export default DetailSummaryCard;
