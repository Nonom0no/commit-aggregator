"use client";

import { useState } from "react";
import { CommitForm } from "@/components/form/CommitForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { CommitsResponse, RepoError } from "@/types/commit";
import { Alert } from "@/components/ui/Alert";
import { GitCommitHorizontal, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface GeneratorSectionProps {
  className?: string;
}

export function GeneratorSection({ className }: GeneratorSectionProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [data, setData] = useState<CommitsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (response: CommitsResponse) => {
    setData(response);
    setStatus("success");
    setError(null);
  };

  const handleError = (err: string) => {
    setError(err);
    setStatus("error");
  };

  const handleLoading = (isLoading: boolean) => {
    if (isLoading) setStatus("loading");
  };

  const handleReset = () => {
    setStatus("idle");
    setData(null);
    setError(null);
  };

  const errorCount = data?.errors.length ?? 0;
  const totalCommits = data?.meta.total ?? 0;
  const repoCount = data?.meta.repoCount ?? 0;

  return (
    <div className={className}>
      <CommitForm onSuccess={handleSuccess} onError={handleError} onLoading={handleLoading} />

      {/* Results Summary */}
      {status === "success" && data && (
        <Card variant="outlined" padding="md" className="mt-6 animate-fade-in">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-0">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-700">
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-lg">Berhasil mengambil commit</CardTitle>
                <p className="text-sm text-slate-600">
                  <Badge variant="emerald" size="sm">{totalCommits} commit</Badge>
                  <Badge variant="sky" size="sm" className="ml-2">{repoCount} repo</Badge>
                  {errorCount > 0 && (
                    <Badge variant="amber" size="sm" className="ml-2">{errorCount} error</Badge>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="rose" size="sm">{data.meta.since.split("T")[0]} – {data.meta.until.split("T")[0]}</Badge>
            </div>
          </CardHeader>

          {errorCount > 0 && data.errors.length > 0 && (
            <CardContent className="mt-4">
              <Alert variant="warning" title="Beberapa repo gagal diproses" className="mb-4">
                <div className="space-y-2">
                  {data.errors.map((err: RepoError, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
                      <span className="font-medium text-slate-700">{err.repo}</span>
                      <span className="text-slate-600">–</span>
                      <span className="text-slate-600">{err.message}</span>
                    </div>
                  ))}
                </div>
              </Alert>
            </CardContent>
          )}

          <div className="mt-4 text-center sm:text-right">
            <p className="text-xs text-slate-500">
              Panel hasil lengkap dengan tombol Copy Markdown akan tersedia di Fase 6.
            </p>
          </div>
        </Card>
      )}

      {status === "error" && error && (
        <Card variant="outlined" padding="md" className="mt-6 animate-fade-in border-red-200">
          <CardContent className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-700 flex-shrink-0">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Gagal mengambil commit</p>
              <p className="text-sm text-slate-600 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === "loading" && (
        <Card variant="outlined" padding="md" className="mt-6 animate-fade-in">
          <CardContent className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-rose-500 animate-spin" aria-hidden="true" />
            <p className="text-slate-600">Mengambil commit dari GitHub…</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}