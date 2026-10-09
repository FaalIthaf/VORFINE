import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthFooter } from "../components/AuthFooter";
import { AuthHeader } from "../components/AuthHeader";
import { UserCapsuleBar } from "../components/UserCapsuleBar";
import { Button, Card, Switch } from "@/components/ui";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useAuth } from "../context/AuthContext";

export const FingerprintScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, verifyBiometric, toggleBiometrics } = useAuth();

  const [fastAuthEnabled, setFastAuthEnabled] = useState(
    user?.biometricsEnabled ?? true
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Animated pulse for scanner rings
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const showToast = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("VORFÍNE Biometrik", msg);
    }
  };

  const handleVerifyFingerprint = async () => {
    setIsScanning(true);
    try {
      await verifyBiometric("fingerprint");
      setScanSuccess(true);
      showToast("Sidik Jari Terverifikasi!");
      setTimeout(() => {
        router.replace("/" as any);
      }, 700);
    } catch {
      showToast("Verifikasi gagal. Coba lagi.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Top Header */}
      <View style={{ paddingTop: insets.top }}>
        <AuthHeader stepTitle="Security Pin Setup" onBack={() => router.back()} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Capsule Bar */}
        <UserCapsuleBar
          name={user?.fullName || "Pengguna VORFÍNE"}
          subtitle="IDR ••••••••"
          badgeLabel="Sesi Aktif"
          badgeType="session"
          avatarInitials={user?.avatar || "VF"}
        />

        {/* Main Title Block */}
        <View style={styles.titleBlock}>
          <Text style={styles.mainTitle}>Pindai Sidik Jari</Text>
          <Text style={styles.subtitle}>
            Sentuh sensor sidik jari ponsel Anda untuk masuk dan mengakses saldo
            serta jadwal finansial VORFINE secara aman.
          </Text>
        </View>

        {/* Central Visual Fingerprint Scanner Card */}
        <Pressable
          onPress={handleVerifyFingerprint}
          style={styles.scannerContainer}
        >
          <View style={styles.rippleWrapper}>
            {/* Outer animated ring */}
            <Animated.View
              style={[
                styles.rippleRingOuter,
                { transform: [{ scale: pulseAnim }] },
                scanSuccess && styles.rippleSuccess,
              ]}
            />
            {/* Middle ring */}
            <View style={styles.rippleRingMiddle} />
            {/* Inner ring */}
            <View style={styles.rippleRingInner}>
              <Ionicons
                name={scanSuccess ? "checkmark" : "finger-print-outline"}
                size={48}
                color={scanSuccess ? "#16A34A" : Colors.primary}
              />
            </View>
          </View>

          {/* Scanner Status Message */}
          <View style={styles.scannerStatusRow}>
            <Ionicons
              name={scanSuccess ? "checkmark-circle" : "sparkles"}
              size={15}
              color="#16A34A"
            />
            <Text style={styles.scannerStatusText}>
              {scanSuccess
                ? "Sidik jari terverifikasi! Mengalihkan..."
                : isScanning
                ? "Memindai sidik jari..."
                : "Siap memindai... Letakkan jari pada sensor"}
            </Text>
          </View>
        </Pressable>

        {/* Otorisasi Cepat Transaksi Feature Card */}
        <Card variant="outlined" style={styles.featureCard}>
          <View style={styles.featureIconCircle}>
            <Ionicons name="flash-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.featureTextWrapper}>
            <Text style={styles.featureTitle}>Otorisasi Cepat Transaksi</Text>
            <Text style={styles.featureSubtitle}>
              Gunakan biometrik untuk konfirmasi transaksi & pengeluaran cepat
            </Text>
          </View>
          <Switch
            value={fastAuthEnabled}
            onValueChange={(val) => {
              setFastAuthEnabled(val);
              toggleBiometrics(val);
            }}
          />
        </Card>

        {/* Secure Enclave Notice Box */}
        <View style={styles.secureNoticeBox}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color="#64748B"
            style={styles.secureNoticeIcon}
          />
          <Text style={styles.secureNoticeText}>
            Fitur ini menggunakan <Text style={styles.boldText}>Secure Enclave</Text>{" "}
            perangkat lokal Anda. Data sidik jari dienkripsi secara mandiri dan tidak
            pernah dikirim ke server.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsBlock}>
          <Button
            title="Verifikasi Sidik Jari"
            onPress={handleVerifyFingerprint}
            loading={isScanning}
            size="lg"
            leftIcon={
              <Ionicons name="finger-print" size={20} color={Colors.white} />
            }
            style={styles.primaryActionBtn}
          />

          <Button
            title="Masuk dengan PIN / Kata Sandi"
            onPress={() => router.push("/auth/login" as any)}
            variant="secondary"
            size="md"
            leftIcon={
              <Ionicons name="keypad-outline" size={18} color="#475569" />
            }
            style={styles.secondaryActionBtn}
          />

          {/* Switch to Face ID Link */}
          <Pressable
            style={styles.switchBiometricBtn}
            onPress={() => router.push("/auth/face-id" as any)}
          >
            <Ionicons name="scan-outline" size={16} color={Colors.primary} />
            <Text style={styles.switchBiometricText}>Beralih ke Face ID</Text>
          </Pressable>
        </View>

        {/* Footer Lock */}
        <AuthFooter />
      </ScrollView>
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
  titleBlock: {
    alignItems: "center",
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  scannerContainer: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    borderRadius: BorderRadius.xl,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  rippleWrapper: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  rippleRingOuter: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(220, 252, 231, 0.7)",
  },
  rippleSuccess: {
    backgroundColor: "rgba(187, 247, 208, 0.9)",
  },
  rippleRingMiddle: {
    position: "absolute",
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  rippleRingInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  scannerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  scannerStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#15803D",
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 14,
  },
  featureIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E0F2F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureTextWrapper: {
    flex: 1,
    marginRight: 10,
  },
  featureTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
  },
  secureNoticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  secureNoticeIcon: {
    marginTop: 2,
  },
  secureNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
  },
  boldText: {
    fontWeight: "700",
    color: "#334155",
  },
  actionsBlock: {
    width: "100%",
    gap: 10,
  },
  primaryActionBtn: {
    backgroundColor: Colors.primary,
  },
  secondaryActionBtn: {
    backgroundColor: "#F1F5F9",
    borderWidth: 0,
  },
  switchBiometricBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    marginTop: 2,
  },
  switchBiometricText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
});

export default FingerprintScreen;
