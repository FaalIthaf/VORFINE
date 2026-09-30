// src/utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  PROFILES: "vorfine_profiles",
  SELECTED_PROFILE: "vorfine_selectedProfileId",
  FINANCE: "vorfine_financeByProfile",
  TRANSACTIONS: "vorfine_transactionsByProfile",
  SCHEDULES: "vorfine_schedulesByProfile",
  NOTIFICATIONS: "vorfine_notificationsByProfile",
};

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
