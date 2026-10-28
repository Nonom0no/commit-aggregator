import { describe, it, expect } from "vitest";
import {
  isMergeCommit,
  listAuthors,
  applyCommitFilters,
} from "../filter-commits";
import type { CommitItem, CommitsResponse } from "@/types/commit";

let counter = 0;

function commit(overrides: Partial<CommitItem> = {}): CommitItem {
  counter += 1;
  const sha = overrides.sha ?? `${String(counter).padStart(7, "0")}abcdef`;
  const repo = overrides.repo ?? {
    owner: "o",
    name: "backend",
    fullName: "o/backend",
  };
  return {
    sha,
    shortSha: sha.slice(0, 7),
    title: "fix: perbaiki bug",
    body: null,
    authorName: "Nama Git",
    authorLogin: "nonom0no",
    date: "2026-10-23T09:00:00+07:00",
    url: `https://github.com/${repo.fullName}/commit/${sha}`,
    repo,
    conventional: null,
    ...overrides,
  };
}

function response(commits: CommitItem[]): CommitsResponse {
  return {
    commits,
    errors: [],
    meta: {
      total: commits.length,
      repoCount: new Set(commits.map((c) => c.repo.fullName)).size,
      since: "2026-10-23T00:00:00+07:00",
      until: "2026-10-23T23:59:59+07:00",
      generatedAt: "2026-10-25T00:00:00Z",
    },
  };
}

describe("isMergeCommit", () => {
  it("mendeteksi pola merge umum", () => {
    expect(
      isMergeCommit(
        commit({ title: "Merge pull request #167 from ciptami/fix/x" }),
      ),
    ).toBe(true);
    expect(
      isMergeCommit(
        commit({ title: "Merge branch 'main' of https://github.com/a/b" }),
      ),
    ).toBe(true);
    expect(
      isMergeCommit(
        commit({ title: "Merge remote-tracking branch 'origin/main'" }),
      ),
    ).toBe(true);
    expect(isMergeCommit(commit({ title: "merge branch 'dev'" }))).toBe(true);
  });

  it("tidak salah mendeteksi commit biasa", () => {
    expect(
      isMergeCommit(commit({ title: "Fix merge conflict in login" })),
    ).toBe(false);
    expect(isMergeCommit(commit({ title: "Merge sort implementation" }))).toBe(
      false,
    );
    expect(isMergeCommit(commit({ title: "Merged pull request helper" }))).toBe(
      false,
    );
    expect(isMergeCommit(commit({ title: "feat: add merge button" }))).toBe(
      false,
    );
  });
});

describe("listAuthors", () => {
  it("menghitung per penulis, terbanyak dulu, dan memakai nama bila login kosong", () => {
    const authors = listAuthors([
      commit({ authorLogin: "wafi" }),
      commit({ authorLogin: "banu1312" }),
      commit({ authorLogin: "banu1312" }),
      commit({ authorLogin: null, authorName: "Tanpa Akun" }),
    ]);
    expect(authors.map((a) => [a.key, a.count])).toEqual([
      ["banu1312", 2],
      ["Tanpa Akun", 1],
      ["wafi", 1],
    ]);
  });
});

describe("applyCommitFilters", () => {
  const merge = commit({
    title: "Merge pull request #1 from a/b",
    authorLogin: "wafi",
  });
  const mine = commit({ authorLogin: "nonom0no" });
  const other = commit({
    authorLogin: "banu1312",
    repo: { owner: "o", name: "frontend", fullName: "o/frontend" },
  });
  const original = response([merge, mine, other]);

  it("menyembunyikan merge commit dan menghitungnya", () => {
    const result = applyCommitFilters(original, {
      hideMerges: true,
      excludedAuthors: [],
    });
    expect(result.visible.commits).toEqual([mine, other]);
    expect(result.mergeCount).toBe(1);
    expect(result.visible.meta.total).toBe(2);
  });

  it("menampilkan merge commit bila tidak disembunyikan", () => {
    const result = applyCommitFilters(original, {
      hideMerges: false,
      excludedAuthors: [],
    });
    expect(result.visible.commits).toHaveLength(3);
    expect(result.mergeCount).toBe(1);
  });

  it("mengecualikan penulis tetapi tetap mencantumkannya di daftar chip", () => {
    const result = applyCommitFilters(original, {
      hideMerges: true,
      excludedAuthors: ["banu1312"],
    });
    expect(result.visible.commits).toEqual([mine]);
    expect(result.authors.map((a) => a.key).sort()).toEqual([
      "banu1312",
      "nonom0no",
    ]);
    expect(result.visible.meta.repoCount).toBe(1);
  });

  it("tidak mengubah data asli", () => {
    applyCommitFilters(original, {
      hideMerges: true,
      excludedAuthors: ["nonom0no"],
    });
    expect(original.commits).toHaveLength(3);
    expect(original.meta.total).toBe(3);
  });

  it("menghasilkan daftar kosong bila semua tersaring", () => {
    const result = applyCommitFilters(original, {
      hideMerges: true,
      excludedAuthors: ["nonom0no", "banu1312"],
    });
    expect(result.visible.commits).toEqual([]);
    expect(result.visible.meta.total).toBe(0);
  });
});
