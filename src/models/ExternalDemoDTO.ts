/**
 * Interface representasi data dari External API untuk Tugas Pekan Demo (VORFÍNE)
 * Kriteria 1: Mengambil data dari External API dan memasukkannya ke dalam Object menggunakan Interface.
 */

export interface ExternalDemoDTO {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  description: string;
  sourceApi: string;
  isVerified: boolean;
}

export interface ExternalApiItemDTO {
  id: number | string;
  todo?: string;
  title?: string;
  name?: string;
  completed?: boolean;
  price?: number;
  amount?: number;
}
