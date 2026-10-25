"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Home, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-rose-50 bg-decorative-blobs flex items-center justify-center px-4">
      <Card variant="default" padding="lg" className="rounded-3xl max-w-md w-full text-center">
        <CardContent className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-700">
            <AlertCircle className="h-8 w-8" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Terjadi kesalahan</h1>
            <p className="mt-2 text-slate-600">
              Maaf, terjadi kesalahan yang tidak terduga. Tim kami sudah diberitahu.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 text-white px-6 py-2.5 text-sm font-medium hover:bg-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Coba lagi
            </button>
            <Link href="/">
              <Button variant="outline" size="md" className="gap-2">
                <Home className="h-4 w-4" aria-hidden="true" />
                Ke Beranda
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}