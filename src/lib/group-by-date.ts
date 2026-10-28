import { formatInTimeZone } from "date-fns-tz";
import type { CommitItem } from "@/types/commit";

const TIMEZONE = "Asia/Jakarta";

export type GroupBy = "date" | "repo" | "none";

export interface DateGroup {
  dateKey: string; // yyyy-MM-dd (WIB)
  label: string; // mis. "Jumat, 23 Okt 2026"
  commits: CommitItem[];
}

const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
const MONTH_NAMES = [
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

/** Kunci tanggal berdasarkan zona WIB, bukan UTC. */
export function getDateKey(isoDate: string): string {
  return formatInTimeZone(new Date(isoDate), TIMEZONE, "yyyy-MM-dd");
}

/** "2026-10-23" -> "Jumat, 23 Okt 2026" (tanpa bergantung pada ICU/locale). */
export function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${DAY_NAMES[weekday]}, ${String(day).padStart(2, "0")} ${MONTH_NAMES[month - 1]} ${year}`;
}

/** Grup per tanggal WIB: tanggal terbaru dulu, commit di dalam grup terbaru dulu. */
export function groupCommitsByDate(commits: CommitItem[]): DateGroup[] {
  const sorted = [...commits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const map = new Map<string, CommitItem[]>();
  for (const commit of sorted) {
    const key = getDateKey(commit.date);
    const list = map.get(key);
    if (list) {
      list.push(commit);
    } else {
      map.set(key, [commit]);
    }
  }

  return Array.from(map, ([dateKey, items]) => ({
    dateKey,
    label: formatDateLabel(dateKey),
    commits: items,
  }));
}

/** "date" bila commit mencakup lebih dari satu tanggal WIB, selain itu "repo". */
export function defaultGroupBy(commits: CommitItem[]): GroupBy {
  const keys = new Set(commits.map((c) => getDateKey(c.date)));
  return keys.size > 1 ? "date" : "repo";
}
