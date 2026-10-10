"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Star,
  Trash2,
  Clock,
  Plus,
  ArrowLeft,
  Archive,
  FolderClosed,
  Tag,
  X,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useNote } from "@/hooks/useNote";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { RichEditor, RichEditorRef } from "@/components/editor/RichEditor";
import { EditorErrorBoundary } from "@/components/editor/EditorErrorBoundary";

interface NoteEditorProps {
  noteId: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ noteId }) => {
  const {
    note,
    title,
    content,
    format,
    isLoading,
    isNotFound,
    isTrashed,
    handleTitleChange,
    handleContentChange,
    handleFallbackContentChange,
    deleteNote,
    toggleFavorite,
    restoreNote,
    permanentlyDeleteNote,
    toggleArchive,
    setNotebookId,
    setTags,
  } = useNote(noteId);

  const { createNote, notebooks } = useWorkspace();
  const richEditorRef = useRef<RichEditorRef>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPermanentDeleteConfirm, setShowPermanentDeleteConfirm] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  // Auto-focus title if note is fresh (content empty and title default)
  useEffect(() => {
    if (!isLoading && note && !isTrashed && note.content === "" && note.title === "Untitled note") {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isLoading, note, isTrashed]);

  // Pressing Enter in title focuses the rich editor canvas immediately
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      richEditorRef.current?.focus();
    }
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#+/, "").toLowerCase();
    if (!trimmed) {
      setIsAddingTag(false);
      setNewTagInput("");
      return;
    }
    const currentTags = note?.tags || [];
    if (!currentTags.includes(trimmed)) {
      setTags([...currentTags, trimmed]);
    }
    setNewTagInput("");
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = note?.tags || [];
    setTags(currentTags.filter((t) => t !== tagToRemove));
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6 animate-pulse select-none">
        <div className="h-4 bg-[var(--surface-2)] rounded w-48" />
        <div className="h-10 bg-[var(--surface-2)] rounded w-3/4" />
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-[var(--surface-2)] rounded w-full" />
          <div className="h-4 bg-[var(--surface-2)] rounded w-5/6" />
          <div className="h-4 bg-[var(--surface-2)] rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (isNotFound || !note) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-5 select-none">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
          <Clock size={24} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Note Not Found
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            This note may have been deleted, moved, or the link may be invalid.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/app/notes">
            <Button variant="outline" size="sm">
              <ArrowLeft size={13} />
              <span>All Notes</span>
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => createNote()}>
            <Plus size={13} />
            <span>Create New Note</span>
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(note.updatedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="max-w-3xl mx-auto py-2 sm:py-6 space-y-6">
      {/* Trashed Note Banner */}
      {isTrashed && (
        <div
          role="alert"
          aria-label="Trashed note notice"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-300 text-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-xs text-[var(--text-primary)]">
                This note is in the trash
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Editing and autosave are disabled. Restore this note to make changes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              className="text-xs h-7 px-3 gap-1.5"
              onClick={restoreNote}
            >
              <RotateCcw size={12} />
              <span>Restore Note</span>
            </Button>
            {showPermanentDeleteConfirm ? (
              <div className="flex items-center gap-1 bg-[var(--surface-2)] p-0.5 rounded-lg border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowPermanentDeleteConfirm(false)}
                  className="px-2 py-0.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={permanentlyDeleteNote}
                  className="px-2 py-0.5 text-[11px] rounded bg-red-600 hover:bg-red-700 text-white font-medium cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-500/10 border-red-500/25"
                onClick={() => setShowPermanentDeleteConfirm(true)}
              >
                <Trash2 size={12} />
                <span>Delete Permanently</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Top Document Header Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <Clock size={13} />
          <span>Edited {formattedDate}</span>
          {note.archivedAt && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[10px] font-medium text-[var(--brand-ember,#E85D3F)] border border-[var(--border-subtle)]">
              Archived
            </span>
          )}
        </div>

        {!isTrashed && (
          <div className="flex items-center gap-1.5">
            {/* Archive Toggle Button */}
            <button
              type="button"
              onClick={toggleArchive}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                note.archivedAt
                  ? "text-[var(--brand-ember,#E85D3F)] bg-[var(--surface-2)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
              }`}
              title={note.archivedAt ? "Unarchive Note" : "Archive Note"}
              aria-label={note.archivedAt ? "Unarchive Note" : "Archive Note"}
            >
              <Archive size={16} />
            </button>

            {/* Favorite Toggle Button */}
            <button
              type="button"
              onClick={toggleFavorite}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                note.isFavorite
                  ? "text-[var(--brand-ember,#E85D3F)] bg-[var(--surface-2)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
              }`}
              title={note.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              aria-label={note.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Star size={16} fill={note.isFavorite ? "currentColor" : "none"} />
            </button>

            {/* Accidental deletion protection */}
            {showDeleteConfirm ? (
              <div
                className="flex items-center gap-1.5 bg-[var(--surface-2)] px-2 py-0.5 rounded-lg border border-[var(--border-subtle)] text-xs animate-in fade-in"
                role="alert"
                aria-label="Confirm moving note to trash"
              >
                <span className="text-[var(--text-secondary)] font-medium text-[11px]">Move to trash?</span>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-1.5 py-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer text-[11px]"
                  aria-label="Cancel deletion"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteNote}
                  className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-colors cursor-pointer text-[11px]"
                  aria-label="Confirm move to trash"
                >
                  Move to Trash
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Move Note to Trash"
                aria-label="Move Note to Trash"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Organization Strip: Notebook and Tags */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
        {/* Notebook Picker */}
        <div className="flex items-center gap-1.5">
          <FolderClosed size={13} className="text-[var(--text-muted)] shrink-0" />
          <select
            value={note.notebookId || ""}
            onChange={(e) => setNotebookId(e.target.value ? e.target.value : null)}
            disabled={isTrashed}
            aria-label="Assign notebook"
            className="text-xs bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-ember,#E85D3F)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <option value="">No notebook (Inbox)</option>
            {notebooks.map((nb) => (
              <option key={nb.id} value={nb.id}>
                {nb.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags management */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag size={13} className="text-[var(--text-muted)] shrink-0" />
          {(note.tags || []).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[11px] font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)]"
            >
              <span>#{t}</span>
              {!isTrashed && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-red-500 transition-colors cursor-pointer"
                  aria-label={`Remove tag ${t}`}
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))}

          {!isTrashed && (
            isAddingTag ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    } else if (e.key === "Escape") {
                      setIsAddingTag(false);
                      setNewTagInput("");
                    }
                  }}
                  onBlur={handleAddTag}
                  placeholder="tag-name"
                  autoFocus
                  className="w-24 px-1.5 py-0.5 text-[11px] rounded bg-[var(--surface-1)] border border-[var(--brand-ember,#E85D3F)] text-[var(--text-primary)] outline-none"
                  aria-label="New tag name"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                title="Add tag"
                aria-label="Add tag"
              >
                <Plus size={11} />
                <span>Tag</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Note Title Input */}
      <div>
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled note"
          aria-label="Note Title"
          disabled={isTrashed}
          className="w-full text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent outline-none border-none p-0 focus:ring-0 leading-tight disabled:opacity-60"
        />
      </div>

      {/* Note Content (Rich Editor with Error Boundary fallback) */}
      <div className="pt-2">
        <EditorErrorBoundary
          fallbackContent={content}
          format={format}
          onFallbackContentChange={handleFallbackContentChange}
        >
          <RichEditor
            key={note.id}
            ref={richEditorRef}
            content={content}
            format={format}
            onContentChange={handleContentChange}
            disabled={isTrashed}
          />
        </EditorErrorBoundary>
      </div>
    </article>
  );
};
