"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FolderClosed, Plus, Star, MoreHorizontal, ArrowLeft, Trash2, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getNoteSnippet } from "@/core/utils/content";

export default function NotebookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const { notes, notebooks, isLoading, createNote, renameNotebook, deleteNotebook } = useWorkspace();
  const notebook = notebooks.find((nb) => nb.id === id);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const notebookNotes = notes.filter((n) => n.notebookId === id);

  const handleStartRename = () => {
    if (notebook) {
      setEditedName(notebook.name);
      setIsEditingName(true);
    }
  };

  const handleSaveRename = async () => {
    if (notebook && editedName.trim()) {
      await renameNotebook(notebook.id, editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleDeleteNotebook = async () => {
    if (notebook) {
      await deleteNotebook(notebook.id);
      router.push("/app/notes");
    }
  };

  const handleCreateNoteInNotebook = async () => {
    await createNote({ notebookId: id });
  };

  if (!isLoading && !notebook) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
          <FolderClosed size={22} />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Notebook Not Found</h2>
        <p className="text-xs text-[var(--text-secondary)]">This notebook may have been deleted or moved.</p>
        <div className="pt-2">
          <Link href="/app/notes">
            <Button variant="outline" size="sm">
              <ArrowLeft size={13} />
              <span>Back to All Notes</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <FolderClosed size={22} className="text-[var(--brand-ember,#E85D3F)] shrink-0" />

            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
                  autoFocus
                  className="px-2 py-0.5 rounded border border-[var(--brand-ember,#E85D3F)] bg-[var(--surface-0)] text-xl font-bold text-[var(--text-primary)] outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveRename}
                  className="p-1 rounded bg-[var(--brand-ember,#E85D3F)] text-white cursor-pointer"
                  title="Save name"
                >
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  {notebook?.name || "Notebook"}
                </h1>
                <button
                  type="button"
                  onClick={handleStartRename}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-opacity cursor-pointer"
                  title="Rename Notebook"
                  aria-label="Rename Notebook"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            {isLoading
              ? "Loading notes..."
              : `${notebookNotes.length} note${notebookNotes.length === 1 ? "" : "s"} in this notebook`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] text-xs animate-in fade-in">
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">Delete notebook? (Notes will be preserved)</span>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteNotebook}
                aria-label="Confirm delete notebook"
                className="px-2.5 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-xs cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Delete Notebook"
              aria-label="Delete Notebook"
            >
              <Trash2 size={15} />
            </button>
          )}

          <Button
            variant="primary"
            size="sm"
            className="text-xs"
            onClick={handleCreateNoteInNotebook}
          >
            <Plus size={14} />
            <span>New Note</span>
          </Button>
        </div>
      </div>

      {/* Notes in Notebook */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-[var(--surface-1)] rounded-xl" />
          <div className="h-20 bg-[var(--surface-1)] rounded-xl" />
        </div>
      ) : notebookNotes.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[var(--border-strong)] rounded-2xl space-y-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
            <FolderClosed size={20} />
          </div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            No notes in this notebook yet
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Organize related ideas here. Click New Note to create your first document in this notebook.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={handleCreateNoteInNotebook}>
              <Plus size={13} />
              <span>Create Note in Notebook</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notebookNotes.map((note) => {
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
