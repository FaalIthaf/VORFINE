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
  primary: "#4E878C",
  primaryDark: "#3E6F74",
  tealSlate: "#457980",
  tealSlateDark: "#3A676D",
  background: "#F4F6F6",
  white: "#FFFFFF",

  // Text Colors
  textPrimary: "#2C3E50",
  textSecondary: "#7F8C8D",
  textLight: "#FFFFFF",
  textLightMuted: "#D0E5E7",

  // Financial Cards
  incomeBg: "#D4F5DE",
  incomeBorder: "#A6E5B7",
  incomeText: "#1B7B3E",

  expenseBg: "#FCE0DF",
  expenseBorder: "#F7B8B5",
  expenseText: "#C0392B",

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
    keuangan: {
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
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
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
