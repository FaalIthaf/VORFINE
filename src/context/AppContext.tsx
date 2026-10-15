import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import {
  FinanceData,
  NotificationItem,
  Profile,
  ScheduleItem,
  TabType,
  TransactionItem,
  TransactionType,
} from "../types";
import {
  getScheduleStartMinutes,
  sortSchedulesByTime,
  sortSchedulesChronologically,
} from "../utils/scheduleUtils";

import { getAccountStorageKey, loadData, saveData, STORAGE_KEYS } from "../utils/storage";
import { useAuth } from "@/features/auth";
export interface AppContextType {
  // Real-time Time & Synchronization
  currentTime: Date;
  currentTimeStr: string;
  currentLiveDateStr: string;
  currentLiveTimeWithSeconds: string;

  // Schedules
  schedules: ScheduleItem[];
  addSchedule: (item: Omit<ScheduleItem, "id" | "completed">) => void;
  updateSchedule: (id: string, updatedFields: Partial<ScheduleItem>) => void;
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
  deleteProfile: (id: string) => void;
  currentProfile: Profile;
  resetStore: () => void;

  // Finance
  financeData: FinanceData;
  updateFinanceData: (data: Partial<FinanceData>) => void;

  // Notifications
  notifications: NotificationItem[];
  addNotification: (
    item: Omit<NotificationItem, "id" | "time" | "isRead"> & { time?: string },
  ) => void;
  toggleReadNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  hasUnreadNotification: boolean;

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

const createDefaultFinanceData = (monthName = "September"): FinanceData => ({
  totalBalance: 0,
  dailyExpense: 0,
  monthlyIncome: 0,
  monthlyExpense: 0,
  yearlyExpense: 0,
  monthName,
  dailyBudget: 0,
  monthlyBudget: 0,
  yearlyBudget: 0,
});

const parseReminderMinutes = (reminderStr?: string): number => {
  if (!reminderStr) return 10;
  const match = reminderStr.match(/(\d+)/);
  if (match) {
    const val = parseInt(match[1], 10);
    if (reminderStr.toLowerCase().includes("jam")) {
      return val * 60;
    }
    return val;
  }
  return 10;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>("home");

// 1. Real-time Clock State (synchronizes every second across all screens)
const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);
  return () => clearInterval(timer);
}, []);


  const formatPad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // Derived real-time Indonesian date/time strings
  const currentHours = formatPad(currentTime.getHours());
  const currentMinutes = formatPad(currentTime.getMinutes());
  const currentSeconds = formatPad(currentTime.getSeconds());
  const currentTimeStr = `${currentHours}:${currentMinutes} WIB`;
  const currentLiveTimeWithSeconds = `${currentHours}:${currentMinutes}:${currentSeconds} WIB`;
  const currentLiveDayName = INDONESIAN_DAYS[currentTime.getDay()];
  const currentLiveMonthName = INDONESIAN_MONTHS[currentTime.getMonth()];
  const currentLiveDateStr = `${currentLiveDayName}, ${currentTime.getDate()} ${currentLiveMonthName} ${currentTime.getFullYear()}`;

  // Date State for Calendar Navigation (default to actual today's date)
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDay, setSelectedDayState] = useState<number>(() => new Date().getDate());

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Profiles State (Starts EMPTY for clean isolation per user account - Task 2 & 3)
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");

<<<<<<< HEAD
  // Isolated State Partitioned by Profile ID
  const [financeByProfile, setFinanceByProfile] = useState<
    Record<string, FinanceData>
  >({});
=======
  // Dynamically sync profile 1 when active user profile changes
  useEffect(() => {
    if (user?.fullName) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === "1" ? { ...p, name: user.fullName } : p))
      );
    }
  }, [user?.fullName]);

  // 9. Isolated State Partitioned by Profile ID
  const _currentMonthName = INDONESIAN_MONTHS[new Date().getMonth()];
  const [financeByProfile, setFinanceByProfile] = useState<
    Record<string, FinanceData>
  >({
    "1": createDefaultFinanceData(_currentMonthName),
    "2": createDefaultFinanceData(_currentMonthName),
    "3": createDefaultFinanceData(_currentMonthName),
  });
>>>>>>> 7b50aba8645cd5b31a65108df4b04e28d726b5a1

  const [transactionsByProfile, setTransactionsByProfile] = useState<
    Record<string, TransactionItem[]>
  >({});

  const [schedulesByProfile, setSchedulesByProfile] = useState<
    Record<string, ScheduleItem[]>
  >({});

  const [notificationsByProfile, setNotificationsByProfile] = useState<
    Record<string, NotificationItem[]>
  >({});

  // Reset store to clear all memory on logout, account switch, or new registration
  const resetStore = useCallback(() => {
    setProfiles([]);
    setSelectedProfileId("");
    setFinanceByProfile({});
    setTransactionsByProfile({});
    setSchedulesByProfile({});
    setNotificationsByProfile({});
    setSearchQuery("");
  }, []);

  // Account-scoped storage key helper (ensures zero data leakage between accounts)
  const getAccountKey = useCallback(
    (baseKey: string) => {
      const accountIdentifier = user?.id || user?.email || null;
      return getAccountStorageKey(baseKey, accountIdentifier);
    },
    [user?.id, user?.email]
  );

  // Synchronize state and load data strictly scoped to active user
  useEffect(() => {
    let isCancelled = false;

    const syncAccountState = async () => {
      if (!user?.id && !user?.email) {
        // No user logged in -> clear state completely
        resetStore();
        return;
      }

      try {
        const accountId = user.id || user.email;
        const profilesKey = getAccountStorageKey(STORAGE_KEYS.PROFILES, accountId);
        const selectedKey = getAccountStorageKey(STORAGE_KEYS.SELECTED_PROFILE, accountId);
        const financeKey = getAccountStorageKey(STORAGE_KEYS.FINANCE, accountId);
        const txKey = getAccountStorageKey(STORAGE_KEYS.TRANSACTIONS, accountId);
        const schedKey = getAccountStorageKey(STORAGE_KEYS.SCHEDULES, accountId);
        const notifsKey = getAccountStorageKey(STORAGE_KEYS.NOTIFICATIONS, accountId);

        const loadedProfiles = await loadData<Profile[]>(profilesKey, []);
        if (isCancelled) return;

        const loadedSelected = await loadData<string>(selectedKey, "");
        const loadedFinance = await loadData<Record<string, FinanceData>>(financeKey, {});
        const loadedTx = await loadData<Record<string, TransactionItem[]>>(txKey, {});
        const loadedSched = await loadData<Record<string, ScheduleItem[]>>(schedKey, {});
        const loadedNotifs = await loadData<Record<string, NotificationItem[]>>(notifsKey, {});

        setProfiles(loadedProfiles);
        setSelectedProfileId(
          loadedSelected || (loadedProfiles.length > 0 ? loadedProfiles[0].id : "")
        );
        setFinanceByProfile(loadedFinance);
        setTransactionsByProfile(loadedTx);
        setSchedulesByProfile(loadedSched);
        setNotificationsByProfile(loadedNotifs);
      } catch (err) {
        console.error("Gagal memuat data akun di AppContext:", err);
        if (!isCancelled) {
          resetStore();
        }
      }
    };

    syncAccountState();

    return () => {
      isCancelled = true;
    };
  }, [user?.id, user?.email, resetStore]);

  // Track triggered alerts to prevent duplicate notifications
  const triggeredBudgetAlerts = useRef<Set<string>>(new Set());
  const triggeredScheduleAlerts = useRef<Set<string>>(new Set());

  // Current active profile data (safe fallback when profiles is empty)
  const currentProfile: Profile = useMemo(() => {
    const found = profiles.find((p) => p.id === selectedProfileId);
    if (found) return found;
    if (profiles.length > 0) return profiles[0];
    return {
      id: "",
      name: user?.fullName || "Belum ada profil",
      isCurrent: false,
    };
  }, [profiles, selectedProfileId, user?.fullName]);

  const activeFinanceData =
    financeByProfile[selectedProfileId] || createDefaultFinanceData(INDONESIAN_MONTHS[new Date().getMonth()]);

  const activeTransactions = transactionsByProfile[selectedProfileId] || [];

  const activeSchedules = schedulesByProfile[selectedProfileId] || [];

  const activeNotifications = notificationsByProfile[selectedProfileId] || [];

  // Compute selected date key
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

  // Notification Actions
  const addNotification = useCallback(
    (
      item: Omit<NotificationItem, "id" | "time" | "isRead"> & {
        time?: string;
      },
    ) => {
      const now = new Date();
      const timeStr =
        item.time ||
        `${formatPad(now.getHours())}:${formatPad(now.getMinutes())} WIB`;

      const newItem: NotificationItem = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        message: item.message,
        time: timeStr,
        isRead: false,
        category: item.category || "Pemberitahuan",
        profileId: selectedProfileId,
        timestamp: Date.now(),
      };

      setNotificationsByProfile((prev) => ({
        ...prev,
        [selectedProfileId]: [newItem, ...(prev[selectedProfileId] || [])],
      }));
    },
    [selectedProfileId],
  );

  const toggleReadNotification = useCallback(
    (id: string) => {
      setNotificationsByProfile((prev) => {
        const list = prev[selectedProfileId] || [];
        return {
          ...prev,
          [selectedProfileId]: list.map((item) =>
            item.id === id ? { ...item, isRead: !item.isRead } : item,
          ),
        };
      });
    },
    [selectedProfileId],
  );

  const deleteNotification = useCallback(
    (id: string) => {
      setNotificationsByProfile((prev) => {
        const list = prev[selectedProfileId] || [];
        return {
          ...prev,
          [selectedProfileId]: list.filter((item) => item.id !== id),
        };
      });
    },
    [selectedProfileId],
  );

  const clearNotifications = useCallback(() => {
    setNotificationsByProfile((prev) => ({
      ...prev,
      [selectedProfileId]: [],
    }));
  }, [selectedProfileId]);

  const hasUnreadNotification = activeNotifications.some(
    (item) => !item.isRead,
  );

  // 4. Budget Threshold 80% Automated Calculation & Alert Trigger
  const checkBudgetThresholds = useCallback(
    (
      newMonthlySpent: number,
      newYearlySpent: number,
      monthlyLimit: number,
      yearlyLimit: number,
      profileId: string,
    ) => {
      // Monthly Budget Check (80% threshold)
      if (monthlyLimit > 0) {
        const monthlyPercent = Math.round((newMonthlySpent / monthlyLimit) * 100);
        const monthlyAlertKey = `${profileId}-monthly-80-${new Date().getFullYear()}-${new Date().getMonth()}`;

        if (monthlyPercent >= 80 && !triggeredBudgetAlerts.current.has(monthlyAlertKey)) {
          triggeredBudgetAlerts.current.add(monthlyAlertKey);

          const message = `Peringatan Anggaran: Total pengeluaran bulanan Anda telah mencapai ${monthlyPercent}% (${formatRupiah(newMonthlySpent)} dari limit ${formatRupiah(monthlyLimit)}). Harap perhatikan batas pengeluaran Anda.`;

          addNotification({
            message,
            category: "Peringatan Anggaran",
          });

          if (Platform.OS === "android") {
            ToastAndroid.show(
              "⚠️ Peringatan: Pengeluaran bulanan telah mencapai 80%!",
              ToastAndroid.LONG,
            );
          } else {
            Alert.alert("Peringatan Anggaran (80%)", message);
          }
        }
      }

      // Annual Budget Check (80% threshold)
      if (yearlyLimit > 0) {
        const yearlyPercent = Math.round((newYearlySpent / yearlyLimit) * 100);
        const yearlyAlertKey = `${profileId}-yearly-80-${new Date().getFullYear()}`;

        if (yearlyPercent >= 80 && !triggeredBudgetAlerts.current.has(yearlyAlertKey)) {
          triggeredBudgetAlerts.current.add(yearlyAlertKey);

          const message = `Peringatan Anggaran: Akumulasi pengeluaran tahun berjalan Anda telah mencapai ${yearlyPercent}% (${formatRupiah(newYearlySpent)} dari total anggaran tahunan ${formatRupiah(yearlyLimit)}).`;

          addNotification({
            message,
            category: "Peringatan Anggaran Tahunan",
          });

          if (Platform.OS === "android") {
            ToastAndroid.show(
              "⚠️ Peringatan: Pengeluaran tahunan telah mencapai 80%!",
              ToastAndroid.LONG,
            );
          } else {
            Alert.alert("Peringatan Anggaran Tahunan (80%)", message);
          }
        }
      }
    },
    [addNotification],
  );

  // Transaction Actions with Real-time Timestamp and Budget Checking
  const addTransaction = useCallback(
    (item: {
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
      const hours = formatPad(now.getHours());
      const minutes = formatPad(now.getMinutes());

      // Real-time Indonesian formatted date string e.g. "30 Sep 2026, 11:45 WIB"
      const formattedDate =
        item.date || `${day} ${monthShort} ${year}, ${hours}:${minutes} WIB`;

      const currentFin =
        financeByProfile[selectedProfileId] || createDefaultFinanceData(INDONESIAN_MONTHS[new Date().getMonth()]);

      let updatedFin = { ...currentFin };

      if (item.type === "income") {
        updatedFin.totalBalance += item.amount;
        updatedFin.monthlyIncome += item.amount;
      } else {
        updatedFin.totalBalance = Math.max(0, updatedFin.totalBalance - item.amount);
        updatedFin.dailyExpense += item.amount;
        updatedFin.monthlyExpense += item.amount;
        updatedFin.yearlyExpense = (updatedFin.yearlyExpense || 0) + item.amount;
      }

      setFinanceByProfile((prev) => ({
        ...prev,
        [selectedProfileId]: updatedFin,
      }));

      const newItem: TransactionItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: item.title,
        note: item.note,
        date: formattedDate,
        amount: formatRupiah(item.amount),
        balance: `Saldo: ${updatedFin.totalBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")},00`,
        type: item.type,
        rawDate,
        timestamp,
        numericAmount: item.amount,
        profileId: selectedProfileId,
      };

      setTransactionsByProfile((prev) => {
        const updated = {
          ...prev,
          [selectedProfileId]: [newItem, ...(prev[selectedProfileId] || [])],
        };
        saveData(getAccountKey(STORAGE_KEYS.TRANSACTIONS), updated);
        return updated;
      });

      // Check budget alert if it was an expense
      if (item.type === "expense") {
        checkBudgetThresholds(
          updatedFin.monthlyExpense,
          updatedFin.yearlyExpense,
          updatedFin.monthlyBudget,
          updatedFin.yearlyBudget,
          selectedProfileId,
        );
      }
    },
    [financeByProfile, selectedProfileId, checkBudgetThresholds, getAccountKey],
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactionsByProfile((prev) => {
        const updated = {
          ...prev,
          [selectedProfileId]: (prev[selectedProfileId] || []).filter(
            (item) => item.id !== id,
          ),
        };
        saveData(getAccountKey(STORAGE_KEYS.TRANSACTIONS), updated);
        return updated;
      });
    },
    [selectedProfileId, getAccountKey],
  );

  // Schedule Actions
  const addSchedule = useCallback(
    (item: Omit<ScheduleItem, "id" | "completed">) => {
      const newItem: ScheduleItem = {
        ...item,
        id: item.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        completed: false,
        dateKey: item.dateKey || selectedDateKey,
        profileId: selectedProfileId,
        reminderTriggered: false,
      };

      setSchedulesByProfile((prev) => {
        const list = [...(prev[selectedProfileId] || []), newItem];
        const updated = {
          ...prev,
          [selectedProfileId]: list.sort(sortSchedulesChronologically),
        };
        saveData(getAccountKey(STORAGE_KEYS.SCHEDULES), updated);
        return updated;
      });

      // 3. Exact One-Shot Timer if Schedule starts today in the future
      if (newItem.alarmEnabled) {
        const reminderMins = parseReminderMinutes(newItem.reminderTime);
        const startMins = getScheduleStartMinutes(newItem);
        if (startMins !== 9999) {
          const now = new Date();
          const currentDayMins = now.getHours() * 60 + now.getMinutes();
          const targetTriggerMins = startMins - reminderMins;

          // If trigger time is within current day and in the future
          if (
            newItem.dateKey ===
              `${now.getFullYear()}-${formatPad(now.getMonth() + 1)}-${formatPad(now.getDate())}` &&
            targetTriggerMins >= currentDayMins
          ) {
            const delayMs = (targetTriggerMins - currentDayMins) * 60 * 1000;
            if (delayMs > 0 && delayMs < 24 * 60 * 60 * 1000) {
              setTimeout(() => {
                const alertMsg = `Pengingat Jadwal: "${newItem.title}" akan dimulai dalam ${reminderMins} menit (${newItem.startTime || newItem.time}).`;
                addNotification({
                  message: alertMsg,
                  category: "Pengingat Jadwal",
                });
                if (Platform.OS === "android") {
                  ToastAndroid.show(`⏰ ${alertMsg}`, ToastAndroid.LONG);
                } else {
                  Alert.alert("Pengingat Jadwal", alertMsg);
                }
              }, delayMs);
            }
          }
        }
      }
    },
    [selectedDateKey, selectedProfileId, addNotification, getAccountKey],
  );

  const updateSchedule = useCallback(
    (id: string, updatedFields: Partial<ScheduleItem>) => {
      setSchedulesByProfile((prev) => {
        const list = (prev[selectedProfileId] || []).map((item) =>
          item.id === id ? { ...item, ...updatedFields } : item,
        );
        const updated = {
          ...prev,
          [selectedProfileId]: list.sort(sortSchedulesChronologically),
        };
        saveData(getAccountKey(STORAGE_KEYS.SCHEDULES), updated);
        return updated;
      });
    },
    [selectedProfileId, getAccountKey],
  );

  const deleteSchedule = useCallback(
    (id: string) => {
      setSchedulesByProfile((prev) => {
        const updated = {
          ...prev,
          [selectedProfileId]: (prev[selectedProfileId] || []).filter(
            (item) => item.id !== id,
          ),
        };
        saveData(getAccountKey(STORAGE_KEYS.SCHEDULES), updated);
        return updated;
      });
    },
    [selectedProfileId, getAccountKey],
  );

  const toggleCompleteSchedule = useCallback(
    (id: string) => {
      setSchedulesByProfile((prev) => {
        const updated = {
          ...prev,
          [selectedProfileId]: (prev[selectedProfileId] || []).map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item,
          ),
        };
        saveData(getAccountKey(STORAGE_KEYS.SCHEDULES), updated);
        return updated;
      });
    },
    [selectedProfileId, getAccountKey],
  );

  // 3. Background Scheduler / Listener for Schedule Reminders (Ticker checking every 5 seconds)
  useEffect(() => {
    const checkScheduleReminders = () => {
      const now = new Date();
      const currentYearNum = now.getFullYear();
      const currentMonthNum = now.getMonth() + 1;
      const currentDayNum = now.getDate();
      const todayKey = `${currentYearNum}-${formatPad(currentMonthNum)}-${formatPad(currentDayNum)}`;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const userSchedules = schedulesByProfile[selectedProfileId] || [];

      userSchedules.forEach((item) => {
        if (!item.alarmEnabled || item.reminderTriggered) return;

        // Check if date matches today or if dateKey is today
        const isToday = !item.dateKey || item.dateKey === todayKey;
        if (!isToday) return;

        const reminderMins = parseReminderMinutes(item.reminderTime);
        const startMins = getScheduleStartMinutes(item);
        if (startMins === 9999) return;

        const triggerMins = startMins - reminderMins;

        // If current minute matches trigger window and hasn't started yet
        if (
          nowMinutes >= triggerMins &&
          nowMinutes <= startMins &&
          !triggeredScheduleAlerts.current.has(item.id)
        ) {
          triggeredScheduleAlerts.current.add(item.id);

          // Mark schedule item as triggered
          setSchedulesByProfile((prev) => ({
            ...prev,
            [selectedProfileId]: (prev[selectedProfileId] || []).map((s) =>
              s.id === item.id ? { ...s, reminderTriggered: true } : s,
            ),
          }));

          const alertMsg = `Pengingat Jadwal: "${item.title}" akan dimulai dalam ${reminderMins} menit (${item.startTime || item.time}).`;

          addNotification({
            message: alertMsg,
            category: "Pengingat Jadwal",
          });

          if (Platform.OS === "android") {
            ToastAndroid.show(`⏰ ${alertMsg}`, ToastAndroid.LONG);
          } else {
            Alert.alert("Pengingat Jadwal", alertMsg);
          }
        }
      });
    };

    const intervalId = setInterval(checkScheduleReminders, 5000);
    return () => clearInterval(intervalId);
  }, [schedulesByProfile, selectedProfileId, addNotification]);

  // Filtered schedules for calendar screen and home screen
  const filteredSchedules = activeSchedules
    .filter((item) => {
      const matchesDate = item.dateKey === selectedDateKey;
      const matchesQuery =
        searchQuery.trim().length === 0 ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.time.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDate && matchesQuery;
    })
    .sort(sortSchedulesByTime);

  // 9. Profile Actions with Complete State Isolation and Reset
  const selectProfile = (id: string) => {
    try {
      setSelectedProfileId(id);
      const updated = profiles.map((p) => ({ ...p, isCurrent: p.id === id }));
      setProfiles(updated);
      saveData(getAccountKey(STORAGE_KEYS.SELECTED_PROFILE), id);
      saveData(getAccountKey(STORAGE_KEYS.PROFILES), updated);
    } catch (err) {
      console.error("selectProfile error:", err);
    }
  };

  const addProfile = (name: string) => {
    try {
      const newId = Date.now().toString();
      const newProfile: Profile = {
        id: newId,
        name,
        isCurrent: true,
      };

<<<<<<< HEAD
      // Initialize clean isolated state for the new profile
      const newFinance = {
        ...financeByProfile,
        [newId]: createDefaultFinanceData("September"),
      };
      const newTx = {
        ...transactionsByProfile,
        [newId]: [],
      };
      const newSched = {
        ...schedulesByProfile,
        [newId]: [],
      };
      const newNotif = {
        ...notificationsByProfile,
        [newId]: [],
      };
=======
    // Initialize clean isolated state for the new profile
    const newFinance = {
      ...financeByProfile,
      [newId]: createDefaultFinanceData(INDONESIAN_MONTHS[new Date().getMonth()]),
    };
    const newTx = {
      ...transactionsByProfile,
      [newId]: [],
    };
    const newSched = {
      ...schedulesByProfile,
      [newId]: [],
    };
    const newNotif = {
      ...notificationsByProfile,
      [newId]: [],
    };
>>>>>>> 7b50aba8645cd5b31a65108df4b04e28d726b5a1

      setFinanceByProfile(newFinance);
      setTransactionsByProfile(newTx);
      setSchedulesByProfile(newSched);
      setNotificationsByProfile(newNotif);

      const updatedProfiles = [
        ...profiles.map((p) => ({ ...p, isCurrent: false })),
        newProfile,
      ];

      setProfiles(updatedProfiles);
      setSelectedProfileId(newId);

      saveData(getAccountKey(STORAGE_KEYS.PROFILES), updatedProfiles);
      saveData(getAccountKey(STORAGE_KEYS.SELECTED_PROFILE), newId);
      saveData(getAccountKey(STORAGE_KEYS.FINANCE), newFinance);
      saveData(getAccountKey(STORAGE_KEYS.TRANSACTIONS), newTx);
      saveData(getAccountKey(STORAGE_KEYS.SCHEDULES), newSched);
      saveData(getAccountKey(STORAGE_KEYS.NOTIFICATIONS), newNotif);
    } catch (err) {
      console.error("addProfile error:", err);
    }
  };

  const deleteProfile = (id: string) => {
    try {
      if (!id) {
        console.warn("deleteProfile: ID profil tidak ditemukan");
        return;
      }

      const remaining = profiles.filter((p) => p.id !== id);
      const newActiveId =
        selectedProfileId === id
          ? remaining.length > 0
            ? remaining[0].id
            : ""
          : selectedProfileId;
      const updatedProfiles = remaining.map((p) => ({
        ...p,
        isCurrent: p.id === newActiveId,
      }));

      setProfiles(updatedProfiles);
      setSelectedProfileId(newActiveId);

      saveData(getAccountKey(STORAGE_KEYS.PROFILES), updatedProfiles);
      saveData(getAccountKey(STORAGE_KEYS.SELECTED_PROFILE), newActiveId);

      // Clean up associated data
      setFinanceByProfile((prev) => {
        const copy = { ...prev };
        delete copy[id];
        saveData(getAccountKey(STORAGE_KEYS.FINANCE), copy);
        return copy;
      });
      setTransactionsByProfile((prev) => {
        const copy = { ...prev };
        delete copy[id];
        saveData(getAccountKey(STORAGE_KEYS.TRANSACTIONS), copy);
        return copy;
      });
      setSchedulesByProfile((prev) => {
        const copy = { ...prev };
        delete copy[id];
        saveData(getAccountKey(STORAGE_KEYS.SCHEDULES), copy);
        return copy;
      });
      setNotificationsByProfile((prev) => {
        const copy = { ...prev };
        delete copy[id];
        saveData(getAccountKey(STORAGE_KEYS.NOTIFICATIONS), copy);
        return copy;
      });
    } catch (err) {
      console.error("deleteProfile error:", err);
    }
  };

  const updateFinanceData = useCallback(
    (data: Partial<FinanceData>) => {
      setFinanceByProfile((prev) => {
        const cur = prev[selectedProfileId] || createDefaultFinanceData();
        const updated = { ...cur, ...data };

        // Check if updating budget limits triggered 80% alert
        checkBudgetThresholds(
          updated.monthlyExpense,
          updated.yearlyExpense,
          updated.monthlyBudget,
          updated.yearlyBudget,
          selectedProfileId,
        );

        const newMap = {
          ...prev,
          [selectedProfileId]: updated,
        };
        saveData(getAccountKey(STORAGE_KEYS.FINANCE), newMap);
        return newMap;
      });
    },
    [selectedProfileId, checkBudgetThresholds, getAccountKey],
  );

  return (
    <AppContext.Provider
      value={{
        currentTime,
        currentTimeStr,
        currentLiveDateStr,
        currentLiveTimeWithSeconds,
        schedules: activeSchedules,
        addSchedule,
        updateSchedule,
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
        deleteProfile,
        currentProfile,
        resetStore,
        financeData: activeFinanceData,
        updateFinanceData,
        transactions: activeTransactions,
        addTransaction,
        deleteTransaction,
        notifications: activeNotifications,
        addNotification,
        toggleReadNotification,
        deleteNotification,
        clearNotifications,
        hasUnreadNotification,
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
