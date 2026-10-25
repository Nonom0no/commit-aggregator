"use client";

import { Badge } from "@/components/ui/Badge";
import { FolderGit2 } from "lucide-react";

interface RepoGroupHeaderProps {
  repoName: string;
  commitCount: number;
  owner: string;
}

export function RepoGroupHeader({ repoName, commitCount, owner }: RepoGroupHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <FolderGit2 className="h-5 w-5 text-slate-500" aria-hidden="true" />
        <span className="font-semibold text-slate-900 text-lg">
          {owner}/{repoName}
        </span>
      </div>
      <Badge variant="sky" size="sm">
        {commitCount} commit{commitCount !== 1 ? "s" : ""}
      </Badge>
    </div>
  );
}