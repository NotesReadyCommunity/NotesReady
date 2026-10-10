"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { FileText, Plus, Star, FolderClosed, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getNoteSnippet } from "@/core/utils/content";

export default function AllNotesPage() {
  const { notes, notebooks, isLoading, createNote } = useWorkspace();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags across notes in workspace
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      n.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [notes]);

  // Filter notes by selected tag
  const filteredNotes = useMemo(() => {
    if (!selectedTag) return notes;
    return notes.filter((n) => n.tags?.includes(selectedTag));
  }, [notes, selectedTag]);

  // Map of notebook id -> notebook name
  const notebookMap = useMemo(() => {
    const map = new Map<string, string>();
    notebooks.forEach((nb) => map.set(nb.id, nb.name));
    return map;
  }, [notebooks]);

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            All Notes
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {isLoading
              ? "Loading notes..."
              : `${notes.length} note${notes.length === 1 ? "" : "s"} in local workspace`}
          </p>
        </div>
        <Button variant="primary" size="sm" className="text-xs" onClick={() => createNote()}>
          <Plus size={14} />
          <span>New Note</span>
        </Button>
      </div>

      {/* Tag Filter Pills */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              selectedTag === null
                ? "bg-[var(--surface-3)] text-[var(--text-primary)] font-semibold"
                : "bg-[var(--surface-1)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                selectedTag === tag
                  ? "bg-[var(--brand-ember,#E85D3F)] text-white font-semibold"
                  : "bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <Tag size={11} />
              <span>#{tag}</span>
            </button>
          ))}
        </div>
      )}

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
      ) : filteredNotes.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[var(--border-subtle)] rounded-xl space-y-2">
          <p className="text-xs text-[var(--text-secondary)]">
            No notes found with tag <span className="font-semibold text-[var(--text-primary)]">#{selectedTag}</span>
          </p>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className="text-xs text-[var(--brand-ember,#E85D3F)] hover:underline cursor-pointer"
          >
            Clear tag filter
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotes.map((note) => {
            const formattedDate = new Date(note.updatedAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            });
            const notebookName = note.notebookId ? notebookMap.get(note.notebookId) : null;

            return (
              <Link
                key={note.id}
                href={`/app/notes/${note.id}`}
                className="block p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] hover:bg-[var(--surface-1)] transition-all cursor-pointer group space-y-2"
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

                {/* Metadata badges: Notebook & Tags */}
                {(notebookName || (note.tags && note.tags.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {notebookName && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[10px] font-medium text-[var(--text-secondary)]">
                        <FolderClosed size={10} className="text-[var(--brand-ember,#E85D3F)]" />
                        <span>{notebookName}</span>
                      </span>
                    )}
                    {note.tags?.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[10px] font-mono text-[var(--text-muted)]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
