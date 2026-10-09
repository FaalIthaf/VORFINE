import { useRouter } from "expo-router";
import { InfoScreen } from "@/features/dashboard";

export default function InfoRoute() {
  const router = useRouter();

  return (
    <InfoScreen
      activeNavTab="menu"
      onSelectNavTab={(tab) => {
        if (tab === "home") {
          router.replace("/" as any);
        } else if (tab === "finance") {
          router.push("/income" as any);
        }
      }}
      onPressNotification={() => router.push("/notifications" as any)}
      onClose={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/" as any);
        }
      }}
    />
  );
}
