"use client";

import React from "react";
import Link from "next/link";
import { Archive, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getNoteSnippet } from "@/core/utils/content";

export default function ArchivePage() {
  const { archivedNotes, isLoading, unarchiveNote } = useWorkspace();

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Archive
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Archived notes are preserved and hidden from your active notes list.
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] font-mono">
          {archivedNotes.length}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-[var(--surface-1)] rounded-xl" />
        </div>
      ) : archivedNotes.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[var(--border-strong)] rounded-2xl space-y-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
            <Archive size={20} />
          </div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Archive is empty
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            You can archive completed or reference notes from the note options menu to declutter your active workspace.
          </p>
          <div className="pt-2">
            <Link href="/app/notes">
              <Button variant="outline" size="sm">
                <ArrowLeft size={13} />
                <span>Return to All Notes</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {archivedNotes.map((note) => {
            const formattedDate = note.archivedAt
              ? new Date(note.archivedAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })
              : "Archived";

            return (
              <div
                key={note.id}
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] hover:bg-[var(--surface-1)] transition-all flex items-center justify-between gap-4"
              >
                <Link
                  href={`/app/notes/${note.id}`}
                  className="flex-1 min-w-0 group cursor-pointer space-y-1"
                >
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-ember,#E85D3F)] truncate transition-colors">
                    {note.title || "Untitled note"}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                    {getNoteSnippet(note.content, note.format)}
                  </p>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    Archived {formattedDate}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2.5 gap-1.5"
                    onClick={() => unarchiveNote(note.id)}
                    title="Unarchive Note"
                    aria-label={`Unarchive note ${note.title}`}
                  >
                    <RotateCcw size={12} />
                    <span>Unarchive</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
