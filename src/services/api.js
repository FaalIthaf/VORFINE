// src/services/api.js
// ─────────────────────────────────────────────────────────────
// VORFINE — REST API Service
// Mengambil data dari server dan memetakan ke format data model aplikasi
// ─────────────────────────────────────────────────────────────

const BASE_URL = "https://dummyjson.com"; // API dummy gratis untuk testing

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════

/**
 * Login user ke API
 * POST /auth/login
 */
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: email, // dummyjson pakai username
      password: password,
    }),
  });

  if (!response.ok) {
    throw new Error("Login gagal. Periksa email dan kata sandi.");
  }

  const data = await response.json();

  // Mapping: sesuaikan response API → format User di aplikasi
  return {
    token: data.token,
    user: {
      id: String(data.id),
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone ?? "",
      role: data.role ?? "user",
      avatar: data.image ?? null,
      biometricsEnabled: false,
      smartNotifications: true,
      sensor3DActive: false,
      encryptionStandard: "AES-256",
      securitySessionActive: true,
    },
  };
};

/**
 * Register user baru ke API
 * POST /users/add
 */
export const registerUser = async (fullName, email, phone, password) => {
  const response = await fetch(`${BASE_URL}/users/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ").slice(1).join(" ") || "",
      email: email,
      phone: phone,
      password: password,
    }),
  });

  if (!response.ok) {
    throw new Error("Registrasi gagal. Coba lagi nanti.");
  }

  const data = await response.json();

  // Mapping: sesuaikan response API → format User di aplikasi
  return {
    id: String(data.id),
    fullName: fullName,
    email: email,
    phone: phone,
    role: "user",
    avatar: null,
    biometricsEnabled: false,
    smartNotifications: true,
    sensor3DActive: false,
    encryptionStandard: "AES-256",
    securitySessionActive: true,
  };
};

// ════════════════════════════════════════════════════════════
// TRANSACTIONS (Pemasukan & Pengeluaran)
// ════════════════════════════════════════════════════════════

/**
 * Ambil daftar transaksi dari API
 * GET /products (digunakan sebagai dummy data transaksi)
 */
const DEFAULT_VORFINE_TITLES = [
  { title: "Gaji Pokok Bulanan", note: "Gaji transfer kantor", amount: 5000000, type: "income" },
  { title: "Belanja Kebutuhan Pokok", note: "Sembako dan kebutuhan dapur", amount: 350000, type: "expense" },
  { title: "Tagihan Listrik & WiFi", note: "Token PLN & internet bulanan", amount: 400000, type: "expense" },
  { title: "Honor Freelance Desain", note: "Termin 1 project mobile app", amount: 1500000, type: "income" },
  { title: "Makan Siang & Kafe", note: "Makan siang bersama tim", amount: 65000, type: "expense" },
  { title: "Bensin Motor & Parkir", note: "BBM Pertamax mingguan", amount: 50000, type: "expense" },
];

export const fetchTransactions = async () => {
  try {
    const response = await fetch(`${BASE_URL}/todos?limit=6`);
    if (!response.ok) throw new Error("Gagal mengambil data transaksi.");
    const data = await response.json();
    const list = data?.todos || [];
    return list.map((item, index) => {
      const template = DEFAULT_VORFINE_TITLES[index % DEFAULT_VORFINE_TITLES.length];
      return {
        id: String(item.id || index + 1),
        title: template.title,
        note: template.note,
        amount: formatRupiah(template.amount),
        balance: formatRupiah(template.type === "income" ? template.amount : 4500000),
        type: template.type,
        date: formatDate(new Date(Date.now() - index * 86400000)),
        rawDate: new Date(Date.now() - index * 86400000).toISOString(),
        timestamp: Date.now() - index * 86400000,
        numericAmount: template.amount,
        profileId: "1",
      };
    });
  } catch {
    return DEFAULT_VORFINE_TITLES.map((template, index) => ({
      id: `fallback-${index + 1}`,
      title: template.title,
      note: template.note,
      amount: formatRupiah(template.amount),
      balance: formatRupiah(template.type === "income" ? template.amount : 4500000),
      type: template.type,
      date: formatDate(new Date(Date.now() - index * 86400000)),
      rawDate: new Date(Date.now() - index * 86400000).toISOString(),
      timestamp: Date.now() - index * 86400000,
      numericAmount: template.amount,
      profileId: "1",
    }));
  }
};

// ════════════════════════════════════════════════════════════
// SCHEDULES (Jadwal)
// ════════════════════════════════════════════════════════════

/**
 * Ambil daftar jadwal dari API
 * GET /todos (digunakan sebagai dummy data jadwal)
 */
export const fetchSchedules = async () => {
  const response = await fetch(`${BASE_URL}/todos?limit=10`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data jadwal.");
  }

  const data = await response.json();

  // Kategori jadwal yang tersedia di VORFINE
  const categories = ["Rutinitas", "Domestik", "Pekerjaan", "Lainnya"];

  // Jam untuk variasi waktu jadwal
  const times = ["07:00", "09:00", "10:30", "13:00", "15:00", "18:00", "20:00"];

  // Mapping: sesuaikan field API → format ScheduleItem di aplikasi
  const schedules = data.todos.map((item, index) => ({
    id: String(item.id),
    title: item.todo,
    category: categories[index % categories.length],
    time: times[index % times.length],
    startTime: times[index % times.length],
    endTime: times[(index + 1) % times.length],
    completed: item.completed,
    alarmEnabled: !item.completed,
    dateKey: getTodayKey(), // tampilkan di hari ini
    profileId: "1",
  }));

  return schedules;
};

// ════════════════════════════════════════════════════════════
// FINANCE SUMMARY (Ringkasan Keuangan)
// ════════════════════════════════════════════════════════════

/**
 * Ambil ringkasan keuangan dari API
 * GET /carts/1 (digunakan sebagai dummy data ringkasan keuangan)
 */
export const fetchFinanceSummary = async () => {
  const response = await fetch(`${BASE_URL}/carts/1`);

  if (!response.ok) {
    throw new Error("Gagal mengambil ringkasan keuangan.");
  }

  const data = await response.json();

  const monthlyIncome = Math.round(data.total * 5000 * 1.5);
  const monthlyExpense = Math.round(data.total * 5000);
  const totalBalance = monthlyIncome - monthlyExpense;

  // Mapping: sesuaikan response API → format FinanceData di aplikasi
  return {
    totalBalance: totalBalance,
    monthlyIncome: monthlyIncome,
    monthlyExpense: monthlyExpense,
    monthlyBudget: Math.round(monthlyIncome * 0.8),
    dailyExpense: Math.round(monthlyExpense / 30),
    dailyBudget: Math.round(monthlyIncome / 30),
    yearlyExpense: monthlyExpense * 12,
    yearlyBudget: monthlyIncome * 10,
    monthName: getMonthName(new Date().getMonth()),
  };
};

// ════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (Fungsi Pembantu)
// ════════════════════════════════════════════════════════════

/**
 * Format angka ke format Rupiah
 * Contoh: 5000000 → "Rp 5.000.000,00"
 */
const formatRupiah = (amount) => {
  return (
    "Rp " +
    Math.round(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
    ",00"
  );
};

/**
 * Format Date menjadi string "DD MMM YYYY"
 * Contoh: "07 Okt 2026"
 */
const formatDate = (date) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const d = String(date.getDate()).padStart(2, "0");
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
};

/**
 * Mendapatkan dateKey hari ini dalam format YYYY-MM-DD
 * Contoh: "2026-10-07"
 */
const getTodayKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Mendapatkan nama bulan dalam Bahasa Indonesia
 */
const getMonthName = (monthIndex) => {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return months[monthIndex];
};

