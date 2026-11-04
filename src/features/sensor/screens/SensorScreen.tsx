import { BrandLogo } from "@/components/BrandLogo";
import { BottomNavBar } from "@/components/BottomNavBar";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { TabType } from "@/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Accelerometer } from "expo-sensors";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface SensorScreenProps {
  showHeader?: boolean;
  showBottomNav?: boolean;
  onClose?: () => void;
}

export const SensorScreen: React.FC<SensorScreenProps> = ({
  showHeader = true,
  showBottomNav = true,
  onClose,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentProfile, activeTab, setActiveTab } = useApp();

  // ─────────────────────────────────────────────────────────────
  // 1. State Management Data Sensor: koordinat { x, y, z }
  // ─────────────────────────────────────────────────────────────
  const [sensorData, setSensorData] = useState<{
    x: number;
    y: number;
    z: number;
  }>({
    x: 0,
    y: 0,
    z: 0,
  });

  // Alias kompatibilitas
  const data = sensorData;
  const setData = setSensorData;

  const [isActive, setIsActive] = useState<boolean>(true);
  const [intervalMs, setIntervalMs] = useState<number>(100); // Default: 100ms
  const [shakeCount, setShakeCount] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Task 3: Ambang Batas (Threshold), Umpan Balik Getaran & Status Interaktif
  // ─────────────────────────────────────────────────────────────
  const THRESHOLD = 1.5; // Batas ambang akselerasi (g)
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [interactionStatus, setInteractionStatus] =
    useState<string>("Normal (Tenang)");
  const lastVibrateTimeRef = useRef<number>(0);
  const resetTimerRef = useRef<any>(null);

  // ─────────────────────────────────────────────────────────────
  // 2 & 3. Listener, Perhitungan Magnitude & Logika Threshold Getar
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const setupSensor = async () => {
      try {
        const available = await Accelerometer.isAvailableAsync();
        setIsAvailable(available);

        if (!available) {
          console.warn("[Sensor] Accelerometer tidak tersedia di platform ini.");
          return;
        }

        // Atur update interval ke 100ms
        Accelerometer.setUpdateInterval(intervalMs);

        if (isActive) {
          subscription = Accelerometer.addListener((accelerometerMeasurement) => {
            setSensorData(accelerometerMeasurement);

            // 2. Hitung Magnitude: Math.sqrt(x * x + y * y + z * z)
            const { x, y, z } = accelerometerMeasurement;
            const magnitude = Math.sqrt(x * x + y * y + z * z);

            // 3. Logika Threshold & Getar: Jika magnitude > 1.5, getarkan 500ms
            if (magnitude > THRESHOLD) {
              const now = Date.now();
              // Batasi interval pemicuan getaran agar tidak overload (cooldown 800ms)
              if (now - lastVibrateTimeRef.current > 800) {
                lastVibrateTimeRef.current = now;
                Vibration.vibrate(500); // Memicu umpan balik getaran 500ms
              }

              // Ubah state status interaktif
              setIsInteracting(true);
              setInteractionStatus(
                `Guncangan Terdeteksi! (${magnitude.toFixed(2)}G > ${THRESHOLD}G)`
              );
              setShakeCount((prev) => prev + 1);

              if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
              }
              resetTimerRef.current = setTimeout(() => {
                setIsInteracting(false);
                setInteractionStatus("Normal (Tenang)");
              }, 1500);
            }
          });
        }
      } catch (err) {
        console.error("[Sensor] Gagal menginisialisasi Accelerometer:", err);
        setIsAvailable(false);
      }
    };

    setupSensor();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, [isActive, intervalMs]);

  // Kalkulasi magnitudo percepatan total (Normal gravitasi bumi ~ 1.00g)
  const totalG = useMemo(() => {
    return Math.sqrt(
      sensorData.x * sensorData.x +
      sensorData.y * sensorData.y +
      sensorData.z * sensorData.z
    );
  }, [sensorData]);

  // Deteksi orientasi perangkat berbasis nilai sumbu x, y, z
  const orientationText = useMemo(() => {
    const { x, y, z } = sensorData;
    if (Math.abs(z) > 0.85) {
      return z > 0 ? "Datar (Menghadap Atas)" : "Datar (Menghadap Bawah)";
    }
    if (Math.abs(y) > 0.7) {
      return y < 0 ? "Tegak (Portrait Normal)" : "Terbalik (Portrait Upside-down)";
    }
    if (Math.abs(x) > 0.7) {
      return x > 0 ? "Lanskap (Miring Kiri)" : "Lanskap (Miring Kanan)";
    }
    return "Miring / Dinamis";
  }, [sensorData]);

  // Navigasi Bottom Bar
  const handleTabSelect = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "home") {
      if (onClose) {
        onClose();
      } else {
        router.replace("/" as any);
      }
    } else if (tab === "finance") {
      router.push("/finance" as any);
    } else if (tab === "schedule") {
      router.push("/schedule" as any);
    } else if (tab === "menu") {
      router.replace("/" as any);
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
      return;
    }
    setActiveTab("home");
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/" as any);
    }
  };

  // Helper persentase bar meter sumbu (-1.5g s/d +1.5g dinormalisasi ke 0% - 100%)
  const getAxisPercentage = (val: number): number => {
    const clamped = Math.max(-1.5, Math.min(1.5, val));
    return Math.round(((clamped + 1.5) / 3) * 100);
  };

  return (
    <View style={styles.root}>
      {showHeader && <StatusBar style="light" />}

      {/* Header Sensor Screen */}
      {showHeader && (
        <View
          style={[
            styles.headerContainer,
            { paddingTop: Math.max(insets.top, 12) + 8 },
          ]}
        >
          <View style={styles.headerRow}>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressedState,
              ]}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Kembali ke Beranda"
            >
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </Pressable>

            <View style={styles.headerTitleCenter}>
              <Text style={styles.headerMainTitle}>Sensor Akselerometer</Text>
              <Text style={styles.headerSubtitle}>Real-time Hardware Telemetry</Text>
            </View>

            <View style={styles.logoBadgeWrapper}>
              <BrandLogo size="small" />
            </View>
          </View>
        </View>
      )}

      {/* Konten Sensor */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Status Interaktif & Threshold Feedback (Task 3) */}
        <View
          style={[
            styles.interactionBanner,
            {
              backgroundColor: isInteracting ? "#FFEBEE" : "#F0FDF4",
              borderColor: isInteracting ? "#EF5350" : "#BBF7D0",
            },
          ]}
        >
          <View style={styles.interactionLeftRow}>
            <MaterialCommunityIcons
              name={isInteracting ? "vibrate" : "shield-check-outline"}
              size={24}
              color={isInteracting ? "#D32F2F" : "#16A34A"}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                style={[
                  styles.interactionTitle,
                  { color: isInteracting ? "#D32F2F" : "#16A34A" },
                ]}
              >
                {isInteracting
                  ? "Peringatan: Guncangan Terdeteksi!"
                  : "Status Sensor: Stabil"}
              </Text>
              <Text style={styles.interactionSubtitle}>
                {isInteracting
                  ? `Magnitudo: ${totalG.toFixed(2)}G > ${THRESHOLD}G (Vibration 500ms Berjalan)`
                  : `Batas ambang getar: ${THRESHOLD}G | ${interactionStatus}`}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.interactionBadge,
              { backgroundColor: isInteracting ? "#D32F2F" : "#16A34A" },
            ]}
          >
            <Text style={styles.interactionBadgeText}>
              {isInteracting ? "SHAKE" : "READY"}
            </Text>
          </View>
        </View>

        {/* Card Status & Sampling Interval */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons
                name="motion-sensor"
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.cardTitle}>Status Telemetri Sensor</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isActive ? "#E8F5E9" : "#FFEBEE" },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isActive ? "#2E7D32" : "#C62828" },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isActive ? "#2E7D32" : "#C62828" },
                ]}
              >
                {isActive ? "AKTIF (LISTENING)" : "DIJEDA"}
              </Text>
            </View>
          </View>

          <Text style={styles.cardDescription}>
            Membaca pergerakan perangkat keras dalam ruang 3 dimensi (sumbu X, Y, Z)
            menggunakan API <Text style={styles.codeText}>expo-sensors</Text> dengan
            interval update <Text style={styles.boldText}>{intervalMs} ms</Text>.
          </Text>

          {isAvailable === false && (
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={18} color="#D32F2F" />
              <Text style={styles.warningText}>
                Sensor fisik tidak terdeteksi (Web Simulator / Perangkat Uji). Nilai
                sensor akan tetap disimulasikan.
              </Text>
            </View>
          )}

          {/* Tombol Kontrol Cepat */}
          <View style={styles.controlsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  backgroundColor: isActive ? "#FFF3E0" : "#E8F5E9",
                  borderColor: isActive ? "#FFE0B2" : "#C8E6C9",
                },
                pressed && styles.pressedState,
              ]}
              onPress={() => setIsActive((prev) => !prev)}
            >
              <Ionicons
                name={isActive ? "pause" : "play"}
                size={16}
                color={isActive ? "#E65100" : "#2E7D32"}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  { color: isActive ? "#E65100" : "#2E7D32" },
                ]}
              >
                {isActive ? "Jeda Sensor" : "Lanjutkan"}
              </Text>
            </Pressable>

            {/* Pilihan Interval */}
            <View style={styles.intervalGroup}>
              {[50, 100, 200, 500].map((intVal) => (
                <Pressable
                  key={intVal}
                  style={[
                    styles.intervalPill,
                    intervalMs === intVal && styles.intervalPillActive,
                  ]}
                  onPress={() => setIntervalMs(intVal)}
                >
                  <Text
                    style={[
                      styles.intervalPillText,
                      intervalMs === intVal && styles.intervalPillTextActive,
                    ]}
                  >
                    {intVal}ms
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* 2. Format Desimal: Terapkan .toFixed(2) pada nilai sumbu X, Y, dan Z */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Koordinat Akselerasi 3-Axis (.toFixed(2))</Text>

          {/* Numerical Quick Summary */}
          <View style={styles.numericSummaryRow}>
            <View style={styles.numericSummaryCol}>
              <Text style={styles.numericAxisTag}>Sumbu X</Text>
              <Text style={styles.numericValueBold}>{sensorData.x.toFixed(2)}</Text>
            </View>
            <View style={styles.numericDivider} />
            <View style={styles.numericSummaryCol}>
              <Text style={styles.numericAxisTag}>Sumbu Y</Text>
              <Text style={styles.numericValueBold}>{sensorData.y.toFixed(2)}</Text>
            </View>
            <View style={styles.numericDivider} />
            <View style={styles.numericSummaryCol}>
              <Text style={styles.numericAxisTag}>Sumbu Z</Text>
              <Text style={styles.numericValueBold}>{sensorData.z.toFixed(2)}</Text>
            </View>
          </View>

          {/* Sumbu X */}
          <View style={styles.axisItem}>
            <View style={styles.axisHeaderRow}>
              <View style={styles.axisLabelBadge}>
                <Text style={styles.axisBadgeText}>Sumbu X</Text>
              </View>
              <Text style={styles.axisDirectionText}>Horizontal (Kiri - Kanan)</Text>
              <Text style={styles.axisValue}>
                {sensorData.x >= 0 ? `+${sensorData.x.toFixed(2)}` : sensorData.x.toFixed(2)} g
              </Text>
            </View>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${getAxisPercentage(sensorData.x)}%`,
                    backgroundColor: "#1976D2",
                  },
                ]}
              />
              <View style={styles.meterCenterLine} />
            </View>
          </View>

          {/* Sumbu Y */}
          <View style={styles.axisItem}>
            <View style={styles.axisHeaderRow}>
              <View style={[styles.axisLabelBadge, { backgroundColor: "#E8F5E9" }]}>
                <Text style={[styles.axisBadgeText, { color: "#2E7D32" }]}>
                  Sumbu Y
                </Text>
              </View>
              <Text style={styles.axisDirectionText}>Vertikal (Atas - Bawah)</Text>
              <Text style={styles.axisValue}>
                {sensorData.y >= 0 ? `+${sensorData.y.toFixed(2)}` : sensorData.y.toFixed(2)} g
              </Text>
            </View>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${getAxisPercentage(sensorData.y)}%`,
                    backgroundColor: "#2E7D32",
                  },
                ]}
              />
              <View style={styles.meterCenterLine} />
            </View>
          </View>

          {/* Sumbu Z */}
          <View style={styles.axisItem}>
            <View style={styles.axisHeaderRow}>
              <View style={[styles.axisLabelBadge, { backgroundColor: "#FFF3E0" }]}>
                <Text style={[styles.axisBadgeText, { color: "#E65100" }]}>
                  Sumbu Z
                </Text>
              </View>
              <Text style={styles.axisDirectionText}>Kedalaman (Depan - Belakang)</Text>
              <Text style={styles.axisValue}>
                {sensorData.z >= 0 ? `+${sensorData.z.toFixed(2)}` : sensorData.z.toFixed(2)} g
              </Text>
            </View>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${getAxisPercentage(sensorData.z)}%`,
                    backgroundColor: "#E65100",
                  },
                ]}
              />
              <View style={styles.meterCenterLine} />
            </View>
          </View>
        </View>

        {/* Card Orientasi & Deteksi Fisik */}
        <View style={styles.summaryGrid}>
          <View style={[styles.gridCard, { flex: 1 }]}>
            <MaterialCommunityIcons
              name="screen-rotation"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.gridCardLabel}>Orientasi Perangkat</Text>
            <Text style={styles.gridCardValue} numberOfLines={2}>
              {orientationText}
            </Text>
          </View>

          <View style={[styles.gridCard, { flex: 1 }]}>
            <MaterialCommunityIcons
              name="speedometer"
              size={24}
              color="#D84315"
            />
            <Text style={styles.gridCardLabel}>Total Vektor (G)</Text>
            <Text style={styles.gridCardValue}>
              {totalG.toFixed(2)} g
            </Text>
          </View>

          <View
            style={[
              styles.gridCard,
              { flex: 1 },
              isInteracting && {
                borderColor: "#EF5350",
                backgroundColor: "#FFF5F5",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="vibrate"
              size={24}
              color={isInteracting ? "#D32F2F" : "#6A1B9A"}
            />
            <Text style={styles.gridCardLabel}>Deteksi Guncangan</Text>
            <Text
              style={[
                styles.gridCardValue,
                isInteracting && { color: "#D32F2F" },
              ]}
            >
              {shakeCount}x
            </Text>
          </View>
        </View>

        {/* Card Edukasi Modul Sensor */}
        <View style={styles.infoCard}>
          <View style={styles.infoTitleRow}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.infoTitle}>Informasi Modul Accelerometer</Text>
          </View>
          <Text style={styles.infoBody}>
            Nilai percepatan dihitung menggunakan rumus magnitudo{" "}
            <Text style={styles.codeText}>Math.sqrt(x*x + y*y + z*z)</Text>. Jika nilai
            melebihi ambang batas <Text style={styles.boldText}>{THRESHOLD} g</Text>,
            sistem secara otomatis memicu umpan balik getaran{" "}
            <Text style={styles.codeText}>Vibration.vibrate(500)</Text> dan memperbarui status
            interaktif.
          </Text>
        </View>
      </ScrollView>

      {/* Bilah Navigasi Bawah */}
      {showBottomNav && (
        <BottomNavBar activeTab="sensor" onSelectTab={handleTabSelect} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.screenBackground,
  },
  headerContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  headerTitleCenter: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 1,
  },
  logoBadgeWrapper: {
    alignItems: "flex-end",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 24,
  },
  interactionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  interactionLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  interactionTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  interactionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  interactionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  interactionBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  codeText: {
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
    backgroundColor: "#F1F5F9",
    color: Colors.primary,
    fontWeight: "600",
  },
  boldText: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: "#C62828",
    lineHeight: 15,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexWrap: "wrap",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  intervalGroup: {
    flexDirection: "row",
    gap: 4,
  },
  intervalPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  intervalPillActive: {
    backgroundColor: Colors.primary,
  },
  intervalPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  intervalPillTextActive: {
    color: Colors.white,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  numericSummaryRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 12,
    marginBottom: Spacing.md,
    justifyContent: "space-around",
    alignItems: "center",
  },
  numericSummaryCol: {
    alignItems: "center",
    flex: 1,
  },
  numericAxisTag: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  numericValueBold: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  numericDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E2E8F0",
  },
  axisItem: {
    marginBottom: Spacing.md,
  },
  axisHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  axisLabelBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  axisBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1976D2",
  },
  axisDirectionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
    marginLeft: 8,
  },
  axisValue: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
    color: Colors.textPrimary,
  },
  meterTrack: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  meterFill: {
    height: "100%",
    borderRadius: 4,
  },
  meterCenterLine: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: Spacing.md,
  },
  gridCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 90,
  },
  gridCardLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  gridCardValue: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 2,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    marginBottom: Spacing.sm,
  },
  infoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2E7D32",
  },
  infoBody: {
    fontSize: 11.5,
    color: "#1B5E20",
    lineHeight: 17,
  },
  pressedState: {
    opacity: 0.7,
  },
});
