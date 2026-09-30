import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { BorderRadius, Colors } from "../../constants/theme";

export type BadgeVariant =
  | "primary"
  | "mint"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "outline"
  | "gold";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "mint",
  icon,
  size = "md",
  style,
  textStyle,
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        style,
      ]}
    >
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text
        style={[
          styles.textBase,
          styles[`text_${variant}`],
          styles[`textSize_${size}`],
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.round,
    alignSelf: "flex-start",
  },
  iconWrapper: {
    marginRight: 5,
  },
  textBase: {
    fontWeight: "600",
  },
  // Sizes
  size_sm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  size_md: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  textSize_sm: {
    fontSize: 11,
  },
  textSize_md: {
    fontSize: 12.5,
  },
  // Variants
  primary: {
    backgroundColor: Colors.primary,
    borderWidth: 0,
  },
  text_primary: {
    color: Colors.white,
  },
  mint: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  text_mint: {
    color: "#15803D",
  },
  success: {
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  text_success: {
    color: "#065F46",
  },
  warning: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  text_warning: {
    color: "#92400E",
  },
  danger: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  text_danger: {
    color: "#B91C1C",
  },
  neutral: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  text_neutral: {
    color: "#475569",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  text_outline: {
    color: "#475569",
  },
  gold: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  text_gold: {
    color: "#B45309",
  },
});

export default Badge;

