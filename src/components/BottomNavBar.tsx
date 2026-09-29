import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Spacing } from "../constants/theme";
import { TabType } from "../types";

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.navContainer,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      <View style={styles.tabsRow}>
        {/* Tab 1: Home */}
        <Pressable
          style={({ pressed }) => [
            styles.tabButton,
            pressed && styles.pressedState,
          ]}
          onPress={() => onSelectTab("home")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "home" }}
          accessibilityLabel="Beranda"
        >
          <Image
            source={require("../../assets/images/tabIcons/HomeIcon.png")}
            style={[
              styles.customIcon,
              { opacity: activeTab === "home" ? 1 : 0.65 },
            ]}
            resizeMode="contain"
          />
          {activeTab === "home" && <View style={styles.activeIndicator} />}
        </Pressable>

        {/* Tab 2: Keuangan */}
        <Pressable
          style={({ pressed }) => [
            styles.tabButton,
            pressed && styles.pressedState,
          ]}
          onPress={() => onSelectTab("finance")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "finance" }}
          accessibilityLabel="Keuangan"
        >
          <Image
            source={require("../../assets/images/tabIcons/MoneyIcon.png")}
            style={[
              styles.customMoneyIcon,
              { opacity: activeTab === "finance" ? 1 : 0.65 },
            ]}
            resizeMode="contain"
          />
          {activeTab === "finance" && <View style={styles.activeIndicator} />}
        </Pressable>

        {/* Tab 3: Jadwal */}
        <Pressable
          style={({ pressed }) => [
            styles.tabButton,
            pressed && styles.pressedState,
          ]}
          onPress={() => onSelectTab("schedule")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "schedule" }}
          accessibilityLabel="Jadwal"
        >
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={28}
            color={Colors.white}
            style={{ opacity: activeTab === "schedule" ? 1 : 0.65 }}
          />
          {activeTab === "schedule" && <View style={styles.activeIndicator} />}
        </Pressable>

        {/* Tab 4: Menu / Info & Changelog (Icon Grid 4 Kotak) */}
        <Pressable
          style={({ pressed }) => [
            styles.tabButton,
            pressed && styles.pressedState,
          ]}
          onPress={() => onSelectTab("menu")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "menu" }}
          accessibilityLabel="Menu dan Info Aplikasi"
        >
          <Ionicons
            name="grid-outline"
            size={25}
            color={Colors.white}
            style={{ opacity: activeTab === "menu" ? 1 : 0.65 }}
          />
          {activeTab === "menu" && <View style={styles.activeIndicator} />}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: Colors.primary,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: Spacing.sm + 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  tabButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minWidth: 54,
    minHeight: 38,
  },
  customIcon: {
    width: 27,
    height: 27,
    tintColor: Colors.white,
  },
  customMoneyIcon: {
    width: 38,
    height: 27,
    tintColor: Colors.white,
  },
  customSettingsIcon: {
    width: 26,
    height: 26,
    tintColor: Colors.white,
  },
  activeIndicator: {
    position: "absolute",
    bottom: -6,
    width: 18,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.white,
  },
  pressedState: {
    opacity: 0.5,
    transform: [{ scale: 0.92 }],
  },
});
