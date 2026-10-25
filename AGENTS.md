# AGENTS.md — Commit Aggregator

> Dokumen ini adalah instruksi utama untuk AI Coding Agent. Baca SELURUH dokumen sebelum menulis kode. Ikuti semua aturan secara literal. Jika ada konflik antara dokumen ini dan kebiasaan/default-mu, dokumen ini yang menang. Bagian **Security** dan **UI Design System** bersifat WAJIB.

---

## 1. Project Overview & Goal

### 1.1 Latar Belakang
Pemilik proyek adalah seorang pemagang yang mengerjakan satu proyek yang terpisah menjadi dua repositori GitHub (frontend dan backend). Untuk laporan harian, ia harus mengambil banyak screenshot pesan commit dari kedua repo. Proses ini lambat, berantakan, dan sulit diedit.

### 1.2 Tujuan
Bangun aplikasi web full-stack bernama **Commit Aggregator** yang:

1. Menerima satu atau banyak URL repositori GitHub (publik maupun privat).
2. Mengambil commit pada rentang tanggal tertentu (default: **Hari Ini**).
3. Menggabungkan semua commit dari semua repo, mengurutkannya dari yang **terbaru ke terlama**.
4. Menampilkannya dalam tampilan yang rapi, dengan highlight untuk *conventional commit* (`feat:`, `fix:`, dll).
5. Menyediakan tombol besar **"Copy as Markdown"** untuk menyalin hasil ke clipboard, siap ditempel ke laporan.

### 1.3 Non-Goals (JANGAN dibangun)
- Jangan buat sistem login/akun pengguna.
- Jangan buat database apa pun.
- Jangan simpan token di mana pun (lihat bagian 6).
- Jangan buat fitur di luar daftar ini (grafik statistik, diff viewer, dsb.) kecuali diminta.

### 1.4 Bahasa
- Seluruh teks UI dan pesan error menggunakan **Bahasa Indonesia** (santai-sopan, jelas, tanpa basa-basi).
- Nama variabel, fungsi, tipe, dan komentar kode menggunakan **Bahasa Inggris**.

---

## 2. Tech Stack & UI Design System

### 2.1 Tech Stack

| Kebutuhan | Pilihan |
|---|---|
| Framework | Next.js (App Router) |
| Bahasa | TypeScript (`strict: true`) |
| Styling | Tailwind CSS |
| Backend | Next.js Route Handlers di `app/api/...` |
| GitHub client | `@octokit/rest` |
| Validasi | `zod` |
| Ikon | `lucide-react` |
| Util class | `clsx` |
| Font | Plus Jakarta Sans via `next/font/google` (fallback: Inter) |

Jangan tambahkan library UI besar (MUI, Chakra, Ant, shadcn generator, dsb.). Semua komponen dibuat sendiri dengan Tailwind.

### 2.2 Prinsip Visual
Aplikasi ini harus terasa seperti **bagian dari portofolio pemilik**: lembut, lapang, manis, tetapi tetap profesional dan terbaca. Kesan yang dituju: *soft, airy, rounded, rose-tinted glass*.

Jika pemilik menyertakan screenshot atau URL portofolio, **cocokkan** nuansanya dengan aturan di bawah. Jika tidak ada, aturan tertulis di bawah adalah satu-satunya sumber kebenaran.

### 2.3 Design Tokens (WAJIB)

**Warna**

| Peran | Kelas Tailwind | Catatan |
|---|---|---|
| Background halaman | `bg-rose-50` | Bisa ditambah radial blur dekoratif `rose-100`/`pink-100` di belakang konten |
| Kartu / panel | `bg-white` | Selalu putih (atau `bg-white/70` bila di atas blur) |
| Border kartu | `border border-rose-200` | Tipis, 1px |
| Border halus | `border-rose-100` | Divider di dalam kartu |
| Teks utama | `text-slate-900` | Judul dan isi utama |
| Teks sekunder | `text-slate-600` / `text-slate-500` | Deskripsi, metadata |
| Aksen utama | `rose-500` (hover `rose-600`, aktif `rose-700`) | Tombol primer, fokus, link |
| Aksen lembut | `rose-100` / `rose-50` | Background badge, chip, hover |
| Error | `bg-red-50 border-red-200 text-red-700` | |
| Sukses | `bg-emerald-50 border-emerald-200 text-emerald-700` | |

Dilarang memakai warna di luar keluarga rose/pink/slate kecuali untuk badge tipe conventional commit (bagian 5.5) dan status error/sukses.

**Bentuk (border-radius)**

- Kartu, panel, input, textarea, dropdown: `rounded-2xl` (kartu besar/hero boleh `rounded-3xl`).
- Tombol, chip, navbar, tab, badge: `rounded-full` (pill).
- Dilarang memakai `rounded-md`, `rounded-sm`, atau sudut tajam.

**Shadow**

- Kartu: `shadow-[0_8px_30px_rgba(244,63,94,0.08)]` (bayangan rose sangat tipis).
- Hover kartu: `hover:shadow-[0_12px_40px_rgba(244,63,94,0.14)] hover:-translate-y-0.5`.
- Tombol primer: `shadow-lg shadow-rose-500/25`.

**Transisi**

- Semua elemen interaktif: `transition-all duration-200 ease-out`.
- Hormati `prefers-reduced-motion`: gunakan `motion-reduce:transition-none motion-reduce:transform-none`.
- Jangan tambahkan animasi masuk berlebihan pada setiap bagian. Satu animasi fade-in halus saat daftar hasil muncul sudah cukup.

**Tipografi**

- Font: Plus Jakarta Sans, dimuat lewat `next/font/google` dengan `variable: "--font-jakarta"`, dan dipasang sebagai font `sans` default. Tailwind `--font-sans` menunjuk ke `var(--font-jakarta)`.
- Judul halaman: `text-4xl md:text-5xl font-bold tracking-tight text-slate-900`.
- Judul seksi/kartu: `text-xl font-semibold text-slate-900`.
- Isi: `text-base text-slate-600`, lebar baris maksimal `max-w-prose` untuk paragraf.
- Hash/SHA commit: `font-mono text-xs`.

**Spacing & Layout**

- Container: `mx-auto w-full max-w-4xl px-4 sm:px-6`.
- Jarak antar seksi: `space-y-8` atau `gap-8`; padding kartu: `p-6 md:p-8`.
- Beri **whitespace lapang**. Jika ragu, tambah jarak, jangan kurangi.
- Padding atas halaman minimal `pt-28` agar konten tidak tertutup navbar mengambang.

### 2.4 Floating Navbar (WAJIB)

Navbar berbentuk pill, mengambang di tengah atas layar, dengan efek kaca (glassmorphism).

```tsx
<header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
  <nav
    aria-label="Navigasi utama"
    className="flex items-center gap-1 rounded-full border border-rose-200/70 bg-white/60 px-2 py-2 shadow-[0_8px_30px_rgba(244,63,94,0.10)] backdrop-blur-xl"
  >
    {/* logo pill + link pill */}
  </nav>
</header>
```

Aturan:
- Posisi `fixed`, `top-4`, terpusat horizontal. Jangan full-width, jangan menempel ke tepi.
- Isi: logo/nama aplikasi (ikon `GitMerge` dari Lucide + teks "Commit Aggregator"), link anchor "Generator" dan "Cara Pakai", serta tautan ikon ke GitHub repo (opsional).
- Setiap item: `rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-rose-100 hover:text-rose-700`.
- Item aktif: `bg-rose-500 text-white`.
- Di layar kecil, sembunyikan teks link dan tampilkan ikon saja, atau sisakan logo + satu tombol; navbar tetap pill.

### 2.5 Badge Style (meniru "Technical Arsenal")

Semua metadata (nama repo, tipe commit, scope, jumlah commit, tanggal) tampil sebagai **badge**:

```
inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50
px-3 py-1 text-xs font-medium text-rose-700
```

- Border tipis, background pastel, bentuk pill, ukuran kecil.
- Badge boleh punya ikon Lucide 14px di kiri (`size-3.5`).
- Daftar badge dibungkus `flex flex-wrap gap-2`.

---

## 3. Directory Structure

Gunakan struktur persis seperti ini. Jangan memindahkan file ke lokasi lain tanpa alasan kuat.

```
commit-aggregator/
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env.example                  # kosong / hanya komentar. TIDAK ada variabel token.
├── .gitignore
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx            # font, metadata, <FloatingNavbar />
    │   ├── page.tsx              # halaman tunggal: hero + generator + hasil
    │   ├── not-found.tsx         # 404 page (Client Component)
    │   ├── error.tsx             # error page (Client Component)
    │   ├── icon.svg              # favicon
    │   ├── globals.css           # Tailwind + background dekoratif
    │   └── api/
    │       └── commits/
    │           └── route.ts      # POST /api/commits
    ├── components/
    │   ├── layout/
    │   │   └── FloatingNavbar.tsx
    │   ├── form/
    │   │   ├── CommitForm.tsx
    │   │   ├── RepoInputList.tsx
    │   │   ├── DateRangePicker.tsx
    │   │   └── PrivateRepoField.tsx
    │   ├── results/
    │   │   ├── ResultsPanel.tsx
    │   │   ├── CommitCard.tsx
    │   │   ├── CommitTypeBadge.tsx
    │   │   ├── RepoGroupHeader.tsx
    │   │   └── CopyMarkdownButton.tsx
    │   ├── ui/
    │   │   ├── Badge.tsx
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Input.tsx
    │   │   ├── Skeleton.tsx
    │   │   └── Alert.tsx
    │   └── GeneratorSection.tsx
    ├── lib/
    │   ├── github.ts             # factory Octokit + fetch commit (SERVER ONLY)
    │   ├── parse-repo-url.ts     # URL -> { owner, repo }
    │   ├── conventional.ts       # parser conventional commit
    │   ├── date-range.ts         # preset tanggal + zona waktu
    │   ├── markdown.ts           # buildMarkdown(commits, options)
    │   ├── schema.ts             # skema zod request
    │   ├── rate-limit.ts         # limiter in-memory sederhana
    │   └── cn.ts                 # helper clsx
    └── types/
        └── commit.ts             # tipe request/response bersama
```

Aturan:
- File yang menyentuh token (`lib/github.ts`, `app/api/commits/route.ts`) diawali `import "server-only";` bila memungkinkan (instal paket `server-only`).
- Komponen yang memakai state/event diberi `"use client"`. Komponen lain tetap Server Component.

---

## 4. Backend API Specification

### 4.1 Endpoint

`POST /api/commits`

Gunakan **POST** (bukan GET) agar token tidak pernah muncul di URL, log akses, atau riwayat browser.

### 4.2 Request

Header: `Content-Type: application/json`

```ts
// src/types/commit.ts
export interface CommitsRequest {
  repos: string[];              // 1–10 URL GitHub, mis. "https://github.com/owner/repo"
  since: string;                // ISO 8601 dengan offset, mis. "2026-10-25T00:00:00+07:00"
  until: string;                // ISO 8601 dengan offset
  token?: string;               // PAT (classic atau fine-grained); hanya dikirim bila "Repository Privat" dicentang
  author?: string;              // opsional: username GitHub untuk memfilter commit
  timezone?: string;            // default "Asia/Jakarta"
}
```

Validasi dengan `zod` di sisi server:
- `repos`: array 1–10 string, tiap item wajib lolos `parseRepoUrl`.
- `since` dan `until`: ISO 8601 valid, `since <= until`, rentang maksimal 31 hari.
- `token`: string opsional, panjang maksimal 255, trim whitespace.
- `author`: opsional, regex `^[A-Za-z0-9-]{1,39}$`.

### 4.3 Response

```ts
export interface ParsedConventional {
  type: string;                 // "feat", "fix", ...
  scope: string | null;
  breaking: boolean;
  description: string;
}

export interface CommitItem {
  sha: string;
  shortSha: string;             // 7 karakter
  title: string;                // baris pertama pesan
  body: string | null;          // sisa pesan, jika ada
  authorName: string;
  authorLogin: string | null;
  date: string;                 // ISO 8601 (UTC)
  url: string;                  // html_url commit
  repo: { owner: string; name: string; fullName: string };
  conventional: ParsedConventional | null;
}

export interface RepoError {
  repo: string;                 // URL atau owner/repo
  code: "NOT_FOUND_OR_NO_ACCESS" | "UNAUTHORIZED" | "RATE_LIMITED" | "INVALID_URL" | "UNKNOWN";
  message: string;              // Bahasa Indonesia, aman ditampilkan ke pengguna
}

export interface CommitsResponse {
  commits: CommitItem[];        // sudah digabung & diurutkan terbaru -> terlama
  errors: RepoError[];          // error per repo; repo lain tetap diproses
  meta: {
    total: number;
    repoCount: number;
    since: string;
    until: string;
    generatedAt: string;
  };
}
```

### 4.4 Status Code

| Status | Kondisi |
|---|---|
| 200 | Sukses (termasuk sukses parsial; cek `errors`) |
| 400 | Body gagal validasi zod |
| 429 | Terkena rate limit aplikasi |
| 500 | Error server tak terduga (pesan generik) |

Jika SEMUA repo gagal, tetap kembalikan 200 dengan `commits: []` dan `errors` terisi, kecuali penyebabnya validasi (400).

### 4.5 Logika Server

1. Parse body, validasi dengan zod.
2. Buat instance Octokit **per request**: `new Octokit({ auth: token || undefined })`. Jangan menaruh instance dengan token di variabel modul/global.
3. Untuk tiap repo, jalankan paralel dengan `Promise.allSettled`:
   `octokit.paginate(octokit.rest.repos.listCommits, { owner, repo, since, until, author, per_page: 100 })`.
   Batasi maksimal 500 commit per repo.
4. Petakan hasil ke `CommitItem`: pisahkan `title` (baris pertama) dan `body`, jalankan `parseConventional(title)`.
5. Gabungkan semua commit, urutkan menurun berdasarkan `date` (`commit.author.date`; fallback `commit.committer.date`).
6. Petakan error Octokit ke `RepoError` dengan pesan Indonesia:
   - 404 → `NOT_FOUND_OR_NO_ACCESS`: "Repo tidak ditemukan atau token tidak punya akses."
   - 401 → `UNAUTHORIZED`: "Token tidak valid atau sudah kedaluwarsa."
   - 403/429 dengan rate limit → `RATE_LIMITED`: "Batas permintaan GitHub tercapai. Coba lagi nanti."
   - Lainnya → `UNKNOWN`: "Gagal mengambil commit dari repo ini."
7. Kembalikan `NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } })`.

### 4.6 Konvensi Conventional Commit (`lib/conventional.ts`)

Parser menerima dua bentuk:

**Bentuk strict** (tipe apa pun):
```
^(\w+)(?:\(([^)]+)\))?(!)?:\s(.+)$
```
Contoh: `feat: add login`, `fix(auth): handle error`, `WIP: refactor`.

**Bentuk longgar** (hanya 11 tipe dikenal: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`; tidak peka huruf besar-kecil):
- Tanpa spasi setelah titik dua: `feat:blabla`, `fix(api):blabla`, `feat!:blabla`
- Tanpa titik dua, dipisah spasi: `feat blabla`, `fix(api) blabla`, `feat! blabla`
- Batas kata wajib: tipe diikuti spasi, titik dua, kurung, atau `!`. Oleh itu `feature x`, `tests x`, `fixing bug` **tidak** terdeteksi.
- Deskripsi hasil `trim()` tidak boleh kosong (`feat`, `feat:`, `feat   ` → `null`).
- Hasil dinormalisasi: type huruf kecil, scope, breaking, description. Dengan begitu `CommitCard` dan output Markdown otomatis rapi.

Jika tidak cocok bentuk mana pun, kembalikan `null`.

---

## 5. Frontend UI/UX Requirements

Halaman tunggal (`app/page.tsx`) dengan urutan: Navbar mengambang → Hero → Kartu Form → Panel Hasil → Seksi "Cara Pakai" singkat.

### 5.1 Hero
- Judul: "Gabungkan commit dari semua repo, tanpa screenshot."
- Subjudul satu kalimat (maks 2 baris): jelaskan bahwa hasilnya bisa disalin sebagai Markdown untuk laporan harian.
- Rata tengah, `pt-28 pb-10`. Tidak perlu ilustrasi; boleh dua blur dekoratif `rose-200/40` di belakang dengan `blur-3xl`, `pointer-events-none`, `-z-10`.

### 5.2 Kartu Form (`CommitForm`)
Kartu putih `rounded-3xl border border-rose-200 p-6 md:p-8` dengan shadow rose lembut. Isi berurutan:

**A. `RepoInputList`**
- Label: "Repositori GitHub".
- Satu baris input per repo: ikon `Github` di kiri dalam input, placeholder `https://github.com/owner/repo`, tombol hapus (ikon `X`, pill, hanya muncul bila repo > 1).
- Tombol "Tambah repo" di bawah: pill outline `border-rose-200 text-rose-700 hover:bg-rose-50` dengan ikon `Plus`.
- Awalnya 2 baris kosong (karena kasus utama adalah frontend + backend). Maksimal 10 baris.
- Validasi inline saat blur: URL harus berformat GitHub; tampilkan pesan kecil `text-red-600` di bawah input.
- Normalisasi: terima juga `owner/repo` dan akhiran `.git` atau `/`.

**B. `DateRangePicker`**
- Preset sebagai chip pill: **Hari Ini** (default, aktif), Kemarin, 7 Hari Terakhir, Kustom.
- Chip aktif: `bg-rose-500 text-white`; tidak aktif: `bg-rose-50 text-rose-700 border border-rose-200`.
- Memilih "Kustom" memunculkan dua `input type="date"` (Dari, Sampai) bergaya `rounded-2xl`.
- Zona waktu tetap `Asia/Jakarta`. "Hari Ini" = `00:00:00` sampai `23:59:59` hari ini (WIB, +07:00). Hitung di `lib/date-range.ts` dan kirim sebagai ISO dengan offset.
- Tampilkan ringkasan rentang terpilih di bawah chip dalam badge (mis. "25 Okt 2026").

**C. `PrivateRepoField`**
- Checkbox kustom berlabel "Repository Privat". Gunakan `<input type="checkbox">` asli (untuk aksesibilitas) dengan styling `accent-rose-500` atau varian pill/switch.
- Saat dicentang, tampilkan (dengan transisi tinggi halus) input **password** untuk "Personal Access Token (PAT)":
  - `type="password"`, `autoComplete="off"`, `spellCheck={false}`, `name` tanpa kata yang memicu penyimpanan oleh password manager bila memungkinkan.
  - Tombol mata (`Eye`/`EyeOff`) untuk menampilkan/menyembunyikan.
  - Teks bantuan `text-sm text-slate-500`: "Token hanya dipakai untuk satu permintaan ini dan tidak disimpan. Classic token butuh scope `repo` untuk repo privat; fine-grained butuh izin baca Contents dan Metadata dan hanya berlaku untuk satu pemilik; bila organisasi memakai SSO, token classic harus di-authorize untuk organisasi itu. Peringatan: classic dengan scope repo punya akses luas: gunakan masa berlaku pendek dan hapus setelah selesai." Sertakan tautan ke halaman pembuatan token classic GitHub (https://github.com/settings/tokens).
- Saat checkbox dimatikan, kosongkan nilai token dari state.

**D. Tombol Submit**
- "Ambil Commit": pill besar, `bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 font-semibold shadow-lg shadow-rose-500/25`, ikon `GitCommitHorizontal`/`Search`.
- State loading: ikon `Loader2` berputar, teks "Mengambil commit…", tombol `disabled`.
- Nonaktif bila tidak ada URL repo valid.

### 5.3 State (di `CommitForm`/`page.tsx`, hanya React state)

```ts
type Status = "idle" | "loading" | "success" | "error";

repos: string[]
preset: "today" | "yesterday" | "last7" | "custom"
customFrom: string; customTo: string
isPrivate: boolean
token: string               // HANYA di memori React
status: Status
data: CommitsResponse | null
requestError: string | null
groupBy: "repo" | "none"    // default "repo"
```

Aturan state:
- Jangan simpan `token` (atau seluruh form) ke `localStorage`, `sessionStorage`, cookie, URL, atau context global.
- Biarkan `token` tetap di state React setelah request selesai agar pengguna bisa generate ulang tanpa mengetik ulang; token otomatis hilang saat halaman di-refresh atau ditutup. Jangan pernah menaruh token di dependency array `useEffect`; fetch hanya dipicu oleh tombol submit.
- Gunakan `AbortController` untuk membatalkan request bila pengguna submit ulang.

### 5.4 Panel Hasil (`ResultsPanel`)

Muncul di bawah form setelah submit.

- **Loading:** 4–5 `Skeleton` kartu (`animate-pulse`, `bg-rose-100`, `rounded-2xl`).
- **Header hasil:** badge ringkasan ("12 commit", "2 repo", rentang tanggal) di kiri; di kanan toggle pill `Per repo | Urut waktu`.
- **Tombol "Copy as Markdown"** (`CopyMarkdownButton`): ditempatkan menonjol di header hasil dan diulang di bagian bawah daftar pada mobile. Ukuran besar, `rounded-full px-8 py-4 text-base font-semibold bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600`, ikon `Copy`. Setelah klik sukses: berubah 2 detik menjadi "Tersalin!" dengan ikon `Check` dan warna emerald, lalu kembali. Gunakan `navigator.clipboard.writeText` dengan fallback `document.execCommand("copy")` via textarea tersembunyi bila API gagal. Beri `aria-live="polite"` untuk pengumuman status.
- **Daftar commit:** per `CommitCard`.
- **Error per repo:** `Alert` merah lembut di atas daftar, satu baris per repo yang gagal (nama repo dalam badge + pesan).
- **Kosong:** kartu putih rounded dengan ikon `GitCommitHorizontal` pucat, teks "Belum ada commit pada rentang ini." dan saran "Coba pilih rentang tanggal yang lebih panjang."
- **Error total (jaringan/500):** `Alert` dengan tombol "Coba lagi".

### 5.5 `CommitCard`

- Kartu: `rounded-2xl border border-rose-200 bg-white p-5 shadow-[...] hover:-translate-y-0.5 hover:shadow-[...]`.
- Baris atas: `CommitTypeBadge` (bila conventional) + badge scope (bila ada) + badge "BREAKING" (bila `breaking`, gaya `bg-red-50 text-red-700 border-red-200`).
- Judul: `description` conventional bila ada, selain itu `title`. `text-base font-semibold text-slate-900`.
- Body (jika ada): `text-sm text-slate-600`, dilipat (`line-clamp-2`) dengan tombol "Selengkapnya".
- Baris bawah (badge): nama repo (`Folder`/`Github`), SHA pendek (mono, tautan ke `url`, ikon `ExternalLink`), jam (`Clock`, format `HH.mm` WIB), nama penulis (`User`).
- Dalam mode "Per repo", `RepoGroupHeader` (judul repo + badge jumlah commit) mengelompokkan kartu; urutan di dalam grup tetap terbaru → terlama.

**Warna `CommitTypeBadge`** (semuanya pastel, border tipis, pill):

| Tipe | Kelas |
|---|---|
| feat | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| fix | `bg-rose-100 text-rose-700 border-rose-200` |
| docs | `bg-sky-50 text-sky-700 border-sky-200` |
| style | `bg-violet-50 text-violet-700 border-violet-200` |
| refactor | `bg-amber-50 text-amber-700 border-amber-200` |
| perf | `bg-orange-50 text-orange-700 border-orange-200` |
| test | `bg-teal-50 text-teal-700 border-teal-200` |
| build, ci | `bg-indigo-50 text-indigo-700 border-indigo-200` |
| chore | `bg-slate-100 text-slate-700 border-slate-200` |
| revert | `bg-red-50 text-red-700 border-red-200` |
| lainnya | `bg-slate-50 text-slate-600 border-slate-200` |

### 5.6 Format Output "Copy as Markdown" (`lib/markdown.ts`)

`buildMarkdown(response, { groupBy })` harus menghasilkan teks persis dengan pola berikut.

Mode `repo` (default):

```
## Laporan Commit — 25 Okt 2026

### owner/frontend-repo (3 commit)
- **feat(auth):** tambah halaman login — [`a1b2c3d`](https://github.com/owner/frontend-repo/commit/a1b2c3d...) (09.41)
- **fix:** perbaiki redirect setelah logout — [`e4f5a6b`](...) (10.15)

### owner/backend-repo (2 commit)
- **feat(api):** endpoint daftar produk — [`c7d8e9f`](...) (11.02)
```

Mode `none` (urut waktu): satu daftar datar, tiap baris diawali nama repo dalam backtick: `` - `frontend-repo` **feat:** ... ``.

Aturan:
- Judul rentang: satu hari → "25 Okt 2026"; beberapa hari → "20 Okt 2026 – 25 Okt 2026".
- Commit non-conventional ditulis tanpa teks tebal: `- judul commit — [\`sha\`](url) (jam)`.
- Jam dalam WIB, format `HH.mm`.
- Jangan sertakan body commit. Jangan sertakan token atau data sensitif apa pun.
- Fungsi ini murni (pure) dan wajib punya unit test sederhana bila test runner tersedia.

### 5.7 Aksesibilitas & Responsif
- Semua input punya `<label>` terhubung; tombol ikon punya `aria-label`.
- Focus ring terlihat: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50`.
- Kontras teks minimal WCAG AA (jangan memakai `text-rose-300` untuk teks penting).
- Mobile-first: form satu kolom; di `md:` rentang tanggal boleh dua kolom. Uji di lebar 360px: tidak boleh ada scroll horizontal.

---

## 6. Security & Best Practices

### 6.1 Aturan Token (KRUSIAL — tidak boleh dilanggar)

1. PAT (classic atau fine-grained) **TIDAK BOLEH** bocor ke browser. Setelah diketik pengguna, token hanya dikirim sekali lewat body POST ke `/api/commits` dan **tidak pernah** dikembalikan dalam response (juga tidak dalam pesan error).
2. PAT hanya diproses di Route Handler `app/api/commits/route.ts` (dan `lib/github.ts` yang diimpor darinya). Tidak boleh ada kode di komponen client yang memanggil `api.github.com` secara langsung.
3. PAT **TIDAK BOLEH** disimpan di database, `localStorage`, `sessionStorage`, cookie, IndexedDB, atau file di server.
4. **DILARANG** memakai prefix `NEXT_PUBLIC_` untuk variabel apa pun yang berkaitan dengan token GitHub. Pada versi ini tidak ada variabel environment untuk token; jangan membuat fallback `process.env.GITHUB_TOKEN`.
5. Jangan pernah `console.log`, mencatat, atau menyertakan token (atau objek request/headers utuh) di log, error, atau telemetri. Redaksi bila perlu.
6. Jangan menaruh token di query string, path URL, atau header kustom yang bisa dicatat proxy.
7. Jangan cache response yang dibuat dengan token: `Cache-Control: no-store`; tandai route `export const dynamic = "force-dynamic"`.
8. Instance Octokit dibuat per request, tidak di-share antar request.

### 6.2 Validasi & Proteksi Server
- Validasi seluruh input dengan `zod`; tolak field tak dikenal (`.strict()`).
- `parseRepoUrl` hanya menerima host `github.com` (dan `www.github.com`) dengan skema `https`. Tolak host lain untuk mencegah SSRF. Regex nama: `^[A-Za-z0-9_.-]+$`.
- Octokit hanya boleh menuju `https://api.github.com` (jangan izinkan `baseUrl` dari input pengguna).
- Terapkan rate limit sederhana in-memory (mis. 20 request/menit per IP) di `lib/rate-limit.ts`; kembalikan 429 bila terlampaui. Catat bahwa ini best-effort pada lingkungan serverless.
- Batasi ukuran body request (mis. 10 KB) dan jumlah repo (maks 10).
- Pesan error ke klien harus generik dan aman; detail teknis hanya di log server tanpa data sensitif.

### 6.3 Header Keamanan
Tambahkan di `next.config.ts` (`headers()`): `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, dan Content-Security-Policy yang membatasi `connect-src 'self'`. Dengan CSP ini, browser tidak bisa menghubungi GitHub langsung, sehingga memperkuat aturan 6.1.

### 6.4 Hygiene Client
- Input token: `type="password"`, `autoComplete="off"`.
- Jangan render token ke DOM sebagai teks biasa kecuali saat pengguna menekan tombol "tampilkan".
- Jangan memakai `dangerouslySetInnerHTML`. Pesan commit dirender sebagai teks biasa (React meng-escape otomatis).
- Jangan menyertakan token dalam state yang dikirim ke error reporter/analytics (tidak ada analytics pada versi ini).

### 6.5 Praktik Kode
- TypeScript `strict`, tanpa `any`. Gunakan tipe dari `src/types/commit.ts` di server dan client.
- Fungsi kecil, murni, dan bernama jelas. Pisahkan logika (lib) dari tampilan (components).
- Tangani semua jalur error; tidak ada promise tanpa penanganan.
- Jalankan `npm run lint` dan `npm run build` tanpa error sebelum menyatakan pekerjaan selesai.
- `.gitignore` wajib memuat `.env*` (kecuali `.env.example`), `node_modules`, `.next`.
- `README.md` singkat: cara menjalankan, cara membuat PAT (classic atau fine-grained), dan pernyataan privasi (token tidak disimpan).

---

## 7. Step-by-Step Implementation Guide

Kerjakan berurutan. Setelah tiap langkah, pastikan proyek masih bisa di-build.

**Langkah 1 — Inisialisasi proyek**
```bash
npx create-next-app@latest commit-aggregator --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd commit-aggregator
```

**Langkah 2 — Instal dependensi**
```bash
npm install @octokit/rest zod lucide-react clsx server-only
```

**Langkah 3 — Fondasi styling**
1. Di `layout.tsx`, muat Plus Jakarta Sans dengan `next/font/google` (`variable: "--font-jakarta"`, `subsets: ["latin"]`), pasang class variabel pada `<html>` dan gunakan `font-sans` pada `<body>`.
2. Pasang `bg-rose-50 text-slate-900 antialiased` pada `<body>`.
3. Di `globals.css`, pastikan font sans Tailwind menunjuk ke `var(--font-jakarta)` di dalam `@theme inline { --font-sans: var(--font-jakarta); }`. **Tailwind v4 butuh `postcss.config.mjs` dengan plugin `@tailwindcss/postcss`** agar `@theme` dan `@apply` diproses.
4. Tambahkan dekorasi latar (dua blob blur rose) di `layout.tsx` atau `page.tsx`.

**Langkah 4 — Tipe & util**
Buat `types/commit.ts`, `lib/cn.ts`, `lib/parse-repo-url.ts`, `lib/conventional.ts`, `lib/date-range.ts`, `lib/schema.ts`, `lib/markdown.ts`, `lib/rate-limit.ts` sesuai bagian 4 dan 5.6. Tulis test sederhana untuk `parseRepoUrl`, `parseConventional`, dan `buildMarkdown` bila memungkinkan.

**Langkah 5 — Backend**
1. Buat `lib/github.ts` (server only): fungsi `fetchRepoCommits(octokit, owner, repo, params)` dan pemetaan error.
2. Buat `app/api/commits/route.ts`: rate limit → validasi zod → fetch paralel dengan `Promise.allSettled` → gabung & urutkan → response dengan `no-store`.
3. Uji manual dengan `curl`/REST client terhadap repo publik, lalu repo privat dengan token uji. Pastikan token tidak muncul di response maupun log.

**Langkah 6 — Komponen UI dasar**
Buat `Button`, `Card`, `Badge`, `Input`, `Skeleton`, `Alert` di `components/ui` dengan token dari bagian 2.3–2.5. Semua varian tombol `rounded-full`, semua input/kartu `rounded-2xl`.

**Langkah 7 — Navbar**
Buat `FloatingNavbar` sesuai 2.4 dan pasang di `layout.tsx`.

**Langkah 8 — Form**
Buat `RepoInputList`, `DateRangePicker`, `PrivateRepoField`, lalu rakit `CommitForm` dengan state dari 5.3. Hubungkan submit ke `fetch("/api/commits", { method: "POST", ... })` dengan `AbortController`.

**Langkah 9 — Hasil & ekspor**
Buat `CommitTypeBadge`, `CommitCard`, `RepoGroupHeader`, `CopyMarkdownButton`, dan `ResultsPanel` (loading, kosong, error, sukses) sesuai 5.4–5.6.

**Langkah 10 — Rakit halaman**
Susun `page.tsx`: Hero → `CommitForm` → `ResultsPanel` → seksi "Cara Pakai" (3 langkah singkat dalam kartu pill/badge).

**Langkah 11 — Polesan & aksesibilitas**
Periksa focus ring, kontras, `prefers-reduced-motion`, tampilan 360px, dan konsistensi radius/warna terhadap bagian 2.

**Langkah 12 — Verifikasi akhir (Definition of Done)**
Tandai semua poin berikut sebelum menyatakan selesai:

- [ ] Dua repo publik digabung dan diurutkan terbaru → terlama.
- [ ] Repo privat berhasil diambil dengan fine-grained PAT; token tidak muncul di response, log, URL, storage, maupun DevTools Network selain body request POST ke `/api/commits`.
- [ ] Tidak ada variabel `NEXT_PUBLIC_*` terkait token; pencarian `grep -r "NEXT_PUBLIC_" .` bersih dari token.
- [ ] Default rentang tanggal adalah "Hari Ini" (WIB).
- [ ] Highlight conventional commit tampil sesuai tabel 5.5; `breaking` ditandai.
- [ ] "Copy as Markdown" menghasilkan format persis 5.6 dan menampilkan umpan balik "Tersalin!".
- [ ] Error per repo ditampilkan tanpa menggagalkan repo lain.
- [ ] Navbar pill mengambang dengan backdrop blur; semua kartu `rounded-2xl`/`rounded-3xl`; semua tombol dan badge `rounded-full`; palet rose/slate konsisten.
- [ ] Tampilan nyaman di mobile (360px) dan desktop.
- [ ] `npm run lint` dan `npm run build` lulus.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
