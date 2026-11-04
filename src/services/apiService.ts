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
    console.error("[apiService] Error saat memuat fetchTransactions:", error);
    throw error;
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
};

export default apiService;
