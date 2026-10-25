# Commit Aggregator

Aplikasi web untuk menggabungkan commit dari banyak repositori GitHub (publik & privat) menjadi satu laporan Markdown rapi.

## Fitur

- Masukkan 1–10 URL repositori GitHub
- Pilih rentang tanggal (preset: Hari Ini, Kemarin, 7 Hari Terakhir, atau Kustom)
- Dukungan repositori privat dengan Fine-grained Personal Access Token (PAT)
- Gabungkan & urutkan commit dari terbaru ke terlama
- Highlight *conventional commit* (`feat:`, `fix:`, `docs:`, dll)
- Tombol **"Copy as Markdown"** untuk menyalin laporan ke clipboard
- Token **tidak pernah disimpan** — hanya di memori browser, dikirim sekali ke API, dan tidak dikembalikan

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build production
npm run build
npm start

# Lint
npm run lint

# Test
npm run test
```

## Membuat Fine-grained Personal Access Token (PAT)

1. Buka [GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/personal-access-tokens/new)
2. Klik **Generate new token**
3. Beri nama token (mis. "Commit Aggregator")
4. Pilih **Resource owner** (user/organization yang memiliki repo)
5. **Repository access**: pilih *Only select repositories* → pilih repo yang dibutuhkan
6. **Permissions** (Repository permissions):
   - **Contents**: Read-only
   - **Metadata**: Read-only
7. Generate token → copy dan gunakan di aplikasi ini

> **Catatan**: Fine-grained token hanya berlaku untuk satu pemilik (user/org). Jika repo berasal dari pemilik berbeda, buat token terpisah untuk masing-masing pemilik.

## Keamanan & Privasi

- Token PAT **tidak disimpan** di database, `localStorage`, cookie, atau file server
- Token hanya dikirim sekali via HTTPS POST ke `/api/commits` (bukan GET, sehingga tidak ada di URL/log browser)
- Server membuat instance Octokit baru per request, tidak menyimpan token di memori global
- Response header `Cache-Control: no-store` — tidak ada caching
- CSP membatasi `connect-src 'self'` — browser tidak bisa menghubungi GitHub langsung

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **GitHub API**: @octokit/rest
- **Validation**: zod
- **Icons**: lucide-react
- **Testing**: Vitest

## Lisensi

MIT