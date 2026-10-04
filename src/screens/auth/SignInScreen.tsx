import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthFooter } from "../../components/auth/AuthFooter";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { BrandLogo } from "../../components/BrandLogo";
import { Button, Checkbox, Input } from "../../components/ui";
import { BorderRadius, Colors, Spacing } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export const SignInScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!emailOrUsername.trim() || !password.trim()) {
      setErrorMsg("Email atau username dan kata sandi wajib diisi.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    try {
      const res = await login(emailOrUsername, password, rememberMe);
      if (res.success) {
        router.replace("/" as any);
      } else {
        setErrorMsg(res.message || "Gagal masuk. Periksa kembali akun Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Lupa Kata Sandi",
      "Tautan pemulihan kata sandi telah dikirimkan ke email terdaftar Anda.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Top Header */}
      <View style={{ paddingTop: insets.top }}>
        <AuthHeader stepTitle="Sign In" onBack={() => router.replace("/auth/register" as any)} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Title Section */}
          <View style={styles.brandTitleBlock}>
            <BrandLogo
              size="medium"
              textColor={Colors.primary}
              waveColor={Colors.primary}
              align="center"
            />
            <Text style={styles.headingTitle}>Selamat Datang Kembali</Text>
            <Text style={styles.subtitleText}>
              Kelola keuangan & produktivitas harianmu dalam satu sentuhan
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            {errorMsg ? (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorAlertText}>{errorMsg}</Text>
              </View>
            ) : null}

            <Input
              label="Email atau Username"
              value={emailOrUsername}
              onChangeText={(text) => {
                setEmailOrUsername(text);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="contoh@vorfine.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={18} color="#94A3B8" />}
            />

            <Input
              label="Kata Sandi"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Masukkan kata sandi"
              isPassword
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />}
            />

            {/* Remember Me & Forgot Password */}
            <View style={styles.actionRow}>
              <Checkbox
                checked={rememberMe}
                onToggle={setRememberMe}
                label="Ingat saya"
              />
              <Pressable onPress={handleForgotPassword} hitSlop={6}>
                <Text style={styles.forgotPasswordText}>Lupa Kata Sandi?</Text>
              </Pressable>
            </View>

            {/* Primary Submit Button */}
            <Button
              title="Masuk Sekarang"
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
              rightIcon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
              style={styles.submitBtn}
            />

            {/* Instant Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ATAU MASUK DENGAN INSTAN</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Biometrics Option Cards */}
            <View style={styles.biometricsRow}>
              <Pressable
                style={styles.biometricCard}
                onPress={() => router.push("/auth/fingerprint" as any)}
              >
                <View style={styles.biometricIconCircle}>
                  <Ionicons name="finger-print-outline" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.biometricTitle}>Fingerprint</Text>
                <Text style={styles.biometricSubtitle}>Sentuh Sensor</Text>
              </Pressable>

              <Pressable
                style={styles.biometricCard}
                onPress={() => router.push("/auth/face-id" as any)}
              >
                <View style={styles.biometricIconCircle}>
                  <Ionicons name="scan-outline" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.biometricTitle}>Face ID</Text>
                <Text style={styles.biometricSubtitle}>Pindai Wajah</Text>
              </Pressable>
            </View>

            {/* Register Link */}
            <View style={styles.switchAuthRow}>
              <Text style={styles.switchAuthPrompt}>Belum memiliki akun VORFINE? </Text>
              <Pressable onPress={() => router.push("/auth/register" as any)}>
                <Text style={styles.switchAuthLink}>Daftar Akun Baru</Text>
              </Pressable>
            </View>

            {/* Green Trust Badge */}
            <View style={styles.trustBadgeContainer}>
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
                <Text style={styles.trustBadgeText}>Keamanan Data Terjamin & Terenkripsi</Text>
              </View>
            </View>
          </View>

          {/* Footer Lock */}
          <AuthFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  brandTitleBlock: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
  },
  headingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 14,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 290,
    lineHeight: 18,
  },
  formCard: {
    width: "100%",
  },
  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: BorderRadius.md,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorAlertText: {
    color: "#DC2626",
    fontSize: 12.5,
    fontWeight: "500",
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 2,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    marginBottom: 22,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  biometricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  biometricCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.xl,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  biometricIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0F2F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  biometricTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  biometricSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  switchAuthRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  switchAuthPrompt: {
    fontSize: 13,
    color: "#64748B",
  },
  switchAuthLink: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  trustBadgeContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 6,
  },
  trustBadgeText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#15803D",
  },
});

export default SignInScreen;

