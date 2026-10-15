import { PeriodFilterMode, TransactionItem } from "../types";

export const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const MONTH_SHORT_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export const parseTransactionDate = (item: {
  date?: string;
  rawDate?: string;
  timestamp?: number;
}): Date => {
  // 1. Prioritas TERTINGGI: Periksa teks item.date
  // Karena ini adalah teks tanggal yang dilihat langsung oleh pengguna di kartu transaksi
  if (item.date) {
    // Format: "28 Sep 2026", "28 September 2026", "28 Sep 2026, 14:00 WIB"
    const match = item.date.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:,\s*(\d{1,2}):(\d{1,2}))?/);
    if (match) {
      const day = parseInt(match[1], 10);
      const mStr = match[2].toLowerCase();
      const year = parseInt(match[3], 10);
      const hours = match[4] ? parseInt(match[4], 10) : 0;
      const minutes = match[5] ? parseInt(match[5], 10) : 0;

      const monthMap: Record<string, number> = {
        jan: 0,
        januari: 0,
        feb: 1,
        februari: 1,
        mar: 2,
        maret: 2,
        apr: 3,
        april: 3,
        mei: 4,
        may: 4,
        jun: 5,
        juni: 5,
        jul: 6,
        juli: 6,
        agu: 7,
        agustus: 7,
        aug: 7,
        sep: 8,
        sept: 8,
        september: 8,
        okt: 9,
        oktober: 9,
        oct: 9,
        nov: 10,
        november: 10,
        des: 11,
        desember: 11,
        dec: 11,
      };

      if (monthMap[mStr] !== undefined) {
        return new Date(year, monthMap[mStr], day, hours, minutes);
      }
    }

    // Format ISO YYYY-MM-DD
    const isoMatch = item.date.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      return new Date(
        parseInt(isoMatch[1], 10),
        parseInt(isoMatch[2], 10) - 1,
        parseInt(isoMatch[3], 10),
      );
    }

    // Format DD/MM/YYYY
    const slashMatch = item.date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      return new Date(
        parseInt(slashMatch[3], 10),
        parseInt(slashMatch[2], 10) - 1,
        parseInt(slashMatch[1], 10),
      );
    }

    const d = new Date(item.date);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Periksa item.rawDate
  if (item.rawDate) {
    const isoMatch = item.rawDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      return new Date(
        parseInt(isoMatch[1], 10),
        parseInt(isoMatch[2], 10) - 1,
        parseInt(isoMatch[3], 10),
      );
    }
    const d = new Date(item.rawDate);
    if (!isNaN(d.getTime())) return d;
  }

  // 3. Periksa item.timestamp
  if (item.timestamp) {
    const d = new Date(item.timestamp);
    if (!isNaN(d.getTime())) return d;
  }

  return new Date();
};

export const filterTransactionsByPeriod = (
  transactions: TransactionItem[],
  mode: PeriodFilterMode,
  options?: {
    targetYear?: number;
    targetMonth?: number; // 0-indexed
    targetDay?: number;
    year?: number;
    month?: number;
    day?: number;
  },
): TransactionItem[] => {
  if (mode === "all") return transactions;

  const now = new Date();
  const year = options?.year ?? options?.targetYear ?? now.getFullYear();
  const month = options?.month ?? options?.targetMonth ?? now.getMonth();
  const day = options?.day ?? options?.targetDay ?? now.getDate();

  return transactions.filter((item) => {
    const itemDate = parseTransactionDate(item);
    const itemYear = itemDate.getFullYear();
    const itemMonth = itemDate.getMonth();
    const itemDay = itemDate.getDate();

    if (mode === "day") {
      return itemYear === year && itemMonth === month && itemDay === day;
    }
    if (mode === "month") {
      return itemYear === year && itemMonth === month;
    }
    if (mode === "year") {
      return itemYear === year;
    }
    return true;
  });
};

export const parseAmountToNumber = (amountStr: string): number => {
  const digits = amountStr.replace(/[^0-9]/g, "");
  if (!digits) return 0;
  // If ends with "00" from ",00", remove the decimal cents
  if (amountStr.includes(",00")) {
    return parseInt(digits.slice(0, -2), 10) || 0;
  }
  return parseInt(digits, 10) || 0;
};
