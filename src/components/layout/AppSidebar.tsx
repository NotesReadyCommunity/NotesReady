"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Star,
  Users,
  Plus,
  Search,
  Settings,
  Trash2,
  FolderClosed,
  ChevronDown,
  Clock,
  Archive,
  Check,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";

interface AppSidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  className = "",
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const {
    recentNotes,
    notebooks,
    trashedNotes,
    archivedNotes,
    createNote,
    createNotebook,
  } = useWorkspace();

  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");

  const navItems = [
    { label: "Home", href: "/app", icon: Home },
    { label: "All Notes", href: "/app/notes", icon: FileText },
    { label: "Favorites", href: "/app/favorites", icon: Star },
    {
      label: "Archive",
      href: "/app/archive",
      icon: Archive,
      badge: archivedNotes.length > 0 ? archivedNotes.length : undefined,
    },
    { label: "Shared", href: "/app/shared", icon: Users },
  ];

  const handleNewNoteClick = async () => {
    await createNote();
    onCloseMobile?.();
  };

  const handleCreateNotebook = async () => {
    const trimmed = newNotebookName.trim();
    if (trimmed) {
      await createNotebook(trimmed);
      setNewNotebookName("");
      setIsCreatingNotebook(false);
    }
  };

  return (
    <aside
      className={`w-64 border-r border-[var(--border-subtle)] bg-[var(--surface-1)] flex flex-col justify-between h-full select-none ${className}`}
    >
      {/* Top Header & Workspace Switcher */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
          <Link
            href="/app"
            onClick={onCloseMobile}
            className="flex items-center gap-2 group transition-opacity hover:opacity-85"
          >
            <BrandLogo size="md" />
          </Link>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="p-1.5 rounded-md text-[var(--text-muted)] opacity-50 cursor-not-allowed"
            title="Workspace options (planned)"
            aria-label="Workspace Options (planned)"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-3 space-y-2">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-start text-xs font-medium tracking-tight"
            type="button"
            onClick={handleNewNoteClick}
          >
            <Plus size={15} />
            <span>New Note</span>
          </Button>

          {/* Quick Search (Planned Feature) */}
          <div
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-0)]/60 text-xs text-[var(--text-muted)] opacity-60 cursor-not-allowed select-none"
            aria-disabled="true"
            title="Quick search is planned for a future release"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="shrink-0" />
              <span>Quick Search</span>
            </div>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)] uppercase tracking-wider font-mono">
              Soon
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="px-2 py-1 space-y-0.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[var(--surface-2)] text-[var(--text-primary)] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className="shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--surface-3)] text-[var(--text-muted)] font-mono">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Notebooks Section */}
        <div className="mt-5 px-3">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Notebooks</span>
            <button
              type="button"
              onClick={() => setIsCreatingNotebook(true)}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              title="Add Notebook"
              aria-label="Add Notebook"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* New Notebook Inline Form */}
          {isCreatingNotebook && (
            <div className="mt-1 px-1.5 py-1 flex items-center gap-1 bg-[var(--surface-2)] rounded-lg border border-[var(--border-subtle)] animate-in fade-in">
              <input
                type="text"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateNotebook();
                  if (e.key === "Escape") {
                    setIsCreatingNotebook(false);
                    setNewNotebookName("");
                  }
                }}
                placeholder="Notebook name"
                autoFocus
                className="w-full text-xs px-1.5 py-0.5 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                aria-label="Notebook name input"
              />
              <button
                type="button"
                onClick={handleCreateNotebook}
                className="p-1 text-[var(--brand-ember,#E85D3F)] hover:text-[var(--brand-ember-hover,#C94A30)] cursor-pointer"
                aria-label="Save notebook"
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNotebook(false);
                  setNewNotebookName("");
                }}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label="Cancel notebook creation"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="mt-1 space-y-0.5">
            {notebooks.length === 0 ? (
              <p className="px-3 py-1.5 text-[11px] text-[var(--text-muted)] italic">
                No notebooks yet.
              </p>
            ) : (
              notebooks.map((nb) => {
                const isCurrent = pathname === `/app/notebooks/${nb.id}`;
                return (
                  <Link
                    key={nb.id}
                    href={`/app/notebooks/${nb.id}`}
                    onClick={onCloseMobile}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer truncate ${
                      isCurrent
                        ? "bg-[var(--surface-2)] text-[var(--text-primary)] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <FolderClosed size={13} className="shrink-0 text-[var(--text-muted)]" />
                    <span className="truncate">{nb.name}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Real Recent Notes Section */}
        <div className="mt-5 px-3">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Recent Notes</span>
            <Clock size={12} />
          </div>

          <div className="mt-1 space-y-0.5">
            {recentNotes.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-[var(--text-muted)] italic">
                No notes created yet.
              </p>
            ) : (
              recentNotes.map((note) => {
                const isCurrent = pathname === `/app/notes/${note.id}`;
                return (
                  <Link
                    key={note.id}
                    href={`/app/notes/${note.id}`}
                    onClick={onCloseMobile}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer truncate ${
                      isCurrent
                        ? "bg-[var(--surface-2)] text-[var(--text-primary)] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <FileText size={13} className="shrink-0 text-[var(--text-muted)]" />
                    <span className="truncate">{note.title || "Untitled note"}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-1">
        {/* Real Trash Navigation */}
        <Link
          href="/app/trash"
          onClick={onCloseMobile}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            pathname === "/app/trash"
              ? "bg-[var(--surface-2)] text-[var(--text-primary)] font-semibold"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Trash2 size={15} className="shrink-0" />
            <span>Trash</span>
          </div>
          {trashedNotes.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--surface-3)] text-[var(--text-muted)] font-mono">
              {trashedNotes.length}
            </span>
          )}
        </Link>

        {/* Planned Settings */}
        <div
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[var(--text-muted)] opacity-60 cursor-not-allowed select-none"
          aria-disabled="true"
          title="Settings are planned for a future release"
        >
          <div className="flex items-center gap-2.5">
            <Settings size={15} className="shrink-0" />
            <span>Settings</span>
          </div>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)] uppercase tracking-wider font-mono">
            Soon
          </span>
        </div>
      </div>
    </aside>
  );
};
