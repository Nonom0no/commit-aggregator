import { NextRequest, NextResponse } from "next/server";
import { commitsRequestSchema } from "@/lib/schema";
import { createOctokit, fetchRepoCommits, mapCommitsToResponse } from "@/lib/github";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const { allowed, remaining, resetAt } = rateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": Math.ceil((resetAt - Date.now()) / 1000).toString() } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body request tidak valid (harus JSON)." },
      { status: 400 }
    );
  }

  const parsed = commitsRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { repos, since, until, token, author } = parsed.data;

  const octokit = createOctokit(token);

  const results = await Promise.allSettled(
    repos.map(async (repoUrl) => {
      const { owner, repo } = parseRepoUrlFromInput(repoUrl);
      const result = await fetchRepoCommits(octokit, { owner, repo, since, until, author });
      return { commits: result.commits, error: result.error, repo: repoUrl };
    })
  );

  const settledResults = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return { commits: [], error: { repo: repos[i], code: "UNKNOWN" as const, message: "Gagal mengambil commit dari repo ini." }, repo: repos[i] };
  });

  const response = mapCommitsToResponse(settledResults, { since, until, repoCount: repos.length });

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store",
      "X-RateLimit-Remaining": remaining.toString(),
    },
  });
}

function parseRepoUrlFromInput(input: string): { owner: string; repo: string } {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };
  const shorthandMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (shorthandMatch) return { owner: shorthandMatch[1], repo: shorthandMatch[2] };
  throw new Error("Format URL tidak valid");
}