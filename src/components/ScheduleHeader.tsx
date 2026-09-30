import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Spacing } from "../constants/theme";
import { BrandLogo } from "./BrandLogo";

interface ScheduleHeaderProps {
  searchQuery: string;
  onChangeSearchQuery: (text: string) => void;
  onPressBack: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  searchQuery,
  onChangeSearchQuery,
  onPressBack,
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
        {/* Back Button */}
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedState,
          ]}
          onPress={onPressBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Beranda"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>

        {/* Capsule Search Bar */}
        <View style={styles.searchBarWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari Transaksi"
            placeholderTextColor="#98A2B3"
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            returnKeyType="search"
          />
          <Ionicons
            name="search-outline"
            size={18}
            color="#667085"
            style={styles.searchIcon}
          />
        </View>

        {/* Brand Title */}
        <BrandLogo color={Colors.white} size="medium" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarWrapper: {
    flex: 1,
    height: 36,
    backgroundColor: Colors.white,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 0,
    height: "100%",
  },
  searchIcon: {
    marginLeft: 6,
  },
  brandContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 4,
  },
  brandTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1.5,
    fontFamily: Platform.select({ ios: "Times New Roman", default: "serif" }),
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -2,
    width: 38,
    justifyContent: "center",
  },
  waveLineLeft: {
    height: 1.5,
    width: 12,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  waveDip: {
    height: 3.5,
    width: 6,
    borderBottomWidth: 1.5,
    borderColor: Colors.white,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginHorizontal: 1,
  },
  waveLineRight: {
    height: 1.5,
    width: 12,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  pressedState: {
    opacity: 0.7,
  },
});

export default ScheduleHeader;
