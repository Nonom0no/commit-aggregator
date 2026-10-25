import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("../conventional", () => ({
  parseConventional: vi.fn((message: string) => {
    const match = message.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s(.+)$/);
    if (!match) return null;
    const [, type, scope, breaking, description] = match;
    return { type: type.toLowerCase(), scope: scope ?? null, breaking: breaking === "!", description: description.trim() };
  }),
}));

import { createOctokit, mapCommitsToResponse, mapOctokitError } from "../github";

describe("github.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createOctokit", () => {
    it("creates Octokit instance", () => {
      const octokit = createOctokit("ghp_test123");
      expect(octokit).toBeDefined();
    });

    it("creates Octokit without auth when token is undefined", () => {
      const octokit = createOctokit(undefined);
      expect(octokit).toBeDefined();
    });

    it("creates Octokit without auth when token is empty string", () => {
      const octokit = createOctokit("");
      expect(octokit).toBeDefined();
    });
  });

  describe("mapOctokitError", () => {
    it("maps 404 to NOT_FOUND_OR_NO_ACCESS", () => {
      const error = { status: 404, response: { status: 404 } };
      const result = mapOctokitError(error, "owner/repo");
      expect(result.code).toBe("NOT_FOUND_OR_NO_ACCESS");
      expect(result.message).toBe("Repo tidak ditemukan atau token tidak punya akses.");
      expect(result.repo).toBe("owner/repo");
    });

    it("maps 401 to UNAUTHORIZED", () => {
      const error = { status: 401 };
      const result = mapOctokitError(error, "owner/repo");
      expect(result.code).toBe("UNAUTHORIZED");
      expect(result.message).toBe("Token tidak valid atau sudah kedaluwarsa.");
    });

    it("maps 403 to RATE_LIMITED", () => {
      const error = { status: 403 };
      const result = mapOctokitError(error, "owner/repo");
      expect(result.code).toBe("RATE_LIMITED");
      expect(result.message).toBe("Batas permintaan GitHub tercapai. Coba lagi nanti.");
    });

    it("maps 429 to RATE_LIMITED", () => {
      const error = { status: 429 };
      const result = mapOctokitError(error, "owner/repo");
      expect(result.code).toBe("RATE_LIMITED");
      expect(result.message).toBe("Batas permintaan GitHub tercapai. Coba lagi nanti.");
    });

    it("maps unknown status to UNKNOWN", () => {
      const error = { status: 500 };
      const result = mapOctokitError(error, "owner/repo");
      expect(result.code).toBe("UNKNOWN");
      expect(result.message).toBe("Gagal mengambil commit dari repo ini.");
    });

    it("maps error with response.status", () => {
      const error = { response: { status: 404 } };
      const result = mapOctokitError(error, "owner/repo");
      expect(result.code).toBe("NOT_FOUND_OR_NO_ACCESS");
    });
  });

  describe("mapCommitsToResponse", () => {
    it("combines commits from multiple repos and sorts by date desc", () => {
      const results = [
        {
          commits: [
            { sha: "sha1", date: "2026-10-25T01:00:00Z", repo: { fullName: "owner/repo1" } } as any,
            { sha: "sha2", date: "2026-10-25T03:00:00Z", repo: { fullName: "owner/repo1" } } as any,
          ],
          error: null,
          repo: "owner/repo1",
        },
        {
          commits: [
            { sha: "sha3", date: "2026-10-25T02:00:00Z", repo: { fullName: "owner/repo2" } } as any,
          ],
          error: null,
          repo: "owner/repo2",
        },
      ];

      const response = mapCommitsToResponse(results, { since: "2026-10-25T00:00:00Z", until: "2026-10-25T23:59:59Z", repoCount: 2 });

      expect(response.commits).toHaveLength(3);
      expect(response.commits[0].sha).toBe("sha2");
      expect(response.commits[1].sha).toBe("sha3");
      expect(response.commits[2].sha).toBe("sha1");
      expect(response.meta.total).toBe(3);
      expect(response.meta.repoCount).toBe(2);
      expect(response.errors).toHaveLength(0);
    });

    it("includes errors from failed repos", () => {
      const results = [
        {
          commits: [{ sha: "sha1", date: "2026-10-25T02:00:00Z", repo: { fullName: "owner/repo1" } } as any],
          error: null,
          repo: "owner/repo1",
        },
        {
          commits: [],
          error: { repo: "owner/repo2", code: "NOT_FOUND_OR_NO_ACCESS" as const, message: "Repo tidak ditemukan" },
          repo: "owner/repo2",
        },
      ];

      const response = mapCommitsToResponse(results, { since: "2026-10-25T00:00:00Z", until: "2026-10-25T23:59:59Z", repoCount: 2 });

      expect(response.commits).toHaveLength(1);
      expect(response.errors).toHaveLength(1);
      expect(response.errors[0].code).toBe("NOT_FOUND_OR_NO_ACCESS");
    });

    it("sets generatedAt to current ISO string", () => {
      const results = [{ commits: [], error: null, repo: "owner/repo" }];
      const before = new Date().toISOString();
      const response = mapCommitsToResponse(results, { since: "2026-10-25T00:00:00Z", until: "2026-10-25T23:59:59Z", repoCount: 1 });
      const after = new Date().toISOString();

      expect(response.meta.generatedAt >= before).toBe(true);
      expect(response.meta.generatedAt <= after).toBe(true);
    });
  });
});