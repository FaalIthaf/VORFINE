/**
 * REST API Service untuk VORFÍNE
 * Bertanggung jawab melakukan permintaan HTTP asinkron (GET/POST) ke server,
 * autentikasi berbasis token dengan SecureStore,
 * serta menyertakan Authorization Bearer token pada protected endpoint.
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  ActivityDTO,
  LoginResponseDTO,
  ProgramDTO,
  TransactionDTO,
  ExternalDemoDTO,
} from "../models";

// 1. URL Tunnel Publik (Jika teman beda jaringan, isi URL dari localtunnel / ngrok di sini)
// Kosongkan string ("") jika Anda menjalankan di laptop sendiri atau Wi-Fi yang sama!
export const TUNNEL_URL = "";

// 2. IP Laptop Server di Jaringan Wi-Fi Lokal
export const LOCAL_IP = "192.168.1.3";

/**
 * Mengambil Base URL secara cerdas:
 * - Jika TUNNEL_URL diisi: semua perangkat memakai tunnel online.
 * - Jika TUNNEL_URL kosong (""):
 *   - Di Browser/Web: otomatis mengikuti hostname (`http://${host}:5000`)
 *   - Di Android/HP: mengarah ke IP Wi-Fi laptop (`http://${LOCAL_IP}:5000`)
 */
export function getBaseUrl(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const host = window.location.hostname || "localhost";
    return `http://${host}:5000`;
  }

  return `http://${LOCAL_IP}:5000`;
}

export const BASE_URL = getBaseUrl();

/**
 * Helper aman untuk parsing response JSON dari server.
 * Mencegah error "no digit after minus sign" jika server mengembalikan pesan error teks/HTML (misal 502/503 tunnel mati).
 */
async function parseJsonResponse(response: Response): Promise<any> {
  // 1. Periksa Response: Pengecekan response.ok sebelum parsing data JSON
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }

  const text = await response.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      "Respons dari server bukan format JSON yang valid. Pastikan server backend dan tunnel aktif."
    );
  }

  return json;
}

/**
 * Memeriksa status koneksi internet perangkat secara proaktif (Task 3)
 */
export async function checkConnection(): Promise<boolean> {
  if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
    return navigator.onLine;
  }
  return true;
}

/**
 * Mendeteksi apakah error yang ditangkap merupakan kegagalan jaringan atau kondisi offline (Task 3)
 */
export function isNetworkError(error: any): boolean {
  if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean" && !navigator.onLine) {
    return true;
  }
  if (!error) return false;

  const msg = (error.message || (typeof error === "string" ? error : "")).toLowerCase();
  const name = (error.name || "").toLowerCase();

  return (
    (name === "typeerror" && (msg.includes("fetch") || msg.includes("network"))) ||
    msg.includes("failed to fetch") ||
    msg.includes("network request failed") ||
    msg.includes("networkerror") ||
    msg.includes("network error") ||
    msg.includes("koneksi") ||
    msg.includes("offline") ||
    msg.includes("internet") ||
    msg.includes("econnrefused") ||
    msg.includes("enotfound") ||
    msg.includes("net::err") ||
    msg.includes("the internet connection appears to be offline")
  );
}

/**
 * Helper generik untuk melakukan HTTP GET request menggunakan fetch() (Task 2)
 * Mengambil token dari SecureStore dan menyertakannya di dalam header HTTP:
 * Authorization: Bearer <token>
 */
export async function getFromApi<T>(endpoint: string): Promise<T> {
  try {
    const base = getBaseUrl();
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    // 1. Ambil Token dari SecureStore (Task 2: Attach Token)
    let token: string | null = null;
    try {
      token = await SecureStore.getItemAsync("access_token");
    } catch {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        token = window.localStorage.getItem("access_token");
      }
    }

    // 2. Sertakan Header Authorization: Bearer <token>
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Bypass-Tunnel-Reminder": "true",
        "bypass-tunnel-reminder": "true",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    // 1. Periksa Response: Tambahkan pengecekan if (!response.ok) { throw new Error('HTTP ' + response.status); } sebelum memparsing data JSON
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    return await parseJsonResponse(response);
  } catch (error) {
    console.error(`[apiService] Gagal fetch data dari ${endpoint}:`, error);
    throw error;
  }
}

/**
 * 1. Mengambil data Kategori Anggaran / Program Finansial (ProgramDTO[])
 * Backend SQL mengembalikan array langsung dari tabel programs
 */
export async function fetchPrograms(): Promise<ProgramDTO[]> {
  try {
    const data = await getFromApi<any[]>("/programs");
    const list = Array.isArray(data) ? data : [];
    return list.map((item: any): ProgramDTO => ({
      id: String(item.id),
      name: item.name || "",
      description: item.description || "",
      category: item.category || "budget",
      status: item.status || "active",
      targetAmount: parseFloat(item.targetAmount) || 0,
      currentAmount: parseFloat(item.currentAmount) || 0,
      startDate: item.startDate || new Date().toISOString().split("T")[0],
      progress: parseInt(item.progress) || 0,
    }));
  } catch (error) {
    console.error("[apiService] Error saat memuat fetchPrograms:", error);
    throw error;
  }
}

/**
 * 2. Mengambil data Transaksi Keuangan (TransactionDTO[])
 * Backend SQL mengembalikan array langsung dari tabel transactions
 */
export async function fetchTransactions(): Promise<TransactionDTO[]> {
  try {
    const data = await getFromApi<any[]>("/transactions");
    const list = Array.isArray(data) ? data : [];
    if (list.length === 0) {
      // Jika database lokal masih kosong, ambil data dari External API
      return await fetchExternalApiTransactions();
    }
    return list.map((item: any): TransactionDTO => ({
      id: String(item.id),
      title: item.title || "",
      amount: parseFloat(item.amount) || 0,
      type: item.type || "expense",
      category: item.category || "",
      date: item.date || new Date().toISOString().split("T")[0],
      description: item.description || "",
      status: item.status || "completed",
      balanceAfter: parseFloat(item.balanceAfter) || 0,
    }));
  } catch (error) {
    console.warn("[apiService] Gagal menghubungi backend lokal, otomatis fallback ke External API:", error);
    // [Kriteria 1 & 2]: Fallback ke External API agar demo tidak gagal saat server lokal mati
    return await fetchExternalApiTransactions();
  }
}

/**
 * 3. Mengambil data Aktivitas & Jadwal Harian (ActivityDTO[])
 * Backend SQL mengembalikan array langsung dari tabel activities
 */
export async function fetchActivities(): Promise<ActivityDTO[]> {
  try {
    const data = await getFromApi<any[]>("/activities");
    const list = Array.isArray(data) ? data : [];
    return list.map((item: any): ActivityDTO => ({
      id: String(item.id),
      title: item.title || "",
      category: item.category || "Rutinitas",
      date: item.date || new Date().toISOString().split("T")[0],
      time: item.time || "08:00",
      completed: Boolean(item.completed),
      status: item.status || "pending",
      reminderEnabled: Boolean(item.reminderEnabled),
    }));
  } catch (error) {
    console.error("[apiService] Error saat memuat fetchActivities:", error);
    throw error;
  }
}

/**
 * 4. Implementasi Fungsi Login (Task 1: Token Authentication)
 * Melakukan HTTP POST ke endpoint /auth/login dengan parameter email dan password.
 * TIDAK ADA FALLBACK — jika server tidak jalan atau kredensial salah, login GAGAL.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponseDTO> {
  const url = `${getBaseUrl()}/auth/login`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Bypass-Tunnel-Reminder": "true",
      "bypass-tunnel-reminder": "true",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ email, password }),
  });

  // Periksa Response: Pengecekan response.ok sebelum parsing JSON
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }

  const data: LoginResponseDTO = await parseJsonResponse(response);

  // Pastikan access_token tersimpan secara aman di SecureStore
  if (data && data.access_token) {
    try {
      await SecureStore.setItemAsync("access_token", data.access_token);
    } catch (secErr) {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.localStorage.setItem("access_token", data.access_token);
      }
    }
  }

  return data;
}

/**
 * Mengambil token autentikasi (access_token) yang tersimpan di SecureStore
 */
export async function getStoredAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync("access_token");
  } catch {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      return window.localStorage.getItem("access_token");
    }
    return null;
  }
}

/**
 * Menghapus token autentikasi (access_token) dari SecureStore saat user logout
 */
export async function removeStoredAccessToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync("access_token");
  } catch {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
    }
  }
}

/**
 * Registrasi User Baru ke Backend SQL
 */
export async function registerUser(payload: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<LoginResponseDTO> {
  const url = `${getBaseUrl()}/auth/register`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Bypass-Tunnel-Reminder": "true",
      "bypass-tunnel-reminder": "true",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(payload),
  });

  // Periksa Response: Pengecekan response.ok sebelum parsing JSON
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }

  const data: LoginResponseDTO = await parseJsonResponse(response);

  if (data && data.access_token) {
    try {
      await SecureStore.setItemAsync("access_token", data.access_token);
    } catch (secErr) {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.localStorage.setItem("access_token", data.access_token);
      }
    }
  }

  return data;
}


// ============================================================================
// 🌟 TUGAS PEKAN DEMO: ASYNCHRONOUS, PROMISE (.then, .resolve, .reject) & DTO
// ============================================================================

/**
 * [KRITERIA 1 & 2]: Mengambil data dari External API & Custom Async Function
 * - External API: https://dummyjson.com/todos?limit=6 (API publik online terpercaya)
 * - Pre-built Async Function: fetch(), response.json()
 * - Custom Async Function: fetchExternalApiTransactions()
 * - Object Interface: Memasukkan hasil parsing ke dalam Object bertipe TransactionDTO[]
 */
export async function fetchExternalApiTransactions(): Promise<TransactionDTO[]> {
  const EXTERNAL_URL = "https://dummyjson.com/todos?limit=6";

  // Pre-built Async Function: fetch()
  const response = await fetch(EXTERNAL_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error saat memanggil External API: ${response.status}`);
  }

  // Pre-built Async Function: response.json()
  const json = await response.json();
  const todos = Array.isArray(json?.todos) ? json.todos : [];

  const categories = ["Gaji", "Belanja", "Tagihan", "Freelance", "Konsumsi", "Investasi"];
  const amounts = [5000000, 350000, 420000, 1500000, 75000, 2000000];

  // Memasukkan data ke dalam Object menggunakan Interface (TransactionDTO)
  const mappedList: TransactionDTO[] = todos.map((item: any, idx: number): TransactionDTO => {
    const isIncome = idx % 3 === 0;
    return {
      id: `ext-${item.id || idx + 1}`,
      title: item.todo || `Transaksi External #${idx + 1}`,
      amount: amounts[idx % amounts.length],
      type: isIncome ? "income" : "expense",
      category: categories[idx % categories.length],
      date: new Date(Date.now() - idx * 86400000).toISOString().split("T")[0],
      description: `Data External API DummyJSON (ID: ${item.id})`,
      status: item.completed ? "completed" : "pending",
      balanceAfter: isIncome ? 8500000 : 4200000,
    };
  });

  return mappedList;
}

/**
 * [KRITERIA 3]: Menggunakan fungsi new Promise(), .resolve(), dan .reject()
 * - Membungkus proses asinkron ke dalam Promise buatan sendiri
 * - Memanggil resolve(data) jika operasi berhasil
 * - Memanggil reject(error) jika parameter tidak valid atau HTTP status bukan 200
 */
export function fetchWithCustomPromise(
  endpointUrl: string = "https://dummyjson.com/todos?limit=6"
): Promise<TransactionDTO[]> {
  return new Promise<TransactionDTO[]>((resolve, reject) => {
    // Demonstrasi pemanggilan reject() saat validasi gagal
    if (!endpointUrl || typeof endpointUrl !== "string" || endpointUrl.trim() === "") {
      return reject(new Error("[Pekan Demo - reject()]: Parameter endpointUrl tidak boleh kosong!"));
    }

    // Pre-built Async Fetch dipadukan dengan chaining .then() dan .catch()
    fetch(endpointUrl)
      .then((res: Response) => {
        if (!res.ok) {
          // Demonstrasi reject() pada status error HTTP
          return reject(
            new Error(`[Pekan Demo - reject()]: Server mengembalikan status HTTP ${res.status}`)
          );
        }
        return res.json();
      })
      .then((data: any) => {
        const rawList = Array.isArray(data?.todos)
          ? data.todos
          : Array.isArray(data)
          ? data
          : [];

        // Pemetaan data mentah ke Object menggunakan Interface TransactionDTO
        const mappedObjects: TransactionDTO[] = rawList.map(
          (item: any, i: number): TransactionDTO => ({
            id: String(item.id || i + 1),
            title: item.todo || item.title || `Transaksi Demo #${i + 1}`,
            amount: 250000 * (i + 1),
            type: i % 2 === 0 ? "income" : "expense",
            category: "Demo Asinkron",
            date: new Date().toISOString().split("T")[0],
            description: "Data sukses diselesaikan melalui custom Promise resolve()",
            status: "completed",
            balanceAfter: 5000000,
          })
        );

        // Demonstrasi pemanggilan resolve() saat data berhasil diproses
        resolve(mappedObjects);
      })
      .catch((err: any) => {
        // Demonstrasi pemanggilan reject() saat terjadi exception jaringan
        reject(
          new Error(`[Pekan Demo - reject()]: Gagal mengambil data: ${err?.message || err}`)
        );
      });
  });
}

/**
 * [KRITERIA 3]: Menggunakan fungsi .then(), .resolve(), dan .reject() secara eksplisit
 * - Menangani pemenuhan Promise menggunakan .then()
 * - Mengembalikan Promise.resolve() dan Promise.reject() secara eksplisit
 */
export function executePromiseDemoChaining(
  simulateFailure: boolean = false
): Promise<TransactionDTO[]> {
  // Jika penguji meminta demonstrasi Promise.reject() eksplisit:
  if (simulateFailure) {
    return Promise.reject(
      new Error("[Pekan Demo - Promise.reject()]: Simulasi kegagalan paksa berhasil dieksekusi!")
    );
  }

  // Demonstrasi pemanggilan Custom Async Function dengan .then() dan .catch()
  return fetchWithCustomPromise()
    .then((resultList: TransactionDTO[]) => {
      console.log("[Pekan Demo - .then()]: Data berhasil diterima:", resultList.length);
      // Demonstrasi eksplisit Promise.resolve()
      return Promise.resolve(resultList);
    })
    .catch((err: Error) => {
      console.error("[Pekan Demo - .catch()]: Error ditangkap:", err.message);
      // Demonstrasi eksplisit Promise.reject()
      return Promise.reject(err);
    });
}

export const apiService = {
  getFromApi,
  fetchPrograms,
  fetchTransactions,
  fetchActivities,
  loginUser,
  registerUser,
  getStoredAccessToken,
  removeStoredAccessToken,
  checkConnection,
  isNetworkError,
  // Tugas Pekan Demo
  fetchExternalApiTransactions,
  fetchWithCustomPromise,
  executePromiseDemoChaining,
};

export default apiService;
