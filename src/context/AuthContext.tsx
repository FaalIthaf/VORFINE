import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types";

const AUTH_STORAGE_KEY = "vorfine_user_auth_state_v1";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
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

const DEFAULT_USER: User = {
  id: "usr_01",
  fullName: "Muhammad Ivan Fadholli",
  email: "contoh@vorfine.com",
  phone: "+62 812-9876-5432",
  role: "Warga Terverifikasi",
  avatar: "MF",
  biometricsEnabled: true,
  smartNotifications: true,
  sensor3DActive: true,
  encryptionStandard: "AES-256",
  securitySessionActive: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load saved session on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.user) {
            setUser(parsed.user);
            setIsAuthenticated(parsed.isAuthenticated ?? true);
            setRememberMe(parsed.rememberMe ?? true);
          }
        }
      } catch (err) {
        console.warn("Failed to load auth session:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveAuthSession = async (updatedUser: User | null, isAuth: boolean, rem: boolean) => {
    try {
      if (rem && updatedUser) {
        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ user: updatedUser, isAuthenticated: isAuth, rememberMe: rem })
        );
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (err) {
      console.warn("Failed to save auth session:", err);
    }
  };

  const login = async (
    email: string,
    password: string,
    remMe: boolean = true
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      // Simulate validation / authentication delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (!email.trim() || !password.trim()) {
        return { success: false, message: "Email dan kata sandi wajib diisi." };
      }

      const activeUser: User = user
        ? { ...user, email }
        : {
            ...DEFAULT_USER,
            email,
          };

      setUser(activeUser);
      setIsAuthenticated(true);
      setRememberMe(remMe);
      await saveAuthSession(activeUser, true, remMe);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

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

      if (!data.fullName.trim() || !data.email.trim() || !data.password.trim()) {
        return {
          success: false,
          message: "Lengkapi semua data pendaftaran dengan benar.",
        };
      }

      // Generate avatar initials from name
      const initials = data.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      const newUser: User = {
        id: `usr_${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || "+62 812-xxxx-xxxx",
        role: "Warga Terverifikasi",
        avatar: initials || "VF",
        biometricsEnabled: data.biometricsEnabled ?? true,
        smartNotifications: data.smartNotifications ?? true,
        sensor3DActive: true,
        encryptionStandard: "AES-256",
        securitySessionActive: true,
      };

      setUser(newUser);
      setIsAuthenticated(true);
      await saveAuthSession(newUser, true, true);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const toggleBiometrics = async (enabled: boolean) => {
    if (user) {
      const updated = { ...user, biometricsEnabled: enabled };
      setUser(updated);
      await saveAuthSession(updated, isAuthenticated, rememberMe);
    }
  };

  const verifyBiometric = async (type: "fingerprint" | "face"): Promise<boolean> => {
    // Simulate biometric hardware scanner verification
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (user) {
      setUser({ ...user, securitySessionActive: true });
    }
    return true;
  };

  const updateProfile = async (updated: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updated };
      setUser(newUser);
      await saveAuthSession(newUser, isAuthenticated, rememberMe);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        rememberMe,
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

