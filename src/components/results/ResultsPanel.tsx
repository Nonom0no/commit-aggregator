"use client";

import { cn } from "@/lib/cn";
import { GitCommitHorizontal, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { CommitCard } from "./CommitCard";
import { RepoGroupHeader } from "./RepoGroupHeader";
import { DateGroupHeader } from "./DateGroupHeader";
import { CopyMarkdownButton } from "./CopyMarkdownButton";
import { ResultsFilters } from "./ResultsFilters";
import { groupCommitsByDate, type GroupBy } from "@/lib/group-by-date";
import type { AuthorOption } from "@/lib/filter-commits";
import type { CommitsResponse, RepoError, CommitItem } from "@/types/commit";

interface ResultsPanelProps {
  status: "idle" | "loading" | "success" | "error";
  data: CommitsResponse | null;
  errorMessage: string | null;
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  onRetry: () => void;
  // Filter
  mergeCount: number;
  authors: AuthorOption[];
  hideMerges: boolean;
  excludedAuthors: string[];
  onHideMergesChange: (value: boolean) => void;
  onToggleAuthor: (key: string) => void;
  onResetAuthors: () => void;
}

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "date", label: "Per tanggal" },
  { value: "repo", label: "Per repo" },
  { value: "none", label: "Urut waktu" },
];

export function ResultsPanel({
  status,
  data,
  errorMessage,
  groupBy,
  onGroupByChange,
  onRetry,
  mergeCount,
  authors,
  hideMerges,
  excludedAuthors,
  onHideMergesChange,
  onToggleAuthor,
  onResetAuthors,
}: ResultsPanelProps) {
  if (status === "loading") {
    return (
      <div
        className="space-y-4 animate-fade-in"
        role="status"
        aria-label="Memuat commit"
      >
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <Card
        variant="outlined"
        padding="md"
        className="animate-fade-in border-red-200"
      >
        <CardContent className="flex flex-col items-center text-center gap-4 py-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-700">
            <GitCommitHorizontal className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-slate-900">Gagal mengambil commit</p>
            <p className="text-sm text-slate-600 mt-1">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full bg-rose-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            <Loader2 className="h-4 w-4" aria-hidden="true" />
            Coba lagi
          </button>
        </CardContent>
      </Card>
    );
  }

  if (status === "success" && data) {
    const { commits, errors, meta } = data;
    const hasErrors = errors.length > 0;
    const showFilters = mergeCount > 0 || authors.length > 1;
    const hiddenByFilter =
      commits.length === 0 &&
      ((hideMerges && mergeCount > 0) || excludedAuthors.length > 0);

    // Group by repo
    const groupedByRepo: Map<string, CommitItem[]> = new Map();
    if (groupBy === "repo") {
      for (const commit of commits) {
        const key = commit.repo.fullName;
        if (!groupedByRepo.has(key)) groupedByRepo.set(key, []);
        groupedByRepo.get(key)!.push(commit);
      }
    }

    // Group by date (WIB)
    const dateGroups = groupBy === "date" ? groupCommitsByDate(commits) : [];

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header with summary badges, group toggle, and copy button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="emerald" size="md" className="gap-2">
              <GitCommitHorizontal className="h-4 w-4" aria-hidden="true" />
              {meta.total} commit
            </Badge>
            <Badge variant="sky" size="md" className="gap-2">
              {meta.repoCount} repo
            </Badge>
            <Badge variant="rose" size="md" className="gap-2">
              {meta.since.split("T")[0]} – {meta.until.split("T")[0]}
            </Badge>
            {hasErrors && (
              <Badge variant="amber" size="md" className="gap-2">
                {errors.length} error
              </Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Group By Toggle */}
            <div
              className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white/60 p-1 shadow-sm"
              role="radiogroup"
              aria-label="Kelompokkan berdasarkan"
            >
              {GROUP_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={groupBy === option.value}
                  onClick={() => onGroupByChange(option.value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2",
                    "motion-reduce:transition-none",
                    groupBy === option.value
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-rose-700 hover:bg-rose-50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Copy Button - Desktop */}
            <CopyMarkdownButton
              data={data}
              groupBy={groupBy}
              className="hidden sm:block"
            />
          </div>
        </div>

        {/* Filters: merge commit dan penulis */}
        {showFilters && (
          <ResultsFilters
            hideMerges={hideMerges}
            mergeCount={mergeCount}
            authors={authors}
            excludedAuthors={excludedAuthors}
            onHideMergesChange={onHideMergesChange}
            onToggleAuthor={onToggleAuthor}
            onResetAuthors={onResetAuthors}
          />
        )}

        {/* Errors from response */}
        {hasErrors && (
          <Alert
            variant="warning"
            title="Beberapa repo gagal diproses"
            className="mb-2"
          >
            <div className="space-y-2">
              {errors.map((err: RepoError, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant="slate" size="sm">
                    {err.repo}
                  </Badge>
                  <span className="text-slate-600">{err.message}</span>
                </div>
              ))}
            </div>
          </Alert>
        )}

        {/* Commits List */}
        {commits.length === 0 ? (
          <Card variant="default" padding="lg" className="text-center py-12">
            <GitCommitHorizontal
              className="h-12 w-12 text-slate-300 mx-auto mb-4"
              aria-hidden="true"
            />
            {hiddenByFilter ? (
              <>
                <p className="text-slate-600 mb-2">
                  Semua commit disembunyikan oleh filter.
                </p>
                <p className="text-sm text-slate-500">
                  Ubah filter di atas untuk menampilkannya.
                </p>
              </>
            ) : (
              <>
                <p className="text-slate-600 mb-2">
                  Belum ada commit pada rentang ini.
                </p>
                <p className="text-sm text-slate-500">
                  Coba pilih rentang tanggal yang lebih panjang.
                </p>
              </>
            )}
          </Card>
        ) : groupBy === "date" ? (
          // Grouped by date (WIB)
          <div className="space-y-10">
            {dateGroups.map((group) => (
              <section
                key={group.dateKey}
                className="space-y-4"
                aria-label={`Commit tanggal ${group.label}`}
              >
                <DateGroupHeader
                  label={group.label}
                  commitCount={group.commits.length}
                />
                <div className="space-y-4" role="list">
                  {group.commits.map((commit) => (
                    <CommitCard key={commit.sha} commit={commit} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : groupBy === "repo" ? (
          // Grouped by repo
          <div className="space-y-8">
            {Array.from(groupedByRepo.entries()).map(
              ([repoFullName, repoCommits]) => {
                const repo = repoCommits[0].repo;
                return (
                  <div key={repoFullName} className="space-y-4">
                    <RepoGroupHeader
                      repoName={repo.name}
                      commitCount={repoCommits.length}
                      owner={repo.owner}
                    />
                    <div
                      className="space-y-4"
                      role="list"
                      aria-label={`Commit dari ${repo.fullName}`}
                    >
                      {repoCommits.map((commit) => (
                        <CommitCard key={commit.sha} commit={commit} />
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ) : (
          // Flat list sorted by time
          <div
            className="space-y-4"
            role="list"
            aria-label="Semua commit diurutkan berdasarkan waktu"
          >
            {commits.map((commit) => (
              <CommitCard key={commit.sha} commit={commit} />
            ))}
          </div>
        )}

        {/* Copy Button - Mobile (bottom) */}
        <div className="sm:hidden">
          <CopyMarkdownButton data={data} groupBy={groupBy} />
        </div>
      </div>
    );
  }

  return null;
}
