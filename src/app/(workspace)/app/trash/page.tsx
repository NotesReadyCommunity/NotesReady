"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, RotateCcw, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getNoteSnippet } from "@/core/utils/content";

export default function TrashPage() {
  const { trashedNotes, isLoading, restoreNote, permanentlyDeleteNote, emptyTrash } = useWorkspace();
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEmptyTrash = async () => {
    await emptyTrash();
    setShowEmptyConfirm(false);
  };

  const handlePermanentDelete = async (id: string) => {
    await permanentlyDeleteNote(id);
    setDeletingId(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Trash
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] font-mono">
              {trashedNotes.length}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Notes moved to trash remain available for recovery until permanently deleted.
          </p>
        </div>

        {trashedNotes.length > 0 && (
          <div>
            {showEmptyConfirm ? (
              <div className="flex items-center gap-2 bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] text-xs animate-in fade-in">
                <span className="text-[11px] text-[var(--text-secondary)] font-medium">Empty trash permanently?</span>
                <button
                  type="button"
                  onClick={() => setShowEmptyConfirm(false)}
                  className="px-2 py-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEmptyTrash}
                  className="px-2.5 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs cursor-pointer transition-colors"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10 border-red-500/20"
                onClick={() => setShowEmptyConfirm(true)}
              >
                <Trash2 size={13} />
                <span>Empty Trash</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Trashed Notes List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-[var(--surface-1)] rounded-xl" />
          <div className="h-20 bg-[var(--surface-1)] rounded-xl" />
        </div>
      ) : trashedNotes.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[var(--border-strong)] rounded-2xl space-y-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
            <Trash2 size={20} />
          </div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Trash is empty
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Items moved to trash will appear here for recovery or permanent deletion.
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
          {trashedNotes.map((note) => {
            const formattedDate = note.deletedAt
              ? new Date(note.deletedAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently";

            return (
              <div
                key={note.id}
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] hover:bg-[var(--surface-1)] transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/app/notes/${note.id}`}
                    className="flex-1 min-w-0 pr-4 group cursor-pointer"
                  >
                    <h2 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-ember,#E85D3F)] truncate transition-colors">
                      {note.title || "Untitled note"}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                      {getNoteSnippet(note.content, note.format)}
                    </p>
                  </Link>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2.5 gap-1.5"
                      onClick={() => restoreNote(note.id)}
                      title="Restore Note"
                      aria-label={`Restore ${note.title}`}
                    >
                      <RotateCcw size={12} />
                      <span>Restore</span>
                    </Button>

                    {deletingId === note.id ? (
                      <div className="flex items-center gap-1 bg-[var(--surface-2)] p-0.5 rounded-lg border border-[var(--border-subtle)]">
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="px-1.5 py-0.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDelete(note.id)}
                          aria-label={`Confirm permanent delete ${note.title}`}
                          className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-[11px] cursor-pointer"
                        >
                          Delete Forever
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingId(note.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Permanently"
                        aria-label={`Permanently delete ${note.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-mono">
                  <span>Deleted {formattedDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
