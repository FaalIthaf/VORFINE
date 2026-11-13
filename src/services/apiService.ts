/**
 * REST API Service untuk VORFÍNE
 * Bertanggung jawab melakukan permintaan HTTP asinkron (GET/POST) ke server,
 * autentikasi berbasis token dengan SecureStore,
 * serta integrasi DummyJSON API untuk Modul 3.
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

// ============================================================================
// 🌟 ENDPOINTS DUMMYJSON KUSTOM (MODUL 3)
// ============================================================================
export const DUMMY_GET_URL = "https://dummyjson.com/c/7658-7caa-4cfd-8233";
export const DUMMY_POST_URL = "https://dummyjson.com/c/718b-cf8c-495a-a66f";

export interface Modul3UserDTO {
  id?: string | number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  role?: string;
  balance?: number;
  raw?: any;
}

// 1. URL Tunnel Publik (Opsional jika menggunakan backend remote)
export const TUNNEL_URL: string = "";

// 2. IP Laptop Server di Jaringan Wi-Fi Lokal
export const LOCAL_IP = "172.16.40.3";

/**
 * Mengambil Base URL secara cerdas
 */
export function getBaseUrl(): string {
  const tunnel = String(TUNNEL_URL || "").trim();
  if (tunnel !== "") {
    return tunnel.replace(/\/+$/, "");
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const host = window.location.hostname || "localhost";
    return `http://${host}:5000`;
  }

  return `http://${LOCAL_IP}:5000`;
}

export const BASE_URL = getBaseUrl();

/**
 * Helper aman untuk parsing response JSON dari server
 */
async function parseJsonResponse(response: Response): Promise<any> {
  const text = await response.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    throw new Error(
      "Respons dari server bukan format JSON yang valid. Pastikan server backend dan tunnel aktif."
    );
  }

  if (!response.ok) {
    const msg =
      json?.message ||
      (response.status === 401
        ? "Email atau kata sandi salah / Sesi tidak valid (401)"
        : `HTTP ${response.status}`);
    const err = new Error(msg);
    (err as any).status = response.status;
    throw err;
  }

  return json;
}

/**
 * Memeriksa status koneksi internet perangkat secara proaktif
 */
export async function checkConnection(): Promise<boolean> {
  if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
    return navigator.onLine;
  }
  return true;
}

/**
 * Mendeteksi apakah error yang ditangkap merupakan kegagalan jaringan atau kondisi offline
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
 * ============================================================================
 * 🚀 FUNGSI API DUMMYJSON KUSTOM (PERSIAPAN MODUL 3)
 * ============================================================================
 */

/**
 * 1. Fetch data dari Custom GET Endpoint DummyJSON
 * Endpoint: https://dummyjson.com/c/3029-d29f-4014-9fb4
 */
export async function fetchCustomDummyGet<T = any>(): Promise<T> {
  try {
    const response = await fetch(DUMMY_GET_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error GET DummyJSON: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("[apiService] Error saat memanggil fetchCustomDummyGet:", err);
    throw err;
  }
}

/**
 * 2. Kirim data ke Custom POST Endpoint DummyJSON
 * Endpoint: https://dummyjson.com/c/eb3d-d728-4cdf-ab19
 */
export async function postCustomDummyData<T = any>(payload: any): Promise<T> {
  try {
    const response = await fetch(DUMMY_POST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error POST DummyJSON: ${response.status}`);
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: true, message: "Data berhasil dikirim ke endpoint DummyJSON POST" } as any;
    }
  } catch (err: any) {
    console.error("[apiService] Error saat memanggil postCustomDummyData:", err);
    throw err;
  }
}

/**
 * 3. Helper Khusus Modul 3: Fetch Username & Email Address
 * Mengambil data dari endpoint GET DummyJSON dan mengekstraksi username & email
 * Siap dipakai di halaman baru Modul 3
 */
export async function fetchUserCredentials(): Promise<Modul3UserDTO> {
  try {
    const data = await fetchCustomDummyGet<any>();
    const username =
      data?.username || data?.user || (data?.foo ? String(data.foo) : "pengguna_vorfine");
    const email =
      data?.email || (data?.foo ? `${data.foo}@vorfine.com` : "pengguna@vorfine.com");

    return {
      id: data?.id || 1,
      username,
      email,
      fullName: data?.fullName || data?.name || username,
      phone: data?.phone || "+62 812-xxxx-xxxx",
      role: data?.role || "Warga Terverifikasi",
      balance: Number(data?.balance) || 0,
      raw: data,
    };
  } catch (err: any) {
    console.error("[apiService] Error fetchUserCredentials:", err);
    throw err;
  }
}

/**
 * ============================================================================
 * 🌟 PEKAN DEMO: ASYNCHRONOUS & PROMISE (.then, .resolve, .reject)
 * ============================================================================
 */

/**
 * Mengambil data transaksi eksternal dari endpoint DummyJSON kustom
 */
export async function fetchExternalApiTransactions(): Promise<TransactionDTO[]> {
  try {
    const data = await fetchCustomDummyGet<any>();
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
      ? data
      : [data];

    return items.map((item: any, idx: number): TransactionDTO => ({
      id: `ext-${item.id || idx + 1}`,
      title: item.title || item.username || item.foo || `Transaksi External #${idx + 1}`,
      amount: Number(item.amount) || 100000,
      type: (item.type === "income" ? "income" : "expense") as "income" | "expense",
      category: item.category || "Modul 3 API",
      date: new Date().toISOString().split("T")[0],
      description: `Data dari Custom DummyJSON API (GET)`,
      status: "completed",
      balanceAfter: 1000000,
    }));
  } catch (error) {
    console.warn("[apiService] Fallback fetchExternalApiTransactions:", error);
    return [];
  }
}

/**
 * Custom Promise Wrapper dengan resolve() dan reject()
 */
export function fetchWithCustomPromise(
  endpointUrl: string = DUMMY_GET_URL
): Promise<TransactionDTO[]> {
  return new Promise<TransactionDTO[]>((resolve, reject) => {
    if (!endpointUrl || typeof endpointUrl !== "string" || endpointUrl.trim() === "") {
      return reject(new Error("[Pekan Demo - reject()]: Parameter endpointUrl tidak boleh kosong!"));
    }

    fetch(endpointUrl, {
      headers: { "Accept": "application/json" }
    })
      .then((res: Response) => {
        if (!res.ok) {
          return reject(
            new Error(`[Pekan Demo - reject()]: Server mengembalikan status HTTP ${res.status}`)
          );
        }
        return res.json();
      })
      .then((data: any) => {
        const rawList = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [data];

        const mappedObjects: TransactionDTO[] = rawList.map(
          (item: any, i: number): TransactionDTO => ({
            id: String(item.id || i + 1),
            title: item.title || item.username || (item.foo ? `Item: ${item.foo}` : `Data Demo #${i + 1}`),
            amount: 150000 * (i + 1),
            type: i % 2 === 0 ? "income" : "expense",
            category: "DummyJSON Modul 3",
            date: new Date().toISOString().split("T")[0],
            description: "Data sukses diselesaikan melalui custom Promise resolve()",
            status: "completed",
            balanceAfter: 2000000,
          })
        );

        resolve(mappedObjects);
      })
      .catch((err: any) => {
        reject(
          new Error(`[Pekan Demo - reject()]: Gagal mengambil data: ${err?.message || err}`)
        );
      });
  });
}

/**
 * Demonstrasi Chaining .then(), .catch() dengan Promise.resolve() dan Promise.reject()
 */
export function executePromiseDemoChaining(
  simulateFailure: boolean = false
): Promise<TransactionDTO[]> {
  if (simulateFailure) {
    return Promise.reject(
      new Error("[Pekan Demo - Promise.reject()]: Simulasi kegagalan paksa berhasil dieksekusi!")
    );
  }

  return fetchWithCustomPromise(DUMMY_GET_URL)
    .then((resultList: TransactionDTO[]) => {
      console.log("[Pekan Demo - .then()]: Data berhasil diterima dari DummyJSON:", resultList.length);
      return Promise.resolve(resultList);
    })
    .catch((err: Error) => {
      console.error("[Pekan Demo - .catch()]: Error ditangkap:", err.message);
      return Promise.reject(err);
    });
}

/**
 * ============================================================================
 * 🌟 GENERIC & BACKEND HELPERS
 * ============================================================================
 */

export async function getFromApi<T>(endpoint: string): Promise<T> {
  try {
    const base = getBaseUrl();
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    let token: string | null = null;
    try {
      token = await SecureStore.getItemAsync("access_token");
    } catch {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        token = window.localStorage.getItem("access_token");
      }
    }

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

    return await parseJsonResponse(response);
  } catch (error) {
    console.error(`[apiService] Gagal fetch data dari ${endpoint}:`, error);
    throw error;
  }
}

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
    return [];
  }
}

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
    return [];
  }
}

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
    return [];
  }
}

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

export async function removeStoredAccessToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync("access_token");
  } catch {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
    }
  }
}

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
  DUMMY_GET_URL,
  DUMMY_POST_URL,
  fetchCustomDummyGet,
  postCustomDummyData,
  fetchUserCredentials,
  fetchExternalApiTransactions,
  fetchWithCustomPromise,
  executePromiseDemoChaining,
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
