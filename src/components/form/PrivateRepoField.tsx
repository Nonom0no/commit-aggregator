"use client";

import { cn } from "@/lib/cn";
import { Eye, EyeOff, Lock, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

interface PrivateRepoFieldProps {
  isPrivate: boolean;
  token: string;
  onIsPrivateChange: (isPrivate: boolean) => void;
  onTokenChange: (token: string) => void;
}

export function PrivateRepoField({
  isPrivate,
  token,
  onIsPrivateChange,
  onTokenChange,
}: PrivateRepoFieldProps) {
  const [showToken, setShowToken] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    onIsPrivateChange(checked);
    if (!checked) {
      onTokenChange("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Checkbox */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="h-5 w-5 rounded-full accent-rose-500 border-rose-300 text-rose-500 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-rose-50 transition-colors"
          />
          <span className="text-sm font-medium text-slate-900 group-hover:text-rose-700 transition-colors">
            Repository Privat
          </span>
        </label>
      </div>

      {/* Token Field Container with height transition */}
      {isPrivate && (
        <div className="pl-8 space-y-3 animate-fade-in">
          <div className="relative">
            <Input
              label="Personal Access Token (PAT)"
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => onTokenChange(e.target.value)}
              placeholder="ghp_... atau github_pat_..."
              autoComplete="off"
              spellCheck={false}
              id="github-token"
              leftIcon={<Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="p-1 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded-full"
                  aria-label={showToken ? "Sembunyikan token" : "Tampilkan token"}
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              }
            />
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Token hanya dipakai untuk satu permintaan ini dan tidak disimpan.
            <br />
            <span className="font-semibold text-slate-700">Classic token:</span> scope <span className="font-semibold text-slate-700">repo</span> (untuk repo privat). Bila organisasi memakai SSO, token harus di-authorize untuk organisasi itu. Classic dengan scope repo punya akses luas: gunakan masa berlaku pendek dan hapus setelah selesai.
            <br />
            <span className="font-semibold text-slate-700">Fine-grained token:</span> izin baca <span className="font-semibold text-slate-700">Contents</span> dan <span className="font-semibold text-slate-700">Metadata</span> pada repo yang dibutuhkan. Hanya berlaku untuk satu pemilik (user/org). Bila repo dari pemilik berbeda, buat token terpisah.
            <br />
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium underline underline-offset-2"
            >
              Buat token di GitHub <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </p>

          <p className="text-xs text-slate-500 bg-rose-50 border border-rose-200 rounded-2xl p-3">
            <span className="font-semibold text-slate-700">Catatan:</span> Token hanya dipakai untuk satu permintaan dan tidak disimpan.
          </p>
        </div>
      )}
    </div>
  );
}