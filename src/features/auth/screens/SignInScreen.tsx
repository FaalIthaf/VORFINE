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
import { AuthFooter } from "../components/AuthFooter";
import { ForgotPasswordModal } from "../components/ForgotPasswordModal";
import { BrandLogo } from "@/components/BrandLogo";
import { Button, Checkbox, Input } from "@/components/ui";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useAuth } from "../context/AuthContext";

export const SignInScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);

  const handleLogin = async () => {
    // Strict validation
    if (!emailOrUsername.trim()) {
      setErrorMsg("Email atau username wajib diisi.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Kata sandi wajib diisi.");
      return;
    }
    if (password.trim().length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
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
    } catch (err) {
      setErrorMsg("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPasswordVisible(true);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Top Safe Area Inset — Header removed for clean, focused login UI */}
      <View style={{ height: insets.top }} />

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

            {/* Register Link */}
            <View style={styles.switchAuthRow}>
              <Text style={styles.switchAuthPrompt}>Belum memiliki akun VORFÍNE? </Text>
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

      {/* Forgot Password 3-Step Wizard Modal */}
      <ForgotPasswordModal
        visible={isForgotPasswordVisible}
        onClose={() => setIsForgotPasswordVisible(false)}
        onSuccess={(email) => {
          setEmailOrUsername(email);
          Alert.alert(
            "Berhasil",
            "Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda."
          );
        }}
      />
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
    marginTop: 18,
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
