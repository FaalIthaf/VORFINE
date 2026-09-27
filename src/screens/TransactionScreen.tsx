import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  ToastAndroid,
  View,
} from "react-native";
import { BottomNavBar } from "../components/BottomNavBar";
import { BudgetAlertCard } from "../components/BudgetAlertCard";
import { Header } from "../components/Header";
import { ProfileModal } from "../components/ProfileModal";
import { TransactionFormCard } from "../components/TransactionFormCard";
import { Colors, MaxContentWidth, Spacing } from "../constants/theme";
import { Profile, TabType } from "../types";

export const TransactionScreen: React.FC = () => {
  const router = useRouter();

  // Profiles State (konsisten dengan Dashboard)
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: "1", name: "Muhammad Ivan Fadholli", isCurrent: true },
    { id: "2", name: "Akun Bisnis / Toko", isCurrent: false },
    { id: "3", name: "Tabungan Pribadi", isCurrent: false },
  ]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("1");
  const [isProfileModalVisible, setIsProfileModalVisible] =
    useState<boolean>(false);

  // State Card 1: Budget Alert / Atur Peringatan
  const [budget, setBudget] = useState<string>("");
  const [reminderTime, setReminderTime] = useState<string>("10 Menit");
  const [period, setPeriod] = useState<string>("Bulan");

  // State Card 2: Form Transaksi Baru
  const [transactionType, setTransactionType] = useState<
    "pemasukan" | "pengeluaran"
  >("pemasukan");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<string>("26 Sep 2026");
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");

  const currentProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const showFeedback = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("VORFÍNE", msg);
    }
  };

  // Handler Dropdown Waktu Pengingat
  const handleReminderTimePress = () => {
    Alert.alert(
      "Pilih Waktu Pengingat",
      "Tentukan waktu notifikasi peringatan sebelum batas tercapai:",
      [
        { text: "5 Menit", onPress: () => setReminderTime("5 Menit") },
        { text: "10 Menit", onPress: () => setReminderTime("10 Menit") },
        { text: "15 Menit", onPress: () => setReminderTime("15 Menit") },
        { text: "30 Menit", onPress: () => setReminderTime("30 Menit") },
        { text: "1 Jam", onPress: () => setReminderTime("1 Jam") },
        { text: "Batal", style: "cancel" },
      ],
    );
  };

  // Handler Dropdown Periode Waktu
  const handlePeriodPress = () => {
    Alert.alert(
      "Pilih Periode Waktu",
      "Pilih jangka waktu evaluasi anggaran:",
      [
        { text: "Hari", onPress: () => setPeriod("Hari") },
        { text: "Minggu", onPress: () => setPeriod("Minggu") },
        { text: "Bulan", onPress: () => setPeriod("Bulan") },
        { text: "Tahun", onPress: () => setPeriod("Tahun") },
        { text: "Batal", style: "cancel" },
      ],
    );
  };

  // Handler Simpan Peringatan
  const handleSaveAlert = () => {
    if (!budget.trim()) {
      Alert.alert(
        "Peringatan Belum Lengkap",
        "Silakan masukkan nominal budget yang ingin dipantau.",
      );
      return;
    }
    showFeedback(
      `Peringatan budget IDR ${budget} (${period}, pengingat ${reminderTime}) berhasil disimpan!`,
    );
  };

  // Handler Tanggal Transaksi
  const handleDatePress = () => {
    Alert.alert(
      "Pilih Tanggal Transaksi",
      "Pilih opsi tanggal pencatatan:",
      [
        { text: "26 Sep 2026", onPress: () => setDate("26 Sep 2026") },
        { text: "27 Sep 2026", onPress: () => setDate("27 Sep 2026") },
        { text: "Hari Ini", onPress: () => setDate("27 Sep 2026") },
        { text: "Batal", style: "cancel" },
      ],
    );
  };

  // Handler Simpan Transaksi
  const handleSaveTransaction = () => {
    if (!amount.trim()) {
      Alert.alert(
        "Form Belum Lengkap",
        "Mohon masukkan nominal jumlah transaksi.",
      );
      return;
    }
    if (!category.trim()) {
      Alert.alert(
        "Form Belum Lengkap",
        "Mohon masukkan kategori transaksi (contoh: Makanan, Gaji, dll).",
      );
      return;
    }

    const typeTitle =
      transactionType === "pemasukan" ? "Pemasukan" : "Pengeluaran";

    Alert.alert(
      "Transaksi Berhasil Disimpan",
      `${typeTitle} sebesar IDR ${amount} untuk kategori "${category}" pada ${date} berhasil dicatat.`,
      [
        {
          text: "Lihat Mutasi",
          onPress: () => {
            if (transactionType === "pemasukan") {
              router.push("/income" as any);
            } else {
              router.push("/expense" as any);
            }
          },
        },
        {
          text: "OK",
          onPress: () => {
            setAmount("");
            setCategory("");
            setNote("");
            setIsAddingNote(false);
          },
        },
      ],
    );
  };

  // Handler Bottom Navigation Bar
  const handleSelectTab = (tab: TabType) => {
    if (tab === "home") {
      router.replace("/");
    } else if (tab === "finance") {
      // Sudah berada di layar transaksi
    } else if (tab === "schedule") {
      showFeedback("Pintasan: Menu agenda jadwal harian");
    } else if (tab === "menu") {
      showFeedback("Pintasan: Menu pengaturan akun");
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header Utama VORFÍNE */}
      <Header
        currentProfileName={currentProfile.name}
        onPressProfile={() => setIsProfileModalVisible(true)}
        onPressNotification={() => router.push("/notifications" as any)}
        hasUnreadNotification={true}
      />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveWrapper}>
          {/* Bagian Atas: Tambah Transaksi Baru (Atur Peringatan / Budget Alert) */}
          <BudgetAlertCard
            budget={budget}
            onBudgetChange={setBudget}
            reminderTime={reminderTime}
            onPressReminderTime={handleReminderTimePress}
            period={period}
            onPressPeriod={handlePeriodPress}
            onSaveAlert={handleSaveAlert}
          />

          {/* Bagian Bawah: Tambah Transaksi Baru (Pencatatan Transaksi Finansial) */}
          <TransactionFormCard
            transactionType={transactionType}
            onSelectTransactionType={setTransactionType}
            amount={amount}
            onAmountChange={setAmount}
            category={category}
            onCategoryChange={setCategory}
            date={date}
            onPressDate={handleDatePress}
            isAddingNote={isAddingNote}
            onToggleAddingNote={() => setIsAddingNote((prev) => !prev)}
            note={note}
            onNoteChange={setNote}
            onSaveTransaction={handleSaveTransaction}
          />
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <ProfileModal
        visible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onSelectProfile={(id) => {
          setSelectedProfileId(id);
          const sel = profiles.find((p) => p.id === id);
          if (sel) showFeedback(`Profil dialihkan ke: ${sel.name}`);
        }}
        onAddProfile={(name) => {
          const newP: Profile = {
            id: Date.now().toString(),
            name,
            isCurrent: false,
          };
          setProfiles((prev) => [...prev, newP]);
          setSelectedProfileId(newP.id);
        }}
      />

      {/* Bottom Navigation Bar (Tab Keuangan Aktif) */}
      <BottomNavBar activeTab="finance" onSelectTab={handleSelectTab} />
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
  responsiveWrapper: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
});

export default TransactionScreen;
