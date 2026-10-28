"use client";

import { useState, useCallback, useMemo } from "react";
import { CommitForm } from "@/components/form/CommitForm";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { defaultGroupBy, type GroupBy } from "@/lib/group-by-date";
import { applyCommitFilters } from "@/lib/filter-commits";
import type { CommitsResponse, CommitsRequest } from "@/types/commit";

interface GeneratorSectionProps {
  className?: string;
}

export function GeneratorSection({ className }: GeneratorSectionProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [data, setData] = useState<CommitsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<CommitsRequest | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("repo");
  const [hideMerges, setHideMerges] = useState(true);
  const [excludedAuthors, setExcludedAuthors] = useState<string[]>([]);

  const filtered = useMemo(
    () =>
      data ? applyCommitFilters(data, { hideMerges, excludedAuthors }) : null,
    [data, hideMerges, excludedAuthors],
  );

  const handleSuccess = useCallback((response: CommitsResponse) => {
    setData(response);
    setStatus("success");
    setError(null);
  }, []);

  const handleError = useCallback((err: string) => {
    setError(err);
    setStatus("error");
  }, []);

  const handleRetry = useCallback(() => {
    if (lastRequest) {
      // Pengguna perlu menekan "Ambil Commit" lagi (token tetap di state form).
      setError(null);
      setStatus("idle");
    }
  }, [lastRequest]);

  const toggleAuthor = useCallback((key: string) => {
    setExcludedAuthors((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const resetAuthors = useCallback(() => setExcludedAuthors([]), []);

  const handleFormSubmit = useCallback(
    async (payload: CommitsRequest) => {
      setLastRequest(payload);
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch("/api/commits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Terlalu banyak permintaan, coba lagi sebentar.");
          }
          const errData = await response.json().catch(() => ({}));
          const message =
            errData.error || "Gagal mengambil commit dari server.";
          throw new Error(message);
        }

        const responseData: CommitsResponse = await response.json();
        // Data baru: tampilkan semua penulis lagi, dan pilih mode default
        // berdasarkan commit yang benar-benar terlihat (setelah filter merge).
        setExcludedAuthors([]);
        const visible = applyCommitFilters(responseData, {
          hideMerges,
          excludedAuthors: [],
        }).visible;
        setGroupBy(defaultGroupBy(visible.commits));
        handleSuccess(responseData);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan jaringan. Silakan coba lagi.";
        handleError(message);
      }
    },
    [handleSuccess, handleError, hideMerges],
  );

  return (
    <div className={className}>
      <CommitForm onSubmit={handleFormSubmit} />

      <ResultsPanel
        status={status}
        data={filtered?.visible ?? null}
        errorMessage={error}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        onRetry={handleRetry}
        mergeCount={filtered?.mergeCount ?? 0}
        authors={filtered?.authors ?? []}
        hideMerges={hideMerges}
        excludedAuthors={excludedAuthors}
        onHideMergesChange={setHideMerges}
        onToggleAuthor={toggleAuthor}
        onResetAuthors={resetAuthors}
      />
    </div>
  );
}
