import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit, getClientIp } from "../rate-limit";
import { store } from "../rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    store.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows first request", () => {
    const result = rateLimit("192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
  });

  it("tracks request count per IP", () => {
    rateLimit("192.168.1.1");
    rateLimit("192.168.1.1");
    const result = rateLimit("192.168.1.1");
    expect(result.remaining).toBe(17);
  });

  it("blocks after MAX_REQUESTS", () => {
    for (let i = 0; i < 20; i++) {
      rateLimit("192.168.1.2");
    }
    const result = rateLimit("192.168.1.2");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    for (let i = 0; i < 20; i++) {
      rateLimit("192.168.1.3");
    }
    vi.advanceTimersByTime(61_000);
    const result = rateLimit("192.168.1.3");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
  });

  it("separates limits by IP", () => {
    for (let i = 0; i < 20; i++) {
      rateLimit("192.168.1.4");
    }
    const result = rateLimit("192.168.1.5");
    expect(result.allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("extracts IP from x-forwarded-for", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "1.2.3.4, 5.6.7.8");
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers();
    headers.set("x-real-ip", "9.10.11.12");
    expect(getClientIp(headers)).toBe("9.10.11.12");
  });

  it("returns unknown if no headers", () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe("unknown");
  });
});