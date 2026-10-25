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

- [ ] **Fase 3: Backend API Commit Route Handler**
  - [ ] `src/lib/github.ts` (`server-only`)
  - [ ] `src/app/api/commits/route.ts`
  - [ ] Verifikasi endpoint POST /api/commits

- [ ] **Fase 4: UI Design System Base & Floating Navbar**
  - [ ] Component UI: `Badge`, `Button`, `Card`, `Input`, `Skeleton`, `Alert`
  - [ ] Component Layout: `FloatingNavbar`

- [ ] **Fase 5: Form Input Commit (`CommitForm`)**
  - [ ] `RepoInputList`, `DateRangePicker`, `PrivateRepoField`, `CommitForm`

- [ ] **Fase 6: Panel Hasil Commit & Ekspor Markdown (`ResultsPanel`)**
  - [ ] `CommitTypeBadge`, `CommitCard`, `RepoGroupHeader`, `CopyMarkdownButton`, `ResultsPanel`
  - [ ] Rakit `src/app/page.tsx`

- [ ] **Fase 7: Polesan Akhir, Keamanan & Build Verification**
  - [ ] Security headers & CSP di `next.config.ts`
  - [ ] `README.md`, `.env.example`
  - [ ] Verifikasi mobile (360px) & audit keamanan token
