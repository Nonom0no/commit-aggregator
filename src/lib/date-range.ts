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
      const start = toZonedTime(new Date(customFrom), TIMEZONE);
      const end = toZonedTime(new Date(customTo), TIMEZONE);
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