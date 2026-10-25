"use client";

import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "error" | "success" | "warning" | "info";
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Alert({ children, className, variant = "error", title, dismissible = false, onDismiss, ...props }: AlertProps) {
  const variants = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    info: "bg-sky-50 border-sky-200 text-sky-700",
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-4 flex gap-3",
        variants[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-sm">{title}</p>}
        <p className="text-sm mt-1">{children}</p>
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            "flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          )}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}