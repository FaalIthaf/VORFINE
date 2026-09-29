import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { BalanceCard } from "../components/BalanceCard";
import { BottomNavBar } from "../components/BottomNavBar";
import { FinanceSummary } from "../components/FinanceSummary";
import { Header } from "../components/Header";
import { ProfileModal } from "../components/ProfileModal";
import { ScheduleSection } from "../components/ScheduleSection";
import { TransactionItemCard } from "../components/TransactionItemCard";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { TabType } from "../types";
import { InfoScreen } from "./InfoScreen";

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
    transactions,
    filteredSchedules,
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

      {/* Dynamic Content based on Active Tab */}
      {activeTab === "menu" ? (
        <View style={{ flex: 1 }}>
          <InfoScreen
            showHeader={false}
            showBottomNav={false}
            currentProfileName={currentProfile.name}
            onPressProfile={() => setIsProfileModalVisible(true)}
            onPressNotification={handleNotificationPress}
            hasUnreadNotification={true}
          />
        </View>
      ) : (
        /* Scrollable Content */
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

          {/* Riwayat Transaksi Terkini Section */}
          <View style={styles.recentTransactionsSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithBadge}>
                <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
                <View style={styles.transCountBadge}>
                  <Text style={styles.transCountText}>{transactions.length}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  Alert.alert(
                    "Pilih Mutasi Transaksi",
                    "Buka rincian riwayat transaksi:",
                    [
                      {
                        text: "Pemasukkan",
                        onPress: () => router.push("/income" as any),
                      },
                      {
                        text: "Pengeluaran",
                        onPress: () => router.push("/expense" as any),
                      },
                      {
                        text: "Catat Transaksi",
                        onPress: () => router.push("/finance" as any),
                      },
                      { text: "Batal", style: "cancel" },
                    ],
                  );
                }}
                hitSlop={8}
              >
                <Text style={styles.seeAllText}>Lihat Semua</Text>
              </Pressable>
            </View>

            {/* List Transaksi Terbaru */}
            {transactions.slice(0, 3).map((item) => (
              <TransactionItemCard
                key={item.id}
                title={item.title}
                note={item.note}
                date={item.date}
                amount={item.amount}
                balance={item.balance}
                type={item.type}
                onPress={() => {
                  if (item.type === "income") {
                    router.push("/income" as any);
                  } else {
                    router.push("/expense" as any);
                  }
                }}
              />
            ))}

            {transactions.length === 0 && (
              <View style={styles.emptyTransCard}>
                <Text style={styles.emptyTransText}>
                  Belum ada catatan transaksi. Catat melalui menu Keuangan.
                </Text>
              </View>
            )}
          </View>

          {/* Schedule Section (Today's Summary) */}
          <ScheduleSection
            currentDateText={formattedSelectedDate}
            items={filteredSchedules.slice(0, 4)}
            onToggleComplete={toggleCompleteSchedule}
            onPressDateDropdown={() => router.push("/schedule" as any)}
          />
        </ScrollView>
      )}

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
      <BottomNavBar activeTab={activeTab} onSelectTab={handleTabSelect} />
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
    paddingBottom: Spacing.xl + 8,
  },
  recentTransactionsSection: {
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionTitleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  transCountBadge: {
    backgroundColor: "#35575C",
    borderRadius: BorderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  transCountText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: Colors.primary,
  },
  emptyTransCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D5DBDB",
    marginBottom: Spacing.md,
  },
  emptyTransText: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    textAlign: "center",
  },
});

export default HomeScreen;
