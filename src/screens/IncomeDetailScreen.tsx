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

export const IncomeDetailScreen: React.FC = () => {
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

  // Mock data sesuai spesifikasi & mock-up UI
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: "inc-1",
      title: "Saldo Awal",
      date: "1 Sep 2026",
      amount: "Rp 300.000,00",
      balance: "Saldo: 300.000,00",
      type: "income",
    },
    {
      id: "inc-2",
      title: "Uang Masuk",
      note: "Gaji",
      date: "1 Sept 2026",
      amount: "Rp 3.400.000,00",
      balance: "Saldo: 3.700.000,00",
      type: "income",
    },
    {
      id: "inc-3",
      title: "Uang Masuk",
      note: "Gaji",
      date: "1 Sept 2026",
      amount: "Rp 3.400.000,00",
      balance: "Saldo: 3.700.000,00",
      type: "income",
    },
    {
      id: "inc-4",
      title: "Uang Masuk",
      note: "Gaji",
      date: "1 Sept 2026",
      amount: "Rp 3.400.000,00",
      balance: "Saldo: 3.700.000,00",
      type: "income",
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
      showFeedback("Data pemasukan berhasil dimuat ulang");
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
            title="Total Pemasukan"
            amount="IDR  3.700.000,00"
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
                    type="income"
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

export default IncomeDetailScreen;
