import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors } from "../../constants/theme";

export interface UserCapsuleBarProps {
  name: string;
  subtitle: string;
  badgeLabel: string;
  badgeType?: "session" | "biometric";
  avatarInitials?: string;
}

export const UserCapsuleBar: React.FC<UserCapsuleBarProps> = ({
  name,
  subtitle,
  badgeLabel,
  badgeType = "session",
  avatarInitials = "MF",
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitials}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>
        </View>
      </View>

      <View
        style={[
          styles.badgePill,
          badgeType === "session" ? styles.badgeSession : styles.badgeBiometric,
        ]}
      >
        {badgeType === "session" ? (
          <View style={styles.activeDot} />
        ) : (
          <Ionicons name="finger-print-outline" size={12} color="#0D9488" style={{ marginRight: 3 }} />
        )}
        <Text
          style={[
            styles.badgeText,
            badgeType === "session" ? styles.badgeTextSession : styles.badgeTextBiometric,
          ]}
        >
          {badgeLabel}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  infoCol: {
    flex: 1,
  },
  nameText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitleText: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  badgeSession: {
    backgroundColor: "#DCFCE7",
  },
  badgeBiometric: {
    backgroundColor: "#CCFBF1",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTextSession: {
    color: "#15803D",
  },
  badgeTextBiometric: {
    color: "#0F766E",
    letterSpacing: 0.5,
  },
});

export default UserCapsuleBar;

