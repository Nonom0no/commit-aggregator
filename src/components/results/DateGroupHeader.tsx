"use client";

import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface DateGroupHeaderProps {
  label: string;
  commitCount: number;
}

export function DateGroupHeader({ label, commitCount }: DateGroupHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-700">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        {label}
      </h3>
      <div className="h-px flex-1 bg-rose-200" aria-hidden="true" />
      <Badge variant="rose" size="sm">
        {commitCount} commit
      </Badge>
    </div>
  );
}
