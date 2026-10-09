"use client";

import React from "react";
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
  const { recentNotes, createNote } = useWorkspace();

  const navItems = [
    { label: "Home", href: "/app", icon: Home },
    { label: "All Notes", href: "/app/notes", icon: FileText },
    { label: "Favorites", href: "/app/favorites", icon: Star },
    { label: "Shared", href: "/app/shared", icon: Users },
  ];

  const handleNewNoteClick = async () => {
    await createNote();
    onCloseMobile?.();
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
            className="p-1.5 rounded-md hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Workspace Options"
            aria-label="Workspace Options"
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

          <Link href="/app/notes" onClick={onCloseMobile} className="block w-full">
            <div
              role="button"
              tabIndex={0}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-0)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search size={14} />
                <span>Quick Search...</span>
              </div>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-secondary)] font-mono border border-[var(--border-subtle)]">
                ⌘K
              </kbd>
            </div>
          </Link>
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[var(--surface-2)] text-[var(--text-primary)] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

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

        {/* Notebooks Section Placeholder */}
        <div className="mt-5 px-3">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Notebooks</span>
            <button
              type="button"
              className="hover:text-[var(--text-primary)] p-0.5 cursor-pointer"
              title="Add Notebook"
              aria-label="Add Notebook"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="mt-1 space-y-0.5">
            <Link href="/app/notes" onClick={onCloseMobile} className="block w-full">
              <div
                role="button"
                tabIndex={0}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all cursor-pointer text-left"
              >
                <FolderClosed size={15} className="shrink-0 text-[var(--text-muted)]" />
                <span className="truncate">General Knowledge</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-1">
        <Link href="/app" onClick={onCloseMobile} className="block w-full">
          <div
            role="button"
            tabIndex={0}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <Settings size={15} />
            <span>Settings</span>
          </div>
        </Link>
        <Link href="/app/notes" onClick={onCloseMobile} className="block w-full">
          <div
            role="button"
            tabIndex={0}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <Trash2 size={15} />
            <span>Trash</span>
          </div>
        </Link>
      </div>
    </aside>
  );
};
