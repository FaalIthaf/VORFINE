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
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BorderRadius, Colors, Spacing } from "../../constants/theme";
import { RegisteredUser, useAuth } from "../../context/AuthContext";
import { Button, Input } from "../ui";

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (email: string) => void;
}

type WizardStep = 1 | 2 | 3 | "success";

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { findAccount, resetPassword } = useAuth();

  const [step, setStep] = useState<WizardStep>(1);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [targetAccount, setTargetAccount] = useState<RegisteredUser | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetAllState = () => {
    setStep(1);
    setEmailOrUsername("");
    setSecurityAnswer("");
    setNewPassword("");
    setConfirmPassword("");
    setTargetAccount(null);
    setErrorMsg("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetAllState();
    onClose();
  };

  // Mask email for security hint (e.g., "jo***@example.com")
  const maskEmail = (email: string) => {
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    const maskedName =
      name.length > 2
        ? name.slice(0, 2) + "*".repeat(name.length - 2)
        : name.slice(0, 1) + "*";
    return `${maskedName}@${domain}`;
  };

  // Step 1: Find Account
  const handleFindAccount = async () => {
    if (!emailOrUsername.trim()) {
      setErrorMsg("Masukkan email atau username terdaftar.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const found = await findAccount(emailOrUsername.trim());
      if (!found) {
        setErrorMsg("Akun tidak ditemukan. Periksa kembali email atau username Anda.");
        return;
      }
      setTargetAccount(found);
      setStep(2);
    } catch {
      setErrorMsg("Terjadi kesalahan saat mencari akun.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Security Verification
  const handleVerifySecurity = () => {
    if (!securityAnswer.trim()) {
      setErrorMsg("Masukkan nama lengkap profil akun Anda.");
      return;
    }

    if (!targetAccount) return;

    const expectedName = targetAccount.user.fullName.trim().toLowerCase();
    const inputName = securityAnswer.trim().toLowerCase();

    if (inputName !== expectedName) {
      setErrorMsg("Jawaban verifikasi tidak cocok dengan data profil terdaftar.");
      return;
    }

    setErrorMsg("");
    setStep(3);
  };

  // Step 3: Set New Password
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setErrorMsg("Kata sandi baru wajib diisi.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!targetAccount) return;

    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await resetPassword(targetAccount.email, newPassword);
      if (res.success) {
        setStep("success");
      } else {
        setErrorMsg(res.message || "Gagal mengatur ulang kata sandi.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan teknis. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    const email = targetAccount?.email || "";
    handleClose();
    if (onSuccess && email) {
      onSuccess(email);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
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
              <View style={styles.modalCard}>
                {/* Header */}
                <View style={styles.headerRow}>
                  <View style={styles.headerLeft}>
                    <View style={styles.headerIconCircle}>
                      <Ionicons name="key-outline" size={20} color="#1F4D47" />
                    </View>
                    <Text style={styles.headerTitle}>Atur Ulang Kata Sandi</Text>
                  </View>
                  <Pressable onPress={handleClose} hitSlop={8} style={styles.closeBtn}>
                    <Ionicons name="close" size={22} color="#64748B" />
                  </Pressable>
                </View>

                {/* Wizard Steps Indicator (if not in success screen) */}
                {step !== "success" && (
                  <View style={styles.stepIndicatorContainer}>
                    <View style={styles.stepRow}>
                      {[
                        { num: 1, label: "Cari Akun" },
                        { num: 2, label: "Verifikasi" },
                        { num: 3, label: "Sandi Baru" },
                      ].map((s, index) => {
                        const currentNum = step as number;
                        const isCompleted = currentNum > s.num;
                        const isActive = currentNum === s.num;

                        return (
                          <React.Fragment key={s.num}>
                            <View style={styles.stepItem}>
                              <View
                                style={[
                                  styles.stepCircle,
                                  isCompleted && styles.stepCircleCompleted,
                                  isActive && styles.stepCircleActive,
                                ]}
                              >
                                {isCompleted ? (
                                  <Ionicons name="checkmark" size={13} color={Colors.white} />
                                ) : (
                                  <Text
                                    style={[
                                      styles.stepNumText,
                                      isActive && styles.stepNumTextActive,
                                    ]}
                                  >
                                    {s.num}
                                  </Text>
                                )}
                              </View>
                              <Text
                                style={[
                                  styles.stepLabel,
                                  (isActive || isCompleted) && styles.stepLabelActive,
                                ]}
                              >
                                {s.label}
                              </Text>
                            </View>
                            {index < 2 && (
                              <View
                                style={[
                                  styles.stepConnector,
                                  currentNum > index + 1 && styles.stepConnectorCompleted,
                                ]}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </View>
                  </View>
                )}

                <ScrollView
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {/* Global Error Banner */}
                  {errorMsg ? (
                    <View style={styles.errorAlert}>
                      <Ionicons name="alert-circle" size={16} color="#DC2626" />
                      <Text style={styles.errorAlertText}>{errorMsg}</Text>
                    </View>
                  ) : null}

                  {/* ── STEP 1: Cari Akun ───────────────────────────────── */}
                  {step === 1 && (
                    <View style={styles.stepContent}>
                      <Text style={styles.stepHeading}>Langkah 1: Temukan Akun</Text>
                      <Text style={styles.stepDescription}>
                        Masukkan alamat email atau nama username yang terdaftar di akun VORFÍNE Anda.
                      </Text>

                      <Input
                        label="Email atau Username"
                        placeholder="contoh@vorfine.com"
                        value={emailOrUsername}
                        onChangeText={(txt) => {
                          setEmailOrUsername(txt);
                          if (errorMsg) setErrorMsg("");
                        }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        leftIcon={<Ionicons name="mail-outline" size={18} color="#94A3B8" />}
                      />

                      <Button
                        title="Cari & Lanjutkan"
                        onPress={handleFindAccount}
                        loading={isLoading}
                        size="md"
                        rightIcon={
                          <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                        }
                        style={styles.actionBtn}
                      />
                    </View>
                  )}

                  {/* ── STEP 2: Verifikasi Keamanan ─────────────────────── */}
                  {step === 2 && targetAccount && (
                    <View style={styles.stepContent}>
                      <Text style={styles.stepHeading}>Langkah 2: Verifikasi Identitas</Text>
                      <Text style={styles.stepDescription}>
                        Untuk memastikan kepemilikan akun, silakan verifikasi data identitas profil Anda.
                      </Text>

                      {/* Account Found Preview Card */}
                      <View style={styles.accountFoundCard}>
                        <View style={styles.accountFoundIconCircle}>
                          <Ionicons name="shield-checkmark" size={20} color="#1F4D47" />
                        </View>
                        <View style={styles.accountFoundInfo}>
                          <Text style={styles.accountFoundTitle}>Akun Ditemukan</Text>
                          <Text style={styles.accountFoundEmail}>
                            {maskEmail(targetAccount.email)}
                          </Text>
                        </View>
                      </View>

                      <Input
                        label="Pertanyaan: Siapa nama lengkap pemilik akun ini?"
                        placeholder="Masukkan nama lengkap Anda..."
                        value={securityAnswer}
                        onChangeText={(txt) => {
                          setSecurityAnswer(txt);
                          if (errorMsg) setErrorMsg("");
                        }}
                        helperText="Sesuai nama profil yang Anda daftarkan."
                        leftIcon={<Ionicons name="person-outline" size={18} color="#94A3B8" />}
                      />

                      <View style={styles.btnRow}>
                        <Button
                          title="Kembali"
                          variant="outline"
                          onPress={() => {
                            setErrorMsg("");
                            setStep(1);
                          }}
                          size="md"
                          style={styles.backBtn}
                        />
                        <Button
                          title="Verifikasi"
                          onPress={handleVerifySecurity}
                          size="md"
                          style={styles.nextBtn}
                          rightIcon={
                            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.white} />
                          }
                        />
                      </View>
                    </View>
                  )}

                  {/* ── STEP 3: Atur Sandi Baru ─────────────────────────── */}
                  {step === 3 && targetAccount && (
                    <View style={styles.stepContent}>
                      <Text style={styles.stepHeading}>Langkah 3: Kata Sandi Baru</Text>
                      <Text style={styles.stepDescription}>
                        Buat kata sandi baru yang aman untuk akun Anda (minimal 8 karakter).
                      </Text>

                      <Input
                        label="Kata Sandi Baru"
                        placeholder="Minimal 8 karakter"
                        value={newPassword}
                        onChangeText={(txt) => {
                          setNewPassword(txt);
                          if (errorMsg) setErrorMsg("");
                        }}
                        isPassword
                        leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />}
                      />

                      <Input
                        label="Konfirmasi Kata Sandi Baru"
                        placeholder="Ulangi kata sandi baru"
                        value={confirmPassword}
                        onChangeText={(txt) => {
                          setConfirmPassword(txt);
                          if (errorMsg) setErrorMsg("");
                        }}
                        isPassword
                        leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color="#94A3B8" />}
                      />

                      <View style={styles.btnRow}>
                        <Button
                          title="Kembali"
                          variant="outline"
                          onPress={() => {
                            setErrorMsg("");
                            setStep(2);
                          }}
                          size="md"
                          style={styles.backBtn}
                        />
                        <Button
                          title="Simpan Sandi"
                          onPress={handleResetPassword}
                          loading={isLoading}
                          size="md"
                          style={styles.nextBtn}
                          rightIcon={
                            <Ionicons name="save-outline" size={16} color={Colors.white} />
                          }
                        />
                      </View>
                    </View>
                  )}

                  {/* ── STEP SUCCESS: Selesai ───────────────────────────── */}
                  {step === "success" && (
                    <View style={styles.successContent}>
                      <View style={styles.successIconCircle}>
                        <Ionicons name="checkmark-circle" size={54} color="#1F4D47" />
                      </View>
                      <Text style={styles.successTitle}>Kata Sandi Diperbarui!</Text>
                      <Text style={styles.successSubtitle}>
                        Kata sandi baru Anda telah berhasil disimpan. Silakan masuk menggunakan kata sandi yang baru dibuat.
                      </Text>

                      <Button
                        title="Masuk Sekarang"
                        onPress={handleFinish}
                        size="md"
                        rightIcon={
                          <Ionicons name="log-in-outline" size={18} color={Colors.white} />
                        }
                        style={styles.actionBtn}
                      />
                    </View>
                  )}
                </ScrollView>
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
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  keyboardView: {
    width: "100%",
    maxWidth: 420,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.xl,
    width: "100%",
    maxHeight: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5F3",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F4D47",
  },
  closeBtn: {
    padding: 4,
  },

  // Wizard Step Progress Indicator
  stepIndicatorContainer: {
    backgroundColor: "#F8FAFC",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepItem: {
    alignItems: "center",
    gap: 4,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: "#1F4D47",
  },
  stepCircleCompleted: {
    backgroundColor: "#10B981",
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  stepNumTextActive: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  stepLabelActive: {
    color: "#1F4D47",
    fontWeight: "700",
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepConnectorCompleted: {
    backgroundColor: "#10B981",
  },

  scrollContent: {
    paddingBottom: Spacing.xs,
  },
  stepContent: {
    paddingTop: 2,
  },
  stepHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },

  accountFoundCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: 12,
  },
  accountFoundIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  accountFoundInfo: {
    flex: 1,
  },
  accountFoundTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },
  accountFoundEmail: {
    fontSize: 13,
    color: "#15803D",
    marginTop: 2,
  },

  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorAlertText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 12.5,
    fontWeight: "500",
  },

  actionBtn: {
    marginTop: Spacing.md,
  },
  btnRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },

  // Success view
  successContent: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8F5F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1F4D47",
    marginBottom: 6,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
});

