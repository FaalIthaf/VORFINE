import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/theme";

export interface BrandLogoProps {
  color?: string;
  textColor?: string;
  waveColor?: string;
  size?: "small" | "medium" | "large";
  align?: "center" | "flex-start" | "flex-end";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  color = Colors.white,
  textColor,
  waveColor,
  size = "medium",
  align = "center",
}) => {
  const activeTextColor = textColor || color;
  const activeWaveColor = waveColor || color;

  const fontSizes = {
    small: 14,
    medium: 18,
    large: 26,
  };

  const waveScales = {
    small: {
      width: 34,
      lineWidth: 10,
      dipWidth: 6,
      dipHeight: 3,
      thickness: 1.2,
      marginTop: -2,
    },
    medium: {
      width: 44,
      lineWidth: 14,
      dipWidth: 8,
      dipHeight: 4,
      thickness: 1.5,
      marginTop: -2,
    },
    large: {
      width: 66,
      lineWidth: 22,
      dipWidth: 12,
      dipHeight: 6,
      thickness: 2,
      marginTop: -3,
    },
  };

  const scale = waveScales[size] || waveScales.medium;
  const fontSize = fontSizes[size] || fontSizes.medium;

  return (
    <View
      style={[
        styles.brandContainer,
        {
          alignItems:
            align === "flex-start"
              ? "flex-start"
              : align === "flex-end"
                ? "flex-end"
                : "center",
        },
      ]}
    >
      <Text
        style={[
          styles.brandTitle,
          {
            color: activeTextColor,
            fontSize,
            letterSpacing: size === "large" ? 3 : 2,
          },
        ]}
      >
        VORFÍNE
      </Text>
      <View
        style={[
          styles.waveContainer,
          {
            width: scale.width,
            marginTop: scale.marginTop,
            alignSelf: align,
          },
        ]}
      >
        <View
          style={[
            styles.waveLine,
            {
              width: scale.lineWidth,
              height: scale.thickness,
              backgroundColor: activeWaveColor,
            },
          ]}
        />
        <View
          style={[
            styles.waveDip,
            {
              width: scale.dipWidth,
              height: scale.dipHeight,
              borderBottomWidth: scale.thickness,
              borderColor: activeWaveColor,
              borderBottomLeftRadius: scale.dipHeight,
              borderBottomRightRadius: scale.dipHeight,
            },
          ]}
        />
        <View
          style={[
            styles.waveLine,
            {
              width: scale.lineWidth,
              height: scale.thickness,
              backgroundColor: activeWaveColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  brandContainer: {
    justifyContent: "center",
  },
  brandTitle: {
    fontWeight: "800",
    fontFamily: Platform.select({ ios: "Times New Roman", default: "serif" }),
    textAlign: "center",
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  waveLine: {
    borderRadius: 1,
  },
  waveDip: {
    marginHorizontal: 1,
  },
});

export default BrandLogo;
