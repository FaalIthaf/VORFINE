import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { DetailHeader } from "../components/DetailHeader";
import { DetailSummaryCard } from "../components/DetailSummaryCard";
import { PeriodFilter } from "../components/PeriodFilter";
import { TransactionItemCard } from "../components/TransactionItemCard";
import {
  BorderRadius,
  Colors,
  MaxContentWidth,
  Spacing,
} from "../constants/theme";
import { useApp } from "../context/AppContext";
import { PeriodFilterMode } from "../types";
import {
  filterTransactionsByPeriod,
  parseAmountToNumber,
} from "../utils/dateUtils";

export const ExpenseDetailScreen: React.FC = () => {
  const router = useRouter();
  const { transactions, addTransaction, financeData } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Period Filter State (Hari, Bulan, Tahun, Semua)
  const [filterMode, setFilterMode] = useState<PeriodFilterMode>("month");
  const [selectedPeriod, setSelectedPeriod] = useState<{
    label: string;
    period: string;
    options?: { year?: number; month?: number; day?: number };
  }>({
    label: "Bulan Ini",
    period: "Sep 2026",
    options: { year: 2026, month: 8 },
  });

  // Modal Tambah Pengeluaran
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newAmount, setNewAmount] = useState<string>("");
  const [newNote, setNewNote] = useState<string>("");

  const showFeedback = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("VORFÍNE", msg);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showFeedback("Data pengeluaran berhasil dimuat ulang");
    }, 500);
  }, []);

  // Filter khusus transaksi pengeluaran
  const expenseTransactions = useMemo(() => {
    return transactions.filter((item) => item.type === "expense");
  }, [transactions]);

  // Filter berdasarkan periode (Hari, Bulan, Tahun, Semua)
  const periodFiltered = useMemo(() => {
    return filterTransactionsByPeriod(
      expenseTransactions,
      filterMode,
      selectedPeriod.options,
    );
  }, [expenseTransactions, filterMode, selectedPeriod.options]);

  // Filter berdasarkan kata kunci pencarian
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return periodFiltered;
    const query = searchQuery.toLowerCase();
    return periodFiltered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.note && item.note.toLowerCase().includes(query)) ||
        item.date.toLowerCase().includes(query) ||
        item.amount.toLowerCase().includes(query) ||
        item.balance.toLowerCase().includes(query),
    );
  }, [periodFiltered, searchQuery]);

  // Hitung total nominal pengeluaran dari hasil filter
  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      if (curr.numericAmount) return acc + curr.numericAmount;
      return acc + parseAmountToNumber(curr.amount);
    }, 0);
  }, [filteredTransactions]);

  const formatRupiah = (val: number): string => {
    return "IDR  " + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ",00";
  };

  const handleSelectMode = (mode: PeriodFilterMode) => {
    setFilterMode(mode);
  };

  const handleSelectPeriod = (
    mode: PeriodFilterMode,
    label: string,
    periodText: string,
    options?: { year?: number; month?: number; day?: number },
  ) => {
    setFilterMode(mode);
    setSelectedPeriod({ label, period: periodText, options });
  };

  // Simpan Pengeluaran Baru
  const handleSaveNewExpense = () => {
    const amountNum = parseInt(newAmount.replace(/[^0-9]/g, ""), 10);
    if (!newTitle.trim()) {
      Alert.alert("Perhatian", "Silakan masukkan keterangan pengeluaran.");
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Perhatian", "Silakan masukkan nominal pengeluaran yang valid.");
      return;
    }

    addTransaction({
      title: newTitle.trim(),
      amount: amountNum,
      type: "expense",
      note: newNote.trim() || undefined,
    });

    setNewTitle("");
    setNewAmount("");
    setNewNote("");
    setIsAddModalVisible(false);

    showFeedback("Pengeluaran baru berhasil disimpan dengan stempel waktu real-time!");
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header Bar */}
      <DetailHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBackPress={handleBack}
      />

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
        <View style={styles.responsiveWrapper}>
          {/* Filter Periode (Hari, Bulan, Tahun, Semua) */}
          <PeriodFilter
            currentMode={filterMode}
            currentLabel={selectedPeriod.label}
            currentPeriodText={selectedPeriod.period}
            onSelectMode={handleSelectMode}
            onSelectPeriod={handleSelectPeriod}
          />

          {/* Card Utama Top (Summary Card) */}
          <DetailSummaryCard
            title="Total Pengeluaran"
            amount={formatRupiah(totalAmount)}
            statPercentage="+2% dari bulan lalu"
            transactionCount={filteredTransactions.length}
          />

          {/* Riwayat Transaksi Section */}
          <View style={styles.historySection}>
            <View style={styles.sectionHeaderRow}>
              {/* Header Badge */}
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>Riwayat Transaksi</Text>
              </View>

              {/* Tombol Tambah Pengeluaran Cepat */}
              <Pressable
                style={styles.addBtnSmall}
                onPress={() => setIsAddModalVisible(true)}
              >
                <Ionicons name="add-circle" size={18} color={Colors.white} />
                <Text style={styles.addBtnSmallText}>Catat Pengeluaran</Text>
              </Pressable>
            </View>

            {/* List Transaksi */}
            <View style={styles.itemsList}>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <TransactionItemCard
                    key={item.id}
                    title={item.title}
                    note={item.note}
                    date={item.date}
                    amount={item.amount}
                    balance={item.balance}
                    type="expense"
                    onPress={() =>
                      showFeedback(
                        `Detail: ${item.title} (${item.amount}) pada ${item.date}`,
                      )
                    }
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="card-outline"
                    size={40}
                    color="#A2B4B7"
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={styles.emptyTitle}>Tidak ada transaksi</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery.trim()
                      ? `Tidak ditemukan transaksi dengan kata kunci "${searchQuery}"`
                      : `Tidak ada pengeluaran pada periode ${selectedPeriod.label} (${selectedPeriod.period}).`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal Tambah Pengeluaran */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsAddModalVisible(false)}
        >
          <Pressable
            style={styles.modalFormCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalFormHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="arrow-down-circle" size={24} color="#C0392B" />
                <Text style={styles.modalFormTitle}>Tambah Pengeluaran</Text>
              </View>
              <Pressable
                onPress={() => setIsAddModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color="#7F8C8D" />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Deskripsi / Keperluan</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Contoh: Makan siang, Bensin, Belanja..."
                placeholderTextColor="#98A2B3"
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nominal (Rp)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Contoh: 50000"
                placeholderTextColor="#98A2B3"
                keyboardType="numeric"
                value={newAmount}
                onChangeText={setNewAmount}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Catatan (Opsional)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Catatan tambahan..."
                placeholderTextColor="#98A2B3"
                value={newNote}
                onChangeText={setNewNote}
              />
            </View>

            <Pressable
              style={styles.submitModalBtn}
              onPress={handleSaveNewExpense}
            >
              <Text style={styles.submitModalBtnText}>Simpan Pengeluaran</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingBottom: Spacing.xxl + 16,
  },
  responsiveWrapper: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  historySection: {
    marginTop: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionBadge: {
    backgroundColor: "#35575C",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  sectionBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  addBtnSmall: {
    backgroundColor: "#C0392B",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  addBtnSmallText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  itemsList: {
    width: "100%",
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D5DBDB",
    marginVertical: Spacing.md,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    textAlign: "center",
    maxWidth: 280,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalFormCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalFormHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  modalFormTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  inputField: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  submitModalBtn: {
    backgroundColor: "#C0392B",
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  submitModalBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 13.5,
  },
});

export default ExpenseDetailScreen;
