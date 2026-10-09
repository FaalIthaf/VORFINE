import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";

interface BalanceCardProps {
  title: string;
  amount: number;
  isMasked: boolean;
  onToggleMask: () => void;
  hasDropdown?: boolean;
  onPressDropdown?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  amount,
  isMasked,
  onToggleMask,
  hasDropdown = false,
  onPressDropdown,
}) => {
  const formatAmount = (val: number): string => {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <View style={styles.card}>
      {/* Title Row */}
      <View style={styles.titleRow}>
        {hasDropdown ? (
          <Pressable
            style={({ pressed }) => [
              styles.dropdownHeader,
              pressed && styles.pressedState,
            ]}
            onPress={onPressDropdown}
          >
            <Text style={styles.cardTitle}>{title}</Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={Colors.textLight}
              style={styles.dropdownIcon}
            />
          </Pressable>
        ) : (
          <Text style={styles.cardTitle}>{title}</Text>
        )}
      </View>

      {/* Amount and Eye Toggle Row */}
      <View style={styles.amountRow}>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyPrefix}>IDR </Text>
          <Text style={styles.amountText}>
            {isMasked ? "••••••••" : formatAmount(amount)}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.eyeButton,
            pressed && styles.pressedState,
          ]}
          onPress={onToggleMask}
          accessibilityRole="button"
          accessibilityLabel={
            isMasked ? "Tampilkan Saldo" : "Sembunyikan Saldo"
          }
        >
          {isMasked ? (
            <Ionicons
              name="eye-off-outline"
              size={22}
              color={Colors.textLightMuted}
            />
          ) : (
            <Ionicons name="eye-outline" size={22} color={Colors.textLight} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.tealSlate,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownIcon: {
    marginLeft: 6,
  },
  cardTitle: {
    color: Colors.textLight,
    fontSize: 13.5,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyPrefix: {
    color: Colors.textLight,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  amountText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
  },
  eyeButton: {
    padding: Spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  pressedState: {
    opacity: 0.65,
  },
});
