import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { BorderRadius, Colors, Spacing } from "../../constants/theme";

export type CardVariant = "elevated" | "flat" | "outlined" | "mint" | "dark";

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: keyof typeof Spacing;
  borderRadius?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "outlined",
  style,
  onPress,
  padding = "lg",
  borderRadius = BorderRadius.xl,
}) => {
  const cardStyles: StyleProp<ViewStyle> = [
    styles.base,
    styles[variant],
    {
      padding: Spacing[padding],
      borderRadius,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyles, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    width: "100%",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  elevated: {
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  flat: {
    backgroundColor: "#F8FAFC",
  },
  outlined: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  mint: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  dark: {
    backgroundColor: "#1A3B44",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
});

export default Card;

