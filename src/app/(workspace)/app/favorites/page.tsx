"use client";

import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getNoteSnippet } from "@/core/utils/content";

export default function FavoritesPage() {
  const { favoriteNotes, isLoading } = useWorkspace();

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      <div className="pb-4 border-b border-[var(--border-subtle)]">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Favorites
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {isLoading
            ? "Loading favorites..."
            : `${favoriteNotes.length} starred note${favoriteNotes.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-[var(--surface-1)] rounded-xl" />
        </div>
      ) : favoriteNotes.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[var(--border-strong)] rounded-2xl space-y-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
            <Star size={20} />
          </div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            No favorites yet
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Click the star icon in any note header to pin it here for immediate access.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {favoriteNotes.map((note) => {
            const formattedDate = new Date(note.updatedAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            });

            return (
              <Link
                key={note.id}
                href={`/app/notes/${note.id}`}
                className="block p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] hover:bg-[var(--surface-1)] transition-all cursor-pointer group space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-black dark:group-hover:text-white">
                      {note.title || "Untitled note"}
                    </h2>
                    <Star size={12} className="text-[var(--brand-ember,#E85D3F)]" fill="currentColor" />
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    {formattedDate}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                  {getNoteSnippet(note.content, note.format)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
