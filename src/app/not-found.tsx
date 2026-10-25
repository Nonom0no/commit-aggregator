"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Home, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-rose-50 bg-decorative-blobs flex items-center justify-center px-4">
      <Card variant="default" padding="lg" className="rounded-3xl max-w-md w-full text-center">
        <CardContent className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-700">
            <AlertCircle className="h-8 w-8" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">404 – Halaman tidak ditemukan</h1>
            <p className="mt-2 text-slate-600">Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.</p>
          </div>
          <Link href="/" className="inline-flex">
            <Button variant="primary" size="lg" className="gap-2">
              <Home className="h-5 w-5" aria-hidden="true" />
              Kembali ke Beranda
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}