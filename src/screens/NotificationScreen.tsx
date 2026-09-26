import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilterBar } from "../components/NotificationFilterBar";
import { NotificationHeader } from "../components/NotificationHeader";
import { BorderRadius, Colors, MaxContentWidth, Spacing } from "../constants/theme";
import { NotificationItem } from "../types";

export const NotificationScreen: React.FC = () => {
  const router = useRouter();

  // State Checkbox Filter "Belum Dibaca"
  const [isUnreadOnly, setIsUnreadOnly] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Mock data notifikasi sesuai spesifikasi dan mock-up UI
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    // Notifikasi Belum Dibaca (Ditampilkan saat Checkbox DICENTANG - Layar Kiri)
    {
      id: "unread-1",
      message:
        "ALERT BUDGET: Pengeluaran Harian anda telah mencapai >=70 % dari pengaturan budget anda.",
      time: "09.22",
      isRead: false,
    },
    {
      id: "unread-2",
      message: "PENGINGAT JADWAL: Sarapan pagi jam 05.00 WIB.",
      time: "09.22",
      isRead: false,
    },
    {
      id: "unread-3",
      message:
        "ALERT BUDGET: Pengeluaran Bulanan anda telah mencapai >=70 % dari pengaturan budget anda.",
      time: "09.22",
      isRead: false,
    },
    {
      id: "unread-4",
      message:
        "ALERT BUDGET: Pengeluaran Harian anda telah mencapai >=70 % dari pengaturan budget anda.",
      time: "09.22",
      isRead: false,
    },
    {
      id: "unread-5",
      message:
        "ALERT BUDGET: Pengeluaran Tahunan anda telah mencapai >=70 % dari pengaturan budget anda.",
      time: "09.22",
      isRead: false,
    },

    // Notifikasi Sudah Dibaca (Ditampilkan saat Checkbox TIDAK DICENTANG - Layar Kanan)
    {
      id: "read-1",
      message:
        "ALERT BUDGET: Pengeluaran Harian anda telah mencapai >=70 % dari pengaturan budget anda.",
      time: "09.22",
      isRead: true,
    },
    {
      id: "read-2",
      message: "PENGINGAT JADWAL: Berangkat ke kantor jam 07.00 WIB.",
      time: "09.22",
      isRead: true,
    },
    {
      id: "read-3",
      message:
        "ALERT BUDGET: Pengeluaran Bulanan anda telah mencapai >=70 % dari pengaturan budget anda.",
      time: "09.22",
      isRead: true,
    },
    {
      id: "read-4",
      message:
        "ALERT BUDGET: Pengeluaran Harian anda telah mencapai >=70 % dari pengaturan budget anda.",
      time: "09.22",
      isRead: true,
    },
    {
      id: "read-5",
      message:
        "ALERT BUDGET: Pengeluaran Harian anda telah mencapai >=70 % dari pengaturan budget anda.",
      time: "09.22",
      isRead: true,
    },
  ]);

  const showFeedback = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("VORFÍNE", msg);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleToggleFilter = () => {
    setIsUnreadOnly((prev) => !prev);
  };

  const handleCardPress = (item: NotificationItem) => {
    const actionLabel = item.isRead
      ? "Tandai Belum Dibaca"
      : "Tandai Sudah Dibaca";

    Alert.alert(
      "Detail Notifikasi",
      item.message,
      [
        {
          text: actionLabel,
          onPress: () => {
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === item.id
                  ? { ...notif, isRead: !notif.isRead }
                  : notif,
              ),
            );
            showFeedback(`Status notifikasi diperbarui.`);
          },
        },
        { text: "Tutup", style: "cancel" },
      ],
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showFeedback("Daftar notifikasi diperbarui");
    }, 600);
  }, []);

  // Filter dinamis berdasarkan state Checkbox
  // isUnreadOnly === true -> hanya menampilkan notifikasi belum dibaca (isRead === false)
  // isUnreadOnly === false -> menampilkan riwayat notifikasi yang sudah dibaca (isRead === true)
  const displayedNotifications = useMemo(() => {
    if (isUnreadOnly) {
      return notifications.filter((notif) => !notif.isRead);
    } else {
      return notifications.filter((notif) => notif.isRead);
    }
  }, [notifications, isUnreadOnly]);

  // Skema background dinamis:
  // Checked: Mode Kiri (#D0D7D9 - abu-abu kebiruan gelap)
  // Unchecked: Mode Kanan (#FFFFFF - terang)
  const currentBackgroundColor = isUnreadOnly
    ? Colors.notificationBgDark
    : Colors.notificationBgLight;

  return (
    <View
      style={[
        styles.rootContainer,
        { backgroundColor: currentBackgroundColor },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Top Bar Header */}
      <NotificationHeader onBackPress={handleBack} />

      {/* Filter Checkbox "Belum Dibaca" */}
      <NotificationFilterBar
        isChecked={isUnreadOnly}
        onToggle={handleToggleFilter}
      />

      {/* Scrollable Notification List */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.responsiveWrapper}>
          {displayedNotifications.length > 0 ? (
            displayedNotifications.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onPress={() => handleCardPress(item)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isUnreadOnly
                  ? "Tidak ada notifikasi baru yang belum dibaca."
                  : "Tidak ada riwayat notifikasi tersimpan."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md + 4,
    paddingBottom: Spacing.xxl + 16,
  },
  responsiveWrapper: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BDC7C9",
    marginVertical: Spacing.lg,
  },
  emptyText: {
    color: "#5F7478",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default NotificationScreen;
