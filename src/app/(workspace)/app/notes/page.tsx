import React from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AllNotesPage() {
  const sampleNotes = [
    {
      id: "note-1",
      title: "Welcome to NotesReady",
      excerpt: "NotesReady is your modern workspace for capturing ideas, structuring knowledge...",
      date: "2 mins ago",
      notebook: "General Knowledge",
    },
    {
      id: "note-2",
      title: "System Architecture & Sync Engine",
      excerpt: "Technical specifications on Yjs CRDT synchronization and Hocuspocus WebSocket layer...",
      date: "Yesterday",
      notebook: "Product Engineering",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            All Notes
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            2 notes in current workspace
          </p>
        </div>
        <Button variant="primary" size="sm" className="text-xs">
          <Plus size={14} />
          <span>New Note</span>
        </Button>
      </div>

      <div className="space-y-2">
        {sampleNotes.map((note) => (
          <div
            key={note.id}
            className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] hover:bg-[var(--surface-1)] transition-all cursor-pointer group space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-black dark:group-hover:text-white">
                {note.title}
              </h2>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                {note.date}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
              {note.excerpt}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] pt-1">
              <FileText size={11} />
              <span>{note.notebook}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
