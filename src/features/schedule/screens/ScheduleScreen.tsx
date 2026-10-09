import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { AddScheduleModal } from "../components/AddScheduleModal";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CalendarWidget } from "@/features/dashboard";
import { ScheduleHeader } from "../components/ScheduleHeader";
import { ScheduleSection } from "../components/ScheduleSection";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { ScheduleItem, TabType } from "@/types";

export const ScheduleScreen: React.FC = () => {
  const router = useRouter();
  const {
    currentYear,
    currentMonth,
    selectedDay,
    setSelectedDay,
    prevMonth,
    nextMonth,
    monthName,
    formattedSelectedDate,
    currentTimeStr,
    selectedDateKey,
    searchQuery,
    setSearchQuery,
    filteredSchedules,
    deleteSchedule,
    toggleCompleteSchedule,
    addSchedule,
    activeTab,
    setActiveTab,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ScheduleItem | null>(
    null,
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      setFeedbackMessage(msg);
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 2500);
    }
  };

  const handleDelete = (id: string) => {
    const item = filteredSchedules.find((s) => s.id === id);
    const targetItem = item || ({ id, title: "jadwal ini" } as ScheduleItem);
    setScheduleToDelete(targetItem);
  };

  const handleConfirmDelete = () => {
    if (scheduleToDelete) {
      deleteSchedule(scheduleToDelete.id);
      setScheduleToDelete(null);
      showFeedback("Jadwal berhasil dihapus.");
    }
  };

  const handleBack = () => {
    setActiveTab("home");
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/" as any);
    }
  };

  const handleTabSelect = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "home") {
      router.replace("/" as any);
    } else if (tab === "finance") {
      router.push("/finance" as any);
    } else if (tab === "menu") {
      router.replace("/" as any);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Top Bar with Back Arrow, Search Bar Capsule, and VORFÍNE logo */}
      <ScheduleHeader
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        onPressBack={handleBack}
      />

      {/* Main Scrollable Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Monthly Calendar Grid Widget */}
        <CalendarWidget
          currentYear={currentYear}
          currentMonth={currentMonth}
          selectedDay={selectedDay}
          onSelectDay={(day) => setSelectedDay(day)}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          monthName={monthName}
        />

        {/* "Jadwal Saya" Section dengan Jam Real-time */}
        <ScheduleSection
          sectionTitle="Jadwal Saya"
          currentDateText={`${formattedSelectedDate} • ${currentTimeStr}`}
          items={filteredSchedules}
          showDeleteButton={true}
          onDelete={handleDelete}
        />

        {/* Floating/Bottom Button: + TAMBAH JADWAL BARU */}
        <Pressable
          style={({ pressed }) => [
            styles.addScheduleButton,
            pressed && styles.pressedState,
          ]}
          onPress={() => setIsAddModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Tambah Jadwal Baru"
        >
          <Text style={styles.addScheduleButtonText}>+ TAMBAH JADWAL BARU</Text>
        </Pressable>
      </ScrollView>

      {/* Delete Confirmation Modal (Web, Tablet, Mobile) */}
      <Modal
        visible={Boolean(scheduleToDelete)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setScheduleToDelete(null)}
      >
        <Pressable
          style={styles.deleteModalBackdrop}
          onPress={() => setScheduleToDelete(null)}
        >
          <Pressable
            style={styles.deleteModalCard}
            onPress={(e) => e.stopPropagation()}
            {...({
              onClick: (e: any) => {
                e?.stopPropagation?.();
              },
            } as any)}
          >
            <View style={styles.deleteModalIconCircle}>
              <Ionicons name="trash-outline" size={26} color="#DC2626" />
            </View>
            <Text style={styles.deleteModalTitle}>Hapus Jadwal</Text>
            <Text style={styles.deleteModalSubtitle}>
              Apakah Anda yakin ingin menghapus jadwal{" "}
              <Text style={styles.deleteModalItemName}>
                "{scheduleToDelete?.title}"
              </Text>
              ?
            </Text>
            <View style={styles.deleteModalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteModalCancelBtn,
                  pressed && styles.pressedState,
                ]}
                onPress={() => setScheduleToDelete(null)}
                {...({
                  onClick: (e: any) => {
                    e?.stopPropagation?.();
                    setScheduleToDelete(null);
                  },
                } as any)}
                accessibilityRole="button"
                accessibilityLabel="Batal hapus jadwal"
              >
                <Text style={styles.deleteModalCancelText}>Batal</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteModalConfirmBtn,
                  pressed && styles.pressedState,
                ]}
                onPress={handleConfirmDelete}
                {...({
                  onClick: (e: any) => {
                    e?.stopPropagation?.();
                    handleConfirmDelete();
                  },
                } as any)}
                accessibilityRole="button"
                accessibilityLabel="Konfirmasi hapus jadwal"
              >
                <Text style={styles.deleteModalConfirmText}>Hapus</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom Sheet Modal: Tambah Jadwal Baru */}
      <AddScheduleModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveSchedule={(newItem) => {
          addSchedule(newItem);
          showFeedback("Jadwal baru berhasil disimpan!");
        }}
        defaultDateKey={selectedDateKey}
        defaultFormattedDate={formattedSelectedDate}
      />

      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
          <Text style={styles.toastText}>{feedbackMessage}</Text>
        </View>
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="schedule" onSelectTab={handleTabSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  addScheduleButton: {
    backgroundColor: "#507B80",
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  addScheduleButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  pressedState: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  // Delete Confirmation Modal Styles
  deleteModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  deleteModalCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  deleteModalIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  deleteModalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  deleteModalItemName: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  deleteModalActions: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  deleteModalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1.2,
    borderColor: "#D0D5DD",
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  deleteModalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
  },
  deleteModalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  deleteModalConfirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
  // Toast Notification Styles
  toastContainer: {
    position: "absolute",
    bottom: 84,
    alignSelf: "center",
    backgroundColor: "#1F2937",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.round,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs + 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 9999,
  },
  toastText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
});

export default ScheduleScreen;
