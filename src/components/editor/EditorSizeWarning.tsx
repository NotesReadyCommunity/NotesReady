"use client";

import React from "react";
import { AlertTriangle, AlertOctagon } from "lucide-react";
import { ContentSizeCheck } from "@/core/utils/limits";

interface EditorSizeWarningProps {
  check: ContentSizeCheck;
}

export const EditorSizeWarning: React.FC<EditorSizeWarningProps> = ({ check }) => {
  if (!check.isWarning && !check.isExceeded) {
    return null;
  }

  if (check.isExceeded) {
    return (
      <div
        className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 my-3 animate-in fade-in"
        role="alert"
        aria-live="assertive"
      >
        <AlertOctagon size={16} className="shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Maximum Note Size Limit Exceeded ({check.formattedSize})</p>
          <p className="text-[11px] leading-relaxed opacity-90">
            This note exceeds the 2 MB hard limit. Autosave and additional content input have been paused to prevent data loss.
            Your current text is preserved in the editor—please copy or delete excess content to resume normal saving.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 my-3 animate-in fade-in"
      role="status"
      aria-live="polite"
    >
      <AlertTriangle size={15} className="shrink-0" />
      <span className="leading-tight">
        Large note ({check.formattedSize} / 500 KB recommended limit). Consider splitting into smaller notes for optimal performance.
      </span>
    </div>
  );
};
