import type { CommitItem, CommitsResponse } from "@/types/commit";

export interface CommitFilters {
  hideMerges: boolean;
  /** Kunci penulis yang dikecualikan. Kosong = semua penulis tampil. */
  excludedAuthors: string[];
}

export interface AuthorOption {
  key: string;
  label: string;
  count: number;
}

export interface FilteredResult {
  visible: CommitsResponse;
  authors: AuthorOption[];
  mergeCount: number;
}

const MERGE_COMMIT_REGEX =
  /^Merge (pull request|branch|remote-tracking branch|tag)\b/i;

export function isMergeCommit(commit: CommitItem): boolean {
  return MERGE_COMMIT_REGEX.test(commit.title.trim());
}

export function getAuthorKey(commit: CommitItem): string {
  return commit.authorLogin || commit.authorName;
}

/** Daftar penulis beserta jumlah commit, terbanyak dulu. */
export function listAuthors(commits: CommitItem[]): AuthorOption[] {
  const map = new Map<string, AuthorOption>();
  for (const commit of commits) {
    const key = getAuthorKey(commit);
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, { key, label: key, count: 1 });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}

export function applyCommitFilters(
  response: CommitsResponse,
  filters: CommitFilters,
): FilteredResult {
  const mergeCount = response.commits.filter(isMergeCommit).length;

  const afterMerge = filters.hideMerges
    ? response.commits.filter((c) => !isMergeCommit(c))
    : response.commits;

  // Daftar penulis dihitung sebelum filter penulis, supaya chip tidak hilang saat dikecualikan.
  const authors = listAuthors(afterMerge);

  const excluded = new Set(filters.excludedAuthors);
  const commits = afterMerge.filter((c) => !excluded.has(getAuthorKey(c)));

  const visible: CommitsResponse = {
    ...response,
    commits,
    meta: {
      ...response.meta,
      total: commits.length,
      repoCount: new Set(commits.map((c) => c.repo.fullName)).size,
    },
  };

  return { visible, authors, mergeCount };
}
