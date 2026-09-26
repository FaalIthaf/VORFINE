import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { NotificationItem } from "../types";

interface NotificationCardProps {
  item: NotificationItem;
  onPress?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  onPress,
}) => {
  // Pastikan format pesan terbungkus tanda kutip sesuai mock-up UI
  const formattedMessage =
    item.message.startsWith('"') && item.message.endsWith('"')
      ? item.message
      : `"${item.message}"`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Notifikasi: ${item.message}, waktu ${item.time}`}
    >
      {/* Header Card (Baris Atas: Notification di kiri, Timestamp di kanan) */}
      <View style={styles.cardHeaderRow}>
        <Text style={styles.notificationLabel}>Notification</Text>
        <Text style={styles.timeLabel}>{item.time}</Text>
      </View>

      {/* Body Card (Isi Pesan Sistem Terformat) */}
      <View style={styles.cardBody}>
        <Text style={styles.messageText}>{formattedMessage}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#42767D",
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: "#2D4E53",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  notificationLabel: {
    color: Colors.white,
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  timeLabel: {
    color: "#E2ECEE",
    fontSize: 12.5,
    fontWeight: "500",
  },
  cardBody: {
    marginTop: 2,
  },
  messageText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: 0.1,
  },
});

export default NotificationCard;
