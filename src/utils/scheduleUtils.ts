import { ScheduleItem } from "../types";

/**
 * Extracts the start time in minutes from midnight (0 - 1439).
 * Supports startTime (e.g. "05:00", "05.00", "5:00", "05.00 WIB", "23:00") and
 * fallback to extracting from time string (e.g. "05.00 - 06.00 WIB").
 */
export const getScheduleStartMinutes = (item: ScheduleItem): number => {
  if (item.startTime) {
    const match = item.startTime.match(/(\d{1,2})[:.](\d{1,2})/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      return hours * 60 + mins;
    }
  }

  if (item.time) {
    const match = item.time.match(/(\d{1,2})[:.](\d{1,2})/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      return hours * 60 + mins;
    }
  }

  return 9999;
};

/**
 * Extracts the end time in minutes from midnight (0 - 1439).
 */
export const getScheduleEndMinutes = (item: ScheduleItem): number => {
  if (item.endTime) {
    const match = item.endTime.match(/(\d{1,2})[:.](\d{1,2})/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      return hours * 60 + mins;
    }
  }

  if (item.time) {
    const matches = Array.from(item.time.matchAll(/(\d{1,2})[:.](\d{1,2})/g));
    if (matches.length > 1) {
      const match = matches[1];
      const hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      return hours * 60 + mins;
    }
  }

  return 9999;
};

/**
 * Comparator function to sort schedules in ascending chronological order
 * by start time (00:00 -> 23:59).
 */
export const sortSchedulesByTime = (
  a: ScheduleItem,
  b: ScheduleItem,
): number => {
  const startA = getScheduleStartMinutes(a);
  const startB = getScheduleStartMinutes(b);

  if (startA !== startB) {
    return startA - startB;
  }

  const endA = getScheduleEndMinutes(a);
  const endB = getScheduleEndMinutes(b);
  if (endA !== endB) {
    return endA - endB;
  }

  return (a.title || "").localeCompare(b.title || "");
};

/**
 * Comparator function to sort schedules chronologically across dates and times.
 */
export const sortSchedulesChronologically = (
  a: ScheduleItem,
  b: ScheduleItem,
): number => {
  if (a.dateKey && b.dateKey && a.dateKey !== b.dateKey) {
    return a.dateKey.localeCompare(b.dateKey);
  }
  return sortSchedulesByTime(a, b);
};
