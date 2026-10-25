export interface ParsedConventional {
  type: string;
  scope: string | null;
  breaking: boolean;
  description: string;
}

export interface CommitItem {
  sha: string;
  shortSha: string;
  title: string;
  body: string | null;
  authorName: string;
  authorLogin: string | null;
  date: string;
  url: string;
  repo: { owner: string; name: string; fullName: string };
  conventional: ParsedConventional | null;
}

export interface RepoError {
  repo: string;
  code: "NOT_FOUND_OR_NO_ACCESS" | "UNAUTHORIZED" | "RATE_LIMITED" | "INVALID_URL" | "UNKNOWN";
  message: string;
}

export interface CommitsResponse {
  commits: CommitItem[];
  errors: RepoError[];
  meta: {
    total: number;
    repoCount: number;
    since: string;
    until: string;
    generatedAt: string;
  };
}

export interface CommitsRequest {
  repos: string[];
  since: string;
  until: string;
  token?: string;
  author?: string;
  timezone?: string;
}