import { z } from "zod";
import { parseRepoUrl } from "./parse-repo-url";

const repoUrlSchema = z.string().min(1).refine(
  (url) => {
    try {
      parseRepoUrl(url);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Format URL repositori tidak valid. Gunakan https://github.com/owner/repo atau owner/repo" }
);

export const commitsRequestSchema = z.object({
  repos: z.array(repoUrlSchema).min(1, "Minimal 1 repositori").max(10, "Maksimal 10 repositori"),
  since: z.iso.datetime({ offset: true, message: "Format tanggal since tidak valid (ISO 8601 dengan offset)" }),
  until: z.iso.datetime({ offset: true, message: "Format tanggal until tidak valid (ISO 8601 dengan offset)" }),
  token: z.string().max(255).optional().transform((v) => (v ? v.trim() : undefined)),
  author: z.string().regex(/^[A-Za-z0-9-]{1,39}$/, "Username GitHub tidak valid").optional(),
  timezone: z.string().default("Asia/Jakarta"),
}).strict().refine(
  (data) => new Date(data.since) <= new Date(data.until),
  { message: "Tanggal mulai (since) harus sebelum atau sama dengan tanggal akhir (until)", path: ["since"] }
).refine(
  (data) => {
    const diffMs = new Date(data.until).getTime() - new Date(data.since).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 31;
  },
  { message: "Rentang tanggal maksimal 31 hari", path: ["until"] }
);

export type CommitsRequestInput = z.infer<typeof commitsRequestSchema>;