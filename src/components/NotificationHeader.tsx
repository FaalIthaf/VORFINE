import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Spacing } from "../constants/theme";

interface NotificationHeaderProps {
  onBackPress: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  onBackPress,
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
        {/* Left Side: Back Button & Judul "Notifikasi" */}
        <View style={styles.leftSection}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedState,
            ]}
            onPress={onBackPress}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Dashboard"
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </Pressable>
          <Text style={styles.titleText}>Notifikasi</Text>
        </View>

        {/* Right Side: VORFÍNE Logo with Wave */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>VORFÍNE</Text>
          <View style={styles.waveContainer}>
            <View style={styles.waveLineLeft} />
            <View style={styles.waveDip} />
            <View style={styles.waveLineRight} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  titleText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  brandContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    color: Colors.white,
    fontSize: 14.5,
    fontWeight: "800",
    letterSpacing: 1.5,
    fontFamily: Platform.select({ ios: "Times New Roman", default: "serif" }),
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -2,
    width: 36,
    justifyContent: "center",
  },
  waveLineLeft: {
    height: 1.2,
    width: 11,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  waveDip: {
    height: 3,
    width: 6,
    borderBottomWidth: 1.2,
    borderColor: Colors.white,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginHorizontal: 1,
  },
  waveLineRight: {
    height: 1.2,
    width: 11,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  pressedState: {
    opacity: 0.7,
  },
});

export default NotificationHeader;
