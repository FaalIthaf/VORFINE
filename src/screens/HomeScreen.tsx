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
import { Profile, ScheduleItem, TabType } from "../types";

export const HomeScreen: React.FC = () => {
  const router = useRouter();

  // Profiles State
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: "1", name: "Muhammad Ivan Fadholli", isCurrent: true },
    { id: "2", name: "Akun Bisnis / Toko", isCurrent: false },
    { id: "3", name: "Tabungan Pribadi", isCurrent: false },
  ]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("1");
  const [isProfileModalVisible, setIsProfileModalVisible] =
    useState<boolean>(false);

  // Financial Masking State
  const [isTotalBalanceMasked, setIsTotalBalanceMasked] =
    useState<boolean>(true);
  const [isDailyExpenseMasked, setIsDailyExpenseMasked] =
    useState<boolean>(true);

  // Financial Amounts State
  const [totalBalance, setTotalBalance] = useState<number>(300000);
  const [dailyExpense, setDailyExpense] = useState<number>(100000);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(3700000);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(350000);

  // Schedule Items State
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: "1",
      time: "05.00 - 06.00 WIB",
      title: "Sarapan Pagi",
      category: "Rutinitas",
      completed: true,
    },
    {
      id: "2",
      time: "07.00 - 07.30 WIB",
      title: "Berangkat ke kantor",
      category: "Domestik",
      completed: true,
    },
    {
      id: "3",
      time: "08.00 - 16.00",
      title: "Kerja",
      category: "Pekerjaan",
      completed: true,
    },
    {
      id: "4",
      time: "08.00 - 16.00",
      title: "Kerja",
      category: "Keuangan",
      completed: true,
    },
  ]);

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Helper feedback
  const showFeedback = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("VORFÍNE", msg);
    }
  };

  const currentProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  // Actions
  const handleToggleScheduleItem = (id: string) => {
    setScheduleItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const handleSelectProfile = (id: string) => {
    setSelectedProfileId(id);
    const selected = profiles.find((p) => p.id === id);
    if (selected) {
      showFeedback(`Profil dialihkan ke: ${selected.name}`);
    }
  };

  const handleAddProfile = (name: string) => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      name,
      isCurrent: false,
    };
    setProfiles((prev) => [...prev, newProfile]);
    setSelectedProfileId(newProfile.id);
    showFeedback(`Profil "${name}" berhasil dibuat!`);
  };

  const handleNotificationPress = () => {
    router.push("/notifications" as any);
  };

  const handleDailyExpenseDropdown = () => {
    Alert.alert(
      "Filter Pengeluaran Harian",
      "Pilih rentang waktu:\n• Hari Ini\n• Kemarin\n• 7 Hari Terakhir",
    );
  };

  const handleToggleDemoFinance = () => {
    if (monthlyIncome === 0) {
      setMonthlyIncome(3700000);
      setMonthlyExpense(350000);
      showFeedback("Menampilkan ringkasan mutasi aktif September.");
    } else {
      setMonthlyIncome(0);
      setMonthlyExpense(0);
      showFeedback("Menampilkan ringkasan standar Rp 0.");
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showFeedback("Data VORFÍNE berhasil diperbarui");
    }, 800);
  }, []);

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
          amount={totalBalance}
          isMasked={isTotalBalanceMasked}
          onToggleMask={() => setIsTotalBalanceMasked((prev) => !prev)}
        />

        {/* Card 2: Pengeluaran Harian */}
        <BalanceCard
          title="Pengeluaran Harian"
          amount={dailyExpense}
          isMasked={isDailyExpenseMasked}
          onToggleMask={() => setIsDailyExpenseMasked((prev) => !prev)}
          hasDropdown={true}
          onPressDropdown={handleDailyExpenseDropdown}
        />

        {/* Financial Summary: Pemasukan & Pengeluaran (September) */}
        <FinanceSummary
          incomeAmount={monthlyIncome}
          expenseAmount={monthlyExpense}
          monthName="September"
          onPressIncome={() => router.push("/income" as any)}
          onPressExpense={() => router.push("/expense" as any)}
        />

        {/* Schedule Section */}
        <ScheduleSection
          currentDateText="Jum'at, 18 September 2026"
          items={scheduleItems}
          onToggleComplete={handleToggleScheduleItem}
          onPressDateDropdown={() =>
            Alert.alert(
              "Pilih Tanggal",
              "Kalender jadwal harian September 2026",
            )
          }
        />

        {/* Pintasan (Quick Actions) */}
        <QuickActions
          onPressScheduleShortcut={() =>
            showFeedback("Pintasan: Membuka agenda jadwal harian")
          }
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
        onSelectProfile={handleSelectProfile}
        onAddProfile={handleAddProfile}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === "finance") {
            Alert.alert(
              "Detail Keuangan VORFÍNE",
              "Pilih halaman rincian transaksi:",
              [
                {
                  text: "Pemasukkan",
                  onPress: () => router.push("/income" as any),
                },
                {
                  text: "Pengeluaran",
                  onPress: () => router.push("/expense" as any),
                },
                { text: "Batal", style: "cancel" },
              ],
            );
          }
        }}
      />
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
