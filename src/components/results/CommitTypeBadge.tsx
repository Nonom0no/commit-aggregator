"use client";

import { Badge } from "@/components/ui/Badge";
import type { ParsedConventional } from "@/types/commit";

interface CommitTypeBadgeProps {
  conventional: ParsedConventional | null;
}

const TYPE_COLORS: Record<string, "emerald" | "rose" | "sky" | "violet" | "amber" | "orange" | "teal" | "indigo" | "slate" | "red"> = {
  feat: "emerald",
  fix: "rose",
  docs: "sky",
  style: "violet",
  refactor: "amber",
  perf: "orange",
  test: "teal",
  build: "indigo",
  ci: "indigo",
  chore: "slate",
  revert: "red",
};

export function CommitTypeBadge({ conventional }: CommitTypeBadgeProps) {
  if (!conventional) return null;

  const { type, scope, breaking } = conventional;
  const color = TYPE_COLORS[type.toLowerCase()] || "slate";

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge variant={color} size="sm">
        {type.toLowerCase()}{scope ? `(${scope})` : ""}{breaking ? "!" : ""}
      </Badge>
      {breaking && (
        <Badge variant="red" size="sm">
          BREAKING
        </Badge>
      )}
    </span>
  );
}