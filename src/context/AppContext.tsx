import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  FinanceData,
  Profile,
  ScheduleItem,
  TabType,
  TransactionItem,
  TransactionType,
} from "../types";

export interface AppContextType {
  // Schedules
  schedules: ScheduleItem[];
  addSchedule: (item: Omit<ScheduleItem, "id" | "completed">) => void;
  deleteSchedule: (id: string) => void;
  toggleCompleteSchedule: (id: string) => void;

  // Transactions
  transactions: TransactionItem[];
  addTransaction: (item: {
    title: string;
    note?: string;
    amount: number;
    type: TransactionType;
    date?: string;
    rawDate?: string;
  }) => void;
  deleteTransaction: (id: string) => void;

  // Calendar Date State
  currentYear: number;
  currentMonth: number; // 0-indexed (8 = September)
  selectedDay: number;
  selectedDateKey: string; // "YYYY-MM-DD"
  formattedSelectedDate: string; // "Jum'at, 18 September 2026"
  setSelectedDay: (day: number) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  monthName: string;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredSchedules: ScheduleItem[];

  // Profiles
  profiles: Profile[];
  selectedProfileId: string;
  selectProfile: (id: string) => void;
  addProfile: (name: string) => void;
  currentProfile: Profile;

  // Finance
  financeData: FinanceData;
  updateFinanceData: (data: Partial<FinanceData>) => void;

  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const INDONESIAN_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jum'at",
  "Sabtu",
];

const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const INDONESIAN_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export const formatRupiah = (val: number): string => {
  return "Rp " + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ",00";
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>("home");

  // Date State - Default September 18, 2026
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 = September
  const [selectedDay, setSelectedDayState] = useState<number>(18);

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Profiles
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: "1", name: "Muhammad Ivan Fadholli", isCurrent: true },
    { id: "2", name: "Akun Bisnis / Toko", isCurrent: false },
    { id: "3", name: "Tabungan Pribadi", isCurrent: false },
  ]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("1");

  // Finance
  const [financeData, setFinanceData] = useState<FinanceData>({
    totalBalance: 300000,
    dailyExpense: 100000,
    monthlyIncome: 3700000,
    monthlyExpense: 350000,
    monthName: "September",
    dailyBudget: 150000,
    monthlyBudget: 2500000,
  });

  // Transactions State
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: "inc-2",
      title: "Uang Masuk",
      note: "Gaji bulanan",
      date: "1 Sep 2026, 09:00 WIB",
      amount: "Rp 3.400.000,00",
      balance: "Saldo: 3.700.000,00",
      type: "income",
      rawDate: "2026-09-01T09:00:00.000Z",
      timestamp: new Date("2026-09-01T09:00:00.000Z").getTime(),
      numericAmount: 3400000,
    },
    {
      id: "exp-3",
      title: "Uang Keluar",
      note: "beli makan siang",
      date: "1 Sep 2026, 12:30 WIB",
      amount: "Rp 50.000,00",
      balance: "Saldo: 3.650.000,00",
      type: "expense",
      rawDate: "2026-09-01T12:30:00.000Z",
      timestamp: new Date("2026-09-01T12:30:00.000Z").getTime(),
      numericAmount: 50000,
    },
    {
      id: "exp-2",
      title: "Uang Keluar",
      note: "beli barang shopee",
      date: "1 Sep 2026, 15:45 WIB",
      amount: "Rp 250.000,00",
      balance: "Saldo: 3.400.000,00",
      type: "expense",
      rawDate: "2026-09-01T15:45:00.000Z",
      timestamp: new Date("2026-09-01T15:45:00.000Z").getTime(),
      numericAmount: 250000,
    },
    {
      id: "exp-1",
      title: "Uang Keluar",
      note: "beli makan malam",
      date: "1 Sep 2026, 19:20 WIB",
      amount: "Rp 50.000,00",
      balance: "Saldo: 3.350.000,00",
      type: "expense",
      rawDate: "2026-09-01T19:20:00.000Z",
      timestamp: new Date("2026-09-01T19:20:00.000Z").getTime(),
      numericAmount: 50000,
    },
    {
      id: "inc-1",
      title: "Saldo Awal",
      note: "Saldo pembukaan",
      date: "1 Sep 2026, 08:00 WIB",
      amount: "Rp 300.000,00",
      balance: "Saldo: 300.000,00",
      type: "income",
      rawDate: "2026-09-01T08:00:00.000Z",
      timestamp: new Date("2026-09-01T08:00:00.000Z").getTime(),
      numericAmount: 300000,
    },
  ]);

  // Transaction Actions with Real-time Timestamp
  const addTransaction = (item: {
    title: string;
    note?: string;
    amount: number;
    type: TransactionType;
    date?: string;
    rawDate?: string;
  }) => {
    const now = new Date();
    const rawDate = item.rawDate || now.toISOString();
    const timestamp = now.getTime();
    const day = now.getDate();
    const monthShort = INDONESIAN_MONTHS_SHORT[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    // Real-time Indonesian formatted date string e.g. "29 Sep 2026, 23:15 WIB"
    const formattedDate =
      item.date || `${day} ${monthShort} ${year}, ${hours}:${minutes} WIB`;

    let newTotal = financeData.totalBalance;
    if (item.type === "income") {
      newTotal += item.amount;
      setFinanceData((prev) => ({
        ...prev,
        totalBalance: prev.totalBalance + item.amount,
        monthlyIncome: prev.monthlyIncome + item.amount,
      }));
    } else {
      newTotal = Math.max(0, newTotal - item.amount);
      setFinanceData((prev) => ({
        ...prev,
        totalBalance: Math.max(0, prev.totalBalance - item.amount),
        dailyExpense: prev.dailyExpense + item.amount,
        monthlyExpense: prev.monthlyExpense + item.amount,
      }));
    }

    const newItem: TransactionItem = {
      id: Date.now().toString(),
      title: item.title,
      note: item.note,
      date: formattedDate,
      amount: formatRupiah(item.amount),
      balance: `Saldo: ${newTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")},00`,
      type: item.type,
      rawDate,
      timestamp,
      numericAmount: item.amount,
    };

    setTransactions((prev) => [newItem, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  // Schedules initial data matching both day 18 and day 26
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: "1",
      dateKey: "2026-09-18",
      time: "05.00 - 06.00 WIB",
      title: "Sarapan Pagi",
      category: "Rutinitas",
      completed: true,
      alarmEnabled: true,
      reminderTime: "10 Menit Sebelum",
    },
    {
      id: "2",
      dateKey: "2026-09-18",
      time: "07.00 - 07.30 WIB",
      title: "Berangkat ke kantor",
      category: "Domestik",
      completed: true,
      alarmEnabled: false,
      reminderTime: "15 Menit Sebelum",
    },
    {
      id: "3",
      dateKey: "2026-09-18",
      time: "08.00 - 16.00",
      title: "Kerja",
      category: "Pekerjaan",
      completed: true,
      alarmEnabled: true,
      reminderTime: "30 Menit Sebelum",
    },
    {
      id: "4",
      dateKey: "2026-09-18",
      time: "08.00 - 16.00",
      title: "Kerja",
      category: "Keuangan",
      completed: true,
      alarmEnabled: false,
      reminderTime: "10 Menit Sebelum",
    },
    {
      id: "5",
      dateKey: "2026-09-26",
      time: "09.00 - 11.00 WIB",
      title: "Review Budget & Tabungan",
      category: "Keuangan",
      completed: false,
      alarmEnabled: true,
      reminderTime: "15 Menit Sebelum",
    },
  ]);

  // Compute selected date key
  const formatPad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const selectedDateKey = `${currentYear}-${formatPad(currentMonth + 1)}-${formatPad(selectedDay)}`;

  // Formatted date string (e.g. "Jum'at, 18 September 2026")
  const dateObj = new Date(currentYear, currentMonth, selectedDay);
  const dayName = INDONESIAN_DAYS[dateObj.getDay()];
  const monthName = INDONESIAN_MONTHS[currentMonth];
  const formattedSelectedDate = `${dayName}, ${selectedDay} ${monthName} ${currentYear}`;

  const setSelectedDay = (day: number) => {
    setSelectedDayState(day);
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Schedule Actions
  const addSchedule = (item: Omit<ScheduleItem, "id" | "completed">) => {
    const newItem: ScheduleItem = {
      ...item,
      id: Date.now().toString(),
      completed: false,
      dateKey: item.dateKey || selectedDateKey,
    };
    setSchedules((prev) => [newItem, ...prev]);
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleCompleteSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  // Filtered schedules by selected date & search query
  const filteredSchedules = schedules.filter((item) => {
    const matchesDate = item.dateKey === selectedDateKey;
    const matchesQuery =
      searchQuery.trim().length === 0 ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.time.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDate && matchesQuery;
  });

  // Profile Actions
  const selectProfile = (id: string) => {
    setSelectedProfileId(id);
    setProfiles((prev) => prev.map((p) => ({ ...p, isCurrent: p.id === id })));
  };

  const addProfile = (name: string) => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      name,
      isCurrent: true,
    };
    setProfiles((prev) => [
      ...prev.map((p) => ({ ...p, isCurrent: false })),
      newProfile,
    ]);
    setSelectedProfileId(newProfile.id);
  };

  const currentProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const updateFinanceData = (data: Partial<FinanceData>) => {
    setFinanceData((prev) => ({ ...prev, ...data }));
  };

  return (
    <AppContext.Provider
      value={{
        schedules,
        addSchedule,
        deleteSchedule,
        toggleCompleteSchedule,
        currentYear,
        currentMonth,
        selectedDay,
        selectedDateKey,
        formattedSelectedDate,
        setSelectedDay,
        prevMonth,
        nextMonth,
        monthName,
        searchQuery,
        setSearchQuery,
        filteredSchedules,
        profiles,
        selectedProfileId,
        selectProfile,
        addProfile,
        currentProfile,
        financeData,
        updateFinanceData,
        transactions,
        addTransaction,
        deleteTransaction,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
