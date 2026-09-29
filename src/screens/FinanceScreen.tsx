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
import { BottomNavBar } from "../components/BottomNavBar";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { TabType } from "../types";

export const FinanceScreen: React.FC = () => {
  const router = useRouter();
  const { financeData, updateFinanceData, addTransaction, setActiveTab } =
    useApp();

  // New Transaction Form State
  const [transType, setTransType] = useState<"expense" | "income">("expense");
  const [transTitle, setTransTitle] = useState("");
  const [transAmount, setTransAmount] = useState("");

  // Budget Edit State
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempDailyBudget, setTempDailyBudget] = useState(
    financeData.dailyBudget.toString(),
  );
  const [tempMonthlyBudget, setTempMonthlyBudget] = useState(
    financeData.monthlyBudget.toString(),
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

  // Calculations for Budget Alert System
  const dailySpent = financeData.dailyExpense;
  const dailyLimit = financeData.dailyBudget;
  const dailyPercentage = Math.min(
    Math.round((dailySpent / (dailyLimit || 1)) * 100),
    100,
  );
  const isDailyOver = dailySpent >= dailyLimit;
  const isDailyNear = dailySpent >= dailyLimit * 0.8 && !isDailyOver;

  const monthlySpent = financeData.monthlyExpense;
  const monthlyLimit = financeData.monthlyBudget;
  const monthlyPercentage = Math.min(
    Math.round((monthlySpent / (monthlyLimit || 1)) * 100),
    100,
  );
  const isMonthlyOver = monthlySpent >= monthlyLimit;
  const isMonthlyNear = monthlySpent >= monthlyLimit * 0.8 && !isMonthlyOver;

  // Save New Transaction
  const handleSaveTransaction = () => {
    const amountNum = parseInt(transAmount.replace(/[^0-9]/g, ""), 10);
    if (!transTitle.trim()) {
      Alert.alert("Perhatian", "Silakan masukkan keterangan transaksi.");
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(
        "Perhatian",
        "Silakan masukkan nominal transaksi yang valid.",
      );
      return;
    }

    addTransaction({
      title: transTitle.trim(),
      note: transType === "expense" ? "Pengeluaran" : "Pemasukan",
      amount: amountNum,
      type: transType,
    });

    const formatted = formatRupiah(amountNum);
    const typeLabel = transType === "expense" ? "Pengeluaran" : "Pemasukan";

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
    if (!isNaN(dNum) && !isNaN(mNum)) {
      updateFinanceData({
        dailyBudget: dNum,
        monthlyBudget: mNum,
      });
      setIsEditingBudget(false);
      showFeedback("Target anggaran berhasil diperbarui!");
    }
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

      {/* Header */}
      <View style={styles.header}>
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
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Keuangan & Pembudgetan</Text>
        <View style={styles.headerRight}>
          <Text style={styles.brandText}>VORFÍNE</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Alert Banner */}
        {isDailyOver || isMonthlyOver ? (
          <View style={[styles.alertBanner, styles.alertBannerDanger]}>
            <Ionicons name="alert-circle" size={24} color="#C0392B" />
            <View style={styles.alertTextWrapper}>
              <Text style={styles.alertBannerTitle}>
                Peringatan Batas Anggaran!
              </Text>
              <Text style={styles.alertBannerDesc}>
                {isDailyOver
                  ? "Pengeluaran harian telah melampaui limit anggaran harian Anda."
                  : "Pengeluaran bulanan telah melampaui limit anggaran bulanan."}
              </Text>
            </View>
          </View>
        ) : isDailyNear || isMonthlyNear ? (
          <View style={[styles.alertBanner, styles.alertBannerWarning]}>
            <Ionicons name="warning-outline" size={24} color="#D97706" />
            <View style={styles.alertTextWrapper}>
              <Text style={[styles.alertBannerTitle, { color: "#D97706" }]}>
                Mendekati Batas Budget (80%)
              </Text>
              <Text style={styles.alertBannerDesc}>
                Perhatikan pengeluaran harian Anda agar tidak melebihi anggaran
                yang ditetapkan.
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

        {/* Budget Progress & Monitor Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardSectionTitle}>Monitoring Anggaran</Text>
              <Text style={styles.cardSectionSub}>
                Bulan {financeData.monthName} 2026
              </Text>
            </View>
            <Pressable
              style={styles.editBudgetButton}
              onPress={() => setIsEditingBudget(!isEditingBudget)}
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
              />
              <Text style={styles.inputLabel}>Batas Budget Bulanan (IDR):</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={tempMonthlyBudget}
                onChangeText={setTempMonthlyBudget}
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
            </View>
          )}
        </View>

        {/* Quick Add Transaction Form */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>Catat Transaksi Cepat</Text>
          <Text style={styles.cardSectionSub}>
            Pemasukan atau pengeluaran langsung disinkronkan ke saldo
          </Text>

          {/* Type Switcher Tabs */}
          <View style={styles.typeSwitcherRow}>
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
                Pemasukkan
              </Text>
            </Pressable>
          </View>

          {/* Form Fields */}
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

          <Pressable
            style={styles.submitTransBtn}
            onPress={handleSaveTransaction}
          >
            <Text style={styles.submitTransBtnText}>
              Simpan {transType === "expense" ? "Pengeluaran" : "Pemasukan"}
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
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16.5,
    fontWeight: "700",
  },
  headerRight: {
    paddingRight: 4,
  },
  brandText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
  },
  alertBannerDesc: {
    color: "#7F8C8D",
    fontSize: 12,
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
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    marginBottom: Spacing.md,
    elevation: 2,
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
  },
  cardSectionSub: {
    color: "#667085",
    fontSize: 12,
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
