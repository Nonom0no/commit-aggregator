"use client";

import { cn } from "@/lib/cn";
import { GitCommitHorizontal, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { CommitCard } from "./CommitCard";
import { RepoGroupHeader } from "./RepoGroupHeader";
import { CopyMarkdownButton } from "./CopyMarkdownButton";
import type { CommitsResponse, RepoError, CommitItem } from "@/types/commit";

interface ResultsPanelProps {
  status: "idle" | "loading" | "success" | "error";
  data: CommitsResponse | null;
  errorMessage: string | null;
  groupBy: "repo" | "none";
  onGroupByChange: (groupBy: "repo" | "none") => void;
  onRetry: () => void;
}

export function ResultsPanel({ status, data, errorMessage, groupBy, onGroupByChange, onRetry }: ResultsPanelProps) {
  if (status === "loading") {
    return (
      <div className="space-y-4 animate-fade-in" role="status" aria-label="Memuat commit">
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <Card variant="outlined" padding="md" className="animate-fade-in border-red-200">
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

    // Group commits if needed
    const groupedCommits: Map<string, CommitItem[]> = new Map();
    if (groupBy === "repo") {
      for (const commit of commits) {
        const key = commit.repo.fullName;
        if (!groupedCommits.has(key)) groupedCommits.set(key, []);
        groupedCommits.get(key)!.push(commit);
      }
    }

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header with summary badges, group toggle, and copy button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="emerald" size="md" className="gap-2">
              <GitCommitHorizontal className="h-4 w-4" aria-hidden="true" />
              {meta.total} commit{meta.total !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="sky" size="md" className="gap-2">
              {meta.repoCount} repo{meta.repoCount !== 1 ? "s" : ""}
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
            <div className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white/60 p-1 shadow-sm" role="radiogroup" aria-label="Kelompokkan berdasarkan">
              <button
                type="button"
                role="radio"
                aria-checked={groupBy === "repo"}
                onClick={() => onGroupByChange("repo")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2",
                  "motion-reduce:transition-none",
                  groupBy === "repo"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-rose-700 hover:bg-rose-50"
                )}
              >
                Per repo
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={groupBy === "none"}
                onClick={() => onGroupByChange("none")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2",
                  "motion-reduce:transition-none",
                  groupBy === "none"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-rose-700 hover:bg-rose-50"
                )}
              >
                Urut waktu
              </button>
            </div>

            {/* Copy Button - Desktop */}
            <CopyMarkdownButton data={data} groupBy={groupBy} className="hidden sm:block" />
          </div>
        </div>

        {/* Errors from response */}
        {hasErrors && (
          <Alert variant="warning" title="Beberapa repo gagal diproses" className="mb-2">
            <div className="space-y-2">
              {errors.map((err: RepoError, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant="slate" size="sm">{err.repo}</Badge>
                  <span className="text-slate-600">{err.message}</span>
                </div>
              ))}
            </div>
          </Alert>
        )}

        {/* Commits List */}
        {commits.length === 0 ? (
          <Card variant="default" padding="lg" className="text-center py-12">
            <GitCommitHorizontal className="h-12 w-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
            <p className="text-slate-600 mb-2">Belum ada commit pada rentang ini.</p>
            <p className="text-sm text-slate-500">Coba pilih rentang tanggal yang lebih panjang.</p>
          </Card>
        ) : groupBy === "repo" ? (
          // Grouped by repo
          <div className="space-y-8">
            {Array.from(groupedCommits.entries()).map(([repoFullName, repoCommits], index) => {
              const repo = repoCommits[0].repo;
              return (
                <div key={repoFullName} className="space-y-4">
                  <RepoGroupHeader repoName={repo.name} commitCount={repoCommits.length} owner={repo.owner} />
                  <div className="space-y-4" role="list" aria-label={`Commit dari ${repo.fullName}`}>
                    {repoCommits.map((commit, i) => (
                      <CommitCard key={commit.sha} commit={commit} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Flat list sorted by time
          <div className="space-y-4" role="list" aria-label="Semua commit diurutkan berdasarkan waktu">
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