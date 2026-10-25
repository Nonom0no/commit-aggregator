"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { ExternalLink, Clock, User, FolderGit2 } from "lucide-react";
import { CommitTypeBadge } from "./CommitTypeBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { CommitItem } from "@/types/commit";

interface CommitCardProps {
  commit: CommitItem;
}

export function CommitCard({ commit }: CommitCardProps) {
  const [showFullBody, setShowFullBody] = useState(false);
  const hasBody = commit.body && commit.body.trim().length > 0;

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }).replace(":", ".");
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
  };

  const displayTitle = commit.conventional?.description || commit.title;
  const displayBody = commit.body;

  return (
    <Card
      variant="default"
      padding="md"
      className="rounded-2xl animate-fade-in"
    >
      {/* Top row: type badge, scope, breaking */}
      <div className="flex items-center flex-wrap gap-2 mb-3">
        <CommitTypeBadge conventional={commit.conventional} />
        {commit.conventional?.scope && (
          <Badge variant="slate" size="sm">
            {commit.conventional.scope}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h4 className="font-semibold text-slate-900 text-base mb-2">
        {displayTitle}
      </h4>

      {/* Body */}
      {hasBody && (
        <div className="text-sm text-slate-600 mb-3">
          <p
            className={cn(
              "whitespace-pre-wrap break-words",
              !showFullBody && "line-clamp-2"
            )}
          >
            {displayBody}
          </p>
          <button
            type="button"
            onClick={() => setShowFullBody(!showFullBody)}
            className="text-xs font-medium text-rose-600 hover:text-rose-700 underline underline-offset-1 mt-1"
          >
            {showFullBody ? "Lebih sedikit" : "Selengkapnya"}
          </button>
        </div>
      )}

      {/* Bottom badges: repo, SHA, time, author */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        <Badge variant="sky" size="sm" className="gap-1">
          <FolderGit2 className="h-3 w-3" aria-hidden="true" />
          {commit.repo.name}
        </Badge>
        <Badge variant="slate" size="sm" className="gap-1">
          <a
            href={commit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono hover:text-rose-600 transition-colors"
          >
            {commit.shortSha}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </Badge>
        <Badge variant="slate" size="sm" className="gap-1">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {formatTime(commit.date)}
        </Badge>
        <Badge variant="slate" size="sm" className="gap-1">
          <User className="h-3 w-3" aria-hidden="true" />
          {commit.authorName}
        </Badge>
      </div>
    </Card>
  );
}