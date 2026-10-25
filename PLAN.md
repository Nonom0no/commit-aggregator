# PLAN.md — Commit Aggregator

## Keputusan Arsitektur
1. **Tailwind CSS v4** (default `create-next-app`, konfigurasi via `@theme` di `globals.css`).
2. **Vitest** untuk unit test helper (`parseRepoUrl`, `parseConventional`, `buildMarkdown`).
3. Inisialisasi `create-next-app` langsung di root folder ini.

---

## Progress Checklist

- [x] **Fase 1: Setup Proyek & Styling Base**
  - [x] Inisialisasi Next.js (App Router, TypeScript, Tailwind v4, ESLint, `src/`, alias `@/*`)
  - [x] Instal dependensi (`@octokit/rest`, `zod`, `lucide-react`, `clsx`, `server-only`, `vitest` dev)
  - [x] Konfigurasi font Plus Jakarta Sans & background `bg-rose-50`
  - [x] Verifikasi `npm run lint` & `npm run build`

- [x] **Fase 2: Tipe Data, Schema Validation & Lib Utilities**
  - [x] `src/types/commit.ts`
  - [x] `src/lib/cn.ts`, `parse-repo-url.ts`, `conventional.ts`, `date-range.ts`, `schema.ts`, `markdown.ts`, `rate-limit.ts`
  - [x] Unit test Vitest untuk helper (`parseRepoUrl`, `parseConventional`, `date-range`, `buildMarkdown`, `rate-limit`)

- [x] **Fase 3: Backend API Commit Route Handler**
  - [x] `src/lib/github.ts` (`server-only`)
  - [x] `src/app/api/commits/route.ts`
  - [x] Verifikasi endpoint POST /api/commits

- [x] **Fase 4: UI Design System Base & Floating Navbar**
  - [x] Component UI: `Badge`, `Button`, `Card`, `Input`, `Skeleton`, `Alert`
  - [x] Component Layout: `FloatingNavbar`

- [x] **Fase 5: Form Input Commit (`CommitForm`)**
  - [x] `RepoInputList`, `DateRangePicker`, `PrivateRepoField`, `CommitForm`
  - [x] `src/components/GeneratorSection.tsx`

- [x] **Fase 6: Panel Hasil Commit & Ekspor Markdown (`ResultsPanel`)**
  - [x] `CommitTypeBadge`, `CommitCard`, `RepoGroupHeader`, `CopyMarkdownButton`, `ResultsPanel`
  - [x] Rakit `src/app/page.tsx`

- [x] **Fase 7: Polesan Akhir, Keamanan & Build Verification**
  - [x] Security headers & CSP di `next.config.ts`
  - [x] `README.md`, `.env.example`
  - [x] Halaman pendukung `not-found.tsx`, `error.tsx`, `icon.svg`
  - [x] Verifikasi mobile (360px) & audit keamanan token