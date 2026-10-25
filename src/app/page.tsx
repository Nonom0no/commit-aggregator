import { GitMerge } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-rose-50 bg-decorative-blobs">
      {/* Hero Section */}
      <section className="pt-28 pb-10 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
          Gabungkan commit dari semua repo, tanpa screenshot.
        </h1>
        <p className="text-base md:text-lg text-slate-600 max-w-prose mx-auto leading-relaxed">
          Masukkan URL repositori GitHub, pilih rentang tanggal, dan dapatkan daftar commit tergabung yang siap disalin sebagai Markdown untuk laporan harian.
        </p>
      </section>

      {/* Generator Form - placeholder */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto pb-16">
        <div className="bg-white rounded-3xl border border-rose-200 shadow-[0_8px_30px_rgba(244,63,94,0.08)] p-6 md:p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Generator (Coming Soon)</h2>
          <p className="text-slate-600">Form input repositori, rentang tanggal, dan token privat akan ditampilkan di sini.</p>
        </div>
      </section>

      {/* Results Panel - placeholder */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto pb-16">
        <div className="bg-white rounded-3xl border border-rose-200 shadow-[0_8px_30px_rgba(244,63,94,0.08)] p-6 md:p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Hasil Commit (Coming Soon)</h2>
          <p className="text-slate-600">Panel hasil commit dengan tombol Copy as Markdown akan ditampilkan di sini.</p>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto pb-20">
        <h2 className="text-xl font-semibold text-slate-900 text-center mb-8">Cara Pakai</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-2xl border border-rose-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-700 mb-4">
              <GitMerge className="size-6" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Masukkan Repo</h3>
            <p className="text-sm text-slate-600">Tambahkan 1–10 URL repositori GitHub (publik atau privat).</p>
          </div>
          <div className="bg-white rounded-2xl border border-rose-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-700 mb-4">
              <GitMerge className="size-6" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Pilih Tanggal</h3>
            <p className="text-sm text-slate-600">Gunakan preset (Hari Ini, Kemarin, 7 Hari) atau pilih rentang kustom.</p>
          </div>
          <div className="bg-white rounded-2xl border border-rose-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-700 mb-4">
              <GitMerge className="size-6" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Salin Markdown</h3>
            <p className="text-sm text-slate-600">Klik tombol besar untuk menyalin laporan commit ke clipboard.</p>
          </div>
        </div>
      </section>
    </div>
  );
}