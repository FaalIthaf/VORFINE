import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from "react-native";
import { BottomNavBar } from "../components/BottomNavBar";
import { Header } from "../components/Header";
import { BorderRadius, Colors, Spacing } from "../constants/theme";
import { DEFAULT_APP_INFO, DEFAULT_CHANGELOGS } from "../data/appInfoData";
import {
    AppAdvantage,
    AppInfoData,
    ChangelogItem,
    ChangelogRelease,
    ChangelogSection,
    TabType,
} from "../types";

export type InternalTabType = "about" | "changelog";

export interface InfoScreenProps {
  appInfo?: AppInfoData;
  changelogs?: ChangelogRelease[];
  currentProfileName?: string;
  onPressProfile?: () => void;
  onPressNotification?: () => void;
  hasUnreadNotification?: boolean;
  activeNavTab?: TabType;
  onSelectNavTab?: (tab: TabType) => void;
  showHeader?: boolean;
  showBottomNav?: boolean;
  onClose?: () => void;
}

export const InfoScreen: React.FC<InfoScreenProps> = ({
  appInfo = DEFAULT_APP_INFO,
  changelogs = DEFAULT_CHANGELOGS,
  currentProfileName = "Muhammad Ivan Fadholli",
  onPressProfile,
  onPressNotification,
  hasUnreadNotification = true,
  activeNavTab = "menu",
  onSelectNavTab,
  showHeader = true,
  showBottomNav = true,
  onClose,
}) => {
  // Tab internal: "Tentang Aplikasi" (about) atau "Riwayat Update" (changelog)
  const [internalTab, setInternalTab] = useState<InternalTabType>("about");

  // Versi changelog yang sedang dipilih (default: versi terbaru)
  const [selectedVersion, setSelectedVersion] = useState<string>(
    changelogs[0]?.version || appInfo.version,
  );

  // Cari data changelog yang sedang aktif
  const currentChangelog =
    changelogs.find((c) => c.version === selectedVersion) || changelogs[0];

  // Helper untuk rendering badge tag [Fix], [New], [Imp]
  const renderTagBadge = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    let badgeBg = "#E8ECEF";
    let badgeTextColor = "#475569";
    let badgeBorderColor = "#CBD5E1";

    if (normalizedTag.includes("fix") || normalizedTag.includes("bug")) {
      badgeBg = "#FEE2E2";
      badgeTextColor = "#DC2626";
      badgeBorderColor = "#FCA5A5";
    } else if (
      normalizedTag.includes("new") ||
      normalizedTag.includes("fitur")
    ) {
      badgeBg = "#DCFCE7";
      badgeTextColor = "#16A34A";
      badgeBorderColor = "#86EFAC";
    } else if (
      normalizedTag.includes("imp") ||
      normalizedTag.includes("tingkat")
    ) {
      badgeBg = "#E0F2FE";
      badgeTextColor = "#0284C7";
      badgeBorderColor = "#7DD3FC";
    }

    return (
      <View
        style={[
          styles.tagBadge,
          { backgroundColor: badgeBg, borderColor: badgeBorderColor },
        ]}
      >
        <Text style={[styles.tagBadgeText, { color: badgeTextColor }]}>
          [{tag}]
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#538389" />

      {/* A. Header / App Bar */}
      {showHeader && (
        <Header
          currentProfileName={currentProfileName}
          onPressProfile={onPressProfile || (() => {})}
          onPressNotification={onPressNotification || (() => {})}
          hasUnreadNotification={hasUnreadNotification}
        />
      )}

      {/* Modal Close Button (jika dijalankan sebagai modal) */}
      {onClose && (
        <View style={styles.modalBar}>
          <Pressable
            style={({ pressed }) => [
              styles.closeModalBtn,
              pressed && styles.pressedState,
            ]}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="#2C3E50" />
            <Text style={styles.closeModalText}>Tutup</Text>
          </Pressable>
        </View>
      )}

      {/* Konten Scrollable */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* B. Hero Section (Info Aplikasi) */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            {/* Logo Vorfine */}
            <View style={styles.heroLogoWrapper}>
              <Image
                source={require("../../assets/images/VORFINE.png")}
                style={styles.heroLogoImage}
                resizeMode="contain"
              />
            </View>

            {/* Nama & Versi Aplikasi */}
            <View style={styles.heroInfoWrapper}>
              <Text style={styles.appNameText}>{appInfo.appName}</Text>
              <Text style={styles.appVersionText}>
                Version {appInfo.version}
              </Text>
            </View>
          </View>

          {/* Garis Pembatas */}
          <View style={styles.heroDivider} />

          {/* Subtitle Ringkas */}
          <View style={styles.heroBottomSection}>
            <Text style={styles.heroAboutTitle}>Tentang Aplikasi</Text>
            <Text style={styles.heroSubtitleText}>{appInfo.heroSubtitle}</Text>
          </View>
        </View>

        {/* C. Tab Navigation Internal / Segmented Control */}
        <View style={styles.tabNavContainer}>
          <View style={styles.tabNavHeader}>
            <Text style={styles.tabNavLabel}>TAB NAVIGATION</Text>
          </View>

          <View style={styles.segmentedRow}>
            {/* Tab 1: Tentang Aplikasi */}
            <Pressable
              style={({ pressed }) => [
                styles.segmentButton,
                internalTab === "about" && styles.segmentButtonActive,
                pressed && styles.pressedState,
              ]}
              onPress={() => setInternalTab("about")}
              accessibilityRole="tab"
              accessibilityState={{ selected: internalTab === "about" }}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={internalTab === "about" ? Colors.white : "#538389"}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.segmentButtonText,
                  internalTab === "about" && styles.segmentButtonTextActive,
                ]}
              >
                Tentang Aplikasi
              </Text>
            </Pressable>

            {/* Tab 2: Riwayat Update */}
            <Pressable
              style={({ pressed }) => [
                styles.segmentButton,
                internalTab === "changelog" && styles.segmentButtonActive,
                pressed && styles.pressedState,
              ]}
              onPress={() => setInternalTab("changelog")}
              accessibilityRole="tab"
              accessibilityState={{ selected: internalTab === "changelog" }}
            >
              <Ionicons
                name="git-branch-outline"
                size={16}
                color={internalTab === "changelog" ? Colors.white : "#538389"}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.segmentButtonText,
                  internalTab === "changelog" && styles.segmentButtonTextActive,
                ]}
              >
                Riwayat Update
              </Text>
            </Pressable>
          </View>
        </View>

        {/* D. KONTEN TAB 1: 📌 TENTANG APLIKASI */}
        {internalTab === "about" && (
          <View style={styles.tabContentContainer}>
            {/* Header Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionEmoji}>📌</Text>
              <Text style={styles.sectionTitle}>TENTANG APLIKASI</Text>
            </View>

            {/* Deskripsi Aplikasi */}
            <View style={styles.descCard}>
              <Text style={styles.descText}>{appInfo.aboutDescription}</Text>
            </View>

            {/* Daftar Keunggulan */}
            <View style={styles.advantagesContainer}>
              <Text style={styles.subSectionTitle}>
                Keunggulan Utama Vorfine
              </Text>
              {appInfo.advantages.map((adv: AppAdvantage) => (
                <View key={adv.id} style={styles.advantageRow}>
                  <View style={styles.advIconBubble}>
                    <Text style={styles.advIconEmoji}>{adv.icon}</Text>
                  </View>
                  <View style={styles.advTextWrapper}>
                    <Text style={styles.advTitleText}>{adv.title}</Text>
                    <Text style={styles.advDescText}>{adv.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Fitur Utama Vorfine (All-in-One Checklist) */}
            <View style={styles.featuresCard}>
              <View style={styles.featuresHeaderRow}>
                <Ionicons name="sparkles" size={18} color="#538389" />
                <Text style={styles.featuresHeaderText}>
                  Fitur Unggulan All-in-One
                </Text>
              </View>

              <View style={styles.featuresGrid}>
                {appInfo.features.map((feat) => (
                  <View key={feat.id} style={styles.featureItemRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#538389"
                      style={styles.featureCheckIcon}
                    />
                    <Text style={styles.featureItemTitle}>{feat.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* E. KONTEN TAB 2: 🛠️ CATATAN UPDATE / CHANGELOG */}
        {internalTab === "changelog" && (
          <View style={styles.tabContentContainer}>
            {/* Header Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionEmoji}>🛠️</Text>
              <Text style={styles.sectionTitle}>
                CATATAN UPDATE / CHANGELOG
              </Text>
            </View>

            {/* Version Pills Switcher (Jika ada lebih dari 1 rilis) */}
            {changelogs.length > 1 && (
              <View style={styles.versionPillsContainer}>
                {changelogs.map((item) => {
                  const isSelected = item.version === currentChangelog.version;
                  return (
                    <Pressable
                      key={item.version}
                      style={[
                        styles.versionPill,
                        isSelected && styles.versionPillActive,
                      ]}
                      onPress={() => setSelectedVersion(item.version)}
                    >
                      <Text
                        style={[
                          styles.versionPillText,
                          isSelected && styles.versionPillTextActive,
                        ]}
                      >
                        v{item.version} {item.isLatest ? "★ Terbaru" : ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Versi Card Utama */}
            <View style={styles.versionReleaseCard}>
              <View style={styles.versionBadgeRow}>
                <Text style={styles.versionBadgeTitle}>
                  [ Versi {currentChangelog.version} ] — {currentChangelog.date}
                </Text>
                {currentChangelog.isLatest && (
                  <View style={styles.latestTag}>
                    <Text style={styles.latestTagText}>Terbaru</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardDivider} />

              {/* Loop Section Changelog (Bug Fixes & Fitur Baru) */}
              {currentChangelog.sections.map(
                (section: ChangelogSection, idx: number) => (
                  <View
                    key={section.id}
                    style={[
                      styles.changelogSectionWrapper,
                      idx > 0 && styles.sectionMarginTop,
                    ]}
                  >
                    {/* Judul Kategori (e.g. 🐛 Bug Fixes & Perbaikan:) */}
                    <View style={styles.changelogCategoryRow}>
                      <Text style={styles.categoryEmoji}>{section.icon}</Text>
                      <Text style={styles.categoryTitle}>{section.title}</Text>
                    </View>

                    {/* Daftar Item Perubahan */}
                    <View style={styles.changelogItemsList}>
                      {section.items.map((item: ChangelogItem) => (
                        <View key={item.id} style={styles.changelogItemRow}>
                          <Text style={styles.bulletDot}>•</Text>
                          {renderTagBadge(item.tag)}
                          <Text style={styles.itemDescriptionText}>
                            {item.description}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ),
              )}
            </View>

            {/* Info Footer Riwayat */}
            <View style={styles.changelogFooter}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#7F8C8D"
              />
              <Text style={styles.changelogFooterText}>
                Vorfine diperbarui secara berkala demi performa terbaik.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* F. Bottom Navigation Bar */}
      {showBottomNav && (
        <BottomNavBar
          activeTab={activeNavTab}
          onSelectTab={onSelectNavTab || (() => {})}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  modalBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  closeModalBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: "#EDF2F7",
  },
  closeModalText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E50",
    marginLeft: 4,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl + 10,
  },

  // B. Hero Section
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroLogoWrapper: {
    width: 105,
    height: 48,
    justifyContent: "center",
    alignItems: "flex-start",
    marginRight: Spacing.md,
  },
  heroLogoImage: {
    width: "100%",
    height: "100%",
  },
  heroInfoWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  appNameText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#2C3E50",
    letterSpacing: 0.3,
  },
  appVersionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#538389",
    marginTop: 2,
  },
  heroDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: Spacing.md,
  },
  heroBottomSection: {
    marginTop: 2,
  },
  heroAboutTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  heroSubtitleText: {
    fontSize: 13,
    color: "#556677",
    lineHeight: 19,
  },

  // C. Tab Navigation Internal
  tabNavContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  tabNavHeader: {
    paddingHorizontal: Spacing.sm,
    paddingTop: 4,
    paddingBottom: 6,
  },
  tabNavLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#538389",
    letterSpacing: 1.2,
  },
  segmentedRow: {
    flexDirection: "row",
    backgroundColor: "#EDF2F7",
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  segmentButtonActive: {
    backgroundColor: "#538389",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  tabIcon: {
    marginRight: 6,
  },
  segmentButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#538389",
  },
  segmentButtonTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },

  // Content Container
  tabContentContainer: {
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm + 4,
    paddingHorizontal: 2,
  },
  sectionEmoji: {
    fontSize: 17,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2C3E50",
    letterSpacing: 0.4,
  },

  // D. Tab 1 Content: Tentang Aplikasi
  descCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: "#538389",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: Spacing.md,
  },
  descText: {
    fontSize: 13.5,
    color: "#334155",
    lineHeight: 20,
    fontWeight: "500",
  },
  advantagesContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: Spacing.md,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 6,
  },
  advantageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  advIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  advIconEmoji: {
    fontSize: 16,
  },
  advTextWrapper: {
    flex: 1,
  },
  advTitleText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  advDescText: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 18,
  },

  // Fitur Lengkap Card
  featuresCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  featuresHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 8,
  },
  featuresHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E50",
    marginLeft: 6,
  },
  featuresGrid: {
    gap: 10,
  },
  featureItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureCheckIcon: {
    marginRight: 8,
  },
  featureItemTitle: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
    flex: 1,
  },

  // E. Tab 2 Content: Changelog
  versionPillsContainer: {
    flexDirection: "row",
    marginBottom: Spacing.sm + 2,
    gap: 8,
  },
  versionPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.round,
    backgroundColor: "#E2E8F0",
  },
  versionPillActive: {
    backgroundColor: "#538389",
  },
  versionPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  versionPillTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  versionReleaseCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  versionBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  versionBadgeTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: 0.2,
  },
  latestTag: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  latestTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: Spacing.md,
  },
  changelogSectionWrapper: {},
  sectionMarginTop: {
    marginTop: Spacing.md + 4,
  },
  changelogCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  changelogItemsList: {
    paddingLeft: 4,
    gap: 8,
  },
  changelogItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletDot: {
    fontSize: 14,
    color: "#64748B",
    marginRight: 6,
    marginTop: 1,
  },
  tagBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 7,
    marginTop: 1,
  },
  tagBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  itemDescriptionText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 19,
    fontWeight: "500",
  },
  changelogFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
  },
  changelogFooterText: {
    fontSize: 12,
    color: "#7F8C8D",
    marginLeft: 6,
    fontWeight: "500",
  },
  pressedState: {
    opacity: 0.7,
  },
});

export default InfoScreen;
