import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";

interface TimeWheelPickerProps {
  visible: boolean;
  title: string;
  initialTime?: string; // e.g. "08.00 WIB" or "08:00"
  onClose: () => void;
  onConfirm: (formattedTime: string) => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 220px
const PADDING_VERTICAL = ITEM_HEIGHT * 2; // 88px

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const QUICK_MINUTES = [0, 15, 30, 45];

export const TimeWheelPicker: React.FC<TimeWheelPickerProps> = ({
  visible,
  title,
  initialTime = "08.00 WIB",
  onClose,
  onConfirm,
}) => {
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const hourDebounceRef = useRef<any>(null);
  const minuteDebounceRef = useRef<any>(null);

  // Parse initialTime on open
  useEffect(() => {
    if (visible) {
      const match = initialTime.match(/(\d{1,2})[.:](\d{1,2})/);
      let h = 8;
      let m = 0;
      if (match) {
        h = Math.min(23, Math.max(0, parseInt(match[1], 10) || 0));
        m = Math.min(59, Math.max(0, parseInt(match[2], 10) || 0));
      }
      setSelectedHour(h);
      setSelectedMinute(m);

      // Scroll wheels to current position
      const timer = setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: h * ITEM_HEIGHT,
          animated: false,
        });
        minuteScrollRef.current?.scrollTo({
          y: m * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);

      return () => {
        clearTimeout(timer);
        clearTimeout(hourDebounceRef.current);
        clearTimeout(minuteDebounceRef.current);
      };
    }
  }, [visible, initialTime]);

  if (!visible) return null;

  const scrollToHour = (h: number, animated = true) => {
    const clamped = Math.max(0, Math.min(23, h));
    setSelectedHour(clamped);
    hourScrollRef.current?.scrollTo({
      y: clamped * ITEM_HEIGHT,
      animated,
    });
  };

  const scrollToMinute = (m: number, animated = true) => {
    const clamped = Math.max(0, Math.min(59, m));
    setSelectedMinute(clamped);
    minuteScrollRef.current?.scrollTo({
      y: clamped * ITEM_HEIGHT,
      animated,
    });
  };

  const handleHourScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(23, index));
    setSelectedHour(clamped);

    if (Platform.OS === "web") {
      clearTimeout(hourDebounceRef.current);
      hourDebounceRef.current = setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: clamped * ITEM_HEIGHT,
          animated: true,
        });
      }, 150);
    }
  };

  const handleMinuteScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(59, index));
    setSelectedMinute(clamped);

    if (Platform.OS === "web") {
      clearTimeout(minuteDebounceRef.current);
      minuteDebounceRef.current = setTimeout(() => {
        minuteScrollRef.current?.scrollTo({
          y: clamped * ITEM_HEIGHT,
          animated: true,
        });
      }, 150);
    }
  };

  const handleConfirm = () => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const formatted = `${pad(selectedHour)}.${pad(selectedMinute)} WIB`;
    onConfirm(formatted);
    onClose();
  };

  const formatDisplay = (n: number) => String(n).padStart(2, "0");

  return (
    <View style={styles.overlayContainer}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.pickerCard}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <View style={styles.clockIconBadge}>
              <Ionicons name="time" size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.pickerTitle}>{title}</Text>
              <Text style={styles.pickerSubtitle}>
                Gulir jam & menit (Alarm Wheel)
              </Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && styles.pressedState,
            ]}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={20} color="#667085" />
          </Pressable>
        </View>

        {/* Digital Clock Display Preview */}
        <View style={styles.digitalClockDisplay}>
          <Text style={styles.clockDigits}>
            {formatDisplay(selectedHour)} : {formatDisplay(selectedMinute)}
          </Text>
          <Text style={styles.clockZoneBadge}>WIB</Text>
        </View>

        {/* Wheel Columns Section */}
        <View style={styles.wheelSectionWrapper}>
          {/* Center Lens Highlight Bar */}
          <View style={styles.centerLens} pointerEvents="none" />

          {/* Column 1: Jam (Hour) */}
          <View style={styles.columnContainer}>
            <View style={styles.columnHeaderRow}>
              <Text style={styles.columnLabel}>JAM</Text>
              <Pressable
                style={styles.stepBtn}
                onPress={() => scrollToHour(selectedHour - 1)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="chevron-up" size={14} color="#667085" />
              </Pressable>
            </View>

            <View style={styles.wheelViewport}>
              <ScrollView
                ref={hourScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                scrollEventThrottle={16}
                contentContainerStyle={{
                  paddingTop: PADDING_VERTICAL,
                  paddingBottom: PADDING_VERTICAL,
                }}
                onScroll={handleHourScroll}
                onMomentumScrollEnd={handleHourScroll}
                onScrollEndDrag={handleHourScroll}
              >
                {HOURS.map((hour) => {
                  const isSelected = hour === selectedHour;
                  const distance = Math.abs(hour - selectedHour);

                  return (
                    <Pressable
                      key={hour}
                      style={styles.wheelItem}
                      onPress={() => scrollToHour(hour)}
                    >
                      <Text
                        style={[
                          styles.wheelItemText,
                          isSelected && styles.wheelItemTextActive,
                          distance === 1 && styles.wheelItemTextNeighbor1,
                          distance >= 2 && styles.wheelItemTextNeighbor2,
                        ]}
                      >
                        {formatDisplay(hour)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <Pressable
              style={styles.stepBtnBottom}
              onPress={() => scrollToHour(selectedHour + 1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="chevron-down" size={14} color="#667085" />
            </Pressable>
          </View>

          {/* Colon Separator */}
          <View style={styles.colonContainer}>
            <Text style={styles.colonText}>:</Text>
          </View>

          {/* Column 2: Menit (Minute) */}
          <View style={styles.columnContainer}>
            <View style={styles.columnHeaderRow}>
              <Text style={styles.columnLabel}>MENIT</Text>
              <Pressable
                style={styles.stepBtn}
                onPress={() => scrollToMinute(selectedMinute - 1)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="chevron-up" size={14} color="#667085" />
              </Pressable>
            </View>

            <View style={styles.wheelViewport}>
              <ScrollView
                ref={minuteScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                scrollEventThrottle={16}
                contentContainerStyle={{
                  paddingTop: PADDING_VERTICAL,
                  paddingBottom: PADDING_VERTICAL,
                }}
                onScroll={handleMinuteScroll}
                onMomentumScrollEnd={handleMinuteScroll}
                onScrollEndDrag={handleMinuteScroll}
              >
                {MINUTES.map((minute) => {
                  const isSelected = minute === selectedMinute;
                  const distance = Math.abs(minute - selectedMinute);

                  return (
                    <Pressable
                      key={minute}
                      style={styles.wheelItem}
                      onPress={() => scrollToMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.wheelItemText,
                          isSelected && styles.wheelItemTextActive,
                          distance === 1 && styles.wheelItemTextNeighbor1,
                          distance >= 2 && styles.wheelItemTextNeighbor2,
                        ]}
                      >
                        {formatDisplay(minute)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <Pressable
              style={styles.stepBtnBottom}
              onPress={() => scrollToMinute(selectedMinute + 1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="chevron-down" size={14} color="#667085" />
            </Pressable>
          </View>
        </View>

        {/* Quick Minute Chips */}
        <View style={styles.quickChipsRow}>
          <Text style={styles.quickChipsLabel}>Pintasan Menit:</Text>
          <View style={styles.chipsGroup}>
            {QUICK_MINUTES.map((m) => {
              const isActive = selectedMinute === m;
              return (
                <Pressable
                  key={m}
                  style={[
                    styles.quickChip,
                    isActive && styles.quickChipActive,
                  ]}
                  onPress={() => scrollToMinute(m)}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      isActive && styles.quickChipTextActive,
                    ]}
                  >
                    :{formatDisplay(m)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && styles.pressedState,
            ]}
            onPress={onClose}
          >
            <Text style={styles.cancelBtnText}>Batal</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.confirmBtn,
              pressed && styles.pressedState,
            ]}
            onPress={handleConfirm}
          >
            <Ionicons name="checkmark-sharp" size={18} color={Colors.white} />
            <Text style={styles.confirmBtnText}>Terapkan Waktu</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: Spacing.md,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  pickerCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 10000,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  clockIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(78, 135, 140, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  pickerSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
    borderRadius: BorderRadius.round,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  digitalClockDisplay: {
    backgroundColor: "#F4F7F8",
    borderRadius: BorderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#E4E7EC",
  },
  clockDigits: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },
  clockZoneBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    backgroundColor: "rgba(78, 135, 140, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
  },
  wheelSectionWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: CONTAINER_HEIGHT + 36, // accommodates headers & step buttons
    backgroundColor: "#FAFBFB",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#EAECF0",
    paddingHorizontal: Spacing.sm,
  },
  centerLens: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    top: PADDING_VERTICAL + 20, // offset for column header & step button
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(78, 135, 140, 0.12)",
    borderRadius: BorderRadius.md,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: Colors.primary,
  },
  columnContainer: {
    flex: 1,
    alignItems: "center",
  },
  columnHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: Spacing.md,
    paddingBottom: 2,
  },
  columnLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#667085",
    letterSpacing: 0.5,
  },
  stepBtn: {
    padding: 2,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  stepBtnBottom: {
    padding: 2,
    marginTop: 2,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  wheelViewport: {
    height: CONTAINER_HEIGHT,
    width: "100%",
    overflow: "hidden",
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  wheelItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#98A2B3",
    fontVariant: ["tabular-nums"],
  },
  wheelItemTextActive: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.primary,
  },
  wheelItemTextNeighbor1: {
    fontSize: 17,
    fontWeight: "600",
    color: "#475467",
  },
  wheelItemTextNeighbor2: {
    fontSize: 14,
    color: "#98A2B3",
    opacity: 0.6,
  },
  colonContainer: {
    width: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  colonText: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
  },
  quickChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.md,
    paddingHorizontal: 2,
  },
  quickChipsLabel: {
    fontSize: 12,
    color: "#667085",
    fontWeight: "600",
  },
  chipsGroup: {
    flexDirection: "row",
    gap: 6,
  },
  quickChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F2F4F7",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  quickChipActive: {
    backgroundColor: "rgba(78, 135, 140, 0.15)",
    borderColor: Colors.primary,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475467",
  },
  quickChipTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  footerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    borderWidth: 1.2,
    borderColor: "#D0D5DD",
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
  },
  confirmBtn: {
    flex: 1.6,
    flexDirection: "row",
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    backgroundColor: "#507B80",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#507B80",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
  pressedState: {
    opacity: 0.75,
  },
});

export default TimeWheelPicker;
