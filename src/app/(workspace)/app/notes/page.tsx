"use client";

import React from "react";
import Link from "next/link";
import { FileText, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getNoteSnippet } from "@/core/utils/content";

export default function AllNotesPage() {
  const { notes, isLoading, createNote } = useWorkspace();

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6 select-none">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            All Notes
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {isLoading ? "Loading notes..." : `${notes.length} note${notes.length === 1 ? "" : "s"} in local workspace`}
          </p>
        </div>
        <Button variant="primary" size="sm" className="text-xs" onClick={() => createNote()}>
          <Plus size={14} />
          <span>New Note</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-[var(--surface-1)] rounded-xl" />
          <div className="h-20 bg-[var(--surface-1)] rounded-xl" />
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[var(--border-strong)] rounded-2xl space-y-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
            <FileText size={20} />
          </div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            No notes yet
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Your thoughts and knowledge will appear here. Click New Note to begin writing immediately.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={() => createNote()}>
              <Plus size={13} />
              <span>Create First Note</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => {
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
                    {note.isFavorite && (
                      <Star size={12} className="text-[var(--brand-ember,#E85D3F)]" fill="currentColor" />
                    )}
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
