"use client";

import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50 disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transition-none";

  const variants = {
    primary: "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-lg shadow-rose-500/25",
    secondary: "bg-rose-100 text-rose-700 hover:bg-rose-200 active:bg-rose-300",
    outline: "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 active:bg-rose-100",
    ghost: "text-rose-700 hover:bg-rose-100 active:bg-rose-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}