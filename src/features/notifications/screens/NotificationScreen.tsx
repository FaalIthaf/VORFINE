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
import {
  BorderRadius,
  Colors,
  MaxContentWidth,
  Spacing,
} from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { NotificationItem } from "@/types";

export const NotificationScreen: React.FC = () => {
  const router = useRouter();
  const {
    notifications,
    toggleReadNotification,
    deleteNotification,
  } = useApp();

  // State Checkbox Filter "Belum Dibaca"
  const [isUnreadOnly, setIsUnreadOnly] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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

    Alert.alert(item.category || "Detail Notifikasi", item.message, [
      {
        text: actionLabel,
        onPress: () => {
          toggleReadNotification(item.id);
          showFeedback("Status notifikasi diperbarui.");
        },
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          deleteNotification(item.id);
          showFeedback("Notifikasi dihapus.");
        },
      },
      { text: "Tutup", style: "cancel" },
    ]);
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
