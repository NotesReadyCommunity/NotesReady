"use client";

import React from "react";
import { Menu, Share2, MoreHorizontal, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveStatus } from "@/context/WorkspaceContext";

interface AppHeaderProps {
  onToggleMobileMenu: () => void;
  title?: string;
  saveStatus?: SaveStatus;
  showSaveStatus?: boolean;
  isStorageDurable?: boolean;
  storageError?: string | null;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileMenu,
  title = "Workspace",
  saveStatus = "saved",
  showSaveStatus = true,
  isStorageDurable = true,
  storageError = null,
}) => {
  return (
    <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--surface-0)] px-4 flex items-center justify-between select-none">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--surface-2)] text-[var(--text-secondary)] cursor-pointer shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-semibold text-[var(--text-primary)] tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md">
            {title}
          </span>

          {/* Storage Warning (P0 Storage Honesty) */}
          {(!isStorageDurable || storageError) && (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 shrink-0"
              role="alert"
              aria-live="polite"
              title={storageError || "Storage unavailable"}
            >
              <AlertCircle size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-xs">Storage unavailable</span>
            </div>
          )}

          {/* Honest Local Save State Indicator (P1 Header Synchronization) */}
          {isStorageDurable && !storageError && showSaveStatus && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] shrink-0" aria-live="polite">
              {saveStatus === "saving" && (
                <>
                  <RefreshCw size={11} className="animate-spin text-[var(--brand-ember,#E85D3F)]" />
                  <span>Saving locally...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Saved locally</span>
                </>
              )}
              {saveStatus === "unsaved" && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Unsaved changes</span>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <AlertCircle size={12} className="text-red-500" />
                  <span className="text-red-500">Storage error</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
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
