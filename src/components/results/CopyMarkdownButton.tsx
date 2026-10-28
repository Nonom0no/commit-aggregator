"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/cn";
import { Copy, Check, AlertCircle } from "lucide-react";
import { buildMarkdown } from "@/lib/markdown";
import { Alert } from "@/components/ui/Alert";
import type { CommitsResponse } from "@/types/commit";
import type { GroupBy } from "@/lib/group-by-date";

interface CopyMarkdownButtonProps {
  data: CommitsResponse | null;
  groupBy: GroupBy;
  disabled?: boolean;
  className?: string;
}

export function CopyMarkdownButton({ data, groupBy, disabled = false, className }: CopyMarkdownButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for non-secure contexts
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }, []);

  const handleClick = useCallback(async () => {
    if (!data || data.commits.length === 0 || disabled) return;

    try {
      const markdown = buildMarkdown(data, { groupBy });
      await copyToClipboard(markdown);
      setStatus("copied");
      setErrorMessage(null);

      // Reset after 2 seconds
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage("Gagal menyalin ke clipboard");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setStatus("idle");
        setErrorMessage(null);
      }, 3000);
    }
  }, [data, groupBy, disabled, copyToClipboard]);

  const isCopied = status === "copied";
  const isError = status === "error";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={!data || data.commits.length === 0 || disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50",
          "motion-reduce:transition-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isCopied
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
            : isError
            ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
            : "bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 active:bg-rose-700"
        )}
        aria-live="polite"
        aria-pressed={isCopied}
      >
        {isCopied ? (
          <>
            <Check className="h-5 w-5" aria-hidden="true" />
            Tersalin!
          </>
        ) : isError ? (
          <>
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
            Gagal
          </>
        ) : (
          <>
            <Copy className="h-5 w-5" aria-hidden="true" />
            Copy as Markdown
          </>
        )}
      </button>

      {isError && errorMessage && (
        <Alert variant="error" className="max-w-xs">
          {errorMessage}
        </Alert>
      )}
    </div>
  );
}