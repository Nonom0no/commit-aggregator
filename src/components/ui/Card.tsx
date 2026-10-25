"use client";

import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, variant = "default", padding = "md", ...props }: CardProps) {
  const base = "rounded-2xl transition-all duration-200 ease-out motion-reduce:transition-none";

  const variants = {
    default: "bg-white border border-rose-200 shadow-[0_8px_30px_rgba(244,63,94,0.08)] hover:shadow-[0_12px_40px_rgba(244,63,94,0.14)] hover:-translate-y-0.5",
    elevated: "bg-white border border-rose-100 shadow-[0_12px_40px_rgba(244,63,94,0.14)] hover:shadow-[0_16px_50px_rgba(244,63,94,0.18)] hover:-translate-y-0.5",
    outlined: "bg-white border-2 border-rose-200 hover:border-rose-300",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6 md:p-8",
    lg: "p-8 md:p-10",
  };

  return (
    <div className={cn(base, variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={cn("mb-4", className)} {...props}>{children}</div>;
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return <h3 className={cn("text-xl font-semibold text-slate-900", className)} {...props}>{children}</h3>;
}

export function CardDescription({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) {
  return <p className={cn("mt-1 text-sm text-slate-600", className)} {...props}>{children}</p>;
}

export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={cn(className)} {...props}>{children}</div>;
}

export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={cn("mt-4 pt-4 border-t border-rose-100", className)} {...props}>{children}</div>;
}