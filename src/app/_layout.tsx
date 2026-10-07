import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "../context/AppContext";
import { AuthProvider, useAuth } from "../context/AuthContext";

/**
 * Auth Guard component:
 * - Prevents unauthenticated access to the dashboard and internal screens.
 * - Redirects new users to /auth/register and returning users to /auth/login.
 * - Redirects authenticated users away from login/register pages back to the dashboard.
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasRegisteredUsers } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const isAuthGroup = segments[0] === "auth";
  const authSubpage = segments[1];
  // Subpages like "fingerprint" and "face-id" can be viewed while authenticated
  const isLoginPageOrRegister =
    isAuthGroup &&
    (authSubpage === "login" ||
      authSubpage === "register" ||
      authSubpage === undefined);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isAuthGroup) {
      // Unauthenticated user → always go to Login page first
      router.replace("/auth/login" as any);
    } else if (isAuthenticated && isLoginPageOrRegister) {
      // Authenticated user trying to access login/register
      router.replace("/" as any);
    }
  }, [
    isAuthenticated,
    isLoading,
    isAuthGroup,
    isLoginPageOrRegister,
  ]);

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
                animation: "slide_from_right",
                contentStyle: { backgroundColor: "#F8F9FA" },
              }}
            />
          </AuthGuard>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
