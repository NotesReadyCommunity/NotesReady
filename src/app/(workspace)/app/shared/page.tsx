import React from "react";
import { Users } from "lucide-react";

export default function SharedPage() {
  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      <div className="pb-4 border-b border-[var(--border-subtle)]">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Shared with Me
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Collaborative documents shared across workspaces and team members
        </p>
      </div>

      <div className="p-8 text-center border border-dashed border-[var(--border-strong)] rounded-2xl space-y-3">
        <div className="w-10 h-10 mx-auto rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
          <Users size={20} />
        </div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          No shared notes yet
        </h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
          When collaborators invite you to a document or workspace, it will appear here with live presence indicators.
        </p>
      </div>
    </div>
  );
}
