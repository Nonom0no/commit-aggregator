"use client";

import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, ForwardRefExoticComponent, RefAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = Object.assign(
  function Input({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            className={cn(
              "w-full rounded-2xl border bg-white text-slate-900 placeholder:text-slate-400",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50",
              "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
              "motion-reduce:transition-none",
              leftIcon ? "pl-10" : "pl-4",
              rightIcon ? "pr-10" : "pr-4",
              "py-2.5 text-sm",
              error
                ? "border-red-300 focus-visible:ring-red-400 focus-visible:ring-offset-red-50"
                : "border-rose-200 hover:border-rose-300",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
  { displayName: "Input" }
) as ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>;

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = Object.assign(
  function Textarea({ className, label, error, helperText, id, ...props }: TextareaProps) {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "w-full rounded-2xl border bg-white text-slate-900 placeholder:text-slate-400",
            "transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50",
            "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
            "motion-reduce:transition-none",
            "p-4 text-sm resize-y min-h-[100px]",
            error
              ? "border-red-300 focus-visible:ring-red-400 focus-visible:ring-offset-red-50"
              : "border-rose-200 hover:border-rose-300",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-sm text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
  { displayName: "Textarea" }
) as ForwardRefExoticComponent<TextareaProps & RefAttributes<HTMLTextAreaElement>>;