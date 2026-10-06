import React from "react";
import { Star } from "lucide-react";

export default function FavoritesPage() {
  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      <div className="pb-4 border-b border-[var(--border-subtle)]">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Favorites
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Quickly access your starred documents and notes
        </p>
      </div>

      <div className="p-8 text-center border border-dashed border-[var(--border-strong)] rounded-2xl space-y-3">
        <div className="w-10 h-10 mx-auto rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
          <Star size={20} />
        </div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          No favorites yet
        </h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
          Click the star icon on any note in your workspace to pin it here for immediate access.
        </p>
      </div>
    </div>
  );
}
