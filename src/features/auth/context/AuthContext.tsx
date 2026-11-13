import { User } from "@/types";
import {
  deleteSecure,
  loadSecureJSON,
  saveSecureJSON,
  SECURE_KEYS,
} from "@/utils/storage";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

export interface RegisteredUser {
  email: string;
  password: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  hasRegisteredUsers: boolean;
  accessToken: string | null;
  login: (
    emailOrUsername: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    smartNotifications?: boolean;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<User>) => Promise<void>;
  verifyBiometric: (type: "face" | "fingerprint") => Promise<boolean>;
  toggleBiometrics: (enabled?: boolean) => Promise<void>;
  /** Instant switch — no re-login required */
  switchAccount: (
    email: string,
  ) => Promise<{ success: boolean; message?: string }>;
  /** Forgot-password: look up account by email/username */
  findAccount: (emailOrUsername: string) => Promise<RegisteredUser | null>;
  /** Forgot-password: reset password for a given email */
  resetPassword: (
    email: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

<<<<<<< HEAD
=======
// Akun bawaan agar pengguna & teman bisa langsung login tanpa perlu setup database server
const DEFAULT_DEMO_USERS: RegisteredUser[] = [
  {
    email: "faalithaf@gmail.com",
    password: "password123",
    user: {
      id: "usr_faal_01",
      fullName: "FaalIthaf",
      email: "faalithaf@gmail.com",
      phone: "+62 812-3456-7890",
      role: "Warga Terverifikasi",
      avatar: "FA",
      biometricsEnabled: true,
      smartNotifications: true,
      sensor3DActive: true,
      encryptionStandard: "AES-256",
      securitySessionActive: true,
    },
  },
  {
    email: "ivanfadolli30@gmail.com",
    password: "ANJAYYY_",
    user: {
      id: "usr_ivan_02",
      fullName: "Ivan Fadolli",
      email: "ivanfadolli30@gmail.com",
      phone: "+62 813-4567-8901",
      role: "Warga Terverifikasi",
      avatar: "IF",
      biometricsEnabled: false,
      smartNotifications: true,
      sensor3DActive: false,
      encryptionStandard: "AES-256",
      securitySessionActive: true,
    },
  },
  {
    email: "demo@vorfine.com",
    password: "password123",
    user: {
      id: "usr_demo_03",
      fullName: "Demo User",
      email: "demo@vorfine.com",
      phone: "+62 812-0000-0000",
      role: "Warga Terverifikasi",
      avatar: "DU",
      biometricsEnabled: false,
      smartNotifications: true,
      sensor3DActive: false,
      encryptionStandard: "AES-256",
      securitySessionActive: true,
    },
  },
];

>>>>>>> eb4d9a74a5160f00b1ececd697e977363aa44907
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
<<<<<<< HEAD
  const [hasRegisteredUsers, setHasRegisteredUsers] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>("vf_local_active");
=======
  const [hasRegisteredUsers, setHasRegisteredUsers] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(
    "vf_local_active",
  );
>>>>>>> eb4d9a74a5160f00b1ececd697e977363aa44907

  // ─── Ambil daftar pengguna tersimpan dari Secure Storage lokal ────
  const getRegisteredUsers = async (): Promise<RegisteredUser[]> => {
    const users = await loadSecureJSON<RegisteredUser[]>(
      SECURE_KEYS.REGISTERED_USERS,
      [],
    );
    return users || [];
  };

  // ─── Simpan pengguna ke Secure Storage lokal ───────────────────────
  const saveRegisteredUsers = async (
    users: RegisteredUser[],
  ): Promise<void> => {
    await saveSecureJSON(SECURE_KEYS.REGISTERED_USERS, users);
  };

  // ─── Simpan sesi aktif ke Secure Storage lokal ────────────────────
  const saveSession = async (
    activeUser: User,
    remMe: boolean,
    tokenString?: string | null,
  ): Promise<void> => {
    await saveSecureJSON(SECURE_KEYS.SESSION_TOKEN, {
      user: activeUser,
      rememberMe: remMe,
      token: tokenString || accessToken || "vf_local_active",
    });
  };

  // ─── Muat sesi tersimpan saat aplikasi dibuka ─────────────────────
  useEffect(() => {
    (async () => {
      try {
        let registeredUsers = await getRegisteredUsers();
        // Bersihkan akun dummy bawaan yang sempat tersimpan sebelumnya
        registeredUsers = registeredUsers.filter(
          (u) =>
            u.user.id !== "usr_demo_03" &&
            u.email.toLowerCase() !== "demo@vorfine.com"
        );
        await saveRegisteredUsers(registeredUsers);
        setHasRegisteredUsers(registeredUsers.length > 0);

        let storedToken: string | null = null;
        try {
          storedToken = await SecureStore.getItemAsync("access_token");
        } catch {
          if (Platform.OS === "web" && typeof window !== "undefined") {
            storedToken = window.localStorage.getItem("access_token");
          }
        }

        const sessionData = await loadSecureJSON<{
          user: User;
          rememberMe: boolean;
          token?: string;
        } | null>(SECURE_KEYS.SESSION_TOKEN, null);

        if (
          sessionData &&
          sessionData.user &&
          sessionData.user.id !== "usr_demo_03" &&
          sessionData.user.email?.toLowerCase() !== "demo@vorfine.com"
        ) {
          setUser(sessionData.user);
          setIsAuthenticated(true);
          setRememberMe(sessionData.rememberMe ?? true);
          setAccessToken(sessionData.token || storedToken || "vf_local_active");
        } else {
          // Jika belum ada akun atau akun demo lama, reset ke bersih (halaman login)
          setUser(null);
          setAccessToken(null);
          setIsAuthenticated(false);
          await deleteSecure(SECURE_KEYS.SESSION_TOKEN);
        }
      } catch (err) {
        console.warn("Failed to load auth session from local storage:", err);
        setUser(null);
        setAccessToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ─── Login Lokal (Cepat, 100% Offline tanpa server) ───────────────
  const login = async (
    emailOrUsername: string,
    password: string,
    remMe: boolean = true,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const trimmedInput = emailOrUsername.trim().toLowerCase();
      if (!trimmedInput || !password.trim()) {
        return {
          success: false,
          message: "Email atau username dan kata sandi wajib diisi.",
        };
      }

      const users = await getRegisteredUsers();
      const matched = users.find(
        (u) =>
          u.email.toLowerCase() === trimmedInput ||
          u.user.fullName.toLowerCase() === trimmedInput,
      );

      if (!matched) {
        return {
          success: false,
          message:
            "Akun belum terdaftar. Silakan klik 'Daftar Akun' terlebih dahulu.",
        };
      }

      if (matched.password !== password) {
        return {
          success: false,
          message: "Kata sandi yang Anda masukkan salah.",
        };
      }

      const localToken = `vf_local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      setAccessToken(localToken);

      try {
        await SecureStore.setItemAsync("access_token", localToken);
      } catch {
        if (Platform.OS === "web" && typeof window !== "undefined") {
          window.localStorage.setItem("access_token", localToken);
        }
      }

      setUser(matched.user);
      setIsAuthenticated(true);
      setRememberMe(remMe);
      await saveSession(matched.user, remMe, localToken);

      return { success: true };
    } catch (err: any) {
      console.warn("Login error:", err);
      return {
        success: false,
        message: err?.message || "Terjadi kesalahan saat masuk.",
      };
    }
  };

  // ─── Register Lokal (Tersimpan aman di device masing-masing) ──────
  const register = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    smartNotifications?: boolean;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      if (
        !data.fullName.trim() ||
        !data.email.trim() ||
        !data.password.trim()
      ) {
        return {
          success: false,
          message: "Lengkapi semua data pendaftaran dengan benar.",
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        return {
          success: false,
          message: "Format email tidak valid. Gunakan format: nama@domain.com",
        };
      }

      if (data.password.length < 6) {
        return {
          success: false,
          message: "Kata sandi minimal harus 6 karakter.",
        };
      }

      const users = await getRegisteredUsers();
      const cleanEmail = data.email.trim().toLowerCase();
      const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return {
          success: false,
          message:
            "Email sudah terdaftar. Silakan masuk menggunakan akun Anda.",
        };
      }

      const nameParts = data.fullName.trim().split(/\s+/);
      const initials =
        nameParts.length >= 2
          ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
          : (data.fullName.slice(0, 2) || "VF").toUpperCase();

      const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newUser: User = {
        id: newId,
        fullName: data.fullName.trim(),
        email: cleanEmail,
        phone: data.phone?.trim() || "+62 812-xxxx-xxxx",
        role: "Warga Terverifikasi",
        avatar: initials,
        biometricsEnabled: false,
        smartNotifications: data.smartNotifications ?? true,
        sensor3DActive: false,
        encryptionStandard: "AES-256",
        securitySessionActive: true,
      };

      const updatedList: RegisteredUser[] = [
        ...users,
        {
          email: cleanEmail,
          password: data.password,
          user: newUser,
        },
      ];
      await saveRegisteredUsers(updatedList);
      setHasRegisteredUsers(true);

      const localToken = `vf_local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      setAccessToken(localToken);

      try {
        await SecureStore.setItemAsync("access_token", localToken);
      } catch {
        if (Platform.OS === "web" && typeof window !== "undefined") {
          window.localStorage.setItem("access_token", localToken);
        }
      }

      setUser(newUser);
      setIsAuthenticated(true);
      setRememberMe(true);
      await saveSession(newUser, true, localToken);

      return { success: true };
    } catch (err: any) {
      console.warn("Register error:", err);
      return {
        success: false,
        message: err?.message || "Terjadi kesalahan saat pendaftaran akun.",
      };
    }
  };

  // ─── Instant Account Switch (NO re-login!) ────────────────────────
  const switchAccount = async (
    email: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const registeredUsers = await getRegisteredUsers();
      const target = registeredUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );

      if (!target) {
        return { success: false, message: "Akun tidak ditemukan." };
      }

      const activeUser = target.user;
      setUser(activeUser);
      setIsAuthenticated(true);
      setRememberMe(true);
      await saveSession(activeUser, true);

      return { success: true };
    } catch (err) {
      console.warn("Switch account error:", err);
      return { success: false, message: "Gagal mengganti akun." };
    }
  };

  // ─── Find Account (for Forgot Password step 1) ────────────────────
  const findAccount = async (
    emailOrUsername: string,
  ): Promise<RegisteredUser | null> => {
    try {
      const trimmed = emailOrUsername.trim().toLowerCase();
      const registeredUsers = await getRegisteredUsers();
      const found = registeredUsers.find(
        (u) =>
          u.email.toLowerCase() === trimmed ||
          u.user.fullName.toLowerCase() === trimmed,
      );
      return found || null;
    } catch {
      return null;
    }
  };

  // ─── Reset Password (for Forgot Password step 3) ──────────────────
  const resetPassword = async (
    email: string,
    newPassword: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      if (newPassword.length < 6) {
        return { success: false, message: "Kata sandi minimal 6 karakter." };
      }
      const registeredUsers = await getRegisteredUsers();
      const idx = registeredUsers.findIndex(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (idx === -1) {
        return { success: false, message: "Akun tidak ditemukan." };
      }
      registeredUsers[idx] = { ...registeredUsers[idx], password: newPassword };
      await saveRegisteredUsers(registeredUsers);
      return { success: true };
    } catch {
      return { success: false, message: "Gagal mengatur ulang kata sandi." };
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token");
    } catch (err) {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.localStorage.removeItem("access_token");
      }
    }
    setUser(null);
    setAccessToken(null);
    setRememberMe(false);
    setIsAuthenticated(false);
    try {
      await deleteSecure(SECURE_KEYS.SESSION_TOKEN);
    } catch (err) {
      console.warn("Failed to delete session on logout:", err);
    }
  };

  // ─── Update Profile ───────────────────────────────────────────────
  const updateProfile = async (updated: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updated };
      setUser(newUser);
      await updateRegisteredUser(newUser);
      await saveSession(newUser, rememberMe);
    }
  };

  // ─── Biometrics ───────────────────────────────────────────────────
  const verifyBiometric = async (
    _type: "face" | "fingerprint",
  ): Promise<boolean> => {
    if (user) {
      setIsAuthenticated(true);
      await saveSession(user, true);
    }
    return true;
  };

  const toggleBiometrics = async (enabled?: boolean) => {
    if (user) {
      const nextVal = enabled !== undefined ? enabled : !user.biometricsEnabled;
      await updateProfile({ biometricsEnabled: nextVal });
    }
  };

  const updateRegisteredUser = async (updatedUser: User) => {
    const registeredUsers = await getRegisteredUsers();
    const updatedList = registeredUsers.map((ru) =>
      ru.user.id === updatedUser.id ? { ...ru, user: updatedUser } : ru,
    );
    await saveRegisteredUsers(updatedList);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        rememberMe,
        hasRegisteredUsers,
        accessToken,
        login,
        register,
        logout,
        updateProfile,
        verifyBiometric,
        toggleBiometrics,
        switchAccount,
        findAccount,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
