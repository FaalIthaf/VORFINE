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
    biometricsEnabled?: boolean;
    smartNotifications?: boolean;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  verifyBiometric: (type: "fingerprint" | "face") => Promise<boolean>;
  updateProfile: (updated: Partial<User>) => Promise<void>;
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

  // ─── Load saved session and registered users on mount ────────────
  useEffect(() => {
    (async () => {
      try {
        const registeredUsers = await getRegisteredUsers();
        setHasRegisteredUsers(registeredUsers.length > 0);

        // Check if an encrypted session exists in SecureStore
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
          // No valid session — user must authenticate
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
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const trimmedInput = emailOrUsername.trim().toLowerCase();
      if (!trimmedInput || !password.trim()) {
        return {
          success: false,
          message: "Email atau username dan kata sandi wajib diisi.",
        };
      }

      // Look up registered users in SecureStore
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

      // Save encrypted session token in SecureStore
      await saveSession(activeUser, remMe);

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Register ─────────────────────────────────────────────────────
  const register = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    biometricsEnabled?: boolean;
    smartNotifications?: boolean;
  }): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
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

      // Generate dynamic avatar initials from user's full name
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
        biometricsEnabled: data.biometricsEnabled ?? true,
        smartNotifications: data.smartNotifications ?? true,
        sensor3DActive: true,
        encryptionStandard: "AES-256",
        securitySessionActive: true,
      };

      // Persist to registered users in SecureStore
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

      // Automatically authenticate and save session
      setUser(newUser);
      setIsAuthenticated(true);
      setRememberMe(true);
      await saveSession(newUser, true);

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────
  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setRememberMe(false);
    // Explicitly delete session token from SecureStore
    await deleteSecure(SECURE_KEYS.SESSION_TOKEN);
  };

  // ─── Toggle Biometrics ────────────────────────────────────────────
  const toggleBiometrics = async (enabled: boolean) => {
    if (user) {
      const updated = { ...user, biometricsEnabled: enabled };
      setUser(updated);
      await updateRegisteredUser(updated);
      await saveSession(updated, rememberMe);
    }
  };

  // ─── Verify Biometric ─────────────────────────────────────────────
  const verifyBiometric = async (
    type: "fingerprint" | "face"
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (user) {
      const updated = { ...user, securitySessionActive: true };
      setUser(updated);
      await saveSession(updated, rememberMe);
      return true;
    }

    // If logging in via biometric shortcut
    const registeredUsers = await getRegisteredUsers();
    const bioUser =
      registeredUsers.find((u) => u.user.biometricsEnabled) ||
      registeredUsers[0];

    if (bioUser) {
      const activeUser = { ...bioUser.user, securitySessionActive: true };
      setUser(activeUser);
      setIsAuthenticated(true);
      setRememberMe(true);
      await saveSession(activeUser, true);
      return true;
    }

    return false;
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

  // ─── Helper: update user data in registered users list ────────────
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
        toggleBiometrics,
        verifyBiometric,
        updateProfile,
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
