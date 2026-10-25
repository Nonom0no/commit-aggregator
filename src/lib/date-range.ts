import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { id } from "date-fns/locale";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

const TIMEZONE = "Asia/Jakarta";

export type DatePreset = "today" | "yesterday" | "last7" | "custom";

export interface DateRange {
  since: string;
  until: string;
  label: string;
}

function toISOWithOffset(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function formatLabel(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "dd MMM yyyy", { locale: id });
}

function formatLabelRange(from: Date, to: Date): string {
  const fromStr = formatInTimeZone(from, TIMEZONE, "dd MMM yyyy", { locale: id });
  const toStr = formatInTimeZone(to, TIMEZONE, "dd MMM yyyy", { locale: id });
  return fromStr === toStr ? fromStr : `${fromStr} – ${toStr}`;
}

/** Parse a YYYY-MM-DD string as a local date in the target timezone (not UTC) */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  // Create date at noon in the target timezone to avoid DST edge cases
  // This is interpreted as local time in the timezone
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function getPresetRange(preset: DatePreset, customFrom?: string, customTo?: string): DateRange {
  const now = new Date();
  const today = toZonedTime(now, TIMEZONE);

  switch (preset) {
    case "today": {
      const start = startOfDay(today);
      const end = endOfDay(today);
      return {
        since: toISOWithOffset(start),
        until: toISOWithOffset(end),
        label: formatLabel(start),
      };
    }
    case "yesterday": {
      const yesterday = subDays(today, 1);
      const start = startOfDay(yesterday);
      const end = endOfDay(yesterday);
      return {
        since: toISOWithOffset(start),
        until: toISOWithOffset(end),
        label: formatLabel(start),
      };
    }
    case "last7": {
      const sevenDaysAgo = subDays(today, 6);
      const start = startOfDay(sevenDaysAgo);
      const end = endOfDay(today);
      return {
        since: toISOWithOffset(start),
        until: toISOWithOffset(end),
        label: formatLabelRange(start, end),
      };
    }
    case "custom": {
      if (!customFrom || !customTo) {
        throw new Error("Rentang kustom memerlukan customFrom dan customTo");
      }
      const start = toZonedTime(parseLocalDate(customFrom), TIMEZONE);
      const end = toZonedTime(parseLocalDate(customTo), TIMEZONE);
      const startOfDayDate = startOfDay(start);
      const endOfDayDate = endOfDay(end);
      return {
        since: toISOWithOffset(startOfDayDate),
        until: toISOWithOffset(endOfDayDate),
        label: formatLabelRange(startOfDayDate, endOfDayDate),
      };
    }
  }
}

export function getDefaultRange(): DateRange {
  return getPresetRange("today");
}