"use client";

import { useState, useRef, FormEvent } from "react";
import { GitCommitHorizontal, Loader2 } from "lucide-react";
import { RepoInputList } from "./RepoInputList";
import { DateRangePicker } from "./DateRangePicker";
import { PrivateRepoField } from "./PrivateRepoField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { getPresetRange, getDefaultRange, type DatePreset, type DateRange } from "@/lib/date-range";
import { isValidRepoUrl } from "@/lib/parse-repo-url";
import type { CommitsRequest, CommitsResponse } from "@/types/commit";

type Status = "idle" | "loading" | "success" | "error";

interface CommitFormProps {
  onSuccess: (data: CommitsResponse) => void;
  onError: (error: string) => void;
  onLoading: (isLoading: boolean) => void;
}

export function CommitForm({ onSuccess, onError, onLoading }: CommitFormProps) {
  const [repos, setRepos] = useState<string[]>(["", ""]);
  const [preset, setPreset] = useState<DatePreset>("today");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const validRepos = repos.map((r) => r.trim()).filter((r) => r && isValidRepoUrl(r));
  const hasValidRepos = validRepos.length > 0;

  const isCustomDateValid = (preset: DatePreset, from: string, to: string): boolean => {
    if (preset !== "custom") return true;
    if (!from || !to) return false;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false;
    if (fromDate > toDate) return false;
    const diffMs = toDate.getTime() - fromDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 31) return false;
    return true;
  };

  const hasValidDateRange = isCustomDateValid(preset, customFrom, customTo);

  const handleRangeChange = (range: DateRange) => {
    // range updated in picker
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!hasValidRepos) {
      setFormError("Masukkan setidaknya satu URL repositori GitHub yang valid.");
      return;
    }

    // Abort previous request if pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setStatus("loading");
    setFormError(null);
    onLoading(true);

    let dateRange: DateRange;
    try {
      dateRange = getPresetRange(preset, customFrom, customTo);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Rentang tanggal tidak valid.";
      setFormError(msg);
      setStatus("error");
      onLoading(false);
      onError(msg);
      return;
    }

    const payload: CommitsRequest = {
      repos: validRepos,
      since: dateRange.since,
      until: dateRange.until,
      timezone: "Asia/Jakarta",
    };

    if (isPrivate && token.trim()) {
      payload.token = token.trim();
    }

    try {
      const response = await fetch("/api/commits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Terlalu banyak permintaan, coba lagi sebentar.");
        }

        const errData = await response.json().catch(() => ({}));
        const message = errData.error || "Gagal mengambil commit dari server.";
        throw new Error(message);
      }

      const data: CommitsResponse = await response.json();
      setStatus("success");
      onSuccess(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      const message = err instanceof Error ? err.message : "Terjadi kesalahan jaringan. Silakan coba lagi.";
      setStatus("error");
      setFormError(message);
      onError(message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <Card variant="default" padding="lg" className="rounded-3xl">
      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Repositories */}
        <RepoInputList repos={repos} onChange={setRepos} />

        {/* Date Range */}
        <DateRangePicker
          preset={preset}
          customFrom={customFrom}
          customTo={customTo}
          onChange={(newPreset, from, to) => {
            setPreset(newPreset);
            setCustomFrom(from);
            setCustomTo(to);
          }}
          onRangeChange={handleRangeChange}
        />

        {/* Private Repo Checkbox + Token */}
        <PrivateRepoField
          isPrivate={isPrivate}
          token={token}
          onIsPrivateChange={setIsPrivate}
          onTokenChange={setToken}
        />

        {/* Form Global Error */}
        {formError && (
          <Alert variant="error" dismissible onDismiss={() => setFormError(null)}>
            {formError}
          </Alert>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex justify-center sm:justify-start">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={status === "loading"}
            disabled={!hasValidRepos || !hasValidDateRange || status === "loading"}
            className="w-full sm:w-auto px-8 py-3.5 text-base shadow-lg shadow-rose-500/25"
          >
            {status === "loading" ? (
              "Mengambil commit…"
            ) : (
              <>
                <GitCommitHorizontal className="h-5 w-5" aria-hidden="true" />
                Ambil Commit
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}