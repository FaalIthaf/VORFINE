import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  // Legacy template compatibility
  light: {
    text: "#2C3E50",
    background: "#F4F6F6",
    backgroundElement: "#EAECEE",
    backgroundSelected: "#D5DBDB",
    textSecondary: "#7F8C8D",
  },
  dark: {
    text: "#FFFFFF",
    background: "#1A252F",
    backgroundElement: "#2C3E50",
    backgroundSelected: "#34495E",
    textSecondary: "#BDC3C7",
  },

  // VORFÍNE Core Colors
  primary: "#2C6E6A",
  primaryDark: "#1F4E4B",
  primaryLight: "#3D8E89",
  tealSlate: "#2C6E6A",
  tealSlateDark: "#1F4E4B",
  mintSoft: "#E8F5E9",
  mintBorder: "#D1E7DD",
  mintText: "#1B5E20",
  charcoal: "#1E1E1E",
  mediumGrey: "#6C757D",
  cardBg: "#F8F9FA",
  inputBorder: "#E2E8F0",
  inputBg: "#F8FAFC",
  background: "#FFFFFF",
  screenBackground: "#F8F9FA",
  white: "#FFFFFF",

  // Text Colors
  textPrimary: "#1E1E1E",
  textSecondary: "#6C757D",
  textLight: "#FFFFFF",
  textLightMuted: "#D0E5E7",

  // Financial Cards & Badges
  incomeBg: "#D2F8DF",
  incomeBorder: "#A6E5B7",
  incomeText: "#16803C",

  expenseBg: "#FFD8D8",
  expenseBorder: "#F7B8B5",
  expenseText: "#C5221F",

  // Detail Page Accents
  cardBorderSubtle: "#3F6469",
  statBadgeGreen: "#439B6C",
  filterPillBg: "#E5EAEC",
  historyBadgeBg: "#3A656B",

  // Notification Theme Colors
  notificationBgDark: "#D0D7D9",
  notificationBgLight: "#FFFFFF",
  notificationCardBg: "#42767D",
  notificationCardBorder: "#31545A",

  // Status & Checkbox
  successGreen: "#27AE60",
  successGreenDark: "#1E8449",

  // Category Tag Colors
  category: {
    rutinitas: {
      bg: "#EAF2F8",
      border: "#A9CCE3",
      text: "#2471A3",
    },
    domestik: {
      bg: "#E8F8F5",
      border: "#A3E4D7",
      text: "#17A589",
    },
    pekerjaan: {
      bg: "#FEF9E7",
      border: "#F9E79F",
      text: "#B7950B",
    },
    lainnya: {
      bg: "#EAFaf1",
      border: "#A9DFBF",
      text: "#1E8449",
    },
  },

  // Borders & Dividers
  border: "#D5DBDB",
  borderLight: "#E5E8E8",
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 16,
  round: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
