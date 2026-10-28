/**
 * Data Transfer Object (DTO) untuk Program / Rencana Finansial & Produktivitas (VORFÍNE)
 * Didesain berdasarkan kebutuhan data aplikasi pada sisi klien,
 * dengan mengabaikan field internal server yang tidak diperlukan.
 */

export type ProgramCategory = "budget" | "savings" | "productivity" | "general";

export type ProgramStatus = "active" | "completed" | "draft" | "archived";

/**
 * Interface representasi data program/rencana anggaran VORFÍNE
 */
export interface ProgramDTO {
  id: string;
  name: string;
  description: string;
  category: ProgramCategory;
  status: ProgramStatus;
  targetAmount?: number;
  currentAmount?: number;
  startDate: string;
  endDate?: string;
  progress?: number;
}

/**
 * Interface payload untuk membuat program baru
 */
export interface CreateProgramDTO {
  name: string;
  description: string;
  category: ProgramCategory;
  targetAmount?: number;
  startDate: string;
  endDate?: string;
}

