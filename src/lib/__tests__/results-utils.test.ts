import { describe, it, expect } from "vitest";
import { formatInTimeZone } from "date-fns-tz";
import { id } from "date-fns/locale";

const TIMEZONE = "Asia/Jakarta";

// Mock commit data for testing
const createMockCommit = (overrides: Partial<{
  sha: string;
  shortSha: string;
  title: string;
  body: string | null;
  authorName: string;
  authorLogin: string | null;
  date: string;
  url: string;
  repo: { owner: string; name: string; fullName: string };
  conventional: { type: string; scope: string | null; breaking: boolean; description: string } | null;
}> = {}) => ({
  sha: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
  shortSha: "a1b2c3d",
  title: "feat: add login page",
  body: null,
  authorName: "John Doe",
  authorLogin: "johndoe",
  date: "2026-10-25T09:41:00+07:00",
  url: "https://github.com/owner/repo/commit/a1b2c3d",
  repo: { owner: "owner", name: "repo", fullName: "owner/repo" },
  conventional: { type: "feat", scope: "auth", breaking: false, description: "add login page" },
  ...overrides,
});

describe("Results utility functions", () => {
  describe("formatTime (WIB HH.mm)", () => {
    it("formats date as HH.mm in WIB", () => {
      const dateStr = "2026-10-25T09:41:00+07:00";
      const formatted = formatInTimeZone(new Date(dateStr), TIMEZONE, "HH.mm");
      expect(formatted).toBe("09.41");
    });

    it("formats midnight correctly", () => {
      const dateStr = "2026-10-25T00:00:00+07:00";
      const formatted = formatInTimeZone(new Date(dateStr), TIMEZONE, "HH.mm");
      expect(formatted).toBe("00.00");
    });

    it("formats noon correctly", () => {
      const dateStr = "2026-10-25T12:30:00+07:00";
      const formatted = formatInTimeZone(new Date(dateStr), TIMEZONE, "HH.mm");
      expect(formatted).toBe("12.30");
    });

    it("handles UTC input and converts to WIB", () => {
      // 2026-10-25T02:41:00Z = 2026-10-25T09:41:00+07:00
      const dateStr = "2026-10-25T02:41:00Z";
      const formatted = formatInTimeZone(new Date(dateStr), TIMEZONE, "HH.mm");
      expect(formatted).toBe("09.41");
    });
  });

  describe("groupCommitsByRepo", () => {
    function groupCommitsByRepo(commits: ReturnType<typeof createMockCommit>[]): Map<string, ReturnType<typeof createMockCommit>[]> {
      const grouped = new Map<string, ReturnType<typeof createMockCommit>[]>();
      for (const commit of commits) {
        const key = commit.repo.fullName;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(commit);
      }
      return grouped;
    }

    it("groups commits by repo fullName", () => {
      const commits = [
        createMockCommit({ sha: "1", shortSha: "a1b2c3d", repo: { owner: "owner1", name: "frontend", fullName: "owner1/frontend" } }),
        createMockCommit({ sha: "2", shortSha: "e4f5a6b", repo: { owner: "owner1", name: "frontend", fullName: "owner1/frontend" } }),
        createMockCommit({ sha: "3", shortSha: "c7d8e9f", repo: { owner: "owner2", name: "backend", fullName: "owner2/backend" } }),
      ];

      const grouped = groupCommitsByRepo(commits);
      expect(grouped.size).toBe(2);
      expect(grouped.get("owner1/frontend")?.length).toBe(2);
      expect(grouped.get("owner2/backend")?.length).toBe(1);
    });

    it("preserves order within each group (newest first)", () => {
      const commits = [
        createMockCommit({ sha: "1", shortSha: "a1b2c3d", date: "2026-10-25T09:41:00+07:00", repo: { owner: "owner", name: "repo", fullName: "owner/repo" } }),
        createMockCommit({ sha: "2", shortSha: "e4f5a6b", date: "2026-10-25T10:15:00+07:00", repo: { owner: "owner", name: "repo", fullName: "owner/repo" } }),
        createMockCommit({ sha: "3", shortSha: "c7d8e9f", date: "2026-10-25T08:30:00+07:00", repo: { owner: "owner", name: "repo", fullName: "owner/repo" } }),
      ];

      // Sort by date descending first (as done in buildMarkdown)
      const sorted = [...commits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const grouped = groupCommitsByRepo(sorted);

      const repoCommits = grouped.get("owner/repo")!;
      expect(repoCommits[0].shortSha).toBe("e4f5a6b"); // newest first
      expect(repoCommits[1].shortSha).toBe("a1b2c3d");
      expect(repoCommits[2].shortSha).toBe("c7d8e9f"); // oldest last
    });

    it("returns empty map for empty array", () => {
      const grouped = groupCommitsByRepo([]);
      expect(grouped.size).toBe(0);
    });
  });

  describe("formatDateRange", () => {
    function formatDateRange(since: string, until: string): string {
      const sinceDate = new Date(since);
      const untilDate = new Date(until);
      const sinceStr = formatInTimeZone(sinceDate, TIMEZONE, "dd MMM yyyy", { locale: id });
      const untilStr = formatInTimeZone(untilDate, TIMEZONE, "dd MMM yyyy", { locale: id });
      return sinceStr === untilStr ? sinceStr : `${sinceStr} – ${untilStr}`;
    }

    it("returns single date when since equals until", () => {
      const result = formatDateRange("2026-10-25T00:00:00+07:00", "2026-10-25T23:59:59+07:00");
      expect(result).toBe("25 Okt 2026");
    });

    it("returns range when dates differ", () => {
      const result = formatDateRange("2026-10-20T00:00:00+07:00", "2026-10-25T23:59:59+07:00");
      expect(result).toBe("20 Okt 2026 – 25 Okt 2026");
    });
  });
});