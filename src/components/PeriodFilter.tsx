import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { PeriodFilterMode } from "../types";
import { MONTH_NAMES_ID, MONTH_SHORT_ID } from "../utils/dateUtils";

export interface PeriodFilterProps {
  currentMode?: PeriodFilterMode;
  currentLabel?: string;
  currentPeriodText?: string;
  onSelectMode?: (mode: PeriodFilterMode) => void;
  onSelectPeriod?: (
    mode: PeriodFilterMode,
    label: string,
    periodText: string,
    options?: { year?: number; month?: number; day?: number },
  ) => void;
  onPress?: () => void;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  currentMode = "month",
  currentLabel = "Bulan Ini",
  currentPeriodText = "Sep 2026",
  onSelectMode,
  onSelectPeriod,
  onPress,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<PeriodFilterMode>(currentMode);

  // Sync internal activeTab with currentMode if prop changes
  React.useEffect(() => {
    setActiveTab(currentMode);
  }, [currentMode]);

  const handleTabPress = (mode: PeriodFilterMode) => {
    setActiveTab(mode);
    if (onSelectMode) {
      onSelectMode(mode);
    }

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const curDay = now.getDate();

    if (onSelectPeriod) {
      if (mode === "all") {
        onSelectPeriod("all", "Semua", "Semua Waktu");
      } else if (mode === "day") {
        onSelectPeriod(
          "day",
          "Hari Ini",
          `${curDay} ${MONTH_SHORT_ID[curMonth]} ${curYear}`,
          { year: curYear, month: curMonth, day: curDay },
        );
      } else if (mode === "month") {
        onSelectPeriod(
          "month",
          "Bulan Ini",
          `${MONTH_SHORT_ID[curMonth]} ${curYear}`,
          { year: curYear, month: curMonth },
        );
      } else if (mode === "year") {
        onSelectPeriod("year", "Tahun Ini", `${curYear}`, { year: curYear });
      }
    }
  };

  const handlePillPress = () => {
    if (onPress) {
      onPress();
    } else {
      setModalVisible(true);
    }
  };

  const handleSelectOption = (
    mode: PeriodFilterMode,
    label: string,
    periodText: string,
    options?: { year?: number; month?: number; day?: number },
  ) => {
    setModalVisible(false);
    if (onSelectPeriod) {
      onSelectPeriod(mode, label, periodText, options);
    }
  };

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();
  const curDay = now.getDate();

  // Day options
  const yesterday = new Date(curYear, curMonth, curDay - 1);
  const dayOptions = [
    {
      label: "Hari Ini",
      periodText: `${curDay} ${MONTH_SHORT_ID[curMonth]} ${curYear}`,
      options: { year: curYear, month: curMonth, day: curDay },
    },
    {
      label: "Kemarin",
      periodText: `${yesterday.getDate()} ${MONTH_SHORT_ID[yesterday.getMonth()]} ${yesterday.getFullYear()}`,
      options: {
        year: yesterday.getFullYear(),
        month: yesterday.getMonth(),
        day: yesterday.getDate(),
      },
    },
    {
      label: "Awal Bulan (1 Sep)",
      periodText: `1 Sep 2026`,
      options: { year: 2026, month: 8, day: 1 },
    },
  ];

  // Month options
  const prevMonthIndex = curMonth === 0 ? 11 : curMonth - 1;
  const prevMonthYear = curMonth === 0 ? curYear - 1 : curYear;
  const monthOptions = [
    {
      label: "Bulan Ini",
      periodText: `${MONTH_SHORT_ID[curMonth]} ${curYear}`,
      options: { year: curYear, month: curMonth },
    },
    {
      label: "Bulan Lalu",
      periodText: `${MONTH_SHORT_ID[prevMonthIndex]} ${prevMonthYear}`,
      options: { year: prevMonthYear, month: prevMonthIndex },
    },
    {
      label: "Juli 2026",
      periodText: "Jul 2026",
      options: { year: 2026, month: 6 },
    },
    {
      label: "Juni 2026",
      periodText: "Jun 2026",
      options: { year: 2026, month: 5 },
    },
  ];

  // Year options
  const yearOptions = [
    {
      label: "Tahun Ini",
      periodText: `${curYear}`,
      options: { year: curYear },
    },
    {
      label: "Tahun Lalu",
      periodText: `${curYear - 1}`,
      options: { year: curYear - 1 },
    },
  ];

  return (
    <View style={styles.container}>
      {/* 1. Filter Tabs: Semua | Hari | Bulan | Tahun */}
      <View style={styles.tabBarContainer}>
        {(["all", "day", "month", "year"] as PeriodFilterMode[]).map((mode) => {
          const isActive = currentMode === mode;
          const titles: Record<PeriodFilterMode, string> = {
            all: "Semua",
            day: "Hari",
            month: "Bulan",
            year: "Tahun",
          };

          return (
            <Pressable
              key={mode}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => handleTabPress(mode)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filter ${titles[mode]}`}
            >
              <Text
                style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
              >
                {titles[mode]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 2. Interactive Period Pill */}
      <Pressable
        style={({ pressed }) => [
          styles.filterPill,
          pressed && styles.pressedState,
        ]}
        onPress={handlePillPress}
        accessibilityRole="button"
        accessibilityLabel={`Filter periode: ${currentLabel} ${currentPeriodText}`}
      >
        <View style={styles.leftGroup}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color="#35575C"
            style={styles.calendarIcon}
          />
          <Text style={styles.labelText}>{currentLabel}</Text>
        </View>

        <View style={styles.rightGroup}>
          <Text style={styles.periodText}>{currentPeriodText}</Text>
          <Ionicons
            name="chevron-down"
            size={15}
            color="#35575C"
            style={styles.chevronIcon}
          />
        </View>
      </Pressable>

      {/* 3. Dropdown Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="filter-circle" size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>Pilih Periode Transaksi</Text>
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#7F8C8D" />
              </Pressable>
            </View>

            {/* Inner Mode Tabs */}
            <View style={styles.modalTabsRow}>
              {(["all", "day", "month", "year"] as PeriodFilterMode[]).map(
                (mode) => {
                  const isSelected = activeTab === mode;
                  const titles: Record<PeriodFilterMode, string> = {
                    all: "Semua",
                    day: "Hari",
                    month: "Bulan",
                    year: "Tahun",
                  };
                  return (
                    <Pressable
                      key={`modal-tab-${mode}`}
                      style={[
                        styles.modalTabItem,
                        isSelected && styles.modalTabItemActive,
                      ]}
                      onPress={() => setActiveTab(mode)}
                    >
                      <Text
                        style={[
                          styles.modalTabText,
                          isSelected && styles.modalTabTextActive,
                        ]}
                      >
                        {titles[mode]}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* Options List */}
            <ScrollView
              style={styles.optionsScrollView}
              showsVerticalScrollIndicator={false}
            >
              {activeTab === "all" && (
                <Pressable
                  style={[
                    styles.optionRow,
                    currentMode === "all" && styles.optionRowSelected,
                  ]}
                  onPress={() =>
                    handleSelectOption("all", "Semua", "Semua Waktu")
                  }
                >
                  <View style={styles.optionTextCol}>
                    <Text style={styles.optionLabel}>Semua Riwayat</Text>
                    <Text style={styles.optionSub}>Tampilkan seluruh transaksi</Text>
                  </View>
                  {currentMode === "all" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.primary}
                    />
                  )}
                </Pressable>
              )}

              {activeTab === "day" &&
                dayOptions.map((opt, idx) => {
                  const isCur =
                    currentMode === "day" && currentPeriodText === opt.periodText;
                  return (
                    <Pressable
                      key={`day-${idx}`}
                      style={[styles.optionRow, isCur && styles.optionRowSelected]}
                      onPress={() =>
                        handleSelectOption(
                          "day",
                          opt.label,
                          opt.periodText,
                          opt.options,
                        )
                      }
                    >
                      <View style={styles.optionTextCol}>
                        <Text style={styles.optionLabel}>{opt.label}</Text>
                        <Text style={styles.optionSub}>{opt.periodText}</Text>
                      </View>
                      {isCur && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={Colors.primary}
                        />
                      )}
                    </Pressable>
                  );
                })}

              {activeTab === "month" &&
                monthOptions.map((opt, idx) => {
                  const isCur =
                    currentMode === "month" &&
                    currentPeriodText === opt.periodText;
                  return (
                    <Pressable
                      key={`month-${idx}`}
                      style={[styles.optionRow, isCur && styles.optionRowSelected]}
                      onPress={() =>
                        handleSelectOption(
                          "month",
                          opt.label,
                          opt.periodText,
                          opt.options,
                        )
                      }
                    >
                      <View style={styles.optionTextCol}>
                        <Text style={styles.optionLabel}>{opt.label}</Text>
                        <Text style={styles.optionSub}>{opt.periodText}</Text>
                      </View>
                      {isCur && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={Colors.primary}
                        />
                      )}
                    </Pressable>
                  );
                })}

              {activeTab === "year" &&
                yearOptions.map((opt, idx) => {
                  const isCur =
                    currentMode === "year" &&
                    currentPeriodText === opt.periodText;
                  return (
                    <Pressable
                      key={`year-${idx}`}
                      style={[styles.optionRow, isCur && styles.optionRowSelected]}
                      onPress={() =>
                        handleSelectOption(
                          "year",
                          opt.label,
                          opt.periodText,
                          opt.options,
                        )
                      }
                    >
                      <View style={styles.optionTextCol}>
                        <Text style={styles.optionLabel}>{opt.label}</Text>
                        <Text style={styles.optionSub}>{opt.periodText}</Text>
                      </View>
                      {isCur && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={Colors.primary}
                        />
                      )}
                    </Pressable>
                  );
                })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E7E9",
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: "#35575C",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#526366",
  },
  tabButtonTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  filterPill: {
    backgroundColor: "#EAEFEF",
    borderRadius: BorderRadius.round,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#D0D9DB",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    marginRight: 8,
  },
  labelText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#1C2E33",
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  periodText: {
    fontSize: 12.5,
    color: "#35575C",
    fontWeight: "600",
    marginRight: 4,
  },
  chevronIcon: {
    marginLeft: 2,
  },
  pressedState: {
    opacity: 0.75,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTabsRow: {
    flexDirection: "row",
    backgroundColor: "#F2F4F5",
    borderRadius: BorderRadius.sm,
    padding: 3,
    marginBottom: Spacing.md,
  },
  modalTabItem: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 4,
  },
  modalTabItemActive: {
    backgroundColor: Colors.primary,
  },
  modalTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  modalTabTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  optionsScrollView: {
    maxHeight: 280,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 6,
    backgroundColor: "#F8F9FA",
  },
  optionRowSelected: {
    backgroundColor: "#E8F4F5",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  optionSub: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default PeriodFilter;
