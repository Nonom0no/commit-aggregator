"use client";

import { GitMerge, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import type { AuthorOption } from "@/lib/filter-commits";

interface ResultsFiltersProps {
  hideMerges: boolean;
  mergeCount: number;
  authors: AuthorOption[];
  excludedAuthors: string[];
  onHideMergesChange: (value: boolean) => void;
  onToggleAuthor: (key: string) => void;
  onResetAuthors: () => void;
}

export function ResultsFilters({
  hideMerges,
  mergeCount,
  authors,
  excludedAuthors,
  onHideMergesChange,
  onToggleAuthor,
  onResetAuthors,
}: ResultsFiltersProps) {
  const showAuthors = authors.length > 1;

  return (
    <div className="space-y-4 rounded-2xl border border-rose-200 bg-white p-4 shadow-[0_8px_30px_rgba(244,63,94,0.08)]">
      {mergeCount > 0 && (
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={hideMerges}
            onChange={(e) => onHideMergesChange(e.target.checked)}
            className="size-4 accent-rose-500"
          />
          <GitMerge className="h-4 w-4 text-slate-500" aria-hidden="true" />
          Sembunyikan merge commit
          <Badge variant="amber" size="sm">
            {hideMerges ? `${mergeCount} disembunyikan` : `${mergeCount} merge`}
          </Badge>
        </label>
      )}

      {showAuthors && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">Penulis</p>
            {excludedAuthors.length > 0 && (
              <button
                type="button"
                onClick={onResetAuthors}
                className="rounded-full px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                Tampilkan semua
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {authors.map((author) => {
              const included = !excludedAuthors.includes(author.key);
              return (
                <button
                  key={author.key}
                  type="button"
                  aria-pressed={included}
                  onClick={() => onToggleAuthor(author.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out",
                    "motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2",
                    included
                      ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                      : "border-rose-200 bg-white text-slate-500 line-through hover:bg-rose-50",
                  )}
                >
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                  {author.label}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px]",
                      included
                        ? "bg-white/25 text-white"
                        : "bg-rose-50 text-rose-700",
                    )}
                  >
                    {author.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
