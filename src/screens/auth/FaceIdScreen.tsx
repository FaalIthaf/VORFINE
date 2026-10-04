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
import { AuthFooter } from "../../components/auth/AuthFooter";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { UserCapsuleBar } from "../../components/auth/UserCapsuleBar";
import { Badge, Button } from "../../components/ui";
import { BorderRadius, Colors, Spacing } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export const FaceIdScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, verifyBiometric } = useAuth();

  const [scanProgress, setScanProgress] = useState(85);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Scan line animation
  const [scanLineAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    scanLoop.start();
    return () => scanLoop.stop();
  }, [scanLineAnim]);

  const showToast = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("Face ID", msg);
    }
  };

  const handleScanFace = async () => {
    setIsScanning(true);
    setScanProgress(92);
    try {
      await verifyBiometric("face");
      setScanProgress(100);
      setScanSuccess(true);
      showToast("Wajah Berhasil Dikenali!");
      setTimeout(() => {
        router.replace("/" as any);
      }, 700);
    } catch {
      showToast("Pemindaian gagal. Arahkan kembali wajah Anda.");
    } finally {
      setIsScanning(false);
    }
  };

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 160],
  });

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
          subtitle="Status: Terverifikasi"
          badgeLabel="BIOMETRIK"
          badgeType="biometric"
          avatarInitials={user?.avatar || "VF"}
        />

        {/* Safe Auth Badge Pill */}
        <View style={styles.safeAuthBadgeWrapper}>
          <View style={styles.safeAuthBadge}>
            <Ionicons name="shield-checkmark" size={13} color={Colors.primary} />
            <Text style={styles.safeAuthBadgeText}>AUTENTIKASI AMAN VORFINE</Text>
          </View>
        </View>

        {/* Title Block */}
        <View style={styles.titleBlock}>
          <Text style={styles.mainTitle}>Otentikasi Wajah (Face ID)</Text>
          <Text style={styles.subtitle}>
            Arahkan wajah Anda ke dalam bingkai kamera untuk membuka brankas
            transaksi dan saldo VORFINE Anda.
          </Text>
        </View>

        {/* Face ID Viewport Scanner Box */}
        <Pressable onPress={handleScanFace} style={styles.scannerViewportCard}>
          {/* Corner brackets */}
          <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
          <View style={[styles.cornerBracket, styles.bracketTopRight]} />
          <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
          <View style={[styles.cornerBracket, styles.bracketBottomRight]} />

          {/* Animated scan line */}
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY }] },
              scanSuccess && styles.scanLineSuccess,
            ]}
          />

          {/* Center Face Graphic */}
          <View style={styles.faceIconCircle}>
            <Ionicons
              name={scanSuccess ? "checkmark-circle" : "happy-outline"}
              size={56}
              color={scanSuccess ? "#16A34A" : Colors.primary}
            />
          </View>

          {/* Bottom Status bar with circular percentage */}
          <View style={styles.scannerBottomRow}>
            <View style={styles.detectingRow}>
              <View
                style={[
                  styles.pulsingDot,
                  scanSuccess && { backgroundColor: "#16A34A" },
                ]}
              />
              <Text style={styles.detectingText}>
                {scanSuccess
                  ? "Wajah Dikenali"
                  : isScanning
                  ? "Memproses Wajah..."
                  : "Mendeteksi Wajah..."}
              </Text>
            </View>

            <View style={styles.progressCirclePill}>
              <Ionicons
                name="radio-button-on-outline"
                size={14}
                color={Colors.primary}
              />
              <Text style={styles.progressCircleText}>{scanProgress}%</Text>
            </View>
          </View>
        </Pressable>

        {/* Kredensial Keamanan Card */}
        <View style={styles.credentialsCard}>
          <View style={styles.credentialsHeader}>
            <Text style={styles.credentialsTitle}>Kredensial Keamanan</Text>
            <Badge
              label="Aktif & Dipantau"
              variant="mint"
              size="sm"
              icon={
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: "#16A34A",
                    marginRight: 4,
                  }}
                />
              }
            />
          </View>

          {/* 3 Stats Columns */}
          <View style={styles.credentialsGrid}>
            {/* Stat 1 */}
            <View style={styles.credItem}>
              <Text style={styles.credLabel}>Sensor 3D</Text>
              <View style={styles.credValueRow}>
                <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                <Text style={styles.credValue}>Aktif</Text>
              </View>
            </View>

            {/* Stat 2 */}
            <View style={styles.credItem}>
              <Text style={styles.credLabel}>Enkripsi</Text>
              <View style={styles.credValueRow}>
                <Ionicons name="key-outline" size={13} color="#0D9488" />
                <Text style={styles.credValue}>AES-256</Text>
              </View>
            </View>

            {/* Stat 3 */}
            <View style={styles.credItem}>
              <Text style={styles.credLabel}>Sesi Finansial</Text>
              <View style={styles.credValueRow}>
                <Ionicons name="shield-checkmark" size={13} color="#16A34A" />
                <Text style={styles.credValue}>Aman</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsBlock}>
          <Button
            title="Pindai Ulang Wajah"
            onPress={handleScanFace}
            loading={isScanning}
            size="lg"
            leftIcon={<Ionicons name="refresh" size={18} color={Colors.white} />}
            style={styles.primaryActionBtn}
          />

          <Button
            title="Gunakan Sidik Jari atau PIN Manual"
            onPress={() => router.push("/auth/fingerprint" as any)}
            variant="secondary"
            size="md"
            leftIcon={
              <Ionicons
                name="finger-print-outline"
                size={18}
                color="#475569"
              />
            }
            style={styles.secondaryActionBtn}
          />

          {/* Cancel button */}
          <Pressable
            style={styles.cancelBtn}
            onPress={() => router.replace("/" as any)}
          >
            <Text style={styles.cancelBtnText}>Batalkan</Text>
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
  safeAuthBadgeWrapper: {
    alignItems: "center",
    marginBottom: 10,
  },
  safeAuthBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    gap: 6,
  },
  safeAuthBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
    letterSpacing: 0.6,
  },
  titleBlock: {
    alignItems: "center",
    marginBottom: 18,
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
  scannerViewportCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.xl,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 16,
    overflow: "hidden",
  },
  cornerBracket: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: Colors.primary,
  },
  bracketTopLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  bracketTopRight: {
    top: 14,
    right: 14,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  bracketBottomLeft: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  bracketBottomRight: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: "absolute",
    left: 30,
    right: 30,
    height: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  scanLineSuccess: {
    backgroundColor: "#16A34A",
  },
  faceIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  scannerBottomRow: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detectingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  detectingText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#334155",
  },
  progressCirclePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  progressCircleText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Colors.primary,
  },
  credentialsCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 20,
  },
  credentialsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  credentialsTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#1E293B",
  },
  credentialsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
  },
  credItem: {
    flex: 1,
  },
  credLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },
  credValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  credValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
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
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
});

export default FaceIdScreen;
