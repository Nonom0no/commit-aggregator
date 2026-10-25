---
# Commit Aggregator

Aplikasi web full‑stack untuk menggabungkan commit dari satu atau banyak repositori GitHub menjadi satu laporan Markdown yang rapi.

## Cara menjalankan
```bash
npm install
npm run dev   # jalankan di http://localhost:3000
```

## Membuat token GitHub
- **Classic token (PAT)**. Buat token dengan **scope** `repo` (untuk repo privat). Token classic berlaku hingga Anda mencabutnya; gunakan hanya secara lokal, beri masa berlaku pendek, dan hapus setelah selesai. Bila organisasi memakai SSO, token harus di‑authorize untuk organisasi itu.
- **Fine‑grained token**. Pilih **Read‑only** dan izinkan akses **Contents** serta **Metadata** pada repositori yang diperlukan. Jika Anda mengakses repositori dari beberapa pemilik/organisasi, buat token terpisah untuk tiap pemilik.

**Catatan SSO** – jika organisasi Anda memakai SSO, token (classic atau fine-grained) harus di‑authorize terlebih dahulu untuk organisasi yang bersangkutan.

## Keamanan token
- Token **tidak pernah disimpan** di database, cookie, `localStorage`, `sessionStorage`, atau file environment.
- Token hanya dikirim dalam body request `POST /api/commits` dan tidak dikembalikan dalam response apa pun.
- Hindari menuliskan token secara literal di kode.

## Privasi
Aplikasi tidak menyimpan atau membagikan token, commit, atau data pribadi pengguna ke layanan lain.