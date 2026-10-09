"use client";

import React from "react";
import Link from "next/link";
import { Plus, BookOpen, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function WorkspaceHomePage() {
  const { notes, createNote } = useWorkspace();
  const latestNote = notes[0];

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-8">
      {/* Note Header / Document Meta */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 font-medium">
            <BookOpen size={14} />
            <span>Personal Workspace</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            <span>Local Storage Active</span>
          </span>
        </div>

        {/* Note Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Welcome to NotesReady
        </h1>
      </div>

      {/* Note Document Body */}
      <article className="prose max-w-none text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] space-y-6">
        <p>
          NotesReady is your calm, local-first workspace for capturing ideas, structuring knowledge, and writing without distraction.
        </p>

        <blockquote className="border-l-2 border-[var(--border-strong)] pl-4 py-1 italic font-medium text-[var(--text-primary)] my-4">
          &ldquo;Simple enough to start instantly. Powerful enough to grow with you.&rdquo;
        </blockquote>

        {latestNote && (
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Last Edited Note
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {latestNote.title || "Untitled note"}
              </div>
            </div>
            <Link href={`/app/notes/${latestNote.id}`}>
              <Button variant="outline" size="sm">
                <span>Continue Writing</span>
              </Button>
            </Link>
          </div>
        )}

        <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] pt-4 border-t border-[var(--border-subtle)]">
          Core Workspace Capabilities
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1">
              Local-First Persistence
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-normal">
              Your notes are stored privately in your browser using IndexedDB. Zero network delays; instantaneous save resilience.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1">
              Instant Capture
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-normal">
              Click New Note anywhere in the application to start writing immediately. Auto-focused title and clean distraction-free canvas.
            </p>
          </div>
        </div>
      </article>

      {/* Bottom Action Footer */}
      <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          NotesReady Core Workspace • Local-First
        </span>
        <div className="flex items-center gap-2">
          <Link href="/app/notes">
            <Button variant="outline" size="sm">
              <FileText size={13} />
              <span>All Notes</span>
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => createNote()}>
            <Plus size={13} />
            <span>Create Note</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
