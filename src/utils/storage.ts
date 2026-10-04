// src/utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// ─── Keys for regular (non-sensitive) data ───────────────────────────
export const STORAGE_KEYS = {
  PROFILES: "vorfine_profiles",
  SELECTED_PROFILE: "vorfine_selectedProfileId",
  FINANCE: "vorfine_financeByProfile",
  TRANSACTIONS: "vorfine_transactionsByProfile",
  SCHEDULES: "vorfine_schedulesByProfile",
  NOTIFICATIONS: "vorfine_notificationsByProfile",
};

// ─── Keys for sensitive data (stored in SecureStore) ─────────────────
export const SECURE_KEYS = {
  SESSION_TOKEN: "vorfine_session_token",
  USER_DATA: "vorfine_user_data",
  REGISTERED_USERS: "vorfine_registered_users",
};

// ─── Regular Storage (AsyncStorage) ──────────────────────────────────
export const saveData = async (key: string, value: any): Promise<void> => {
  try {
    const json = JSON.stringify(value);
    await AsyncStorage.setItem(key, json);
  } catch (e) {
    console.warn("Failed to save", key, e);
  }
};

export const loadData = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const json = await AsyncStorage.getItem(key);
    return json != null ? (JSON.parse(json) as T) : fallback;
  } catch (e) {
    console.warn("Failed to load", key, e);
    return fallback;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.warn("Failed to clear storage", e);
  }
};

// ─── Secure Storage (expo-secure-store) ──────────────────────────────
// These functions encrypt sensitive data like session tokens and credentials.
// On web, falls back to AsyncStorage (SecureStore is not available).

const isSecureStoreAvailable = Platform.OS !== "web";

export const saveSecure = async (key: string, value: string): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(key, value);
    } else {
      // Web fallback
      await AsyncStorage.setItem(`__secure_${key}`, value);
    }
  } catch (e) {
    console.warn("Failed to save secure data", key, e);
  }
};

export const loadSecure = async (key: string): Promise<string | null> => {
  try {
    if (isSecureStoreAvailable) {
      return await SecureStore.getItemAsync(key);
    } else {
      return await AsyncStorage.getItem(`__secure_${key}`);
    }
  } catch (e) {
    console.warn("Failed to load secure data", key, e);
    return null;
  }
};

export const deleteSecure = async (key: string): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(`__secure_${key}`);
    }
  } catch (e) {
    console.warn("Failed to delete secure data", key, e);
  }
};

// ─── Convenience helpers for JSON objects in SecureStore ─────────────
export const saveSecureJSON = async (key: string, value: any): Promise<void> => {
  await saveSecure(key, JSON.stringify(value));
};

export const loadSecureJSON = async <T>(key: string, fallback: T): Promise<T> => {
  const raw = await loadSecure(key);
  if (raw != null) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
};
