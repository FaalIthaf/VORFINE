import { BrandLogo } from "@/components/BrandLogo";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Accelerometer } from "expo-sensors";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export interface SensorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SensorModal: React.FC<SensorModalProps> = ({
  visible,
  onClose,
}) => {
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

  const [intervalMs, setIntervalMs] = useState<number>(100);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!visible) return;

    let subscription: { remove: () => void } | null = null;

    const startListening = async () => {
      try {
        const available = await Accelerometer.isAvailableAsync();
        setIsAvailable(available);

        if (!available) {
          console.warn("[SensorModal] Accelerometer tidak tersedia di platform ini.");
          return;
        }

        Accelerometer.setUpdateInterval(intervalMs);

        if (isActive) {
          subscription = Accelerometer.addListener((data) => {
            setSensorData(data);
          });
        }
      } catch (err) {
        console.error("[SensorModal] Gagal menginisialisasi Accelerometer:", err);
        setIsAvailable(false);
      }
    };

    startListening();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [visible, isActive, intervalMs]);

  // Kalkulasi total magnitudo percepatan (G)
  const totalG = useMemo(() => {
    return Math.sqrt(
      sensorData.x * sensorData.x +
      sensorData.y * sensorData.y +
      sensorData.z * sensorData.z
    );
  }, [sensorData]);

  // Orientasi perangkat
  const orientationText = useMemo(() => {
    const { x, y, z } = sensorData;
    if (Math.abs(z) > 0.85) {
      return z > 0 ? "Datar (Menghadap Atas)" : "Datar (Menghadap Bawah)";
    }
    if (Math.abs(y) > 0.7) {
      return y < 0 ? "Tegak (Portrait Normal)" : "Terbalik (Portrait)";
    }
    if (Math.abs(x) > 0.7) {
      return x > 0 ? "Lanskap (Kiri)" : "Lanskap (Kanan)";
    }
    return "Miring / Dinamis";
  }, [sensorData]);

  const getAxisPercentage = (val: number): number => {
    const clamped = Math.max(-1.5, Math.min(1.5, val));
    return Math.round(((clamped + 1.5) / 3) * 100);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header Modal */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <View style={styles.sensorIconBadge}>
                <MaterialCommunityIcons
                  name="motion-sensor"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              <View>
                <Text style={styles.modalTitle}>Sensor Akselerometer</Text>
                <Text style={styles.modalSubtitle}>
                  Telemetri Perangkat Real-time
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressedState,
              ]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup Modal Sensor"
            >
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </Pressable>
          </View>

          {/* Konten Sensor Modal */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status & Kontrol */}
            <View style={styles.statusBox}>
              <View style={styles.statusRow}>
                <View style={styles.statusDotLive} />
                <Text style={styles.statusLabel}>
                  {isActive ? "SENSOR AKTIF (100ms)" : "SENSOR DIJEDA"}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.toggleBtn,
                  pressed && styles.pressedState,
                ]}
                onPress={() => setIsActive((prev) => !prev)}
              >
                <Ionicons
                  name={isActive ? "pause" : "play"}
                  size={14}
                  color={Colors.primary}
                />
                <Text style={styles.toggleBtnText}>
                  {isActive ? "Jeda" : "Lanjutkan"}
                </Text>
              </Pressable>
            </View>

            {/* 2. Format Desimal: Terapkan .toFixed(2) pada nilai sumbu X, Y, dan Z */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>
                Koordinat Sumbu (Nilai Numerik)
              </Text>

              {/* Sumbu X */}
              <View style={styles.axisCard}>
                <View style={styles.axisTitleRow}>
                  <View style={[styles.axisBadge, { backgroundColor: "#E3F2FD" }]}>
                    <Text style={[styles.axisBadgeText, { color: "#1976D2" }]}>
                      X
                    </Text>
                  </View>
                  <Text style={styles.axisName}>Sumbu X (Horizontal)</Text>
                  <Text style={styles.axisNumericValue}>
                    {sensorData.x >= 0
                      ? `+${sensorData.x.toFixed(2)}`
                      : sensorData.x.toFixed(2)}
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
              <View style={styles.axisCard}>
                <View style={styles.axisTitleRow}>
                  <View style={[styles.axisBadge, { backgroundColor: "#E8F5E9" }]}>
                    <Text style={[styles.axisBadgeText, { color: "#2E7D32" }]}>
                      Y
                    </Text>
                  </View>
                  <Text style={styles.axisName}>Sumbu Y (Vertikal)</Text>
                  <Text style={styles.axisNumericValue}>
                    {sensorData.y >= 0
                      ? `+${sensorData.y.toFixed(2)}`
                      : sensorData.y.toFixed(2)}
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
              <View style={styles.axisCard}>
                <View style={styles.axisTitleRow}>
                  <View style={[styles.axisBadge, { backgroundColor: "#FFF3E0" }]}>
                    <Text style={[styles.axisBadgeText, { color: "#E65100" }]}>
                      Z
                    </Text>
                  </View>
                  <Text style={styles.axisName}>Sumbu Z (Kedalaman)</Text>
                  <Text style={styles.axisNumericValue}>
                    {sensorData.z >= 0
                      ? `+${sensorData.z.toFixed(2)}`
                      : sensorData.z.toFixed(2)}
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

            {/* Grid Ringkasan Tambahan */}
            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoColLabel}>Orientasi</Text>
                <Text style={styles.infoColValue} numberOfLines={1}>
                  {orientationText}
                </Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoColLabel}>Total Gaya (G)</Text>
                <Text style={styles.infoColValue}>{totalG.toFixed(2)} g</Text>
              </View>
            </View>

            {/* Tombol Tutup */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryCloseBtn,
                pressed && styles.pressedState,
              ]}
              onPress={onClose}
            >
              <Text style={styles.primaryCloseBtnText}>Tutup Layar Sensor</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl + 4,
    borderTopRightRadius: BorderRadius.xl + 4,
    maxHeight: "85%",
    minHeight: 460,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sensorIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    flex: 1,
  },
  modalScrollContent: {
    padding: Spacing.lg,
    paddingBottom: 28,
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: Spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDotLive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
    letterSpacing: 0.5,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#E6F4EA",
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: Spacing.md,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  axisCard: {
    marginBottom: 14,
  },
  axisTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  axisBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  axisBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  axisName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    flex: 1,
    marginLeft: 8,
  },
  axisNumericValue: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
    color: Colors.textPrimary,
  },
  meterTrack: {
    height: 7,
    backgroundColor: "#E2E8F0",
    borderRadius: 3.5,
    overflow: "hidden",
    position: "relative",
  },
  meterFill: {
    height: "100%",
    borderRadius: 3.5,
  },
  meterCenterLine: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: Spacing.lg,
  },
  infoCol: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  infoColLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  infoColValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  primaryCloseBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCloseBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  pressedState: {
    opacity: 0.7,
  },
});

