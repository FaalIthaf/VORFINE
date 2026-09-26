import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Alert,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
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
import { TransactionItem } from "../types";

export const ExpenseDetailScreen: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<{
    label: string;
    period: string;
  }>({
    label: "Bulan Ini",
    period: "Sep 2026",
  });

  // Mock data pengeluaran sesuai spesifikasi & mock-up UI
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: "exp-1",
      title: "Uang Keluar",
      note: "beli makan",
      date: "1 Sep 2026",
      amount: "Rp 50.000,00",
      balance: "Saldo: 3.850.000,00",
      type: "expense",
    },
    {
      id: "exp-2",
      title: "Uang Keluar",
      note: "beli barang shoppe",
      date: "1 Sep 2026",
      amount: "Rp 250.000,00",
      balance: "Saldo: 3.400.000,00",
      type: "expense",
    },
    {
      id: "exp-3",
      title: "Uang Keluar",
      note: "beli makan",
      date: "1 Sep 2026",
      amount: "Rp 50.000,00",
      balance: "Saldo: 3.650.000,00",
      type: "expense",
    },
    {
      id: "exp-4",
      title: "Uang Keluar",
      note: "beli makan",
      date: "1 Sep 2026",
      amount: "Rp 50.000,00",
      balance: "Saldo: 3.650.000,00",
      type: "expense",
    },
  ]);

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

  const handleFilterPeriodPress = () => {
    Alert.alert("Pilih Periode Transaksi", "Pilih filter periode:", [
      {
        text: "Bulan Ini (Sep 2026)",
        onPress: () =>
          setSelectedPeriod({ label: "Bulan Ini", period: "Sep 2026" }),
      },
      {
        text: "Bulan Lalu (Agu 2026)",
        onPress: () =>
          setSelectedPeriod({ label: "Bulan Lalu", period: "Agu 2026" }),
      },
      {
        text: "Tahun Ini (2026)",
        onPress: () =>
          setSelectedPeriod({ label: "Tahun Ini", period: "2026" }),
      },
      { text: "Batal", style: "cancel" },
    ]);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showFeedback("Data pengeluaran berhasil dimuat ulang");
    }, 600);
  }, []);

  // Filter list berdasarkan pencarian
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.note && item.note.toLowerCase().includes(query)) ||
        item.date.toLowerCase().includes(query) ||
        item.amount.toLowerCase().includes(query) ||
        item.balance.toLowerCase().includes(query),
    );
  }, [transactions, searchQuery]);

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
          {/* Filter Periode */}
          <PeriodFilter
            currentLabel={selectedPeriod.label}
            currentPeriodText={selectedPeriod.period}
            onPress={handleFilterPeriodPress}
          />

          {/* Card Utama Top (Summary Card) */}
          <DetailSummaryCard
            title="Total Pengeluaran"
            amount="IDR  350.000,00"
            statPercentage="+2% dari bulan lalu"
            transactionCount={2}
          />

          {/* Riwayat Transaksi Section */}
          <View style={styles.historySection}>
            {/* Header Badge */}
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>Riwayat Transaksi</Text>
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
                        `Detail transaksi: ${item.title} (${item.amount})`,
                      )
                    }
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Tidak ditemukan transaksi dengan kata kunci "{searchQuery}"
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
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
  sectionBadge: {
    backgroundColor: "#35575C",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
  },
  sectionBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
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
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
});

export default ExpenseDetailScreen;
