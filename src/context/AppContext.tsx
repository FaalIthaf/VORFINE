import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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

import { loadData, saveData, STORAGE_KEYS } from "../utils/storage";
import * as Notifications from "expo-notifications";
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
  currentProfile: Profile;

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

// 2. Expo Notifications Setup: request permissions and set handler
useEffect(() => {
  (async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.warn("Expo notifications permission not granted");
    }
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  })();
}, []);

// 3. Load persisted state from AsyncStorage on app start
useEffect(() => {
  (async () => {
    const loadedProfiles = await loadData(STORAGE_KEYS.PROFILES, [] as Profile[]);
    if (loadedProfiles.length) setProfiles(loadedProfiles);
    const loadedSelected = await loadData(STORAGE_KEYS.SELECTED_PROFILE, "1");
    setSelectedProfileId(loadedSelected);
    const loadedFinance = await loadData(STORAGE_KEYS.FINANCE, {} as Record<string, FinanceData>);
    if (Object.keys(loadedFinance).length) setFinanceByProfile(loadedFinance);
    const loadedTx = await loadData(STORAGE_KEYS.TRANSACTIONS, {} as Record<string, TransactionItem[]>);
    if (Object.keys(loadedTx).length) setTransactionsByProfile(loadedTx);
    const loadedSched = await loadData(STORAGE_KEYS.SCHEDULES, {} as Record<string, ScheduleItem[]>);
    if (Object.keys(loadedSched).length) setSchedulesByProfile(loadedSched);
    const loadedNotifs = await loadData(STORAGE_KEYS.NOTIFICATIONS, {} as Record<string, NotificationItem[]>);
    if (Object.keys(loadedNotifs).length) setNotificationsByProfile(loadedNotifs);
  })();
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

  // Date State for Calendar Navigation (default to September 2026 as per base design)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 = September
  const [selectedDay, setSelectedDayState] = useState<number>(18);

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Profiles State
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: "1", name: "Muhammad Ivan Fadholli", isCurrent: true },
    { id: "2", name: "Akun Bisnis / Toko", isCurrent: false },
    { id: "3", name: "Tabungan Pribadi", isCurrent: false },
  ]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("1");

  // 9. Isolated State Partitioned by Profile ID
  const [financeByProfile, setFinanceByProfile] = useState<
    Record<string, FinanceData>
  >({
    "1": createDefaultFinanceData("September"),
    "2": createDefaultFinanceData("September"),
    "3": createDefaultFinanceData("September"),
  });

  const [transactionsByProfile, setTransactionsByProfile] = useState<
    Record<string, TransactionItem[]>
  >({
    "1": [],
    "2": [],
    "3": [],
  });

  const [schedulesByProfile, setSchedulesByProfile] = useState<
    Record<string, ScheduleItem[]>
  >({
    "1": [],
    "2": [],
    "3": [],
  });

  const [notificationsByProfile, setNotificationsByProfile] = useState<
    Record<string, NotificationItem[]>
  >({
    "1": [],
    "2": [],
    "3": [],
  });

  // Track triggered alerts to prevent duplicate notifications
  const triggeredBudgetAlerts = useRef<Set<string>>(new Set());
  const triggeredScheduleAlerts = useRef<Set<string>>(new Set());

  // Current active profile data
  const currentProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const activeFinanceData =
    financeByProfile[selectedProfileId] || createDefaultFinanceData("September");

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
        financeByProfile[selectedProfileId] || createDefaultFinanceData("September");

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
        id: Date.now().toString(),
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

      setTransactionsByProfile((prev) => ({
        ...prev,
        [selectedProfileId]: [newItem, ...(prev[selectedProfileId] || [])],
      }));

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
    [financeByProfile, selectedProfileId, checkBudgetThresholds],
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactionsByProfile((prev) => ({
        ...prev,
        [selectedProfileId]: (prev[selectedProfileId] || []).filter(
          (item) => item.id !== id,
        ),
      }));
    },
    [selectedProfileId],
  );

  // Schedule Actions
  const addSchedule = useCallback(
    (item: Omit<ScheduleItem, "id" | "completed">) => {
      const newItem: ScheduleItem = {
        ...item,
        id: Date.now().toString(),
        completed: false,
        dateKey: item.dateKey || selectedDateKey,
        profileId: selectedProfileId,
        reminderTriggered: false,
      };

      setSchedulesByProfile((prev) => {
        const list = [...(prev[selectedProfileId] || []), newItem];
        return {
          ...prev,
          [selectedProfileId]: list.sort(sortSchedulesChronologically),
        };
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
    [selectedDateKey, selectedProfileId, addNotification],
  );

  const updateSchedule = useCallback(
    (id: string, updatedFields: Partial<ScheduleItem>) => {
      setSchedulesByProfile((prev) => {
        const list = (prev[selectedProfileId] || []).map((item) =>
          item.id === id ? { ...item, ...updatedFields } : item,
        );
        return {
          ...prev,
          [selectedProfileId]: list.sort(sortSchedulesChronologically),
        };
      });
    },
    [selectedProfileId],
  );

  const deleteSchedule = useCallback(
    (id: string) => {
      setSchedulesByProfile((prev) => ({
        ...prev,
        [selectedProfileId]: (prev[selectedProfileId] || []).filter(
          (item) => item.id !== id,
        ),
      }));
    },
    [selectedProfileId],
  );

  const toggleCompleteSchedule = useCallback(
    (id: string) => {
      setSchedulesByProfile((prev) => ({
        ...prev,
        [selectedProfileId]: (prev[selectedProfileId] || []).map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item,
        ),
      }));
    },
    [selectedProfileId],
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
    setSelectedProfileId(id);
    setProfiles((prev) => prev.map((p) => ({ ...p, isCurrent: p.id === id })));
    // State is cleanly switched through selectedProfileId indexing financeByProfile, transactionsByProfile, etc.
  };

  const addProfile = (name: string) => {
    const newId = Date.now().toString();
    const newProfile: Profile = {
      id: newId,
      name,
      isCurrent: true,
    };

    // Initialize clean isolated state for the new profile
    setFinanceByProfile((prev) => ({
      ...prev,
      [newId]: createDefaultFinanceData("September"),
    }));
    setTransactionsByProfile((prev) => ({
      ...prev,
      [newId]: [],
    }));
    setSchedulesByProfile((prev) => ({
      ...prev,
      [newId]: [],
    }));
    setNotificationsByProfile((prev) => ({
      ...prev,
      [newId]: [],
    }));

    setProfiles((prev) => [
      ...prev.map((p) => ({ ...p, isCurrent: false })),
      newProfile,
    ]);
    setSelectedProfileId(newId);
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

        return {
          ...prev,
          [selectedProfileId]: updated,
        };
      });
    },
    [selectedProfileId, checkBudgetThresholds],
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
        currentProfile,
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
