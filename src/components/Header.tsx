import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Spacing } from "../constants/theme";
import { BrandLogo } from "./BrandLogo";

interface HeaderProps {
  currentProfileName: string;
  onPressProfile: () => void;
  onPressNotification: () => void;
  hasUnreadNotification?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfileName,
  onPressProfile,
  onPressNotification,
  hasUnreadNotification = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: Math.max(insets.top, 12) + 8 },
      ]}
    >
      <View style={styles.headerRow}>
        {/* Profile Selector */}
        <Pressable
          style={({ pressed }) => [
            styles.profileButton,
            pressed && styles.pressedState,
          ]}
          onPress={onPressProfile}
          accessibilityRole="button"
          accessibilityLabel="Ganti Profil"
        >
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={14} color={Colors.white} />
          </View>
          <Text style={styles.profileName} numberOfLines={1}>
            {currentProfileName}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={Colors.white}
            style={styles.chevronIcon}
          />
        </Pressable>

        {/* Brand Title */}
        <BrandLogo color={Colors.white} size="medium" />

        {/* Notification Button */}
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressedState,
          ]}
          onPress={onPressNotification}
          accessibilityRole="button"
          accessibilityLabel="Notifikasi"
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={Colors.white}
          />
          {hasUnreadNotification && <View style={styles.notificationDot} />}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 40,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "45%",
    paddingVertical: Spacing.xs,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  profileName: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  brandContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
    fontFamily: Platform.select({ ios: "Times New Roman", default: "serif" }),
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -2,
    width: 44,
    justifyContent: "center",
  },
  waveLineLeft: {
    height: 1.5,
    width: 14,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  waveDip: {
    height: 4,
    width: 8,
    borderBottomWidth: 1.5,
    borderColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginHorizontal: 1,
  },
  waveLineRight: {
    height: 1.5,
    width: 14,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E74C3C",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  pressedState: {
    opacity: 0.7,
  },
});
