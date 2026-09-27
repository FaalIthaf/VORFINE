import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";

interface TransactionFormCardProps {
  transactionType: "pemasukan" | "pengeluaran";
  onSelectTransactionType: (type: "pemasukan" | "pengeluaran") => void;
  amount: string;
  onAmountChange: (text: string) => void;
  category: string;
  onCategoryChange: (text: string) => void;
  date: string;
  onPressDate: () => void;
  isAddingNote: boolean;
  onToggleAddingNote: () => void;
  note: string;
  onNoteChange: (text: string) => void;
  onSaveTransaction: () => void;
}

export const TransactionFormCard: React.FC<TransactionFormCardProps> = ({
  transactionType,
  onSelectTransactionType,
  amount,
  onAmountChange,
  category,
  onCategoryChange,
  date,
  onPressDate,
  isAddingNote,
  onToggleAddingNote,
  note,
  onNoteChange,
  onSaveTransaction,
}) => {
  const isIncome = transactionType === "pemasukan";
  const accentColor = isIncome ? "#43A047" : "#E53935";

  return (
    <View style={styles.cardContainer}>
      {/* Header Card dengan garis horizontal */}
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>Tambah Transaksi Baru</Text>
        <View style={styles.cardTitleLine} />
      </View>

      {/* Tab Switcher: Pemasukan vs Pengeluaran */}
      <View style={styles.tabSwitcherContainer}>
        {/* Tab Pemasukan */}
        <Pressable
          style={[
            styles.tabButton,
            isIncome ? styles.incomeTabActive : styles.tabInactive,
          ]}
          onPress={() => onSelectTransactionType("pemasukan")}
          accessibilityRole="tab"
          accessibilityState={{ selected: isIncome }}
          accessibilityLabel="Pilih Jenis Transaksi Pemasukan"
        >
          <Text
            style={[
              styles.tabText,
              isIncome ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            Pemasukan
          </Text>
        </Pressable>

        {/* Tab Pengeluaran */}
        <Pressable
          style={[
            styles.tabButton,
            !isIncome ? styles.expenseTabActive : styles.tabInactive,
          ]}
          onPress={() => onSelectTransactionType("pengeluaran")}
          accessibilityRole="tab"
          accessibilityState={{ selected: !isIncome }}
          accessibilityLabel="Pilih Jenis Transaksi Pengeluaran"
        >
          <Text
            style={[
              styles.tabText,
              !isIncome ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            Pengeluaran
          </Text>
        </Pressable>
      </View>

      {/* Input: Jumlah */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Jumlah</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="IDR"
            placeholderTextColor="#9EAFAF"
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="numeric"
            accessibilityLabel="Input Jumlah Transaksi"
          />
        </View>
      </View>

      {/* Input: Kategori */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Kategori</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="Makanan, Kendaraan, Gaji, dll"
            placeholderTextColor="#9EAFAF"
            value={category}
            onChangeText={onCategoryChange}
            accessibilityLabel="Input Kategori Transaksi"
          />
        </View>
      </View>

      {/* Input: Tanggal (Kotak Interaktif Ringkas) */}
      <Pressable
        style={({ pressed }) => [
          styles.dateBox,
          pressed && styles.pressedState,
        ]}
        onPress={onPressDate}
        accessibilityRole="button"
        accessibilityLabel={`Pilih Tanggal Transaksi: ${date}`}
      >
        <Text style={styles.dateLabelSmall}>Tanggal</Text>
        <View style={styles.dateContentRow}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={20}
            color="#61787B"
          />
          <Text style={styles.dateText}>{date}</Text>
        </View>
      </Pressable>

      {/* Catatan Pembayaran (Interaktif: Link awal -> Textarea saat diklik) */}
      {!isAddingNote ? (
        <Pressable
          style={({ pressed }) => [
            styles.addNoteLink,
            pressed && styles.pressedState,
          ]}
          onPress={onToggleAddingNote}
          accessibilityRole="button"
          accessibilityLabel="Tambah Catatan Transaksi"
        >
          <Text style={[styles.addNoteText, { color: accentColor }]}>
            + Tambah Catatan Transaksi
          </Text>
        </Pressable>
      ) : (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Catatan Pembayaran</Text>
          <View style={styles.textAreaBox}>
            <TextInput
              style={styles.textAreaInput}
              placeholder="Catatan"
              placeholderTextColor="#9EAFAF"
              value={note}
              onChangeText={onNoteChange}
              multiline
              numberOfLines={3}
              accessibilityLabel="Input Catatan Pembayaran"
            />
          </View>
        </View>
      )}

      {/* Tombol Aksi Utama: SIMPAN TRANSAKSI */}
      <Pressable
        style={({ pressed }) => [
          styles.saveTransactionButton,
          pressed && styles.pressedButton,
        ]}
        onPress={onSaveTransaction}
        accessibilityRole="button"
        accessibilityLabel="Simpan Transaksi"
      >
        <Text style={styles.saveTransactionButtonText}>SIMPAN TRANSAKSI</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: "#4A6B70",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B2C2F",
    marginRight: 8,
  },
  cardTitleLine: {
    flex: 1,
    height: 1.2,
    backgroundColor: "#8CA5A8",
  },
  tabSwitcherContainer: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: "#3B6F75",
    borderRadius: 8,
    overflow: "hidden",
    height: 40,
    marginBottom: Spacing.md,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  incomeTabActive: {
    backgroundColor: "#43A047",
  },
  expenseTabActive: {
    backgroundColor: "#E53935",
  },
  tabInactive: {
    backgroundColor: Colors.white,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabTextInactive: {
    color: "#1B2C2F",
  },
  fieldGroup: {
    marginBottom: Spacing.md - 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1B2C2F",
    marginBottom: 5,
  },
  inputBox: {
    borderWidth: 1.5,
    borderColor: "#3B6F75",
    borderRadius: 8,
    height: 40,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  textInput: {
    fontSize: 13,
    color: "#1B2C2F",
    paddingVertical: 0,
  },
  dateBox: {
    borderWidth: 1.5,
    borderColor: "#3B6F75",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    width: 140,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
  },
  dateLabelSmall: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#1B2C2F",
    textAlign: "center",
    marginBottom: 2,
  },
  dateContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#1B2C2F",
    marginLeft: 6,
  },
  addNoteLink: {
    marginVertical: Spacing.sm,
    alignSelf: "flex-start",
  },
  addNoteText: {
    fontSize: 13,
    fontWeight: "700",
  },
  textAreaBox: {
    borderWidth: 1.5,
    borderColor: "#3B6F75",
    borderRadius: 8,
    minHeight: 65,
    padding: Spacing.sm,
    backgroundColor: Colors.white,
  },
  textAreaInput: {
    fontSize: 12.5,
    color: "#1B2C2F",
    textAlignVertical: "top",
    padding: 0,
  },
  saveTransactionButton: {
    backgroundColor: "#3B6F75",
    borderRadius: 8,
    width: "75%",
    paddingVertical: 12,
    alignSelf: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  saveTransactionButtonText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  pressedState: {
    opacity: 0.75,
  },
  pressedButton: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

export default TransactionFormCard;
