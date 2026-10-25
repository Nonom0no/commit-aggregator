"use client";

import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = "text", width, height, ...props }: SkeletonProps) {
  const base = "animate-pulse bg-rose-100 rounded overflow-hidden";

  const variants = {
    text: "h-4 rounded-full",
    circular: "rounded-full",
    rectangular: "rounded-2xl",
  };

  return (
    <div
      className={cn(base, variants[variant], className)}
      style={{ width, height }}
      {...props}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className, lines = 3, ...props }: HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("rounded-2xl border border-rose-200 bg-white p-6 space-y-4", className)} {...props}>
      <Skeleton variant="rectangular" width="40%" height="24px" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} variant="text" width={i === lines - 1 ? "60%" : "100%"} />
        ))}
      </div>
    </div>
  );
}