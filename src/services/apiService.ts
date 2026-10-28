/**
 * REST API Service untuk VORFÍNE (Task 2)
 * Bertanggung jawab melakukan permintaan HTTP asinkron (GET) ke server,
 * mengubah respons menjadi format JSON, dan memetakannya ke DTO aplikasi keuangan VORFÍNE.
 */

import { ActivityDTO, ProgramDTO, TransactionDTO } from "../models";

// Base URL endpoint RESTful API
const BASE_URL = "https://dummyjson.com";

// Template data riwayat transaksi murni keuangan pribadi VORFÍNE
const VORFINE_FINANCIAL_TRANSACTIONS = [
  {
    title: "Gaji Pokok Bulanan",
    type: "income" as const,
    category: "Gaji & Upah",
    amount: 5000000,
    description: "Gaji transfer bulanan perusahaan",
    balanceAfter: 5000000,
  },
  {
    title: "Belanja Kebutuhan Pokok",
    type: "expense" as const,
    category: "Belanja Harian",
    amount: 350000,
    description: "Sembako dan belanja bahan makanan dapur",
    balanceAfter: 4650000,
  },
  {
    title: "Tagihan Listrik & WiFi",
    type: "expense" as const,
    category: "Tagihan & Utilitas",
    amount: 400000,
    description: "Pembayaran token PLN dan internet Indihome",
    balanceAfter: 4250000,
  },
  {
    title: "Honor Freelance Desain",
    type: "income" as const,
    category: "Freelance",
    amount: 1500000,
    description: "Pembayaran termin 1 project mobile app",
    balanceAfter: 5750000,
  },
  {
    title: "Makan Siang & Kafe",
    type: "expense" as const,
    category: "Makanan & Minuman",
    amount: 65000,
    description: "Makan siang dan kopi bersama rekan kerja",
    balanceAfter: 5685000,
  },
  {
    title: "Bensin Motor & Parkir",
    type: "expense" as const,
    category: "Transportasi",
    amount: 50000,
    description: "Pengisian BBM Pertamax dan parkir harian",
    balanceAfter: 5635000,
  },
];

// Template data rencana alokasi anggaran keuangan VORFÍNE
const VORFINE_BUDGET_PLANS = [
  {
    name: "Alokasi Kebutuhan Pokok",
    description: "Batas pengeluaran pangan & belanja kebutuhan bulanan",
    category: "budget" as const,
    targetAmount: 2500000,
    currentAmount: 1800000,
    status: "active" as const,
  },
  {
    name: "Tabungan Dana Darurat",
    description: "Simpanan dana cadangan 6 bulan pengeluaran rutin",
    category: "savings" as const,
    targetAmount: 12000000,
    currentAmount: 8500000,
    status: "active" as const,
  },
  {
    name: "Alokasi Tagihan & Utilitas",
    description: "Anggaran listrik, air, internet, dan langganan bulanan",
    category: "budget" as const,
    targetAmount: 850000,
    currentAmount: 650000,
    status: "active" as const,
  },
  {
    name: "Tabungan Investasi & Reksadana",
    description: "Alokasi instrumen investasi jangka panjang",
    category: "savings" as const,
    targetAmount: 5000000,
    currentAmount: 2500000,
    status: "active" as const,
  },
];

/**
 * Helper generik untuk melakukan HTTP GET request menggunakan fetch()
 * Mengembalikan data JSON yang telah diparsing
 */
export async function getFromApi<T>(endpoint: string): Promise<T> {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Permintaan API gagal! Status: ${response.status} (${response.statusText})`
      );
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error(`[apiService] Gagal fetch data dari ${endpoint}:`, error);
    throw error;
  }
}

/**
 * 1. Mengambil data Kategori Anggaran / Program Finansial (ProgramDTO[])
 * Memetakan respons server ke format ProgramDTO keuangan VORFÍNE
 */
export async function fetchPrograms(): Promise<ProgramDTO[]> {
  try {
    const data = await getFromApi<{ todos?: any[] }>("/todos?limit=4");
    const list = data?.todos && Array.isArray(data.todos) ? data.todos : [];

    if (list.length === 0) {
      throw new Error("Data list kosong dari server");
    }

    return list.map((item: any, index: number): ProgramDTO => {
      const template = VORFINE_BUDGET_PLANS[index % VORFINE_BUDGET_PLANS.length];
      const progress = Math.min(
        100,
        Math.round((template.currentAmount / template.targetAmount) * 100)
      );

      return {
        id: String(item.id || index + 1),
        name: template.name,
        description: template.description,
        category: template.category,
        status: template.status,
        targetAmount: template.targetAmount,
        currentAmount: template.currentAmount,
        startDate: new Date().toISOString().split("T")[0],
        progress,
      };
    });
  } catch (error) {
    console.error("[apiService] Error saat memuat fetchPrograms, menggunakan fallback keuangan:", error);
    return VORFINE_BUDGET_PLANS.map((template, index) => ({
      id: `budget-${index + 1}`,
      name: template.name,
      description: template.description,
      category: template.category,
      status: template.status,
      targetAmount: template.targetAmount,
      currentAmount: template.currentAmount,
      startDate: new Date().toISOString().split("T")[0],
      progress: Math.min(
        100,
        Math.round((template.currentAmount / template.targetAmount) * 100)
      ),
    }));
  }
}

/**
 * 2. Mengambil data Transaksi Keuangan (TransactionDTO[])
 * Digunakan untuk mutasi riwayat pemasukan & pengeluaran VORFÍNE
 */
export async function fetchTransactions(): Promise<TransactionDTO[]> {
  try {
    const data = await getFromApi<{ todos?: any[] }>("/todos?limit=6");
    const list = data?.todos && Array.isArray(data.todos) ? data.todos : [];

    if (list.length === 0) {
      throw new Error("Data list kosong dari server");
    }

    return list.map((item: any, index: number): TransactionDTO => {
      const template =
        VORFINE_FINANCIAL_TRANSACTIONS[
          index % VORFINE_FINANCIAL_TRANSACTIONS.length
        ];
      const txDate = new Date(Date.now() - index * 86400000)
        .toISOString()
        .split("T")[0];

      return {
        id: String(item.id || index + 1),
        title: template.title,
        amount: template.amount,
        type: template.type,
        category: template.category,
        date: txDate,
        description: template.description,
        status: "completed",
        balanceAfter: template.balanceAfter,
      };
    });
  } catch (error) {
    console.error(
      "[apiService] Error saat memuat fetchTransactions, menggunakan fallback keuangan:",
      error
    );
    return VORFINE_FINANCIAL_TRANSACTIONS.map((template, index) => ({
      id: `tx-fb-${index + 1}`,
      title: template.title,
      amount: template.amount,
      type: template.type,
      category: template.category,
      date: new Date(Date.now() - index * 86400000)
        .toISOString()
        .split("T")[0],
      description: template.description,
      status: "completed",
      balanceAfter: template.balanceAfter,
    }));
  }
}

/**
 * 3. Mengambil data Aktivitas & Jadwal Harian (ActivityDTO[])
 * Digunakan untuk schedule produktivitas VORFÍNE
 */
export async function fetchActivities(): Promise<ActivityDTO[]> {
  try {
    const data = await getFromApi<{ todos: any[] }>("/todos?limit=10");

    if (!data || !Array.isArray(data.todos)) {
      return [];
    }

    const categories: Array<ActivityDTO["category"]> = [
      "Rutinitas",
      "Domestik",
      "Pekerjaan",
      "Keuangan",
      "Lainnya",
    ];

    const times = [
      "05:00 - 06:00 WIB",
      "07:00 - 07:30 WIB",
      "08:00 - 16:00 WIB",
      "16:30 - 18:00 WIB",
      "19:00 - 20:30 WIB",
    ];

    return data.todos.map(
      (item: any, index: number): ActivityDTO => ({
        id: String(item.id),
        title: item.todo,
        category: categories[index % categories.length],
        date: new Date().toISOString().split("T")[0],
        time: times[index % times.length],
        completed: Boolean(item.completed),
        status: item.completed ? "completed" : "pending",
        reminderEnabled: !item.completed,
      })
    );
  } catch (error) {
    console.error("[apiService] Error saat memuat fetchActivities:", error);
    throw error;
  }
}

export const apiService = {
  getFromApi,
  fetchPrograms,
  fetchTransactions,
  fetchActivities,
};

export default apiService;
