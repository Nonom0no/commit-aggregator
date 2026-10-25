"use client";

import { useState, useCallback } from "react";
import { CommitForm } from "@/components/form/CommitForm";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import type { CommitsResponse, CommitsRequest } from "@/types/commit";

interface GeneratorSectionProps {
  className?: string;
}

export function GeneratorSection({ className }: GeneratorSectionProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [data, setData] = useState<CommitsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<CommitsRequest | null>(null);
  const [groupBy, setGroupBy] = useState<"repo" | "none">("repo");

  const handleSuccess = useCallback((response: CommitsResponse) => {
    setData(response);
    setStatus("success");
    setError(null);
  }, []);

  const handleError = useCallback((err: string) => {
    setError(err);
    setStatus("error");
  }, []);

  const handleLoading = useCallback((isLoading: boolean) => {
    if (isLoading) setStatus("loading");
  }, []);

  const handleRetry = useCallback(() => {
    if (lastRequest) {
      // Re-send the last request using the same token from form state
      // The CommitForm handles the actual fetch, so we just need to trigger it
      // For now, we'll dispatch a custom event that CommitForm can listen to
      // But since we can't easily do that, we'll just clear error and let user re-submit
      setError(null);
      setStatus("idle");
      // Note: In a real implementation, we'd store the form state and re-submit
      // For this version, user needs to click "Ambil Commit" again
    }
  }, [lastRequest]);

  const handleFormSubmit = useCallback(async (payload: CommitsRequest) => {
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
        const message = errData.error || "Gagal mengambil commit dari server.";
        throw new Error(message);
      }

      const responseData: CommitsResponse = await response.json();
      handleSuccess(responseData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan jaringan. Silakan coba lagi.";
      handleError(message);
    }
  }, [handleSuccess, handleError]);

  return (
    <div className={className}>
      <CommitForm onSubmit={handleFormSubmit} />

      <ResultsPanel
        status={status}
        data={data}
        errorMessage={error}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        onRetry={handleRetry}
      />
    </div>
  );
}