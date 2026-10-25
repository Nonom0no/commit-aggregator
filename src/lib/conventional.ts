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

// Strict pattern: type(scope)!: description
const STRICT_REGEX = /^(\w+)(?:\(([^)]+)\))?(!)?:\s(.+)$/;

// Loose pattern for known types only:
// - Without space after colon: feat:blabla, fix(api):blabla, feat!:blabla
// - Without colon, space separated: feat blabla, fix(api) blabla, feat! blabla
// Word boundary required: type must be followed by :, (, !, or space
const KNOWN_TYPES_ALT = [...CONVENTIONAL_TYPES].join("|");
const LOOSE_REGEX = new RegExp(
  `^(${KNOWN_TYPES_ALT})(?:\\(([^)]+)\\))?(!)?(?::\\s*(.+)|\\s+(.+))$`,
  "i"
);

export function parseConventional(message: string): ParsedConventional | null {
  const firstLine = message.trim().split("\n")[0];

  // Try strict pattern first (works for ANY type)
  const strictMatch = firstLine.match(STRICT_REGEX);
  if (strictMatch) {
    const [, type, scope, breaking, description] = strictMatch;
    const desc = description.trim();
    if (desc.length === 0) return null;
    return {
      type: type.toLowerCase(),
      scope: scope ?? null,
      breaking: breaking === "!",
      description: desc,
    };
  }

  // Try loose pattern (only for known 11 types, case-insensitive)
  const looseMatch = firstLine.match(LOOSE_REGEX);
  if (looseMatch) {
    const [, type, scope, breaking, descAfterColon, descAfterSpace] = looseMatch;
    const description = (descAfterColon ?? descAfterSpace ?? "").trim();
    if (description.length === 0) return null;
    return {
      type: type.toLowerCase(),
      scope: scope ?? null,
      breaking: breaking === "!",
      description,
    };
  }

  return null;
}

export function isKnownConventionalType(type: string): boolean {
  return CONVENTIONAL_TYPES.has(type.toLowerCase());
}