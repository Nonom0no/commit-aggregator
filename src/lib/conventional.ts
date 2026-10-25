export interface ParsedConventional {
  type: string;
  scope: string | null;
  breaking: boolean;
  description: string;
}

const CONVENTIONAL_TYPES = new Set([
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
]);

const CONVENTIONAL_REGEX = /^(\w+)(?:\(([^)]+)\))?(!)?:\s(.+)$/;

export function parseConventional(message: string): ParsedConventional | null {
  const firstLine = message.trim().split("\n")[0];
  const match = firstLine.match(CONVENTIONAL_REGEX);

  if (!match) return null;

  const [, type, scope, breaking, description] = match;

  return {
    type: type.toLowerCase(),
    scope: scope ?? null,
    breaking: breaking === "!",
    description: description.trim(),
  };
}

export function isKnownConventionalType(type: string): boolean {
  return CONVENTIONAL_TYPES.has(type.toLowerCase());
}