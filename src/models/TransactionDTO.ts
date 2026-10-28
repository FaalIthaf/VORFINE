/**
 * Data Transfer Object (DTO) untuk Fitur Transaksi Keuangan (VORFÍNE)
 * Didesain berdasarkan kebutuhan data aplikasi pada sisi klien,
 * dengan mengabaikan field internal server yang tidak diperlukan.
 */

export type TransactionType = "income" | "expense";

export type TransactionStatus = "completed" | "pending" | "cancelled";

/**
 * Interface representasi data transaksi yang diterima dari API/Server
 */
export interface TransactionDTO {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  description?: string;
  status: TransactionStatus;
  balanceAfter?: number;
}

/**
 * Interface payload untuk membuat atau mencatat transaksi baru
 */
export interface CreateTransactionDTO {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  description?: string;
}

/**
 * Interface ringkasan statistik mutasi keuangan
 */
export interface TransactionSummaryDTO {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  period: string;
  transactionCount: number;
}

