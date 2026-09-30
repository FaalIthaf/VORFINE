export type ScheduleCategory =
  | "Rutinitas"
  | "Domestik"
  | "Pekerjaan"
  | "Lainnya";

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  category: ScheduleCategory;
  completed: boolean;
  dateKey?: string;
  alarmEnabled?: boolean;
  reminderTime?: string;
  startTime?: string;
  endTime?: string;
}

export interface Profile {
  id: string;
  name: string;
  isCurrent: boolean;
}

export interface FinanceData {
  totalBalance: number;
  dailyExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthName: string;
  dailyBudget: number;
  monthlyBudget: number;
}

export type TabType = "home" | "finance" | "schedule" | "menu";

export type TransactionType = "income" | "expense";

export interface TransactionItem {
  id: string;
  title: string;
  note?: string;
  date: string;
  amount: string;
  balance: string;
  type: TransactionType;
  rawDate?: string;
  timestamp?: number;
  numericAmount?: number;
}

export type PeriodFilterMode = "all" | "day" | "month" | "year";

export interface NotificationItem {
  id: string;
  message: string;
  time: string;
  isRead: boolean;
  category?: string;
}

// App Info & Changelog Types
export interface ChangelogItem {
  id: string;
  tag: "Fix" | "New" | "Imp" | string;
  description: string;
}

export interface ChangelogSection {
  id: string;
  title: string;
  icon: string;
  items: ChangelogItem[];
}

export interface ChangelogRelease {
  version: string;
  date: string;
  isLatest?: boolean;
  sections: ChangelogSection[];
}

export interface AppAdvantage {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface AppFeatureItem {
  id: string;
  title: string;
  icon: string;
}

export interface AppInfoData {
  appName: string;
  version: string;
  releaseDate: string;
  heroSubtitle: string;
  aboutDescription: string;
  advantages: AppAdvantage[];
  features: AppFeatureItem[];
  changelogs: ChangelogRelease[];
}
