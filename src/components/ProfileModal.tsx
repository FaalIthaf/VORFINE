import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
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
import { useAuth, RegisteredUser } from "../context/AuthContext";
import { Profile } from "../types";
import {
    loadSecureJSON,
    SECURE_KEYS,
} from "../utils/storage";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profiles: Profile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onAddProfile: (name: string) => void;
  onDeleteProfile?: (id: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  profiles,
  selectedProfileId,
  onSelectProfile,
  onAddProfile,
  onDeleteProfile,
}) => {
  const router = useRouter();
  const { logout, switchAccount } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  // Ganti Akun sub-modal state
  const [isSwitchAccountVisible, setIsSwitchAccountVisible] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<RegisteredUser[]>([]);

  // Load saved accounts when Ganti Akun popup opens
  useEffect(() => {
    if (isSwitchAccountVisible) {
      (async () => {
        const accounts = await loadSecureJSON<RegisteredUser[]>(
          SECURE_KEYS.REGISTERED_USERS,
          []
        );
        setSavedAccounts(accounts);
      })();
    }
  }, [isSwitchAccountVisible]);

  const handleCreate = () => {
    if (newProfileName.trim().length > 0) {
      onAddProfile(newProfileName.trim());
      setNewProfileName("");
      setIsAdding(false);
    }
  };

  const handleSelectProfile = (id: string) => {
    onSelectProfile(id);
    onClose();
  };

  const handleDeleteProfile = (profile: Profile) => {
    if (profiles.length <= 1) {
      Alert.alert("Perhatian", "Minimal harus ada satu profil.");
      return;
    }
    Alert.alert(
      "Hapus Profil",
      `Apakah Anda yakin ingin menghapus profil "${profile.name}"? Data yang tersimpan di profil ini akan dihapus.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            onDeleteProfile?.(profile.id);
          },
        },
      ]
    );
  };

  const handleSwitchToAccount = async (account: RegisteredUser) => {
    // Instant switch without requiring re-login
    setIsSwitchAccountVisible(false);
    onClose();
    const res = await switchAccount(account.email);
    if (!res.success) {
      Alert.alert("Gagal", res.message || "Gagal mengganti akun.");
    }
  };

  const handleAddNewAccount = () => {
    setIsSwitchAccountVisible(false);
    onClose();
    router.push("/auth/register" as any);
  };

  // Generate avatar initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.slice(0, 2) || "VF").toUpperCase();
  };

  return (
    <>
      {/* Main Profile Modal */}
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
                            isSelected && styles.profileItemSelected,
                            pressed && styles.pressedState,
                          ]}
                          onPress={() => handleSelectProfile(profile.id)}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: isSelected }}
                        >
                          <View style={styles.profileItemLeft}>
                            <View
                              style={[
                                styles.avatarCircle,
                                isSelected && styles.avatarCircleSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.avatarInitials,
                                  isSelected && styles.avatarInitialsSelected,
                                ]}
                              >
                                {getInitials(profile.name)}
                              </Text>
                            </View>
                            <View style={styles.profileTextCol}>
                              <Text
                                style={[
                                  styles.profileItemName,
                                  isSelected && styles.profileItemNameSelected,
                                ]}
                              >
                                {profile.name}
                              </Text>
                              {isSelected && (
                                <Text style={styles.profileActiveLabel}>
                                  Profil Aktif
                                </Text>
                              )}
                            </View>
                          </View>

                          <View style={styles.profileItemActions}>
                            {/* Delete Profile button (only shown if more than 1 profile) */}
                            {profiles.length > 1 && onDeleteProfile && (
                              <Pressable
                                hitSlop={8}
                                style={({ pressed }) => [
                                  styles.deleteProfileBtn,
                                  pressed && { opacity: 0.5 },
                                ]}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProfile(profile);
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={`Hapus profil ${profile.name}`}
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={18}
                                  color="#EF4444"
                                />
                              </Pressable>
                            )}

                            {/* Radio Button */}
                            <View
                              style={[
                                styles.radioOuter,
                                isSelected && styles.radioOuterSelected,
                              ]}
                            >
                              {isSelected && <View style={styles.radioInner} />}
                            </View>
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

                  {/* Ganti Akun Button (Center Aligned) */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.switchAccountBtn,
                      pressed && styles.pressedState,
                    ]}
                    onPress={() => setIsSwitchAccountVisible(true)}
                  >
                    <Ionicons name="swap-horizontal-outline" size={18} color="#1F4D47" />
                    <Text style={styles.switchAccountBtnText}>Ganti Akun</Text>
                  </Pressable>

                  {/* Logout Button */}
                  <Pressable
                    style={[styles.logoutBtn]}
                    onPress={async () => {
                      onClose();
                      await logout();
                      router.replace("/auth/login" as any);
                    }}
                  >
                    <Ionicons name="log-out-outline" size={16} color="#DC2626" />
                    <Text style={styles.logoutBtnText}>
                      Keluar (Logout)
                    </Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Ganti Akun Sub-Modal */}
      <Modal
        visible={isSwitchAccountVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSwitchAccountVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsSwitchAccountVisible(false)}>
          <View style={styles.switchAccountBackdrop}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.switchAccountModal}>
                {/* Header */}
                <View style={styles.switchAccountHeader}>
                  <View style={styles.switchAccountTitleRow}>
                    <Ionicons name="people-outline" size={22} color="#1F4D47" />
                    <Text style={styles.switchAccountTitle}>Ganti Akun</Text>
                  </View>
                  <Pressable
                    onPress={() => setIsSwitchAccountVisible(false)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={22} color="#64748B" />
                  </Pressable>
                </View>

                <Text style={styles.switchAccountSubtitle}>
                  Pilih akun yang tersimpan di perangkat ini
                </Text>

                {/* Saved Accounts List */}
                {savedAccounts.length > 0 ? (
                  <ScrollView
                    style={styles.accountsList}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                  >
                    {savedAccounts.map((account, index) => (
                      <Pressable
                        key={account.email}
                        style={({ pressed }) => [
                          styles.accountCard,
                          pressed && styles.accountCardPressed,
                        ]}
                        onPress={() => handleSwitchToAccount(account)}
                      >
                        <View style={styles.accountAvatarCircle}>
                          <Text style={styles.accountAvatarText}>
                            {account.user.avatar || getInitials(account.user.fullName)}
                          </Text>
                        </View>
                        <View style={styles.accountInfoCol}>
                          <Text style={styles.accountName} numberOfLines={1}>
                            {account.user.fullName}
                          </Text>
                          <Text style={styles.accountEmail} numberOfLines={1}>
                            {account.email}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#94A3B8"
                        />
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.noAccountsContainer}>
                    <Ionicons name="person-add-outline" size={36} color="#94A3B8" />
                    <Text style={styles.noAccountsText}>
                      Belum ada akun tersimpan di perangkat ini
                    </Text>
                  </View>
                )}

                {/* Bottom Actions */}
                <View style={styles.switchAccountActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.addAccountBtn,
                      pressed && styles.pressedState,
                    ]}
                    onPress={handleAddNewAccount}
                  >
                    <Ionicons name="person-add-outline" size={18} color={Colors.white} />
                    <Text style={styles.addAccountBtnText}>Buat Akun Baru</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.addExistingBtn,
                      pressed && styles.pressedState,
                    ]}
                    onPress={() => {
                      setIsSwitchAccountVisible(false);
                      onClose();
                      router.push("/auth/login" as any);
                    }}
                  >
                    <Ionicons name="log-in-outline" size={18} color="#1F4D47" />
                    <Text style={styles.addExistingBtnText}>Tambah Akun</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === "ios" ? 40 : Spacing.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 16,
    maxHeight: "80%",
  },
  indicatorContainer: {
    alignItems: "center",
    paddingTop: 2,
    marginBottom: Spacing.lg + 2,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
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
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  profileItemSelected: {
    backgroundColor: "#E8F5F3",
    borderBottomColor: "transparent",
    borderWidth: 1,
    borderColor: "#1F4D47",
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    backgroundColor: "#F8F9FA",
  },
  avatarCircleSelected: {
    backgroundColor: "#1F4D47",
    borderColor: "#1F4D47",
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  avatarInitialsSelected: {
    color: Colors.white,
  },
  profileTextCol: {
    flex: 1,
  },
  profileItemName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  profileItemNameSelected: {
    color: "#1F4D47",
    fontWeight: "700",
  },
  profileActiveLabel: {
    fontSize: 11,
    color: "#1F4D47",
    fontWeight: "600",
    marginTop: 1,
  },
  profileItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteProfileBtn: {
    padding: 4,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
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
    borderColor: "#1F4D47",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1F4D47",
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
    backgroundColor: "#1F4D47",
  },
  confirmButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
  pressedState: {
    opacity: 0.7,
  },

  // Ganti Akun button
  switchAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E8F5F3",
    borderWidth: 1,
    borderColor: "#B2DFDB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    marginTop: 14,
  },
  switchAccountBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F4D47",
    textAlign: "center",
  },

  // Logout button
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    marginTop: 10,
  },
  logoutBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#DC2626",
  },

  // ── Ganti Akun Sub-Modal ──────────────────────────────
  switchAccountBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  switchAccountModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 380,
    maxHeight: "75%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  switchAccountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  switchAccountTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchAccountTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F4D47",
  },
  switchAccountSubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    marginBottom: Spacing.lg,
  },
  accountsList: {
    marginBottom: Spacing.md,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFB",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  accountCardPressed: {
    backgroundColor: "#E8F5F3",
    borderColor: "#1F4D47",
  },
  accountAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1F4D47",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountAvatarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  accountInfoCol: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  accountEmail: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  noAccountsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    gap: 10,
  },
  noAccountsText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },
  switchAccountActions: {
    flexDirection: "row",
    gap: 10,
  },
  addAccountBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#1F4D47",
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  addAccountBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.white,
  },
  addExistingBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#E8F5F3",
    borderWidth: 1,
    borderColor: "#B2DFDB",
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  addExistingBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F4D47",
  },
});
