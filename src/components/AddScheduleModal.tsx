import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { ScheduleCategory, ScheduleItem } from "../types";
import { TimeWheelPicker } from "./TimeWheelPicker";

interface AddScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveSchedule: (schedule: Omit<ScheduleItem, "id" | "completed">) => void;
  defaultDateKey: string;
  defaultFormattedDate: string;
}

const CATEGORIES: ScheduleCategory[] = [
  "Rutinitas",
  "Domestik",
  "Pekerjaan",
  "Lainnya",
];

const REMINDER_OPTIONS = [
  "5 Menit Sebelum",
  "10 Menit Sebelum",
  "15 Menit Sebelum",
  "30 Menit Sebelum",
  "1 Jam Sebelum",
];

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  visible,
  onClose,
  onSaveSchedule,
  defaultDateKey,
  defaultFormattedDate,
}) => {
  const [scheduleName, setScheduleName] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ScheduleCategory>("Rutinitas");

  // Date & Time settings
  const [startTimeText, setStartTimeText] = useState("00.00 WIB");
  const [endTimeText, setEndTimeText] = useState("00.00 WIB");
  const [scheduleDateText, setScheduleDateText] =
    useState(defaultFormattedDate);
  const [timePickerTarget, setTimePickerTarget] = useState<
    "start" | "end" | null
  >(null);

  // Alarm & Reminders
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("10 Menit Sebelum");
  const [isReminderPickerOpen, setIsReminderPickerOpen] = useState(false);

  // Reset fields on close
  const handleClose = () => {
    setScheduleName("");
    setActivityDescription("");
    setSelectedCategory("Rutinitas");
    setIsReminderPickerOpen(false);
    setTimePickerTarget(null);
    onClose();
  };

  const handleSave = () => {
    const finalTitle = scheduleName.trim() || activityDescription.trim();
    if (!finalTitle) {
      Alert.alert("Perhatian", "Silakan masukkan nama atau jenis jadwal Anda.");
      return;
    }

    const timeRange = `${startTimeText} - ${endTimeText}`;

    onSaveSchedule({
      title: finalTitle,
      time: timeRange,
      category: selectedCategory,
      dateKey: defaultDateKey,
      alarmEnabled,
      reminderTime: alarmEnabled ? reminderTime : undefined,
      startTime: startTimeText,
      endTime: endTimeText,
    });

    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.bottomSheet}>
                {/* Drag Indicator Bar */}
                <View style={styles.indicatorContainer}>
                  <View style={styles.dragIndicator} />
                </View>

                {/* Title */}
                <Text style={styles.sheetTitle}>Tambah Jadwal Baru</Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {/* Field 1: Jadwal Saya */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Jadwal Saya</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Masukkan Jenis Jadwal"
                      placeholderTextColor="#98A2B3"
                      value={scheduleName}
                      onChangeText={setScheduleName}
                    />
                  </View>

                  {/* Field 2: Pengaturan Waktu */}
                  <View style={styles.fieldGroup}>
                    <View style={styles.timeSettingsRow}>
                      {/* Waktu Mulai */}
                      <View style={styles.timeCardCol}>
                        <Text style={styles.fieldSubLabel}>Waktu Mulai</Text>
                        <Pressable
                          style={({ pressed }) => [
                            styles.pickerCard,
                            pressed && styles.pressedState,
                          ]}
                          onPress={() => setTimePickerTarget("start")}
                          accessibilityRole="button"
                          accessibilityLabel={`Pilih Waktu Mulai. Waktu saat ini: ${startTimeText}`}
                        >
                          <Ionicons
                            name="time-outline"
                            size={18}
                            color={Colors.primary}
                            style={styles.cardIcon}
                          />
                          <Text style={styles.pickerCardText} numberOfLines={1}>
                            {startTimeText}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={14}
                            color={Colors.textPrimary}
                          />
                        </Pressable>
                      </View>

                      {/* Waktu Selesai */}
                      <View style={styles.timeCardCol}>
                        <Text style={styles.fieldSubLabel}>Waktu Selesai</Text>
                        <Pressable
                          style={({ pressed }) => [
                            styles.pickerCard,
                            pressed && styles.pressedState,
                          ]}
                          onPress={() => setTimePickerTarget("end")}
                          accessibilityRole="button"
                          accessibilityLabel={`Pilih Waktu Selesai. Waktu saat ini: ${endTimeText}`}
                        >
                          <Ionicons
                            name="time-outline"
                            size={18}
                            color={Colors.primary}
                            style={styles.cardIcon}
                          />
                          <Text style={styles.pickerCardText} numberOfLines={1}>
                            {endTimeText}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={14}
                            color={Colors.textPrimary}
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {/* Field 3: Jenis Aktivitas & Kategori */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Jenis Aktivitas</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Masukkan Aktivitas Anda"
                      placeholderTextColor="#98A2B3"
                      value={activityDescription}
                      onChangeText={setActivityDescription}
                    />

                    {/* Category Quick Chips */}
                    <View style={styles.categoryChipsRow}>
                      {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        return (
                          <Pressable
                            key={cat}
                            style={[
                              styles.categoryChip,
                              isSelected && styles.categoryChipSelected,
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                          >
                            <Text
                              style={[
                                styles.categoryChipText,
                                isSelected && styles.categoryChipTextSelected,
                              ]}
                            >
                              {cat}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Field 4: Alarm & Pengingat */}
                  <View style={styles.alarmSection}>
                    <View style={styles.alarmSwitchRow}>
                      <Text style={styles.alarmLabel}>Alarm Aktivitas</Text>
                      <Switch
                        value={alarmEnabled}
                        onValueChange={setAlarmEnabled}
                        trackColor={{ false: "#D0D5DD", true: "#D0D5D6" }}
                        thumbColor={Colors.white}
                      />
                    </View>

                    {alarmEnabled && (
                      <View style={styles.reminderRow}>
                        <Text style={styles.reminderLabel}>
                          Waktu Pengingat
                        </Text>
                        <Pressable
                          style={styles.reminderDropdown}
                          onPress={() =>
                            setIsReminderPickerOpen((prev) => !prev)
                          }
                        >
                          <Text style={styles.reminderDropdownText}>
                            {reminderTime}
                          </Text>
                        </Pressable>
                      </View>
                    )}

                    {/* Reminder Options Dropdown List */}
                    {alarmEnabled && isReminderPickerOpen && (
                      <View style={styles.reminderOptionsBox}>
                        {REMINDER_OPTIONS.map((opt) => (
                          <Pressable
                            key={opt}
                            style={[
                              styles.reminderOptionItem,
                              reminderTime === opt &&
                                styles.reminderOptionItemSelected,
                            ]}
                            onPress={() => {
                              setReminderTime(opt);
                              setIsReminderPickerOpen(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.reminderOptionText,
                                reminderTime === opt &&
                                  styles.reminderOptionTextSelected,
                              ]}
                            >
                              {opt}
                            </Text>
                            {reminderTime === opt && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={Colors.primary}
                              />
                            )}
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Field 5: Action Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.submitButton,
                      pressed && styles.pressedState,
                    ]}
                    onPress={handleSave}
                    accessibilityRole="button"
                    accessibilityLabel="Simpan Jadwal Baru"
                  >
                    <Text style={styles.submitButtonText}>
                      SIMPAN JADWAL BARU
                    </Text>
                  </Pressable>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>

          {/* Time Wheel Picker (Alarm Style Drum Picker) */}
          <TimeWheelPicker
            visible={timePickerTarget !== null}
            title={
              timePickerTarget === "start"
                ? "Pilih Waktu Mulai"
                : "Pilih Waktu Selesai"
            }
            initialTime={
              timePickerTarget === "start" ? startTimeText : endTimeText
            }
            onClose={() => setTimePickerTarget(null)}
            onConfirm={(formattedTime) => {
              if (timePickerTarget === "start") {
                setStartTimeText(formattedTime);
              } else {
                setEndTimeText(formattedTime);
              }
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    width: "100%",
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === "ios" ? 40 : Spacing.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: "90%",
  },
  indicatorContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  dragIndicator: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#344054",
  },
  sheetTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  fieldGroup: {
    marginBottom: Spacing.md + 2,
  },
  fieldLabel: {
    color: Colors.textPrimary,
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 6,
  },
  fieldSubLabel: {
    color: Colors.textPrimary,
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 13.5,
    color: Colors.textPrimary,
  },
  timeSettingsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  timeCardCol: {
    flex: 1,
  },
  pickerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  cardIcon: {
    marginRight: 6,
  },
  pickerCardText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  categoryChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    backgroundColor: "#F2F4F7",
    borderWidth: 1,
    borderColor: "#EAECF0",
  },
  categoryChipSelected: {
    backgroundColor: "#507B80",
    borderColor: "#507B80",
  },
  categoryChipText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#475467",
  },
  categoryChipTextSelected: {
    color: Colors.white,
  },
  alarmSection: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.xs,
  },
  alarmSwitchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  alarmLabel: {
    color: Colors.textPrimary,
    fontSize: 14.5,
    fontWeight: "700",
  },
  reminderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  reminderDropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: Colors.white,
    gap: 6,
  },
  reminderDropdownText: {
    fontSize: 12.5,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  reminderOptionsBox: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: BorderRadius.md,
    backgroundColor: "#FAFAFA",
    overflow: "hidden",
  },
  reminderOptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
  },
  reminderOptionItemSelected: {
    backgroundColor: "#F0F9FF",
  },
  reminderOptionText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  reminderOptionTextSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#507B80",
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  pressedState: {
    opacity: 0.7,
  },
});
