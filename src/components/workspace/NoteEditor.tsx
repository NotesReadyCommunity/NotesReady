"use client";

import React, { useRef, useEffect, useState } from "react";
import { Star, Trash2, Clock, Plus, ArrowLeft } from "lucide-react";
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
    handleTitleChange,
    handleContentChange,
    handleFallbackContentChange,
    deleteNote,
    toggleFavorite,
  } = useNote(noteId);

  const { createNote } = useWorkspace();
  const richEditorRef = useRef<RichEditorRef>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto-focus title if note is fresh (content empty and title default)
  useEffect(() => {
    if (!isLoading && note && note.content === "" && note.title === "Untitled note") {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isLoading, note]);

  // Pressing Enter in title focuses the rich editor canvas immediately
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      richEditorRef.current?.focus();
    }
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
      {/* Top Document Header Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <Clock size={13} />
          <span>Edited {formattedDate}</span>
        </div>

        <div className="flex items-center gap-1.5">
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
          className="w-full text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent outline-none border-none p-0 focus:ring-0 leading-tight"
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
          />
        </EditorErrorBoundary>
      </div>
    </article>
  );
};
