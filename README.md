---
# Commit Aggregator

Aplikasi web full‑stack untuk menggabungkan commit dari satu atau banyak repositori GitHub menjadi satu laporan Markdown yang rapi.

## Cara menjalankan
```bash
npm install
npm run dev   # jalankan di http://localhost:3000
```

## Membuat token GitHub
- **Classic token** (pilihan lama). Buat token dengan **scope** `repo` atau `public_repo`. Token classic berlaku **hingga** Anda mencabutnya; gunakan hanya secara lokal dan hapus setelah selesai.
- **Fine‑grained token** (disarankan). Pilih **Read‑only** dan izinkan akses **Contents** serta **Metadata** pada repositori yang diperlukan. Jika Anda mengakses repositori dari beberapa pemilik/organisasi, buat token terpisah untuk tiap pemilik.

**Catatan SSO** – jika organisasi Anda memakai SSO, token harus di‑authorize terlebih dahulu.

## Keamanan token
- Token **tidak pernah disimpan** di database, cookie, `localStorage`, `sessionStorage`, atau file environment.
- Token hanya dikirim dalam body request `POST /api/commits` dan tidak dikembalikan dalam response apa pun.
- Hindari menuliskan token secara literal di kode.

## Privasi
Aplikasi tidak menyimpan atau membagikan token, commit, atau data pribadi pengguna ke layanan lain.
