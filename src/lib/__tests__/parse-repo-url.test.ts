import { describe, it, expect } from "vitest";
import { parseRepoUrl, isValidRepoUrl } from "../parse-repo-url";

describe("parseRepoUrl", () => {
  it("parses full HTTPS GitHub URL", () => {
    expect(parseRepoUrl("https://github.com/owner/repo")).toEqual({ owner: "owner", repo: "repo" });
  });

  it("parses full HTTPS GitHub URL with www", () => {
    expect(parseRepoUrl("https://www.github.com/owner/repo")).toEqual({ owner: "owner", repo: "repo" });
  });

  it("parses URL with .git suffix", () => {
    expect(parseRepoUrl("https://github.com/owner/repo.git")).toEqual({ owner: "owner", repo: "repo" });
  });

  it("parses URL with trailing slash", () => {
    expect(parseRepoUrl("https://github.com/owner/repo/")).toEqual({ owner: "owner", repo: "repo" });
  });

  it("parses shorthand owner/repo", () => {
    expect(parseRepoUrl("owner/repo")).toEqual({ owner: "owner", repo: "repo" });
  });

  it("parses owner with dots and hyphens", () => {
    expect(parseRepoUrl("my-org.my-sub/repo-name")).toEqual({ owner: "my-org.my-sub", repo: "repo-name" });
  });

  it("throws on invalid host", () => {
    expect(() => parseRepoUrl("https://gitlab.com/owner/repo")).toThrow("Format URL tidak valid");
  });

  it("throws on missing path", () => {
    expect(() => parseRepoUrl("https://github.com/owner")).toThrow("Format URL tidak valid");
  });

  it("throws on empty string", () => {
    expect(() => parseRepoUrl("")).toThrow("Format URL tidak valid");
  });

  it("throws on random string", () => {
    expect(() => parseRepoUrl("not-a-url")).toThrow("Format URL tidak valid");
  });
});

describe("isValidRepoUrl", () => {
  it("returns true for valid URLs", () => {
    expect(isValidRepoUrl("https://github.com/owner/repo")).toBe(true);
    expect(isValidRepoUrl("owner/repo")).toBe(true);
    expect(isValidRepoUrl("https://github.com/owner/repo.git")).toBe(true);
  });

  it("returns false for invalid URLs", () => {
    expect(isValidRepoUrl("https://gitlab.com/owner/repo")).toBe(false);
    expect(isValidRepoUrl("https://github.com/owner")).toBe(false);
    expect(isValidRepoUrl("")).toBe(false);
    expect(isValidRepoUrl("not-a-url")).toBe(false);
  });
});