import { GitBranch, CalendarDays, Copy, GitMerge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { GeneratorSection } from "@/components/GeneratorSection";
import { Suspense } from "react";

const GeneratorFallback = () => (
  <Card variant="default" padding="lg" className="rounded-3xl">
    <CardContent className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-32" />
    </CardContent>
  </Card>
);

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

      {/* Generator Form */}
      <section id="generator" className="px-4 sm:px-6 max-w-4xl mx-auto pb-16 scroll-mt-28">
        <Suspense fallback={<GeneratorFallback />}>
          <GeneratorSection />
        </Suspense>
      </section>

      {/* How to Use Section */}
      <section id="cara-pakai" className="px-4 sm:px-6 max-w-4xl mx-auto pb-20 scroll-mt-28">
        <h2 className="text-xl font-semibold text-slate-900 text-center mb-8">Cara Pakai</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card variant="default" padding="lg" className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-700 mb-4">
              <GitBranch className="size-6" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Masukkan Repo</h3>
            <p className="text-sm text-slate-600">Tambahkan 1–10 URL repositori GitHub (publik atau privat).</p>
          </Card>
          <Card variant="default" padding="lg" className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-700 mb-4">
              <CalendarDays className="size-6" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Pilih Tanggal</h3>
            <p className="text-sm text-slate-600">Gunakan preset (Hari Ini, Kemarin, 7 Hari) atau pilih rentang kustom.</p>
          </Card>
          <Card variant="default" padding="lg" className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-700 mb-4">
              <Copy className="size-6" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Salin Markdown</h3>
            <p className="text-sm text-slate-600">Klik tombol besar untuk menyalin laporan commit ke clipboard.</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
