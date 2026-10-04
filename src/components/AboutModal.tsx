import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { DEFAULT_APP_INFO, DEFAULT_CHANGELOGS } from "../data/appInfoData";
import { InfoScreen } from "../screens/InfoScreen";
import { AppInfoData, ChangelogRelease, TabType } from "../types";

export interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
  appInfo?: AppInfoData;
  changelogs?: ChangelogRelease[];
  currentProfileName?: string;
  onPressProfile?: () => void;
  onPressNotification?: () => void;
  activeNavTab?: TabType;
  onSelectNavTab?: (tab: TabType) => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  visible,
  onClose,
  appInfo = DEFAULT_APP_INFO,
  changelogs = DEFAULT_CHANGELOGS,
  currentProfileName = "Pengguna VORFÍNE",
  onPressProfile,
  onPressNotification,
  activeNavTab = "menu",
  onSelectNavTab,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafeContainer}>
        {/* Floating / Header Close Bar */}
        <View style={styles.topControlBar}>
          <Pressable
            style={({ pressed }) => [
              styles.dismissButton,
              pressed && styles.pressedState,
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Tutup Halaman Info"
          >
            <Ionicons name="chevron-down" size={20} color="#2C3E50" />
            <Text style={styles.dismissButtonText}>Tutup Info Aplikasi</Text>
          </Pressable>
        </View>

        {/* Embedded InfoScreen */}
        <View style={styles.screenWrapper}>
          <InfoScreen
            appInfo={appInfo}
            changelogs={changelogs}
            currentProfileName={currentProfileName}
            onPressProfile={onPressProfile}
            onPressNotification={onPressNotification}
            activeNavTab={activeNavTab}
            onSelectNavTab={(tab) => {
              if (tab !== "menu") {
                onClose();
              }
              onSelectNavTab?.(tab);
            }}
            showBottomNav={true}
            onClose={onClose}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalSafeContainer: {
    flex: 1,
    backgroundColor: "#538389",
  },
  topControlBar: {
    backgroundColor: "#538389",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  dismissButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.round,
  },
  dismissButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  screenWrapper: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  pressedState: {
    opacity: 0.7,
  },
});

export default AboutModal;
