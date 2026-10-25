import type { CommitsResponse } from "@/types/commit";
import { formatInTimeZone } from "date-fns-tz";

const TIMEZONE = "Asia/Jakarta";

type GroupBy = "repo" | "none";

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return formatInTimeZone(date, TIMEZONE, "HH.mm");
}

function formatDateRange(since: string, until: string): string {
  const sinceDate = new Date(since);
  const untilDate = new Date(until);
  const sinceStr = formatInTimeZone(sinceDate, TIMEZONE, "dd MMM yyyy");
  const untilStr = formatInTimeZone(untilDate, TIMEZONE, "dd MMM yyyy");
  return sinceStr === untilStr ? sinceStr : `${sinceStr} – ${untilStr}`;
}

function formatCommitLine(commit: CommitsResponse["commits"][0], showRepoName = false): string {
  const time = formatTime(commit.date);
  const shaLink = `[\`${commit.shortSha}\`](${commit.url})`;
  const repoPrefix = showRepoName ? `\`${commit.repo.name}\` ` : "";
  
  if (commit.conventional) {
    const { type, scope, breaking, description } = commit.conventional;
    const scopeStr = scope ? `(${scope})` : "";
    const breakingStr = breaking ? "!" : "";
    return `- ${repoPrefix}**${type}${scopeStr}${breakingStr}:** ${description} — ${shaLink} (${time})`;
  }
  return `- ${repoPrefix}${commit.title} — ${shaLink} (${time})`;
}

export function buildMarkdown(response: CommitsResponse, options: { groupBy: GroupBy } = { groupBy: "repo" }): string {
  const { commits, meta } = response;
  
  // Sort commits by date descending (newest first)
  const sortedCommits = [...commits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const title = `## Laporan Commit — ${formatDateRange(meta.since, meta.until)}`;
  
  if (sortedCommits.length === 0) {
    return `${title}\n\nBelum ada commit pada rentang ini.`;
  }

  if (options.groupBy === "none") {
    const lines = sortedCommits.map((c) => formatCommitLine(c, true));
    return `${title}\n\n${lines.join("\n")}`;
  }

  // Group by repo
  const grouped = new Map<string, CommitsResponse["commits"]>();
  for (const commit of sortedCommits) {
    const key = commit.repo.fullName;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(commit);
  }

  const sections: string[] = [];
  for (const [repoFullName, repoCommits] of grouped) {
    const repo = repoCommits[0].repo;
    const header = `### ${repo.fullName} (${repoCommits.length} commit${repoCommits.length !== 1 ? "s" : ""})`;
    const lines = repoCommits.map((c) => formatCommitLine(c, false));
    sections.push(`${header}\n${lines.join("\n")}`);
  }

  return `${title}\n\n${sections.join("\n\n")}`;
}