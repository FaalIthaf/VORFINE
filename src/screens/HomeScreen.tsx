import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  ToastAndroid,
  View,
} from "react-native";
import { BalanceCard } from "../components/BalanceCard";
import { BottomNavBar } from "../components/BottomNavBar";
import { FinanceSummary } from "../components/FinanceSummary";
import { Header } from "../components/Header";
import { ProfileModal } from "../components/ProfileModal";
import { QuickActions } from "../components/QuickActions";
import { ScheduleSection } from "../components/ScheduleSection";
import { Colors, Spacing } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { TabType } from "../types";

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const {
    schedules,
    toggleCompleteSchedule,
    formattedSelectedDate,
    profiles,
    selectedProfileId,
    selectProfile,
    addProfile,
    currentProfile,
    financeData,
    activeTab,
    setActiveTab,
  } = useApp();

  const [isProfileModalVisible, setIsProfileModalVisible] =
    useState<boolean>(false);

  // Financial Masking State
  const [isTotalBalanceMasked, setIsTotalBalanceMasked] =
    useState<boolean>(true);
  const [isDailyExpenseMasked, setIsDailyExpenseMasked] =
    useState<boolean>(true);

  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Helper feedback
  const showFeedback = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("VORFÍNE", msg);
    }
  };

  const handleNotificationPress = () => {
    router.push("/notifications" as any);
  };

  const handleDailyExpenseDropdown = () => {
    Alert.alert(
      "Filter Pengeluaran Harian",
      "Pilih rentang waktu:\nHari Ini\nKemarin\n7 Hari Terakhir",
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showFeedback("Data VORFÍNE berhasil diperbarui");
    }, 600);
  }, []);

  const handleTabSelect = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "schedule") {
      router.push("/schedule" as any);
    } else if (tab === "finance") {
      router.push("/finance" as any);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header Section */}
      <Header
        currentProfileName={currentProfile.name}
        onPressProfile={() => setIsProfileModalVisible(true)}
        onPressNotification={handleNotificationPress}
        hasUnreadNotification={true}
      />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Card 1: Total Saldo */}
        <BalanceCard
          title="Total Saldo"
          amount={financeData.totalBalance}
          isMasked={isTotalBalanceMasked}
          onToggleMask={() => setIsTotalBalanceMasked((prev) => !prev)}
        />

        {/* Card 2: Pengeluaran Harian */}
        <BalanceCard
          title="Pengeluaran Harian"
          amount={financeData.dailyExpense}
          isMasked={isDailyExpenseMasked}
          onToggleMask={() => setIsDailyExpenseMasked((prev) => !prev)}
          hasDropdown={true}
          onPressDropdown={handleDailyExpenseDropdown}
        />

        {/* Financial Summary: Pemasukan & Pengeluaran (September) */}
        <FinanceSummary
          incomeAmount={financeData.monthlyIncome}
          expenseAmount={financeData.monthlyExpense}
          monthName={financeData.monthName}
          onPressIncome={() => router.push("/income" as any)}
          onPressExpense={() => router.push("/expense" as any)}
        />

        {/* Schedule Section (Today's Summary) */}
        <ScheduleSection
          currentDateText={formattedSelectedDate}
          items={schedules.slice(0, 4)}
          onToggleComplete={toggleCompleteSchedule}
          onPressDateDropdown={() => router.push("/schedule" as any)}
        />

        {/* Pintasan (Quick Actions) */}
        <QuickActions
          onPressScheduleShortcut={() => router.push("/schedule" as any)}
          onPressTimerShortcut={() =>
            showFeedback("Pintasan: Membuka stopwatch / pengingat aktivitas")
          }
        />
      </ScrollView>

      {/* Bottom Sheet / Modal: Ganti Profil */}
      <ProfileModal
        visible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onSelectProfile={(id) => {
          selectProfile(id);
          showFeedback("Profil berhasil dialihkan!");
        }}
        onAddProfile={(name) => {
          addProfile(name);
          showFeedback(`Profil "${name}" berhasil dibuat!`);
        }}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="home" onSelectTab={handleTabSelect} />
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});

export default HomeScreen;
