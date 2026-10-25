import { describe, it, expect } from "vitest";
import { commitsRequestSchema } from "../schema";

describe("commitsRequestSchema - token validation", () => {
  const validBase = {
    repos: ["https://github.com/owner/repo"],
    since: "2026-10-25T00:00:00+07:00",
    until: "2026-10-25T23:59:59+07:00",
  };

  it("accepts classic token ghp_...", () => {
    const result = commitsRequestSchema.safeParse({
      ...validBase,
      token: "ghp_abcdefghijklmnopqrstuvwxyz123456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.token).toBe("ghp_abcdefghijklmnopqrstuvwxyz123456");
    }
  });

  it("accepts fine-grained token github_pat_...", () => {
    const result = commitsRequestSchema.safeParse({
      ...validBase,
      token: "github_pat_abcdefghijklmnopqrstuvwxyz123456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.token).toBe("github_pat_abcdefghijklmnopqrstuvwxyz123456");
    }
  });

  it("rejects token longer than 255 characters", () => {
    const longToken = "ghp_" + "a".repeat(252); // 256 chars total
    const result = commitsRequestSchema.safeParse({
      ...validBase,
      token: longToken,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("token"))).toBe(true);
    }
  });

  it("accepts token exactly 255 characters", () => {
    const token255 = "ghp_" + "a".repeat(251); // 255 chars total
    const result = commitsRequestSchema.safeParse({
      ...validBase,
      token: token255,
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from token", () => {
    const result = commitsRequestSchema.safeParse({
      ...validBase,
      token: "  ghp_abcdefghijklmnopqrstuvwxyz123456  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.token).toBe("ghp_abcdefghijklmnopqrstuvwxyz123456");
    }
  });

  it("treats empty string as undefined (optional)", () => {
    const result = commitsRequestSchema.safeParse({
      ...validBase,
      token: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.token).toBeUndefined();
    }
  });
});