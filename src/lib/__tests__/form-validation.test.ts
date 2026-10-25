import { describe, it, expect } from "vitest";

describe("Custom Date Range Validation Logic", () => {
  function validateCustomDateRange(from: string, to: string): { valid: boolean; error?: string } {
    if (!from || !to) {
      return { valid: false, error: "Tanggal mulai dan selesai wajib diisi" };
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return { valid: false, error: "Format tanggal tidak valid" };
    }

    if (fromDate > toDate) {
      return { valid: false, error: "Tanggal mulai tidak boleh setelah tanggal akhir" };
    }

    const diffMs = toDate.getTime() - fromDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 31) {
      return { valid: false, error: "Rentang tanggal maksimal 31 hari" };
    }

    return { valid: true };
  }

  it("returns valid for correct range within 31 days", () => {
    const result = validateCustomDateRange("2026-10-01", "2026-10-15");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("returns error if from date is after to date", () => {
    const result = validateCustomDateRange("2026-10-20", "2026-10-10");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Tanggal mulai tidak boleh setelah tanggal akhir");
  });

  it("returns error if date range exceeds 31 days", () => {
    const result = validateCustomDateRange("2026-10-01", "2026-11-15");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Rentang tanggal maksimal 31 hari");
  });

  it("returns error if dates are missing", () => {
    const result = validateCustomDateRange("", "2026-10-10");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Tanggal mulai dan selesai wajib diisi");
  });
});