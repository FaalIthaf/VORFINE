import { BottomNavBar } from "@/components/BottomNavBar";
import { Header } from "@/components/Header";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/features/auth";
import { ProfileModal } from "@/features/profile";
import { ScheduleSection } from "@/features/schedule/components/ScheduleSection";
import { TransactionItemCard } from "@/features/transaction";
import { TabType } from "@/types";
import { parseAmountToNumber, parseTransactionDate } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BalanceCard } from "../components/BalanceCard";
import { FinanceSummary } from "../components/FinanceSummary";
import { InfoScreen } from "./InfoScreen";
import { apiService } from "@/services";
import { TransactionDTO } from "@/models";

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    toggleCompleteSchedule,
    formattedSelectedDate,
    currentTimeStr,
    profiles,
    selectedProfileId,
    selectProfile,
    addProfile,
    deleteProfile,
    currentProfile,
    financeData,
    transactions,
    filteredSchedules,
    hasUnreadNotification,
    activeTab,
    setActiveTab,
  } = useApp();

  const [isProfileModalVisible, setIsProfileModalVisible] =
    useState<boolean>(false);
  const [isPeriodModalVisible, setIsPeriodModalVisible] =
    useState<boolean>(false);
  const [expensePeriod, setExpensePeriod] = useState<
    "daily" | "monthly" | "yearly"
  >("daily");

  // Financial Masking State
  const [isTotalBalanceMasked, setIsTotalBalanceMasked] =
    useState<boolean>(true);
  const [isDailyExpenseMasked, setIsDailyExpenseMasked] =
    useState<boolean>(true);

  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────
  // Task 1: State penampung error dan status loading (Error Handling)
  // ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setErrorMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [apiTransactions, setApiTransactions] = useState<TransactionDTO[]>([]);

  // Tetap sinkronkan isLoadingApi untuk kompatibilitas tampilan
  const isLoadingApi = loading;

  // Helper format mata uang Rupiah
  const formatRupiah = (val: number | string): string => {
    if (typeof val === "string") {
      if (val.startsWith("Rp") || val.startsWith("IDR")) return val;
      val = Number(val) || 0;
    }
    const formatted = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formatted},00`;
  };

  // Hook useCallback untuk fungsi pemanggil API dengan penanganan Loading, Error, & Offline (Task 1, 2, 3)
  const loadApiData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setIsOffline(false);

      // 1. Deteksi Koneksi Proaktif sebelum request (Task 3)
      const isConnected = await apiService.checkConnection();
      if (!isConnected) {
        throw new TypeError("Failed to fetch: Perangkat dalam kondisi offline");
      }

      // 2. Panggil fungsi REST API transaksi VORFÍNE (Task 2)
      const rawTransactions = await apiService.fetchTransactions();

      // 3. Gunakan metode .map() untuk menyesuaikan field server agar cocok dengan struktur DTO (Task 1)
      const mappedTransactions: TransactionDTO[] = rawTransactions.map(
        (item: any) => ({
          id: String(item.id),
          title: item.title,
          amount: Number(item.amount) || 0,
          type: item.type === "income" ? "income" : "expense",
          category: item.category || "Umum",
          date: item.date,
          description: item.description || item.title,
          status: item.status || "completed",
          balanceAfter: item.balanceAfter,
        })
      );

      setApiTransactions(mappedTransactions);
      setErrorMessage(null);
      setIsOffline(false);
    } catch (err: any) {
      console.error("Gagal memuat data API pada Dashboard:", err);

      // 1. Deteksi Koneksi / Penangkapan Error Jaringan (Task 3)
      const isNetOffline = apiService.isNetworkError(err);
      setIsOffline(isNetOffline);

      if (isNetOffline) {
        // 2. Tampilan Pesan Offline Khusus (Task 3)
        setErrorMessage(
          "Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi."
        );
      } else {
        setErrorMessage(err?.message || "Terjadi kesalahan saat memuat data.");
      }

      // Sembunyikan data jika terjadi kegagalan (Task 2 & 3: data tidak ditampilkan saat error/offline)
      setApiTransactions([]);
    } finally {
      // Pastikan setLoading(false) dijalankan di dalam blok finally agar tidak infinite loading
      setLoading(false);
    }
  }, []);

  // Panggil loadApiData saat komponen pertama kali dimuat
  useEffect(() => {
    loadApiData();
  }, [loadApiData]);

  // Listener perubahan status koneksi (Offline / Online) untuk pemulihan real-time (Task 3)
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleOnline = () => {
        setIsOffline(false);
        loadApiData();
      };
      const handleOffline = () => {
        setIsOffline(true);
        setErrorMessage(
          "Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi."
        );
        setApiTransactions([]);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [loadApiData]);

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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadApiData();
      showFeedback("Data transaksi VORFÍNE berhasil diperbarui");
    } catch (err: any) {
      showFeedback("Gagal memperbarui data: " + (err?.message || ""));
    } finally {
      setRefreshing(false);
    }
  }, [loadApiData]);

  const handleTabSelect = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "schedule") {
      router.push("/schedule" as any);
    } else if (tab === "finance") {
      router.push("/finance" as any);
    }
  };

  // 3. Mapping data transaksi murni keuangan pribadi VORFÍNE
  const displayTransactions = useMemo(() => {
    // Jika user sudah memiliki catatan transaksi pribadi, tampilkan transaksi user
    if (transactions.length > 0) {
      return transactions;
    }

    // Jika terjadi kegagalan (error !== null), sembunyikan data API (Task 2)
    if (error !== null) {
      return [];
    }

    // Jika belum ada data transaksi user, tampilkan data dinamis dari REST API VORFÍNE (Task 3)
    return apiTransactions.map((t) => ({
      id: `api-${t.id}`,
      title: t.title,
      note: t.description || t.category,
      date: t.date,
      amount: formatRupiah(t.amount),
      balance: t.balanceAfter ? formatRupiah(t.balanceAfter) : "Saldo: Terkelola",
      type: t.type,
      numericAmount: t.amount,
      rawDate: t.date,
      timestamp: new Date(t.date).getTime() || Date.now(),
    }));
  }, [transactions, apiTransactions, error]);

  // 5. Multi-Period calculations for Harian, Bulanan, and Tahunan
  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  const periodStats = useMemo(() => {
    let dExp = 0;
    let dInc = 0;
    let mExp = 0;
    let mInc = 0;
    let yExp = 0;
    let yInc = 0;

    displayTransactions.forEach((t) => {
      const amt = t.numericAmount || parseAmountToNumber(t.amount);
      const d = parseTransactionDate(t);
      const isThisYear = d.getFullYear() === todayYear;
      const isThisMonth = isThisYear && d.getMonth() === todayMonth;
      const isToday = isThisMonth && d.getDate() === todayDay;

      if (t.type === "expense") {
        if (isToday) dExp += amt;
        if (isThisMonth) mExp += amt;
        if (isThisYear) yExp += amt;
      } else {
        if (isToday) dInc += amt;
        if (isThisMonth) mInc += amt;
        if (isThisYear) yInc += amt;
      }
    });

    return {
      dailyExpense: Math.max(dExp, financeData.dailyExpense),
      dailyIncome: dInc,
      monthlyExpense: Math.max(mExp, financeData.monthlyExpense),
      monthlyIncome: Math.max(mInc, financeData.monthlyIncome),
      yearlyExpense: Math.max(yExp, financeData.yearlyExpense || 0),
      yearlyIncome: yInc,
    };
  }, [displayTransactions, financeData, todayYear, todayMonth, todayDay]);

  const activeExpenseTitle =
    expensePeriod === "daily"
      ? "Pengeluaran Harian"
      : expensePeriod === "monthly"
        ? "Pengeluaran Bulanan"
        : "Pengeluaran Tahunan";

  const activeExpenseAmount =
    expensePeriod === "daily"
      ? periodStats.dailyExpense
      : expensePeriod === "monthly"
        ? periodStats.monthlyExpense
        : periodStats.yearlyExpense;

  const activeSummaryPeriodLabel =
    expensePeriod === "daily"
      ? "Hari Ini"
      : expensePeriod === "monthly"
        ? financeData.monthName
        : `Tahun ${todayYear}`;

  const activeSummaryIncome =
    expensePeriod === "daily"
      ? periodStats.dailyIncome
      : expensePeriod === "monthly"
        ? periodStats.monthlyIncome
        : periodStats.yearlyIncome;

  const activeSummaryExpense =
    expensePeriod === "daily"
      ? periodStats.dailyExpense
      : expensePeriod === "monthly"
        ? periodStats.monthlyExpense
        : periodStats.yearlyExpense;

  return (
    <View style={styles.rootContainer}>
      <StatusBar {...({ barStyle: "light-content", backgroundColor: Colors.primary } as any)} />

      {/* Header Section */}
      <Header
        currentProfileName={currentProfile.name}
        onPressProfile={() => setIsProfileModalVisible(true)}
        onPressNotification={handleNotificationPress}
        hasUnreadNotification={hasUnreadNotification}
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
            hasUnreadNotification={hasUnreadNotification}
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

          {/* Card 2: Pengeluaran Multi-Periode (Harian, Bulanan, Tahunan) */}
          <BalanceCard
            title={activeExpenseTitle}
            amount={activeExpenseAmount}
            isMasked={isDailyExpenseMasked}
            onToggleMask={() => setIsDailyExpenseMasked((prev) => !prev)}
            hasDropdown={true}
            onPressDropdown={() => setIsPeriodModalVisible(true)}
          />

          {/* Financial Summary: Pemasukan & Pengeluaran disesuaikan dengan periode */}
          <FinanceSummary
            incomeAmount={activeSummaryIncome}
            expenseAmount={activeSummaryExpense}
            monthName={activeSummaryPeriodLabel}
            onPressIncome={() => router.push("/income" as any)}
            onPressExpense={() => router.push("/expense" as any)}
          />

          {/* Riwayat Transaksi Terkini Section */}
            <View style={styles.recentTransactionsSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleWithBadge}>
                  <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
                  <View style={styles.transCountBadge}>
                    <Text style={styles.transCountText}>
                      {displayTransactions.length}
                    </Text>
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
                      ]
                    );
                  }}
                  hitSlop={8}
                ></Pressable>
              </View>

              {/* 1. Indikator Loading: Saat proses fetch sedang berjalan (loading === true) */}
              {loading && displayTransactions.length === 0 ? (
                <View style={styles.loadingCard}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>
                    Memuat data... Mohon tunggu sebentar
                  </Text>
                  <Text style={styles.loadingSubtext}>
                    Sedang mengambil data transaksi dari server VORFÍNE
                  </Text>
                </View>
              ) : error !== null ? (
                /* 2. Pesan Error / Offline & Tombol Retry: Jika terjadi kegagalan (Task 2 & 3) */
                <View
                  style={[
                    styles.errorTransCard,
                    isOffline && styles.offlineTransCard,
                  ]}
                >
                  <View
                    style={[
                      styles.errorIconCircle,
                      isOffline && styles.offlineIconCircle,
                    ]}
                  >
                    <Ionicons
                      name={isOffline ? "cloud-offline-outline" : "alert-circle-outline"}
                      size={24}
                      color={isOffline ? "#D97706" : "#DC2626"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.errorTitleText,
                      isOffline && styles.offlineTitleText,
                    ]}
                  >
                    {isOffline ? "Tidak Ada Koneksi Internet" : "Gagal Memuat Data"}
                  </Text>
                  <Text style={styles.errorMessageText}>
                    {isOffline
                      ? "Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi."
                      : error.includes("HTTP")
                        ? `Terjadi kesalahan respon server (${error}). Periksa koneksi backend atau coba kembali.`
                        : error}
                  </Text>
                  {/* 3. Fungsi Retry: Tombol Coba Lagi memicu kembali pemanggil API */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.retryButton,
                      isOffline && styles.offlineRetryButton,
                      pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                    ]}
                    onPress={loadApiData}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isOffline
                        ? "Coba Lagi menghubungkan ke internet"
                        : "Coba Lagi memuat data transaksi"
                    }
                  >
                    <Ionicons name="reload-outline" size={15} color="#FFFFFF" />
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                  </Pressable>
                </View>
              ) : displayTransactions.length > 0 ? (
                /* 4. Tampilan Data Sukses: List Transaksi Terbaru DTO */
                displayTransactions
                  .slice(0, 3)
                  .map((item, index) => (
                    <TransactionItemCard
                      key={`${item.id}-${index}`}
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
                  ))
              ) : (
                /* 5. Tampilan Kosong (tidak ada catatan transaksi) */
                <View style={styles.emptyTransCard}>
                  <Text style={styles.emptyTransText}>
                    Belum ada catatan transaksi. Catat melalui menu Keuangan.
                  </Text>
                </View>
              )}
            </View>

            {/* Schedule Section dengan Waktu Real-Time Sinkron */}
          <ScheduleSection
            currentDateText={`${formattedSelectedDate} • ${currentTimeStr}`}
            items={filteredSchedules.slice(0, 4)}
            onToggleComplete={toggleCompleteSchedule}
            onPressDateDropdown={() => router.push("/schedule" as any)}
          />
        </ScrollView>
      )}

      {/* Modal / Action Sheet: Filter Multi-Periode Pengeluaran (Point 5) */}
      <Modal
        visible={isPeriodModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPeriodModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setIsPeriodModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.periodModalContent}>
                <View style={styles.periodModalHeader}>
                  <Text style={styles.periodModalTitle}>
                    Pilih Periode Pengeluaran
                  </Text>
                  <Text style={styles.periodModalSubtitle}>
                    Perbarui tampilan ringkasan dan grafik pengeluaran
                  </Text>
                </View>

                <View style={styles.periodOptionsList}>
                  {[
                    {
                      key: "daily",
                      label: "Harian",
                      desc: "Pengeluaran hari ini",
                    },
                    {
                      key: "monthly",
                      label: "Bulanan",
                      desc: `Pengeluaran bulan ${financeData.monthName}`,
                    },
                    {
                      key: "yearly",
                      label: "Tahunan",
                      desc: `Akumulasi tahun berjalan (${todayYear})`,
                    },
                  ].map((option) => {
                    const isSelected = expensePeriod === option.key;
                    return (
                      <Pressable
                        key={option.key}
                        style={[
                          styles.periodOptionItem,
                          isSelected && styles.periodOptionItemSelected,
                        ]}
                        onPress={() => {
                          setExpensePeriod(option.key as any);
                          setIsPeriodModalVisible(false);
                          showFeedback(
                            `Menampilkan pengeluaran ${option.label}`,
                          );
                        }}
                      >
                        <View style={styles.periodOptionTextWrapper}>
                          <Text
                            style={[
                              styles.periodOptionLabel,
                              isSelected && styles.periodOptionLabelSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                          <Text style={styles.periodOptionDesc}>
                            {option.desc}
                          </Text>
                        </View>
                        {isSelected ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color={Colors.primary}
                          />
                        ) : (
                          <View style={styles.radioEmpty} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  style={styles.closePeriodBtn}
                  onPress={() => setIsPeriodModalVisible(false)}
                >
                  <Text style={styles.closePeriodBtnText}>Buka</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
        onDeleteProfile={(id) => {
          deleteProfile(id);
          showFeedback("Profil berhasil dihapus!");
        }}
      />

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
  loadingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D5DBDB",
    marginBottom: Spacing.md,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  errorTransCard: {
    backgroundColor: "#FFF8F8",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: Spacing.md,
  },
  errorIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  errorTitleText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#B91C1C",
    marginBottom: 3,
    textAlign: "center",
  },
  errorMessageText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: "700",
  },
  offlineTransCard: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  offlineIconCircle: {
    backgroundColor: "#FEF3C7",
  },
  offlineTitleText: {
    color: "#B45309",
  },
  offlineRetryButton: {
    backgroundColor: Colors.primary,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  periodModalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 360,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  periodModalHeader: {
    marginBottom: Spacing.md,
  },
  periodModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  periodModalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  periodOptionsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  periodOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  periodOptionItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#F0FDF4",
  },
  periodOptionTextWrapper: {
    flex: 1,
  },
  periodOptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  periodOptionLabelSelected: {
    color: Colors.primary,
    fontWeight: "700",
  },
  periodOptionDesc: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radioEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
  },
  closePeriodBtn: {
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.md,
  },
  closePeriodBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  biometricQuickBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  biometricQuickLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  biometricAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  biometricAvatarText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  biometricQuickInfo: {
    flex: 1,
  },
  biometricNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  biometricQuickName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  activeDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  biometricQuickSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  biometricQuickRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E0F2F1",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
  },
  
});

export default HomeScreen;
