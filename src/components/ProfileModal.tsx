import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { Profile } from "../types";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profiles: Profile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onAddProfile: (name: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  profiles,
  selectedProfileId,
  onSelectProfile,
  onAddProfile,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const handleCreate = () => {
    if (newProfileName.trim().length > 0) {
      onAddProfile(newProfileName.trim());
      setNewProfileName("");
      setIsAdding(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
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

                {/* Header */}
                <Text style={styles.sheetTitle}>Ganti Profil</Text>
                <Text style={styles.sheetSubtitle}>
                  Pilih profil untuk dikelola
                </Text>

                {/* Profile List */}
                <ScrollView style={styles.profileList} bounces={false}>
                  {profiles.map((profile) => {
                    const isSelected = profile.id === selectedProfileId;

                    return (
                      <Pressable
                        key={profile.id}
                        style={({ pressed }) => [
                          styles.profileItem,
                          pressed && styles.pressedState,
                        ]}
                        onPress={() => {
                          onSelectProfile(profile.id);
                          onClose();
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                      >
                        <View style={styles.profileItemLeft}>
                          <View style={styles.avatarCircle}>
                            <Ionicons
                              name="person-outline"
                              size={18}
                              color={Colors.textPrimary}
                            />
                          </View>
                          <Text style={styles.profileItemName}>
                            {profile.name}
                          </Text>
                        </View>

                        {/* Radio Button */}
                        <View
                          style={[
                            styles.radioOuter,
                            isSelected && styles.radioOuterSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Add Profile Section */}
                {isAdding ? (
                  <View style={styles.addInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Masukkan nama profil..."
                      placeholderTextColor={Colors.textSecondary}
                      value={newProfileName}
                      onChangeText={setNewProfileName}
                      autoFocus
                      onSubmitEditing={handleCreate}
                    />
                    <View style={styles.addButtonsRow}>
                      <Pressable
                        style={[styles.smallButton, styles.cancelButton]}
                        onPress={() => {
                          setIsAdding(false);
                          setNewProfileName("");
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Batal</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.smallButton, styles.confirmButton]}
                        onPress={handleCreate}
                      >
                        <Text style={styles.confirmButtonText}>Simpan</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    style={({ pressed }) => [
                      styles.addProfileButton,
                      pressed && styles.pressedState,
                    ]}
                    onPress={() => setIsAdding(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Buat Profil Baru"
                  >
                    <Ionicons name="add" size={20} color={Colors.primary} />
                    <Text style={styles.addProfileText}>Buat Profil Baru</Text>
                  </Pressable>
                )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
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
    maxHeight: "80%",
  },
  indicatorContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D0D7DE",
  },
  sheetTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sheetSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  profileList: {
    marginBottom: Spacing.lg,
  },
  profileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    backgroundColor: "#F8F9FA",
  },
  profileItemName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.successGreen,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.successGreen,
  },
  addProfileButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  addProfileText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
  addInputContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: "#F8F9FA",
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  addButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  smallButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  cancelButton: {
    backgroundColor: "#E5E8E8",
  },
  cancelButtonText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
  pressedState: {
    opacity: 0.7,
  },
});
