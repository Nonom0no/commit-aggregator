import { describe, it, expect } from "vitest";
import { buildMarkdown } from "../markdown";
import type { CommitsResponse, CommitItem } from "@/types/commit";

function createMockCommit(overrides: Partial<CommitItem> = {}): CommitItem {
  const sha = overrides.sha || "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0";
  const shortSha = overrides.shortSha || "a1b2c3d";
  const repo = overrides.repo || { owner: "owner", name: "frontend-repo", fullName: "owner/frontend-repo" };
  return {
    sha,
    shortSha,
    title: "feat(auth): add login page",
    body: null,
    authorName: "John Doe",
    authorLogin: "johndoe",
    date: "2026-10-25T02:41:00Z",
    url: `https://github.com/${repo.fullName}/commit/${sha}`,
    repo,
    conventional: {
      type: "feat",
      scope: "auth",
      breaking: false,
      description: "add login page",
    },
    ...overrides,
  };
}

function createMockResponse(commits: CommitItem[]): CommitsResponse {
  return {
    commits,
    errors: [],
    meta: {
      total: commits.length,
      repoCount: 1,
      since: "2026-10-24T17:00:00Z",
      until: "2026-10-25T16:59:59Z",
      generatedAt: "2026-10-25T05:00:00Z",
    },
  };
}

describe("buildMarkdown", () => {
  describe("groupBy: repo (default)", () => {
    it("formats single commit with conventional type", () => {
      const commit = createMockCommit();
      const response = createMockResponse([commit]);
      const markdown = buildMarkdown(response, { groupBy: "repo" });

      expect(markdown).toContain("## Laporan Commit — 25 Oct 2026");
      expect(markdown).toContain("### owner/frontend-repo (1 commit)");
      expect(markdown).toContain("- **feat(auth):** add login page — [`a1b2c3d`](https://github.com/owner/frontend-repo/commit/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0) (09.41)");
    });

    it("groups commits by repo", () => {
      const commits = [
        createMockCommit({
          sha: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
          shortSha: "a1b2c3d",
          date: "2026-10-25T02:41:00Z",
          conventional: { type: "feat", scope: "auth", breaking: false, description: "add login page" },
        }),
        createMockCommit({
          sha: "e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3",
          shortSha: "e4f5a6b",
          date: "2026-10-25T03:15:00Z",
          title: "fix: handle logout redirect",
          conventional: { type: "fix", scope: null, breaking: false, description: "handle logout redirect" },
        }),
        createMockCommit({
          sha: "c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
          shortSha: "c7d8e9f",
          date: "2026-10-25T04:02:00Z",
          repo: { owner: "owner", name: "backend-repo", fullName: "owner/backend-repo" },
          conventional: { type: "feat", scope: "api", breaking: false, description: "add products endpoint" },
        }),
      ];
      const response = createMockResponse(commits);
      response.meta.repoCount = 2;
      const markdown = buildMarkdown(response, { groupBy: "repo" });

      expect(markdown).toContain("### owner/frontend-repo (2 commits)");
      expect(markdown).toContain("- **feat(auth):** add login page — [`a1b2c3d`](https://github.com/owner/frontend-repo/commit/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0) (09.41)");
      expect(markdown).toContain("- **fix:** handle logout redirect — [`e4f5a6b`](https://github.com/owner/frontend-repo/commit/e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3) (10.15)");
      expect(markdown).toContain("### owner/backend-repo (1 commit)");
      expect(markdown).toContain("- **feat(api):** add products endpoint — [`c7d8e9f`](https://github.com/owner/backend-repo/commit/c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6) (11.02)");
    });

    it("shows commit without conventional type as plain text", () => {
      const commit = createMockCommit({
        title: "Update dependencies",
        conventional: null,
      });
      const response = createMockResponse([commit]);
      const markdown = buildMarkdown(response, { groupBy: "repo" });

      expect(markdown).toContain("- Update dependencies — [`a1b2c3d`](https://github.com/owner/frontend-repo/commit/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0) (09.41)");
      expect(markdown).not.toContain("**");
    });

    it("shows breaking change indicator", () => {
      const commit = createMockCommit({
        conventional: { type: "feat", scope: "api", breaking: true, description: "change response format" },
      });
      const response = createMockResponse([commit]);
      const markdown = buildMarkdown(response, { groupBy: "repo" });

      expect(markdown).toContain("- **feat(api)!:** change response format — [`a1b2c3d`](https://github.com/owner/frontend-repo/commit/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0) (09.41)");
    });

    it("shows empty state message when no commits", () => {
      const response = createMockResponse([]);
      const markdown = buildMarkdown(response, { groupBy: "repo" });

      expect(markdown).toBe("## Laporan Commit — 25 Oct 2026\n\nBelum ada commit pada rentang ini.");
    });

    it("sorts commits by date descending (newest first) within each repo group", () => {
      const commits = [
        createMockCommit({
          shortSha: "oldest",
          sha: "sha-oldest",
          date: "2026-10-24T18:00:00Z",
        }),
        createMockCommit({
          shortSha: "newest",
          sha: "sha-newest",
          date: "2026-10-24T20:00:00Z",
        }),
        createMockCommit({
          shortSha: "middle",
          sha: "sha-middle",
          date: "2026-10-24T19:00:00Z",
        }),
      ];
      const response = createMockResponse(commits);
      const markdown = buildMarkdown(response, { groupBy: "repo" });

      // Find the section for the repo
      const repoSection = markdown.split("### owner/frontend-repo")[1];
      const newestIndex = repoSection!.indexOf("newest");
      const middleIndex = repoSection!.indexOf("middle");
      const oldestIndex = repoSection!.indexOf("oldest");

      expect(newestIndex).toBeLessThan(middleIndex);
      expect(middleIndex).toBeLessThan(oldestIndex);
    });
  });

  describe("groupBy: none", () => {
    it("shows flat list with repo name prefix", () => {
      const commits = [
        createMockCommit({
          shortSha: "a1b2c3d",
          sha: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
          date: "2026-10-25T02:41:00Z",
          repo: { owner: "owner", name: "frontend-repo", fullName: "owner/frontend-repo" },
        }),
        createMockCommit({
          shortSha: "e4f5a6b",
          sha: "e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3",
          date: "2026-10-25T03:15:00Z",
          repo: { owner: "owner", name: "backend-repo", fullName: "owner/backend-repo" },
        }),
      ];
      const response = createMockResponse(commits);
      const markdown = buildMarkdown(response, { groupBy: "none" });

      expect(markdown).toContain("- `frontend-repo` **feat(auth):** add login page — [`a1b2c3d`](https://github.com/owner/frontend-repo/commit/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0) (09.41)");
      expect(markdown).toContain("- `backend-repo` **feat(auth):** add login page — [`e4f5a6b`](https://github.com/owner/backend-repo/commit/e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3) (10.15)");
    });

    it("does not include repo group headers", () => {
      const commits = [
        createMockCommit({ shortSha: "a1b2c3d" }),
        createMockCommit({ shortSha: "e4f5a6b" }),
      ];
      const response = createMockResponse(commits);
      const markdown = buildMarkdown(response, { groupBy: "none" });

      expect(markdown).not.toContain("###");
    });
  });

  describe("date range formatting", () => {
    it("shows single date for same day range", () => {
      const commit = createMockCommit();
      const response = createMockResponse([commit]);
      response.meta.since = "2026-10-24T17:00:00Z";
      response.meta.until = "2026-10-25T16:59:59Z";
      const markdown = buildMarkdown(response);

      expect(markdown).toContain("## Laporan Commit — 25 Oct 2026");
    });

    it("shows range for multi-day", () => {
      const commit = createMockCommit();
      const response = createMockResponse([commit]);
      response.meta.since = "2026-10-19T17:00:00Z";
      response.meta.until = "2026-10-25T16:59:59Z";
      const markdown = buildMarkdown(response);

      expect(markdown).toContain("## Laporan Commit — 20 Oct 2026 – 25 Oct 2026");
    });
  });

  describe("WIB time formatting", () => {
    it("formats time as HH.mm in WIB", () => {
      const commit = createMockCommit({
        date: "2026-10-25T02:41:00Z",
      });
      const response = createMockResponse([commit]);
      const markdown = buildMarkdown(response);

      expect(markdown).toContain("(09.41)");
    });
  });
});