import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types";
import {
  deleteSecure,
  loadSecureJSON,
  saveSecureJSON,
  SECURE_KEYS,
} from "../utils/storage";

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
  login: (
    emailOrUsername: string,
    password: string,
    rememberMe?: boolean
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
  switchAccount: (email: string) => Promise<{ success: boolean; message?: string }>;
  /** Forgot-password: look up account by email/username */
  findAccount: (emailOrUsername: string) => Promise<RegisteredUser | null>;
  /** Forgot-password: reset password for a given email */
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasRegisteredUsers, setHasRegisteredUsers] = useState<boolean>(false);

  // ─── Get all registered users from Secure Storage ────────────────
  const getRegisteredUsers = async (): Promise<RegisteredUser[]> => {
    return await loadSecureJSON<RegisteredUser[]>(
      SECURE_KEYS.REGISTERED_USERS,
      []
    );
  };

  // ─── Save registered users list to Secure Storage ────────────────
  const saveRegisteredUsers = async (
    users: RegisteredUser[]
  ): Promise<void> => {
    await saveSecureJSON(SECURE_KEYS.REGISTERED_USERS, users);
  };

  // ─── Persist session to Secure Storage ────────────────────────────
  const saveSession = async (
    activeUser: User,
    remMe: boolean
  ): Promise<void> => {
    await saveSecureJSON(SECURE_KEYS.SESSION_TOKEN, {
      user: activeUser,
      rememberMe: remMe,
      token: `vf_sec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    });
  };

  // ─── Load saved session on mount ──────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const registeredUsers = await getRegisteredUsers();
        setHasRegisteredUsers(registeredUsers.length > 0);

        const sessionData = await loadSecureJSON<{
          user: User;
          rememberMe: boolean;
          token?: string;
        } | null>(SECURE_KEYS.SESSION_TOKEN, null);

        if (sessionData && sessionData.user) {
          setUser(sessionData.user);
          setIsAuthenticated(true);
          setRememberMe(sessionData.rememberMe ?? true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.warn("Failed to load auth session from SecureStore:", err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ─── Login ────────────────────────────────────────────────────────
  const login = async (
    emailOrUsername: string,
    password: string,
    remMe: boolean = true
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const trimmedInput = emailOrUsername.trim().toLowerCase();
      if (!trimmedInput || !password.trim()) {
        return {
          success: false,
          message: "Email atau username dan kata sandi wajib diisi.",
        };
      }

      const registeredUsers = await getRegisteredUsers();
      const found = registeredUsers.find(
        (u) =>
          (u.email.toLowerCase() === trimmedInput ||
            u.user.fullName.toLowerCase() === trimmedInput) &&
          u.password === password
      );

      if (!found) {
        return {
          success: false,
          message:
            "Akun tidak ditemukan atau kata sandi salah. Silakan periksa kembali atau buat akun baru.",
        };
      }

      const activeUser = found.user;
      setUser(activeUser);
      setIsAuthenticated(true);
      setRememberMe(remMe);
      await saveSession(activeUser, remMe);

      return { success: true };
    } catch (err) {
      console.warn("Login error:", err);
      return { success: false, message: "Terjadi kesalahan saat login." };
    }
  };

  // ─── Register ─────────────────────────────────────────────────────
  const register = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    smartNotifications?: boolean;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

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

      const phoneClean = data.phone.replace(/[\s\-()]/g, "");
      if (phoneClean.length > 0) {
        const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,10}$/;
        if (!phoneRegex.test(phoneClean)) {
          return {
            success: false,
            message:
              "Format nomor HP tidak valid. Gunakan format Indonesia: +62 8xx-xxxx-xxxx",
          };
        }
      }

      if (data.password.length < 8) {
        return {
          success: false,
          message: "Kata sandi minimal harus 8 karakter.",
        };
      }

      const registeredUsers = await getRegisteredUsers();
      const existing = registeredUsers.find(
        (u) => u.email.toLowerCase() === data.email.trim().toLowerCase()
      );
      if (existing) {
        return {
          success: false,
          message:
            "Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang sudah ada.",
        };
      }

      const nameParts = data.fullName.trim().split(/\s+/);
      const initials =
        nameParts.length >= 2
          ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
          : (data.fullName.slice(0, 2) || "VF").toUpperCase();

      const newUser: User = {
        id: `usr_${Date.now()}`,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
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
        ...registeredUsers,
        {
          email: data.email.trim().toLowerCase(),
          password: data.password,
          user: newUser,
        },
      ];
      await saveRegisteredUsers(updatedList);
      setHasRegisteredUsers(true);

      setUser(newUser);
      setIsAuthenticated(true);
      setRememberMe(true);
      await saveSession(newUser, true);

      return { success: true };
    } catch (err) {
      console.warn("Register error:", err);
      return { success: false, message: "Terjadi kesalahan saat mendaftar." };
    }
  };

  // ─── Instant Account Switch (NO re-login!) ────────────────────────
  const switchAccount = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const registeredUsers = await getRegisteredUsers();
      const target = registeredUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
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
    emailOrUsername: string
  ): Promise<RegisteredUser | null> => {
    try {
      const trimmed = emailOrUsername.trim().toLowerCase();
      const registeredUsers = await getRegisteredUsers();
      const found = registeredUsers.find(
        (u) =>
          u.email.toLowerCase() === trimmed ||
          u.user.fullName.toLowerCase() === trimmed
      );
      return found || null;
    } catch {
      return null;
    }
  };

  // ─── Reset Password (for Forgot Password step 3) ──────────────────
  const resetPassword = async (
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      if (newPassword.length < 8) {
        return { success: false, message: "Kata sandi minimal 8 karakter." };
      }
      const registeredUsers = await getRegisteredUsers();
      const idx = registeredUsers.findIndex(
        (u) => u.email.toLowerCase() === email.toLowerCase()
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
    setUser(null);
    setIsAuthenticated(false);
    setRememberMe(false);
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
  const verifyBiometric = async (_type: "face" | "fingerprint"): Promise<boolean> => {
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
      ru.user.id === updatedUser.id ? { ...ru, user: updatedUser } : ru
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
