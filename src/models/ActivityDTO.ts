/**
 * Data Transfer Object (DTO) untuk Fitur Aktivitas & Jadwal Harian (VORFÍNE)
 * Didesain berdasarkan kebutuhan data aplikasi pada sisi klien,
 * dengan mengabaikan field internal server yang tidak diperlukan.
 */

export type ActivityCategory =
  | "Rutinitas"
  | "Domestik"
  | "Pekerjaan"
  | "Keuangan"
  | "Lainnya";

export type ActivityStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

/**
 * Interface representasi data aktivitas/jadwal harian
 */
export interface ActivityDTO {
  id: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  date: string;
  time: string;
  completed: boolean;
  status: ActivityStatus;
  reminderEnabled?: boolean;
}

/**
 * Interface payload untuk membuat jadwal aktivitas baru
 */
export interface CreateActivityDTO {
  title: string;
  description?: string;
  category: ActivityCategory;
  date: string;
  time: string;
  reminderEnabled?: boolean;
}

