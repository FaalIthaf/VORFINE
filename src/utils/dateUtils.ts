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

export const parseTransactionDate = (item: TransactionItem): Date => {
  if (item.timestamp) {
    const d = new Date(item.timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  if (item.rawDate) {
    const d = new Date(item.rawDate);
    if (!isNaN(d.getTime())) return d;
  }
  if (item.date) {
    const d = new Date(item.date);
    if (!isNaN(d.getTime())) return d;

    // Parse format like "1 Sep 2026" or "29 Sep 2026, 23:15 WIB"
    const match = item.date.match(/(\d+)\s+([A-Za-z]+)\s+(\d{4})/);
    if (match) {
      const day = parseInt(match[1], 10);
      const mStr = match[2].toLowerCase();
      const year = parseInt(match[3], 10);

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

      const monthIndex = monthMap[mStr] ?? 8;
      return new Date(year, monthIndex, day);
    }
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
