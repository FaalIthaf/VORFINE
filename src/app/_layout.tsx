import "@/utils/sensorPolyfill";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/features/auth";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

/**
 * Auth Guard component (Task 3: Session Protection):
 * - Memastikan aplikasi mengecek keberadaan token saat pertama kali dibuka.
 * - Jika tidak ada token yang valid / tidak terautentikasi, arahkan pengguna langsung ke halaman /login.
 * - Mencegah akses ke halaman utama/dashboard tanpa token yang sah.
 * - Mengembalikan pengguna terautentikasi yang mencoba mengakses halaman login/register kembali ke dashboard.
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const segs = segments as any;
  const firstSegment = (segs[0] as string | undefined) || "";
  const authSubpage = (segs[1] as string | undefined) || "";

  const isAuthGroup = firstSegment === "auth" || firstSegment === "login";
  // Subpages like "fingerprint" and "face-id" can be viewed while authenticated
  const isLoginPageOrRegister =
    firstSegment === "login" ||
    (firstSegment === "auth" &&
      (authSubpage === "login" ||
        authSubpage === "register" ||
        authSubpage === ""));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isAuthGroup) {
      // Tidak ada token / belum terautentikasi → arahkan langsung ke halaman login
      router.replace("/login" as any);
    } else if (isAuthenticated && isLoginPageOrRegister) {
      // Pengguna yang sudah terautentikasi → arahkan ke dashboard
      router.replace("/" as any);
    }
  }, [isAuthenticated, isLoading, isAuthGroup, isLoginPageOrRegister]);

  // Prevent flash of protected dashboard content before auth check completes or redirect fires
  if (isLoading || (!isAuthenticated && !isAuthGroup)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8F9FA",
        }}
      >
        <ActivityIndicator size="large" color="#1F4D47" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <StatusBar style="light" />
          <AuthGuard>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "none",
                contentStyle: { backgroundColor: "#F8F9FA" },
              }}
            >
              {/* Dashboard / Beranda Utama */}
              <Stack.Screen name="index" options={{ title: "Beranda" }} />

              {/* Fitur Utama */}
              <Stack.Screen name="finance" options={{ title: "Keuangan" }} />
              <Stack.Screen name="schedule" options={{ title: "Jadwal" }} />
              <Stack.Screen name="sensor" options={{ title: "Sensor Akselerometer" }} />
              <Stack.Screen name="expense" options={{ title: "Detail Pengeluaran" }} />
              <Stack.Screen name="income" options={{ title: "Detail Pemasukan" }} />
              <Stack.Screen name="notifications" options={{ title: "Notifikasi" }} />
              <Stack.Screen name="info" options={{ title: "Informasi Aplikasi" }} />

              {/* Autentikasi (Task 3: Session Protection & Route Guard) */}
              <Stack.Screen name="login" options={{ title: "Masuk Akun" }} />
              <Stack.Screen name="auth/login" options={{ title: "Masuk Akun" }} />
              <Stack.Screen name="auth/register" options={{ title: "Daftar Akun" }} />
              <Stack.Screen name="auth/fingerprint" options={{ title: "Verifikasi Sidik Jari" }} />
              <Stack.Screen name="auth/face-id" options={{ title: "Verifikasi Face ID" }} />
            </Stack>
          </AuthGuard>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
