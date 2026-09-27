import { AppInfoData, ChangelogRelease } from "../types";

export const DEFAULT_CHANGELOGS: ChangelogRelease[] = [
  {
    version: "2.1.0",
    date: "27 Sep 2026",
    isLatest: true,
    sections: [
      {
        id: "bug-fixes-2.1.0",
        title: "Bug Fixes & Perbaikan:",
        icon: "🐛",
        items: [
          {
            id: "fix-1",
            tag: "Fix",
            description: "Mengatasi crash saat membuka menu profil.",
          },
          {
            id: "fix-2",
            tag: "Fix",
            description: "Memperbaiki lag pada loading daftar transaksi.",
          },
          {
            id: "fix-3",
            tag: "Fix",
            description:
              "Masalah tombol 'Submit' tidak merespons di beberapa perangkat.",
          },
        ],
      },
      {
        id: "features-2.1.0",
        title: "Fitur & Peningkatan Baru:",
        icon: "🚀",
        items: [
          {
            id: "feat-1",
            tag: "New",
            description: "Mode Gelap (Dark Mode) kini tersedia.",
          },
          {
            id: "feat-2",
            tag: "Imp",
            description: "Sinkronisasi data 2x lebih cepat dari sebelumnya.",
          },
          {
            id: "feat-3",
            tag: "New",
            description:
              "Alert otomatis ketika pengeluaran mendekati batas budget.",
          },
        ],
      },
    ],
  },
  {
    version: "1.2.0",
    date: "10 Agu 2026",
    sections: [
      {
        id: "features-1.2.0",
        title: "Fitur & Peningkatan Baru:",
        icon: "🚀",
        items: [
          {
            id: "feat-1.2-1",
            tag: "New",
            description:
              "Pengelola Keuangan & Penjadwalan Aktivitas All-in-One.",
          },
          {
            id: "feat-1.2-2",
            tag: "New",
            description: "Marker Checklist penyelesaian aktivitas harian.",
          },
          {
            id: "feat-1.2-3",
            tag: "Imp",
            description: "Navigasi tab responsif dengan transisi seamless.",
          },
        ],
      },
      {
        id: "bug-fixes-1.2.0",
        title: "Bug Fixes & Perbaikan:",
        icon: "🐛",
        items: [
          {
            id: "fix-1.2-1",
            tag: "Fix",
            description:
              "Perbaikan format angka mata uang Rupiah pada kartu ringkasan.",
          },
        ],
      },
    ],
  },
];

export const DEFAULT_APP_INFO: AppInfoData = {
  appName: "Vorfine",
  version: "1.2.0",
  releaseDate: "27 Sep 2026",
  heroSubtitle:
    "Aplikasi ini dibuat untuk membantu pengguna dalam mengelola keuangan dan produktivitas harian secara terpadu.",
  aboutDescription:
    "Aplikasi ini dirancang untuk membantumu mengelola keuangan dan produktivitas harian secara lebih teratur dan efisien.",
  advantages: [
    {
      id: "adv-1",
      icon: "✨",
      title: "Fitur Utama:",
      description: "Pengelola Keuangan & Penjadwalan Aktivitas All-in-One.",
    },
    {
      id: "adv-2",
      icon: "⚡",
      title: "Performa Ringan & Cepat:",
      description: "Navigasi responsif dan seamless.",
    },
    {
      id: "adv-3",
      icon: "🔒",
      title: "Keamanan Data Terjamin:",
      description: "Penyimpanan data lokal & terenkripsi.",
    },
    {
      id: "adv-4",
      icon: "🎨",
      title: "Antarmuka Simpel & Intuitif:",
      description: "Desain modern yang mudah digunakan.",
    },
  ],
  features: [
    {
      id: "feat-sched",
      title: "Pembuatan Jadwal & Aktivitas Harian",
      icon: "calendar-outline",
    },
    {
      id: "feat-alarm",
      title: "Alarm & Notifikasi Pengingat",
      icon: "notifications-outline",
    },
    {
      id: "feat-checklist",
      title: "Marker Penyelesaian Aktivitas / Checklist",
      icon: "checkmark-circle-outline",
    },
    {
      id: "feat-cashflow",
      title: "Pencatatan Pemasukan & Pengeluaran",
      icon: "wallet-outline",
    },
    {
      id: "feat-budget",
      title: "Pembudgetan (Harian / Bulanan)",
      icon: "pie-chart-outline",
    },
    {
      id: "feat-alert",
      title: "Alert & Warning saat mendekati limit budget",
      icon: "alert-circle-outline",
    },
    {
      id: "feat-stats",
      title: "Grafik & Visualisasi Statistik Keuangan + Produktivitas",
      icon: "trending-up-outline",
    },
  ],
  changelogs: DEFAULT_CHANGELOGS,
};
