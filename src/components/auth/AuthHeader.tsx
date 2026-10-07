import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "../BrandLogo";
import { Colors } from "../../constants/theme";

export interface AuthHeaderProps {
  stepTitle?: string;
  onBack?: () => void;
  showAvatar?: boolean;
  showBackButton?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  stepTitle = "Sign In",
  onBack,
  showAvatar = true,
  showBackButton = true,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/" as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      {showBackButton ? (
        <Pressable onPress={handleBack} hitSlop={10} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </Pressable>
      ) : (
        <View style={styles.backButton} />
      )}

      {/* Brand Center */}
      <View style={styles.brandWrapper}>
        <BrandLogo
          size="small"
          textColor={Colors.primary}
          waveColor={Colors.primary}
          align="center"
        />
      </View>

      {/* Right Step Pill / Avatar */}
      <View style={styles.rightWrapper}>
        {stepTitle ? (
          <View style={styles.stepPill}>
            <Text style={styles.stepText}>{stepTitle}</Text>
          </View>
        ) : null}
        {showAvatar && (
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={14} color={Colors.white} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  brandWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  rightWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stepText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AuthHeader;

