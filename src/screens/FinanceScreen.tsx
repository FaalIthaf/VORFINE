import { Ionicons } from "@expo/vector-icons";
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
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavBar } from "../components/BottomNavBar";
import { BrandLogo } from "../components/BrandLogo";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { TabType } from "../types";

export const FinanceScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { financeData, updateFinanceData, addTransaction, setActiveTab } =
    useApp();

  // 7. New Transaction Form State (default: Pemasukan on left, Pengeluaran on right)
  const [transType, setTransType] = useState<"income" | "expense">("income");
  const [transTitle, setTransTitle] = useState("");
  const [transAmount, setTransAmount] = useState("");

  // 6. Budget Edit State (Daily, Monthly, and Annual)
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempDailyBudget, setTempDailyBudget] = useState(
    financeData.dailyBudget.toString(),
  );
  const [tempMonthlyBudget, setTempMonthlyBudget] = useState(
    financeData.monthlyBudget.toString(),
  );
  const [tempYearlyBudget, setTempYearlyBudget] = useState(
    (financeData.yearlyBudget || 0).toString(),
  );

  const showFeedback = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("VORFÍNE", msg);
    }
  };

  const formatRupiah = (val: number): string => {
    return "Rp " + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ",00";
  };

  // Calculations for Daily Budget Alert System
  const dailySpent = financeData.dailyExpense;
  const dailyLimit = financeData.dailyBudget;
  const dailyPercentage =
    dailyLimit > 0 ? Math.min(Math.round((dailySpent / dailyLimit) * 100), 100) : 0;
  const isDailyOver = dailyLimit > 0 && dailySpent >= dailyLimit;
  const isDailyNear =
    dailyLimit > 0 && dailySpent >= dailyLimit * 0.8 && !isDailyOver;

  // Calculations for Monthly Budget Alert System
  const monthlySpent = financeData.monthlyExpense;
  const monthlyLimit = financeData.monthlyBudget;
  const monthlyPercentage =
    monthlyLimit > 0
      ? Math.min(Math.round((monthlySpent / monthlyLimit) * 100), 100)
      : 0;
  const isMonthlyOver = monthlyLimit > 0 && monthlySpent >= monthlyLimit;
  const isMonthlyNear =
    monthlyLimit > 0 && monthlySpent >= monthlyLimit * 0.8 && !isMonthlyOver;

  // 6. Calculations for Annual Budget Monitoring
  const yearlySpent = financeData.yearlyExpense || 0;
  const yearlyLimit = financeData.yearlyBudget || 0;
  const yearlyPercentage =
    yearlyLimit > 0
      ? Math.min(Math.round((yearlySpent / yearlyLimit) * 100), 100)
      : 0;
  const isYearlyOver = yearlyLimit > 0 && yearlySpent >= yearlyLimit;
  const isYearlyNear =
    yearlyLimit > 0 && yearlySpent >= yearlyLimit * 0.8 && !isYearlyOver;

  // Save New Transaction
  const handleSaveTransaction = () => {
    const amountNum = parseInt(transAmount.replace(/[^0-9]/g, ""), 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(
        "Perhatian",
        "Silakan masukkan nominal transaksi yang valid.",
      );
      return;
    }
    if (!transTitle.trim()) {
      Alert.alert("Perhatian", "Silakan masukkan keterangan transaksi.");
      return;
    }

    addTransaction({
      title: transTitle.trim(),
      note: transType === "income" ? "Pemasukan" : "Pengeluaran",
      amount: amountNum,
      type: transType,
    });

    const formatted = formatRupiah(amountNum);
    const typeLabel = transType === "income" ? "Pemasukan" : "Pengeluaran";

    setTransTitle("");
    setTransAmount("");

    Alert.alert(
      "Transaksi Berhasil Disimpan",
      `${typeLabel} sebesar ${formatted} berhasil dicatat dengan waktu sekarang dan disinkronkan ke riwayat Dashboard.`,
      [
        {
          text: "Lihat di Dashboard",
          onPress: () => {
            setActiveTab("home");
            router.replace("/" as any);
          },
        },
        {
          text: "Lihat Riwayat",
          onPress: () => {
            if (transType === "income") {
              router.push("/income" as any);
            } else {
              router.push("/expense" as any);
            }
          },
        },
        { text: "OK", style: "cancel" },
      ],
    );
  };

  const handleSaveBudget = () => {
    const dNum = parseInt(tempDailyBudget.replace(/[^0-9]/g, ""), 10);
    const mNum = parseInt(tempMonthlyBudget.replace(/[^0-9]/g, ""), 10);
    const yNum = parseInt(tempYearlyBudget.replace(/[^0-9]/g, ""), 10);

    updateFinanceData({
      dailyBudget: isNaN(dNum) ? 0 : dNum,
      monthlyBudget: isNaN(mNum) ? 0 : mNum,
      yearlyBudget: isNaN(yNum) ? 0 : yNum,
    });
    setIsEditingBudget(false);
    showFeedback("Target anggaran berhasil diperbarui!");
  };

  const handleTabSelect = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "home") {
      router.replace("/" as any);
    } else if (tab === "schedule") {
      router.push("/schedule" as any);
    } else if (tab === "menu") {
      router.replace("/" as any);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* 8. Header with Responsive Safe Area & Synchronized Symmetrical BrandLogo */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 12) + 8 },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => {
            setActiveTab("home");
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/" as any);
            }
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Beranda"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Mengatur Keuangan</Text>
        <View style={styles.headerRight}>
          <BrandLogo color={Colors.white} size="medium" />
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Alert Banner */}
        {isDailyOver || isMonthlyOver || isYearlyOver ? (
          <View style={[styles.alertBanner, styles.alertBannerDanger]}>
            <Ionicons name="alert-circle" size={24} color="#C0392B" />
            <View style={styles.alertTextWrapper}>
              <Text style={styles.alertBannerTitle}>
                Peringatan Batas Anggaran!
              </Text>
              <Text style={styles.alertBannerDesc}>
                {isDailyOver
                  ? "Pengeluaran harian telah melampaui limit anggaran harian Anda."
                  : isMonthlyOver
                    ? "Pengeluaran bulanan telah melampaui limit anggaran bulanan."
                    : "Pengeluaran tahunan telah melampaui limit anggaran tahunan."}
              </Text>
            </View>
          </View>
        ) : isDailyNear || isMonthlyNear || isYearlyNear ? (
          <View style={[styles.alertBanner, styles.alertBannerWarning]}>
            <Ionicons name="warning-outline" size={24} color="#D97706" />
            <View style={styles.alertTextWrapper}>
              <Text style={[styles.alertBannerTitle, { color: "#D97706" }]}>
                Mendekati Batas Budget (80%)
              </Text>
              <Text style={styles.alertBannerDesc}>
                {isDailyNear
                  ? "Pengeluaran harian Anda telah mencapai 80% dari batas harian."
                  : isMonthlyNear
                    ? "Pengeluaran bulanan Anda telah mencapai 80% dari batas bulanan."
                    : "Akumulasi pengeluaran tahun berjalan telah mencapai 80% dari total anggaran tahunan."}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Quick Links to Detailed Views */}
        <View style={styles.quickLinksRow}>
          <Pressable
            style={[styles.quickLinkCard, styles.incomeLinkCard]}
            onPress={() => router.push("/income" as any)}
          >
            <View style={styles.quickLinkHeader}>
              <Text style={styles.quickLinkLabel}>Pemasukan</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={Colors.incomeText}
              />
            </View>
            <Text style={styles.quickLinkAmount}>
              {formatRupiah(financeData.monthlyIncome)}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.quickLinkCard, styles.expenseLinkCard]}
            onPress={() => router.push("/expense" as any)}
          >
            <View style={styles.quickLinkHeader}>
              <Text style={styles.quickLinkLabel}>Pengeluaran</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={Colors.expenseText}
              />
            </View>
            <Text style={styles.quickLinkAmount}>
              {formatRupiah(financeData.monthlyExpense)}
            </Text>
          </Pressable>
        </View>

        {/* 6. Budget Progress & Monitoring Card (Daily, Monthly, and Annual) */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardSectionTitle}>Monitoring Anggaran</Text>
              <Text style={styles.cardSectionSub}>
                Bulan {financeData.monthName} 2026 & Tahunan
              </Text>
            </View>
            <Pressable
              style={styles.editBudgetButton}
              onPress={() => {
                setTempDailyBudget(financeData.dailyBudget.toString());
                setTempMonthlyBudget(financeData.monthlyBudget.toString());
                setTempYearlyBudget((financeData.yearlyBudget || 0).toString());
                setIsEditingBudget(!isEditingBudget);
              }}
            >
              <Text style={styles.editBudgetText}>
                {isEditingBudget ? "Batal" : "Atur Budget"}
              </Text>
            </Pressable>
          </View>

          {isEditingBudget ? (
            <View style={styles.editBudgetForm}>
              <Text style={styles.inputLabel}>Batas Budget Harian (IDR):</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={tempDailyBudget}
                onChangeText={setTempDailyBudget}
                placeholder="Contoh: 100000"
                placeholderTextColor="#98A2B3"
              />

              <Text style={styles.inputLabel}>Batas Budget Bulanan (IDR):</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={tempMonthlyBudget}
                onChangeText={setTempMonthlyBudget}
                placeholder="Contoh: 3000000"
                placeholderTextColor="#98A2B3"
              />

              <Text style={styles.inputLabel}>Batas Budget Tahunan (IDR):</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={tempYearlyBudget}
                onChangeText={setTempYearlyBudget}
                placeholder="Contoh: 36000000"
                placeholderTextColor="#98A2B3"
              />

              <Pressable
                style={styles.saveBudgetBtn}
                onPress={handleSaveBudget}
              >
                <Text style={styles.saveBudgetBtnText}>
                  Simpan Pengaturan Budget
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.progressContainer}>
              {/* Daily Budget Progress */}
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Budget Harian</Text>
                  <Text style={styles.progressValues}>
                    {formatRupiah(dailySpent)} / {formatRupiah(dailyLimit)} (
                    {dailyPercentage}%)
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${dailyPercentage}%`,
                        backgroundColor: isDailyOver
                          ? "#E74C3C"
                          : isDailyNear
                            ? "#F39C12"
                            : "#2ECC71",
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Monthly Budget Progress */}
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Budget Bulanan</Text>
                  <Text style={styles.progressValues}>
                    {formatRupiah(monthlySpent)} / {formatRupiah(monthlyLimit)}{" "}
                    ({monthlyPercentage}%)
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${monthlyPercentage}%`,
                        backgroundColor: isMonthlyOver
                          ? "#E74C3C"
                          : isMonthlyNear
                            ? "#F39C12"
                            : "#3498DB",
                      },
                    ]}
                  />
                </View>
              </View>

              {/* 6. Annual Budget Progress (Monitoring Anggaran Tahunan) */}
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <View style={styles.annualHeaderTitleRow}>
                    <Text style={styles.progressLabel}>
                      Budget Tahunan (2026)
                    </Text>
                    {yearlyLimit > 0 && (
                      <View
                        style={[
                          styles.annualBadge,
                          {
                            backgroundColor: isYearlyOver
                              ? "#FEE2E2"
                              : isYearlyNear
                                ? "#FEF3C7"
                                : "#DCFCE7",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.annualBadgeText,
                            {
                              color: isYearlyOver
                                ? "#DC2626"
                                : isYearlyNear
                                  ? "#D97706"
                                  : "#16A34A",
                            },
                          ]}
                        >
                          {isYearlyOver
                            ? "Over Limit"
                            : isYearlyNear
                              ? "Mendekati 80%"
                              : "Terkendali"}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.progressValues}>
                    {formatRupiah(yearlySpent)} / {formatRupiah(yearlyLimit)} (
                    {yearlyPercentage}%)
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${yearlyPercentage}%`,
                        backgroundColor: isYearlyOver
                          ? "#E74C3C"
                          : isYearlyNear
                            ? "#F39C12"
                            : "#0284C7",
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 7. Quick Add Transaction Form (Corrected Layout & Relocated Fields) */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>Catat Transaksi Cepat</Text>
          <Text style={styles.cardSectionSub}>
            Pemasukan atau pengeluaran langsung disinkronkan ke saldo
          </Text>

          {/* Type Switcher Tabs: Pemasukan di kiri, Pengeluaran di kanan */}
          <View style={styles.typeSwitcherRow}>
            {/* Opsi 1: Pemasukan (Kiri) */}
            <Pressable
              style={[
                styles.typeSwitchBtn,
                transType === "income" && styles.typeSwitchBtnActiveIncome,
              ]}
              onPress={() => setTransType("income")}
            >
              <Ionicons
                name="arrow-up-circle"
                size={18}
                color={transType === "income" ? Colors.white : "#1E8449"}
              />
              <Text
                style={[
                  styles.typeSwitchText,
                  transType === "income" && styles.typeSwitchTextActive,
                ]}
              >
                Pemasukan
              </Text>
            </Pressable>

            {/* Opsi 2: Pengeluaran (Kanan) */}
            <Pressable
              style={[
                styles.typeSwitchBtn,
                transType === "expense" && styles.typeSwitchBtnActiveExpense,
              ]}
              onPress={() => setTransType("expense")}
            >
              <Ionicons
                name="arrow-down-circle"
                size={18}
                color={transType === "expense" ? Colors.white : "#C0392B"}
              />
              <Text
                style={[
                  styles.typeSwitchText,
                  transType === "expense" && styles.typeSwitchTextActive,
                ]}
              >
                Pengeluaran
              </Text>
            </Pressable>
          </View>

          {/* Form Fields: Nominal (Rp) di atas, Deskripsi tepat di bawahnya */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Nominal (Rp)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Contoh: 50000"
              placeholderTextColor="#98A2B3"
              keyboardType="numeric"
              value={transAmount}
              onChangeText={setTransAmount}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Deskripsi / Keterangan</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Contoh: Beli makan siang, Gaji bulanan..."
              placeholderTextColor="#98A2B3"
              value={transTitle}
              onChangeText={setTransTitle}
            />
          </View>

          <Pressable
            style={styles.submitTransBtn}
            onPress={handleSaveTransaction}
          >
            <Text style={styles.submitTransBtnText}>
              Simpan {transType === "income" ? "Pemasukan" : "Pengeluaran"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="finance" onSelectTab={handleTabSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerRight: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl + 10,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  alertBannerDanger: {
    backgroundColor: "#FDEDEC",
    borderWidth: 1,
    borderColor: "#F5B7B1",
  },
  alertBannerWarning: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  alertTextWrapper: {
    flex: 1,
  },
  alertBannerTitle: {
    color: "#C0392B",
    fontSize: 13.5,
    fontWeight: "700",
    lineHeight: 18,
  },
  alertBannerDesc: {
    color: "#7F8C8D",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  quickLinksRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickLinkCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  incomeLinkCard: {
    backgroundColor: Colors.incomeBg,
    borderColor: Colors.incomeBorder,
  },
  expenseLinkCard: {
    backgroundColor: Colors.expenseBg,
    borderColor: Colors.expenseBorder,
  },
  quickLinkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  quickLinkLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  quickLinkAmount: {
    fontSize: 14.5,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 4,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    marginBottom: Spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  cardSectionTitle: {
    color: Colors.textPrimary,
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  cardSectionSub: {
    color: "#667085",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  editBudgetButton: {
    backgroundColor: "#F2F4F7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  editBudgetText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  progressContainer: {
    gap: Spacing.md,
  },
  progressItem: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  annualHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  annualBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  annualBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  progressLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  progressValues: {
    fontSize: 11.5,
    fontWeight: "500",
    color: "#667085",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#EAECF0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  typeSwitcherRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  typeSwitchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    gap: 6,
  },
  typeSwitchBtnActiveExpense: {
    backgroundColor: "#C0392B",
    borderColor: "#C0392B",
  },
  typeSwitchBtnActiveIncome: {
    backgroundColor: "#1E8449",
    borderColor: "#1E8449",
  },
  typeSwitchText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  typeSwitchTextActive: {
    color: Colors.white,
  },
  formGroup: {
    marginBottom: Spacing.sm + 2,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
  submitTransBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  submitTransBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 13.5,
    letterSpacing: 0.2,
  },
  editBudgetForm: {
    gap: Spacing.sm,
  },
  saveBudgetBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  saveBudgetBtnText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
});

export default FinanceScreen;
