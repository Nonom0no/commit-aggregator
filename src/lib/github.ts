import "server-only";
import { Octokit } from "@octokit/rest";
import type { CommitItem, ParsedConventional, RepoError } from "@/types/commit";
import { parseConventional } from "./conventional";
import { parseRepoUrl } from "./parse-repo-url";

export function createOctokit(token?: string): Octokit {
  return new Octokit({ auth: token || undefined });
}

export interface FetchRepoCommitsParams {
  owner: string;
  repo: string;
  since: string;
  until: string;
  author?: string;
  perPage?: number;
  maxCommits?: number;
}

export async function fetchRepoCommits(
  octokit: Octokit,
  params: FetchRepoCommitsParams
): Promise<{ commits: CommitItem[]; error: RepoError | null }> {
  const { owner, repo, since, until, author, perPage = 100, maxCommits = 500 } = params;
  const commits: CommitItem[] = [];

  try {
    for await (const response of octokit.paginate.iterator(octokit.rest.repos.listCommits, {
      owner,
      repo,
      since,
      until,
      author,
      per_page: perPage,
    })) {
      for (const commit of response.data) {
        if (commits.length >= maxCommits) break;

        const commitData = commit.commit;
        const authorDate = commitData.author?.date ?? commitData.committer?.date ?? new Date().toISOString();
        const message = commitData.message || "";
        const [title, ...bodyLines] = message.split("\n");
        const body = bodyLines.length > 0 ? bodyLines.join("\n").trim() : null;

        const conventional = parseConventional(message);

        commits.push({
          sha: commit.sha,
          shortSha: commit.sha.slice(0, 7),
          title: title.trim(),
          body,
          authorName: commitData.author?.name || "Unknown",
          authorLogin: commit.author?.login || null,
          date: authorDate,
          url: commit.html_url,
          repo: { owner, name: repo, fullName: `${owner}/${repo}` },
          conventional,
        });
      }
      if (commits.length >= maxCommits) break;
    }

    return { commits, error: null };
  } catch (err) {
    const error = mapOctokitError(err, `${owner}/${repo}`);
    return { commits: [], error };
  }
}

export function mapOctokitError(err: unknown, repo: string): RepoError {
  const status = (err as { status?: number }).status ?? (err as { response?: { status?: number } }).response?.status;
  const headers = (err as { response?: { headers?: Record<string, string> } }).response?.headers ?? {};

  let code: RepoError["code"] = "UNKNOWN";
  let message = "Gagal mengambil commit dari repo ini.";

  if (status === 404) {
    code = "NOT_FOUND_OR_NO_ACCESS";
    message = "Repo tidak ditemukan, atau token tidak punya akses (cek scope repo dan authorize SSO bila perlu).";
  } else if (status === 401) {
    code = "UNAUTHORIZED";
    message = "Token tidak valid atau sudah kedaluwarsa.";
  } else if (status === 429) {
    code = "RATE_LIMITED";
    message = "Batas permintaan GitHub tercapai. Coba lagi nanti.";
  } else if (status === 403) {
    const ratelimitRemaining = headers["x-ratelimit-remaining"];
    const errorMessage = (err as { message?: string }).message?.toLowerCase() ?? "";
    if (ratelimitRemaining === "0" || errorMessage.includes("rate limit")) {
      code = "RATE_LIMITED";
      message = "Batas permintaan GitHub tercapai. Coba lagi nanti.";
    } else {
      code = "NOT_FOUND_OR_NO_ACCESS";
      message = "Repo tidak ditemukan, atau token tidak punya akses (cek scope repo dan authorize SSO bila perlu).";
    }
  }

  return { repo, code, message };
}

export function mapCommitsToResponse(
  results: Array<{ commits: CommitItem[]; error: RepoError | null; repo: string }>,
  meta: { since: string; until: string; repoCount: number }
): { commits: CommitItem[]; errors: RepoError[]; meta: { total: number; repoCount: number; since: string; until: string; generatedAt: string } } {
  const allCommits: CommitItem[] = [];
  const errors: RepoError[] = [];

  for (const result of results) {
    allCommits.push(...result.commits);
    if (result.error) {
      errors.push(result.error);
    }
  }

  allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    commits: allCommits,
    errors,
    meta: {
      total: allCommits.length,
      repoCount: meta.repoCount,
      since: meta.since,
      until: meta.until,
      generatedAt: new Date().toISOString(),
    },
  };
}