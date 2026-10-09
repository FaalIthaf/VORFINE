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
import { Colors, Spacing } from "@/constants/theme";
import { BrandLogo } from "@/components/BrandLogo";

interface DetailHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onBackPress: () => void;
  onSearchSubmit?: () => void;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onBackPress,
  onSearchSubmit,
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
          onPress={onBackPress}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Dashboard"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari Transaksi"
            placeholderTextColor="#8B9DA0"
            value={searchQuery}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
            accessibilityLabel="Cari Transaksi"
          />
          {searchQuery.length > 0 ? (
            <Pressable
              onPress={() => onSearchChange("")}
              hitSlop={8}
              style={styles.searchIconWrapper}
            >
              <Ionicons name="close-circle" size={18} color="#7F9497" />
            </Pressable>
          ) : (
            <View style={styles.searchIconWrapper}>
              <Ionicons name="search" size={18} color={Colors.primaryDark} />
            </View>
          )}
        </View>

        {/* App Logo / Title */}
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
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 22,
    height: 38,
    marginHorizontal: Spacing.sm,
    paddingHorizontal: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#2C3E50",
    paddingVertical: 0,
  },
  searchIconWrapper: {
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  brandContainer: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
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

export default DetailHeader;
