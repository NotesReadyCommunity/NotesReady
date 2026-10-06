import React from "react";
import { Plus, BookOpen, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkspaceHomePage() {
  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-8">
      {/* Note Header / Document Meta */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 font-medium">
            <BookOpen size={14} />
            <span>General Knowledge</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            <span>Updated 2 minutes ago</span>
          </span>
        </div>

        {/* Note Title */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Welcome to NotesReady
        </h1>
      </div>

      {/* Note Document Body (Human-designed content layout) */}
      <article className="prose max-w-none text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] space-y-6">
        <p>
          NotesReady is your modern workspace for capturing ideas, structuring knowledge, and collaborating in real time. We built NotesReady around a singular guiding principle:
        </p>

        <blockquote className="border-l-2 border-[var(--border-strong)] pl-4 py-1 italic font-medium text-[var(--text-primary)] my-4">
          &ldquo;Simple enough to start instantly. Powerful enough to grow with you.&rdquo;
        </blockquote>

        <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] pt-4 border-t border-[var(--border-subtle)]">
          Core Capabilities in Phase 1
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1">
              Distraction-Free Surface
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-normal">
              Clean typography, generous margins, and subtle contextual controls keep attention strictly on your content.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1">
              Responsive Multi-Tier Shell
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-normal">
              Effortlessly navigate between notebooks, recent documents, and favorites across desktop, tablet, and mobile.
            </p>
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] pt-4 border-t border-[var(--border-subtle)]">
          Next Phase Roadmap
        </h2>

        <ul className="space-y-2 text-xs sm:text-sm list-none pl-0">
          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[10px] font-bold text-[var(--text-primary)]">
              2
            </span>
            <span>
              <strong>Note Creation & Persistence</strong> — Instant note instantiation, title auto-focus, and local storage buffer.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[10px] font-bold text-[var(--text-primary)]">
              3
            </span>
            <span>
              <strong>Modular Tiptap Editor</strong> — ProseMirror blocks, checklists, code syntax highlighting, callouts, and floating menus.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[10px] font-bold text-[var(--text-primary)]">
              5
            </span>
            <span>
              <strong>Real-Time Collaboration</strong> — Multi-user synchronization with Yjs CRDTs and live presence cursors.
            </span>
          </li>
        </ul>
      </article>

      {/* Bottom Action Footer */}
      <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          NotesReady Foundation • Release v0.1.0
        </span>
        <Button variant="secondary" size="sm">
          <Plus size={13} />
          <span>Create Note</span>
        </Button>
      </div>
    </div>
  );
}
