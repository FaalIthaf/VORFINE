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

// In-memory fallback cache ensures data integrity across components even if native storage drivers fail
const memoryStore = new Map<string, string>();

const isWeb = Platform.OS === "web";

const getWebStorage = (): Storage | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

// ─── Regular Storage (AsyncStorage with Web localStorage & Memory Fallback) ──
export const saveData = async (key: string, value: any): Promise<void> => {
  try {
    const json = JSON.stringify(value);
    memoryStore.set(key, json);

    if (isWeb) {
      try {
        getWebStorage()?.setItem(key, json);
      } catch {
        // web storage quota or privacy mode error
      }
      return;
    }

    // Try AsyncStorage on native
    try {
      await AsyncStorage.setItem(key, json);
      return;
    } catch {
      // If AsyncStorage native module is null or fails, try SecureStore as fallback if small
      if (json.length < 2000) {
        try {
          if (await SecureStore.isAvailableAsync()) {
            await SecureStore.setItemAsync(`_fb_${key}`, json);
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e) {
    // Memory store holds it safely
  }
};

export const loadData = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    if (isWeb) {
      try {
        const webVal = getWebStorage()?.getItem(key);
        if (webVal != null) {
          memoryStore.set(key, webVal);
          return JSON.parse(webVal) as T;
        }
      } catch {
        // ignore
      }
      const mem = memoryStore.get(key);
      return mem != null ? (JSON.parse(mem) as T) : fallback;
    }

    // Native: Try AsyncStorage
    try {
      const json = await AsyncStorage.getItem(key);
      if (json != null) {
        memoryStore.set(key, json);
        return JSON.parse(json) as T;
      }
    } catch {
      // Fallback: check SecureStore fallback
      try {
        if (await SecureStore.isAvailableAsync()) {
          const fb = await SecureStore.getItemAsync(`_fb_${key}`);
          if (fb != null) {
            memoryStore.set(key, fb);
            return JSON.parse(fb) as T;
          }
        }
      } catch {
        // ignore
      }
    }

    const mem = memoryStore.get(key);
    if (mem != null) {
      return JSON.parse(mem) as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
};

export const clearAllData = async (): Promise<void> => {
  memoryStore.clear();
  if (isWeb) {
    try {
      getWebStorage()?.clear();
    } catch {
      // ignore
    }
    return;
  }

  try {
    await AsyncStorage.clear();
  } catch {
    // ignore
  }
};

export const removeData = async (key: string): Promise<void> => {
  memoryStore.delete(key);
  if (isWeb) {
    try {
      getWebStorage()?.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }

  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
  try {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.deleteItemAsync(`_fb_${key}`);
    }
  } catch {
    // ignore
  }
};

export const getAccountStorageKey = (
  baseKey: string,
  userIdentifier?: string | null
): string => {
  if (!userIdentifier) return `${baseKey}_guest`;
  const sanitized = userIdentifier.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  return `${baseKey}_${sanitized}`;
};

// ─── Secure Storage (expo-secure-store on Native, localStorage on Web) ──
export const saveSecure = async (key: string, value: string): Promise<void> => {
  try {
    memoryStore.set(`__sec_${key}`, value);
    if (isWeb) {
      try {
        getWebStorage()?.setItem(`__sec_${key}`, value);
      } catch {
        // ignore
      }
      return;
    }

    let secureAvailable = false;
    try {
      secureAvailable = await SecureStore.isAvailableAsync();
    } catch {
      secureAvailable = false;
    }

    if (secureAvailable) {
      await SecureStore.setItemAsync(key, value);
    } else {
      try {
        await AsyncStorage.setItem(`__sec_${key}`, value);
      } catch {
        // memoryStore holds it
      }
    }
  } catch {
    // memoryStore holds it
  }
};

export const loadSecure = async (key: string): Promise<string | null> => {
  try {
    if (isWeb) {
      try {
        const webVal = getWebStorage()?.getItem(`__sec_${key}`);
        if (webVal != null) {
          memoryStore.set(`__sec_${key}`, webVal);
          return webVal;
        }
      } catch {
        // ignore
      }
      return memoryStore.get(`__sec_${key}`) || null;
    }

    let secureAvailable = false;
    try {
      secureAvailable = await SecureStore.isAvailableAsync();
    } catch {
      secureAvailable = false;
    }

    if (secureAvailable) {
      const val = await SecureStore.getItemAsync(key);
      if (val != null) {
        memoryStore.set(`__sec_${key}`, val);
        return val;
      }
    }

    try {
      const asyncVal = await AsyncStorage.getItem(`__sec_${key}`);
      if (asyncVal != null) {
        memoryStore.set(`__sec_${key}`, asyncVal);
        return asyncVal;
      }
    } catch {
      // ignore
    }

    return memoryStore.get(`__sec_${key}`) || null;
  } catch {
    return memoryStore.get(`__sec_${key}`) || null;
  }
};

export const deleteSecure = async (key: string): Promise<void> => {
  try {
    memoryStore.delete(`__sec_${key}`);
    if (isWeb) {
      try {
        getWebStorage()?.removeItem(`__sec_${key}`);
      } catch {
        // ignore
      }
      return;
    }

    let secureAvailable = false;
    try {
      secureAvailable = await SecureStore.isAvailableAsync();
    } catch {
      secureAvailable = false;
    }

    if (secureAvailable) {
      await SecureStore.deleteItemAsync(key);
    }

    try {
      await AsyncStorage.removeItem(`__sec_${key}`);
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
};

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
