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
import { Badge, Button, Checkbox, Input } from "../../components/ui";
import { BorderRadius, Colors, Spacing } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("Muhammad Ivan Fadholli");
  const [email, setEmail] = useState("ivan@vorfine.com");
  const [phone, setPhone] = useState("+62 812-3456-7890");
  const [password, setPassword] = useState("Secret@123!");
  const [confirmPassword, setConfirmPassword] = useState("Secret@123!");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [enableBiometrics, setEnableBiometrics] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Simple password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { percent: 0, text: "Lemah", color: "#DC2626" };
    let score = 0;
    if (password.length >= 8) score += 35;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    if (score >= 80) return { percent: 100, text: "Kuat", color: "#16A34A" };
    if (score >= 50) return { percent: 65, text: "Sedang", color: "#F59E0B" };
    return { percent: 35, text: "Lemah", color: "#DC2626" };
  };

  const strength = getPasswordStrength();

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Mohon lengkapi semua kolom pendaftaran.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Anda harus menyetujui Syarat & Ketentuan serta Privasi.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);
    try {
      const res = await register({
        fullName,
        email,
        phone,
        password,
        biometricsEnabled: enableBiometrics,
        smartNotifications: enableBiometrics,
      });

      if (res.success) {
        Alert.alert(
          "Pendaftaran Berhasil",
          "Akun Anda siap! Lanjutkan untuk mengatur PIN & Biometrik keamanan.",
          [
            {
              text: "Atur Biometrik",
              onPress: () => router.push("/auth/fingerprint" as any),
            },
            {
              text: "Ke Beranda",
              onPress: () => router.replace("/" as any),
            },
          ]
        );
      } else {
        setErrorMsg(res.message || "Gagal membuat akun.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Top Header */}
      <View style={{ paddingTop: insets.top }}>
        <AuthHeader stepTitle="Sign Up" onBack={() => router.back()} />
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
            <Text style={styles.headingTitle}>Buat Akun Baru</Text>
            <Text style={styles.subtitleText}>
              Mulai atur alur keuangan dan jadwal produktivitas harianmu
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

            {/* Nama Lengkap */}
            <Input
              label="Nama Lengkap"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Muhammad Ivan Fadholli"
              leftIcon={<Ionicons name="person-outline" size={18} color="#94A3B8" />}
            />

            {/* Email Aktif */}
            <Input
              label="Email Aktif"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@domain.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={18} color="#94A3B8" />}
            />

            {/* Nomor WhatsApp / HP */}
            <Input
              label="Nomor WhatsApp / HP"
              value={phone}
              onChangeText={setPhone}
              placeholder="+62 812-xxxx-xxxx"
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={18} color="#94A3B8" />}
            />

            {/* Buat Kata Sandi */}
            <Input
              label="Buat Kata Sandi"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 8 karakter unik"
              isPassword
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />}
              rightBadge={
                <View style={styles.strengthBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
                  <Text style={styles.strengthBadgeText}>{strength.text}</Text>
                </View>
              }
            />

            {/* Password Strength Indicator Row */}
            <View style={styles.strengthRow}>
              <View style={styles.strengthBarBg}>
                <View
                  style={[
                    styles.strengthBarFill,
                    {
                      width: `${strength.percent}%`,
                      backgroundColor: strength.color,
                    },
                  ]}
                />
              </View>
              <View style={styles.strengthTextRow}>
                <Text style={styles.strengthHintText}>
                  Kombinasi huruf, angka & simbol aktif
                </Text>
                <Text style={styles.strengthPercentText}>
                  Tingkat Keamanan {strength.percent}%
                </Text>
              </View>
            </View>

            {/* Konfirmasi Kata Sandi */}
            <Input
              label="Konfirmasi Kata Sandi"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Ulangi kata sandi Anda"
              isPassword
              leftIcon={<Ionicons name="repeat-outline" size={18} color="#94A3B8" />}
              rightIcon={
                confirmPassword && confirmPassword === password ? (
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                ) : undefined
              }
            />

            {/* Checkbox 1: Terms */}
            <View style={styles.checkboxContainer}>
              <Checkbox
                checked={agreeTerms}
                onToggle={setAgreeTerms}
                label={
                  <Text style={styles.checkboxLabel}>
                    Saya menyetujui{" "}
                    <Text style={styles.highlightText}>Syarat & Ketentuan</Text>{" "}
                    serta{" "}
                    <Text style={styles.highlightText}>Kebijakan Privasi</Text>{" "}
                    VORFINE.
                  </Text>
                }
              />
            </View>

            {/* Checkbox 2: Biometrics */}
            <View style={styles.checkboxContainer}>
              <Checkbox
                checked={enableBiometrics}
                onToggle={setEnableBiometrics}
                label={
                  <Text style={styles.checkboxLabel}>
                    Aktifkan otentikasi biometrik & notifikasi cerdas untuk
                    pengingat keuangan terjadwal.
                  </Text>
                }
              />
            </View>

            {/* Submit Button */}
            <Button
              title="Daftar Sekarang"
              onPress={handleRegister}
              loading={isLoading}
              size="lg"
              leftIcon={<Ionicons name="person-add-outline" size={18} color={Colors.white} />}
              style={styles.submitBtn}
            />

            {/* Already have account link */}
            <View style={styles.switchAuthRow}>
              <Text style={styles.switchAuthPrompt}>Sudah punya akun? </Text>
              <Pressable onPress={() => router.push("/auth/login" as any)}>
                <Text style={styles.switchAuthLink}>Masuk di sini {"->"}</Text>
              </Pressable>
            </View>

            {/* 2 Feature Badges */}
            <View style={styles.featureBadgesRow}>
              <Badge
                label="Bebas Biaya Langganan"
                variant="mint"
                icon={<Ionicons name="checkmark" size={12} color="#15803D" />}
              />
              <Badge
                label="Penyimpanan Terenkripsi"
                variant="neutral"
                icon={<Ionicons name="lock-closed" size={12} color="#475569" />}
              />
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
    marginTop: 6,
    marginBottom: 20,
  },
  headingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 12.5,
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
  strengthBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  strengthBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  strengthRow: {
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  strengthBarBg: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  strengthHintText: {
    fontSize: 11,
    color: "#64748B",
  },
  strengthPercentText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0F172A",
  },
  checkboxContainer: {
    marginBottom: 12,
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 17,
  },
  highlightText: {
    color: Colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginBottom: 18,
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
  featureBadgesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 6,
  },
});

export default SignUpScreen;

