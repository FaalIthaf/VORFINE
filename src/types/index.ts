export type ScheduleCategory =
  | "Rutinitas"
  | "Domestik"
  | "Pekerjaan"
  | "Keuangan";

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  category: ScheduleCategory;
  completed: boolean;
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
}

export type TabType = "home" | "finance" | "schedule" | "menu";
