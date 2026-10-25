"use client";

import { cn } from "@/lib/cn";
import { CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getPresetRange, getDefaultRange, type DatePreset, type DateRange } from "@/lib/date-range";
import { formatInTimeZone } from "date-fns-tz";

function getTodayWib(): string {
  return formatInTimeZone(Date.now(), "Asia/Jakarta", "yyyy-MM-dd");
}

interface DateRangePickerProps {
  preset: DatePreset;
  customFrom: string;
  customTo: string;
  onChange: (preset: DatePreset, customFrom: string, customTo: string) => void;
  onRangeChange: (range: DateRange) => void;
}

export function DateRangePicker({ preset, customFrom, customTo, onChange, onRangeChange }: DateRangePickerProps) {
  const [customFromError, setCustomFromError] = useState("");
  const [customToError, setCustomToError] = useState("");

  const presets: { value: DatePreset; label: string }[] = [
    { value: "today", label: "Hari Ini" },
    { value: "yesterday", label: "Kemarin" },
    { value: "last7", label: "7 Hari Terakhir" },
    { value: "custom", label: "Kustom" },
  ];

  const handlePresetChange = (newPreset: DatePreset) => {
    onChange(newPreset, customFrom, customTo);
    if (newPreset !== "custom") {
      const range = getPresetRange(newPreset);
      onRangeChange(range);
    }
  };

  const handleCustomFromChange = (value: string) => {
    onChange("custom", value, customTo);
    if (value && customTo) {
      if (!isCustomValid(value, customTo)) {
        const fromDate = Date.parse(value);
        const toDate = Date.parse(customTo);
        if (fromDate > toDate) {
          setCustomFromError("Tanggal mulai tidak boleh setelah tanggal akhir");
        } else {
          const diffMs = toDate - fromDate;
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays > 31) {
            setCustomToError("Rentang tanggal maksimal 31 hari");
          }
        }
      } else {
        const range = getPresetRange("custom", value, customTo);
        onRangeChange(range);
      }
    }
    setCustomFromError("");
  };

  const handleCustomToChange = (value: string) => {
    onChange("custom", customFrom, value);
    if (customFrom && value) {
      if (!isCustomValid(customFrom, value)) {
        const fromDate = Date.parse(customFrom);
        const toDate = Date.parse(value);
        if (fromDate > toDate) {
          setCustomFromError("Tanggal mulai tidak boleh setelah tanggal akhir");
        } else {
          const diffMs = toDate - fromDate;
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays > 31) {
            setCustomToError("Rentang tanggal maksimal 31 hari");
          }
        }
      } else {
        const range = getPresetRange("custom", customFrom, value);
        onRangeChange(range);
      }
    }
    setCustomToError("");
  };

  const isCustomValid = (from: string, to: string): boolean => {
    if (!from || !to) return false;
    const fromDate = Date.parse(from);
    const toDate = Date.parse(to);
    if (isNaN(fromDate) || isNaN(toDate)) return false;
    if (fromDate > toDate) return false;
    const diffMs = toDate - fromDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 31) return false;
    return true;
  };

  const currentRange = (() => {
    if (preset !== "custom") {
      return getPresetRange(preset);
    }
    if (isCustomValid(customFrom, customTo)) {
      return getPresetRange("custom", customFrom, customTo);
    }
    return { since: "", until: "", label: "Pilih tanggal" };
  })();

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">Rentang Tanggal</label>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Pilih rentang tanggal">
        {presets.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={preset === value}
            onClick={() => handlePresetChange(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50",
              "motion-reduce:transition-none",
              preset === value
                ? "bg-rose-500 text-white"
                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      {preset === "custom" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Dari"
            type="date"
            value={customFrom}
            onChange={(e) => handleCustomFromChange(e.target.value)}
            error={customFromError}
            min="2020-01-01" max={getTodayWib()}            id="custom-from"
          />
          <Input
            label="Sampai"
            type="date"
            value={customTo}
            onChange={(e) => handleCustomToChange(e.target.value)}
            error={customToError}
            min={customFrom || "2020-01-01"}
            max={getTodayWib()}
            id="custom-to"
          />
        </div>
      )}

      {/* Range Summary Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="rose" size="sm">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {currentRange.label}
        </Badge>
        <span className="text-xs text-slate-500">
          ({currentRange.since.split("T")[0]} – {currentRange.until.split("T")[0]})
        </span>
      </div>
    </div>
  );
}