"use client";

import React from "react";
import { Menu, Share2, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onToggleMobileMenu: () => void;
  title?: string;
  isSaving?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileMenu,
  title = "Welcome to NotesReady",
  isSaving = false,
}) => {
  return (
    <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--surface-0)] px-4 flex items-center justify-between select-none">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--surface-2)] text-[var(--text-secondary)] cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-primary)] tracking-tight truncate max-w-[200px] sm:max-w-xs">
            {title}
          </span>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
            <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>{isSaving ? "Saving..." : "Saved to workspace"}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
          <Share2 size={13} />
          <span>Share</span>
        </Button>
        <button
          type="button"
          className="p-1.5 rounded-md hover:bg-[var(--surface-2)] text-[var(--text-secondary)] cursor-pointer"
          title="Note Options"
          aria-label="More Options"
        >
          <MoreHorizontal size={17} />
        </button>
      </div>
    </header>
  );
};
