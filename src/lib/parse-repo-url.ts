export interface ParsedRepoUrl {
  owner: string;
  repo: string;
}

const GITHUB_URL_REGEX = /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/;
const SHORTHAND_REGEX = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/;

export function parseRepoUrl(input: string): ParsedRepoUrl {
  const trimmed = input.trim();

  // Try full GitHub URL
  const urlMatch = trimmed.match(GITHUB_URL_REGEX);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // Try shorthand owner/repo
  const shorthandMatch = trimmed.match(SHORTHAND_REGEX);
  if (shorthandMatch) {
    return { owner: shorthandMatch[1], repo: shorthandMatch[2] };
  }

  throw new Error("Format URL tidak valid. Gunakan https://github.com/owner/repo atau owner/repo");
}

export function isValidRepoUrl(input: string): boolean {
  try {
    parseRepoUrl(input);
    return true;
  } catch {
    return false;
  }
}