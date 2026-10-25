import { describe, it, expect } from "vitest";
import { parseConventional, isKnownConventionalType } from "../conventional";

describe("parseConventional", () => {
  it("parses basic feat commit", () => {
    const result = parseConventional("feat: add login page");
    expect(result).toEqual({
      type: "feat",
      scope: null,
      breaking: false,
      description: "add login page",
    });
  });

  it("parses fix with scope", () => {
    const result = parseConventional("fix(auth): handle null token");
    expect(result).toEqual({
      type: "fix",
      scope: "auth",
      breaking: false,
      description: "handle null token",
    });
  });

  it("parses breaking change with !", () => {
    const result = parseConventional("feat!: change API response format");
    expect(result).toEqual({
      type: "feat",
      scope: null,
      breaking: true,
      description: "change API response format",
    });
  });

  it("parses breaking change with scope and !", () => {
    const result = parseConventional("fix(auth)!: remove deprecated method");
    expect(result).toEqual({
      type: "fix",
      scope: "auth",
      breaking: true,
      description: "remove deprecated method",
    });
  });

  it("parses docs commit", () => {
    const result = parseConventional("docs: update README");
    expect(result).toEqual({
      type: "docs",
      scope: null,
      breaking: false,
      description: "update README",
    });
  });

  it("parses style commit", () => {
    const result = parseConventional("style: format code with prettier");
    expect(result).toEqual({
      type: "style",
      scope: null,
      breaking: false,
      description: "format code with prettier",
    });
  });

  it("parses refactor commit", () => {
    const result = parseConventional("refactor(api): simplify error handling");
    expect(result).toEqual({
      type: "refactor",
      scope: "api",
      breaking: false,
      description: "simplify error handling",
    });
  });

  it("parses perf commit", () => {
    const result = parseConventional("perf: optimize database queries");
    expect(result).toEqual({
      type: "perf",
      scope: null,
      breaking: false,
      description: "optimize database queries",
    });
  });

  it("parses test commit", () => {
    const result = parseConventional("test: add unit tests for auth");
    expect(result).toEqual({
      type: "test",
      scope: null,
      breaking: false,
      description: "add unit tests for auth",
    });
  });

  it("parses build commit", () => {
    const result = parseConventional("build: update webpack config");
    expect(result).toEqual({
      type: "build",
      scope: null,
      breaking: false,
      description: "update webpack config",
    });
  });

  it("parses ci commit", () => {
    const result = parseConventional("ci: add GitHub Actions workflow");
    expect(result).toEqual({
      type: "ci",
      scope: null,
      breaking: false,
      description: "add GitHub Actions workflow",
    });
  });

  it("parses chore commit", () => {
    const result = parseConventional("chore: update dependencies");
    expect(result).toEqual({
      type: "chore",
      scope: null,
      breaking: false,
      description: "update dependencies",
    });
  });

  it("parses revert commit", () => {
    const result = parseConventional("revert: feat: add login page");
    expect(result).toEqual({
      type: "revert",
      scope: null,
      breaking: false,
      description: "feat: add login page",
    });
  });

  it("parses unknown type that matches pattern", () => {
    const result = parseConventional("custom(scope): do something");
    expect(result).toEqual({
      type: "custom",
      scope: "scope",
      breaking: false,
      description: "do something",
    });
  });

  it("returns null for non-conventional commit", () => {
    expect(parseConventional("add login page")).toBeNull();
    expect(parseConventional("Fix bug in login")).toBeNull();
    expect(parseConventional("")).toBeNull();
  });

  it("parses WIP as conventional type (matches pattern)", () => {
    const result = parseConventional("WIP: working on feature");
    expect(result).toEqual({
      type: "wip",
      scope: null,
      breaking: false,
      description: "working on feature",
    });
  });

  it("returns null for malformed conventional", () => {
    expect(parseConventional("feat:")).toBeNull();
    expect(parseConventional("feat")).toBeNull();
    expect(parseConventional("feat():")).toBeNull();
  });

  it("uses only first line of multi-line message", () => {
    const result = parseConventional("feat: add login\n\nBody with details\nBREAKING CHANGE: something");
    expect(result).toEqual({
      type: "feat",
      scope: null,
      breaking: false,
      description: "add login",
    });
  });
});

describe("isKnownConventionalType", () => {
  it("returns true for known types", () => {
    expect(isKnownConventionalType("feat")).toBe(true);
    expect(isKnownConventionalType("fix")).toBe(true);
    expect(isKnownConventionalType("docs")).toBe(true);
    expect(isKnownConventionalType("style")).toBe(true);
    expect(isKnownConventionalType("refactor")).toBe(true);
    expect(isKnownConventionalType("perf")).toBe(true);
    expect(isKnownConventionalType("test")).toBe(true);
    expect(isKnownConventionalType("build")).toBe(true);
    expect(isKnownConventionalType("ci")).toBe(true);
    expect(isKnownConventionalType("chore")).toBe(true);
    expect(isKnownConventionalType("revert")).toBe(true);
  });

  it("returns false for unknown types", () => {
    expect(isKnownConventionalType("custom")).toBe(false);
    expect(isKnownConventionalType("wip")).toBe(false);
    expect(isKnownConventionalType("")).toBe(false);
  });

  it("is case insensitive", () => {
    expect(isKnownConventionalType("FEAT")).toBe(true);
    expect(isKnownConventionalType("Fix")).toBe(true);
  });
});