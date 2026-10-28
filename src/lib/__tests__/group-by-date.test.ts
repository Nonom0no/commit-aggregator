import { describe, it, expect } from "vitest";
import { buildMarkdown } from "../markdown";
import {
  getDateKey,
  formatDateLabel,
  groupCommitsByDate,
  defaultGroupBy,
} from "../group-by-date";
import type { CommitItem, CommitsResponse } from "@/types/commit";

let counter = 0;

function commit(date: string, overrides: Partial<CommitItem> = {}): CommitItem {
  counter += 1;
  const sha = overrides.sha ?? `${String(counter).padStart(7, "0")}abcdef`;
  const repo = overrides.repo ?? {
    owner: "owner",
    name: "frontend-repo",
    fullName: "owner/frontend-repo",
  };
  return {
    sha,
    shortSha: sha.slice(0, 7),
    title: "fix: perbaiki bug",
    body: null,
    authorName: "Tester",
    authorLogin: "tester",
    date,
    url: `https://github.com/${repo.fullName}/commit/${sha}`,
    repo,
    conventional: {
      type: "fix",
      scope: null,
      breaking: false,
      description: "perbaiki bug",
    },
    ...overrides,
  };
}

describe("getDateKey", () => {
  it("memakai tanggal WIB, bukan UTC", () => {
    // 03.00 WIB tanggal 23 = 20.00 UTC tanggal 22
    expect(getDateKey("2026-10-22T20:00:00Z")).toBe("2026-10-23");
  });

  it("memisahkan tepat di tengah malam WIB", () => {
    expect(getDateKey("2026-10-22T16:59:59Z")).toBe("2026-10-22"); // 23.59.59 WIB
    expect(getDateKey("2026-10-22T17:00:00Z")).toBe("2026-10-23"); // 00.00.00 WIB
  });
});

describe("formatDateLabel", () => {
  it("menulis nama hari dan bulan singkat dalam bahasa Indonesia", () => {
    expect(formatDateLabel("2026-10-23")).toBe("Jumat, 23 Okt 2026");
    expect(formatDateLabel("2026-10-24")).toBe("Sabtu, 24 Okt 2026");
    expect(formatDateLabel("2026-10-05")).toBe("Senin, 05 Okt 2026");
  });
});

describe("groupCommitsByDate", () => {
  it("mengelompokkan per tanggal WIB, terbaru dulu", () => {
    const a = commit("2026-10-23T09:00:00+07:00", { sha: "a" });
    const b = commit("2026-10-23T14:00:00+07:00", { sha: "b" });
    const c = commit("2026-10-20T10:00:00+07:00", { sha: "c" });
    const d = commit("2026-10-22T20:00:00Z", { sha: "d" }); // 03.00 WIB tanggal 23

    const groups = groupCommitsByDate([a, c, d, b]);

    expect(groups.map((g) => g.dateKey)).toEqual(["2026-10-23", "2026-10-20"]);
    expect(groups[0].label).toBe("Jumat, 23 Okt 2026");
    expect(groups[0].commits.map((x) => x.sha)).toEqual(["b", "a", "d"]);
    expect(groups[1].commits.map((x) => x.sha)).toEqual(["c"]);
  });

  it("melewati tanggal tanpa commit", () => {
    const groups = groupCommitsByDate([
      commit("2026-10-23T09:00:00+07:00"),
      commit("2026-10-20T09:00:00+07:00"),
    ]);
    expect(groups.map((g) => g.dateKey)).toEqual(["2026-10-23", "2026-10-20"]);
  });

  it("menghasilkan satu grup untuk satu commit dan array kosong untuk input kosong", () => {
    expect(
      groupCommitsByDate([commit("2026-10-23T09:00:00+07:00")]),
    ).toHaveLength(1);
    expect(groupCommitsByDate([])).toEqual([]);
  });
});

describe("defaultGroupBy", () => {
  it("memilih 'repo' untuk satu tanggal dan 'date' untuk banyak tanggal", () => {
    expect(defaultGroupBy([])).toBe("repo");
    expect(
      defaultGroupBy([
        commit("2026-10-23T09:00:00+07:00"),
        commit("2026-10-23T15:00:00+07:00"),
      ]),
    ).toBe("repo");
    expect(
      defaultGroupBy([
        commit("2026-10-23T09:00:00+07:00"),
        commit("2026-10-24T09:00:00+07:00"),
      ]),
    ).toBe("date");
  });
});

describe("buildMarkdown mode 'date'", () => {
  it("memberi judul per tanggal, terbaru dulu, dengan awalan repo", () => {
    const fri = commit("2026-10-23T07:41:00+07:00");
    const sat = commit("2026-10-24T10:15:00+07:00");
    const response: CommitsResponse = {
      commits: [fri, sat],
      errors: [],
      meta: {
        total: 2,
        repoCount: 1,
        since: "2026-10-23T00:00:00+07:00",
        until: "2026-10-24T23:59:59+07:00",
        generatedAt: "2026-10-25T00:00:00Z",
      },
    };

    const md = buildMarkdown(response, { groupBy: "date" });

    expect(md).toContain("### Sabtu, 24 Okt 2026 (1 commit)");
    expect(md).toContain("### Jumat, 23 Okt 2026 (1 commit)");
    expect(md.indexOf("Sabtu, 24")).toBeLessThan(md.indexOf("Jumat, 23"));
    expect(md).toContain("`frontend-repo` **fix:** perbaiki bug");
    expect(md).toContain("(10.15)");
    expect(md).toContain("(07.41)");
  });
});
