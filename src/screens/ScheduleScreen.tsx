import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
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
import { BottomNavBar } from "../components/BottomNavBar";
import { CalendarWidget } from "../components/CalendarWidget";
import { ScheduleHeader } from "../components/ScheduleHeader";
import { ScheduleSection } from "../components/ScheduleSection";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { TabType } from "../types";

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

  const showFeedback = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("VORFÍNE", msg);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Hapus Jadwal",
      "Apakah Anda yakin ingin menghapus jadwal ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteSchedule(id);
            showFeedback("Jadwal berhasil dihapus.");
          },
        },
      ],
    );
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

        {/* "Jadwal Saya" Section */}
        <ScheduleSection
          sectionTitle="Jadwal Saya"
          currentDateText={formattedSelectedDate}
          items={filteredSchedules}
          showDeleteButton={true}
          onDelete={handleDelete}
          onToggleComplete={toggleCompleteSchedule}
          onPressDateDropdown={() =>
            Alert.alert(
              "Pilih Tanggal",
              `Tanggal aktif: ${formattedSelectedDate}`,
            )
          }
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
});

export default ScheduleScreen;
