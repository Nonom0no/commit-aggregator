"use client";

import { cn } from "@/lib/cn";
import { GitFork, X, Plus } from "lucide-react";
import { useState, ChangeEvent, FocusEvent, FormEvent } from "react";
import { parseRepoUrl, isValidRepoUrl } from "@/lib/parse-repo-url";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface RepoInputListProps {
  repos: string[];
  onChange: (repos: string[]) => void;
  maxRepos?: number;
}

export function RepoInputList({ repos, onChange, maxRepos = 10 }: RepoInputListProps) {
  const [errors, setErrors] = useState<Record<number, string>>({});

  const validateRepo = (index: number, value: string) => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [index]: "" }));
      return;
    }
    try {
      parseRepoUrl(value);
      setErrors((prev) => ({ ...prev, [index]: "" }));
    } catch (e) {
      setErrors((prev) => ({ ...prev, [index]: e instanceof Error ? e.message : "Format URL tidak valid" }));
    }
  };

  const handleChange = (index: number, value: string) => {
    const newRepos = [...repos];
    newRepos[index] = value;
    onChange(newRepos);
    validateRepo(index, value);
  };

  const handleBlur = (index: number, e: FocusEvent<HTMLInputElement>) => {
    validateRepo(index, e.target.value);
  };

  const handleRemove = (index: number) => {
    if (repos.length <= 1) return;
    const newRepos = repos.filter((_, i) => i !== index);
    onChange(newRepos);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleAdd = () => {
    if (repos.length >= maxRepos) return;
    onChange([...repos, ""]);
  };

  const allValid = repos.length > 0 && repos.every((r) => r.trim() && isValidRepoUrl(r));

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">Repositori GitHub</label>
      <div className="space-y-3" role="list" aria-label="Daftar repositori">
        {repos.map((repo, index) => (
          <div key={index} className="flex items-center gap-2" role="listitem">
            <Input
              id={`repo-${index}`}
              value={repo}
              onChange={(e) => handleChange(index, e.target.value)}
              onBlur={(e) => handleBlur(index, e)}
              placeholder="https://github.com/owner/repo"
              leftIcon={<GitFork className="h-5 w-5 text-slate-400" aria-hidden="true" />}
              error={errors[index]}
              aria-describedby={errors[index] ? `repo-${index}-error` : undefined}
            />
            {repos.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                aria-label={`Hapus repositori ${index + 1}`}
                className="p-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={repos.length >= maxRepos}
          className="gap-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah repo
        </Button>
        <Badge variant="slate" size="sm">
          {repos.length} / {maxRepos}
        </Badge>
      </div>

      {errors[0] && (
        <p className="text-sm text-red-600" role="alert">
          Minimal satu repositori wajib diisi dengan format yang valid.
        </p>
      )}
    </div>
  );
}