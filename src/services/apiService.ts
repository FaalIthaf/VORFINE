/**
 * REST API Service untuk VORFÍNE (Task 2)
 * Bertanggung jawab melakukan permintaan HTTP asinkron (GET) ke server,
 * mengubah respons menjadi format JSON, dan memetakannya ke DTO aplikasi.
 */

import { ActivityDTO, ProgramDTO, TransactionDTO } from "../models";

// Base URL endpoint RESTful API
const BASE_URL = "https://dummyjson.com";

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
 * 1. Mengambil data Program / Rencana Finansial (ProgramDTO[])
 * Memenuhi spesifikasi ProgramDTO dari Task 1
 */
export async function fetchPrograms(): Promise<ProgramDTO[]> {
  try {
    const data = await getFromApi<{ products: any[] }>("/products?limit=10");

    if (!data || !Array.isArray(data.products)) {
      return [];
    }

    // Tangkap data array dan petakan ke format ProgramDTO
    return data.products.map(
      (item: any, index: number): ProgramDTO => ({
        id: String(item.id),
        name: item.title,
        description: item.description || "Deskripsi program VORFÍNE",
        category: index % 2 === 0 ? "budget" : "savings",
        status: "active",
        targetAmount: item.price * 10000,
        currentAmount: Math.round(item.price * 10000 * ((item.rating || 4) / 5)),
        startDate: new Date().toISOString().split("T")[0],
        progress: Math.min(100, Math.round(((item.rating || 4) / 5) * 100)),
      })
    );
  } catch (error) {
    console.error("[apiService] Error saat memuat fetchPrograms:", error);
    throw error;
  }
}

/**
 * 2. Mengambil data Transaksi Keuangan (TransactionDTO[])
 * Digunakan untuk mutasi pemasukan & pengeluaran VORFÍNE
 */
export async function fetchTransactions(): Promise<TransactionDTO[]> {
  try {
    const data = await getFromApi<{ products: any[] }>("/products?limit=10");

    if (!data || !Array.isArray(data.products)) {
      return [];
    }

    // Tangkap data array dan petakan ke format TransactionDTO
    return data.products.map(
      (item: any, index: number): TransactionDTO => ({
        id: String(item.id),
        title: item.title,
        amount: item.price * 1000,
        type: index % 2 === 0 ? "income" : "expense",
        category:
          item.category || (index % 2 === 0 ? "Gaji & Usaha" : "Kebutuhan Harian"),
        date: new Date(Date.now() - index * 86400000).toISOString().split("T")[0],
        description: item.description,
        status: "completed",
        balanceAfter: item.price * 5000,
      })
    );
  } catch (error) {
    console.error("[apiService] Error saat memuat fetchTransactions:", error);
    throw error;
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

    // Tangkap data array dan petakan ke format ActivityDTO
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

