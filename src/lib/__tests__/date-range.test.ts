import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getPresetRange, getDefaultRange, type DatePreset } from "../date-range";

describe("date-range", () => {
  // Mock current date to 2026-10-25 (Sunday) in WIB
  const mockNow = new Date("2026-10-25T12:00:00+07:00");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getPresetRange", () => {
    it("returns today range in WIB with correct ISO format", () => {
      const range = getPresetRange("today");
      expect(range.since).toBe("2026-10-25T00:00:00+07:00");
      expect(range.until).toBe("2026-10-25T23:59:59+07:00");
      expect(range.label).toBe("25 Okt 2026");
    });

    it("returns yesterday range in WIB", () => {
      const range = getPresetRange("yesterday");
      expect(range.since).toBe("2026-10-24T00:00:00+07:00");
      expect(range.until).toBe("2026-10-24T23:59:59+07:00");
      expect(range.label).toBe("24 Okt 2026");
    });

    it("returns last7 range (6 days ago to today) in WIB", () => {
      const range = getPresetRange("last7");
      expect(range.since).toBe("2026-10-19T00:00:00+07:00");
      expect(range.until).toBe("2026-10-25T23:59:59+07:00");
      expect(range.label).toBe("19 Okt 2026 – 25 Okt 2026");
    });

    it("returns custom range with provided dates in YYYY-MM-DD format (WIB)", () => {
      const range = getPresetRange("custom", "2026-10-20", "2026-10-22");
      expect(range.since).toBe("2026-10-20T00:00:00+07:00");
      expect(range.until).toBe("2026-10-22T23:59:59+07:00");
      expect(range.label).toBe("20 Okt 2026 – 22 Okt 2026");
    });

    it("throws when custom preset missing dates", () => {
      expect(() => getPresetRange("custom")).toThrow("Rentang kustom memerlukan customFrom dan customTo");
    });

    it("single day custom range shows single date label", () => {
      const range = getPresetRange("custom", "2026-10-20", "2026-10-20");
      expect(range.since).toBe("2026-10-20T00:00:00+07:00");
      expect(range.until).toBe("2026-10-20T23:59:59+07:00");
      expect(range.label).toBe("20 Okt 2026");
    });

    it("custom range treats input as WIB local date, not UTC (timezone bug fix)", () => {
      // This test verifies the fix: input "2026-10-25" should produce WIB dates,
      // not shift by one day due to UTC parsing
      const range = getPresetRange("custom", "2026-10-25", "2026-10-25");
      expect(range.since).toBe("2026-10-25T00:00:00+07:00");
      expect(range.until).toBe("2026-10-25T23:59:59+07:00");
    });

    it("multi-day custom range treats input as WIB local dates", () => {
      const range = getPresetRange("custom", "2026-10-20", "2026-10-25");
      expect(range.since).toBe("2026-10-20T00:00:00+07:00");
      expect(range.until).toBe("2026-10-25T23:59:59+07:00");
      expect(range.label).toBe("20 Okt 2026 – 25 Okt 2026");
    });
  });

  describe("getDefaultRange", () => {
    it("returns today as default", () => {
      const range = getDefaultRange();
      expect(range.since).toBe("2026-10-25T00:00:00+07:00");
      expect(range.until).toBe("2026-10-25T23:59:59+07:00");
      expect(range.label).toBe("25 Okt 2026");
    });
  });

  describe("timezone handling", () => {
    it("uses Asia/Jakarta timezone regardless of system timezone", () => {
      // The mocked time is already in WIB, verify the output has +07:00 offset
      const range = getPresetRange("today");
      expect(range.since).toContain("+07:00");
      expect(range.until).toContain("+07:00");
    });
  });
});