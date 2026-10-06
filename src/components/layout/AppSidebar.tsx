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
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  className = "",
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/app", icon: Home },
    { label: "All Notes", href: "/app/notes", icon: FileText },
    { label: "Favorites", href: "/app/favorites", icon: Star },
    { label: "Shared", href: "/app/shared", icon: Users },
  ];

  return (
    <aside
      className={`w-64 border-r border-[var(--border-subtle)] bg-[var(--surface-1)] flex flex-col justify-between h-full select-none ${className}`}
    >
      {/* Top Header & Workspace Switcher */}
      <div>
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
            onClick={() => {
              // Note creation trigger (Phase 2)
              alert("Note creation initialized (Phase 2)");
            }}
          >
            <Plus size={15} />
            <span>New Note</span>
          </Button>

          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-0)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search size={14} />
              <span>Quick Search...</span>
            </div>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-secondary)] font-mono border border-[var(--border-subtle)]">
              ⌘K
            </kbd>
          </button>
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

        {/* Notebooks / Folders Section Placeholder */}
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
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all cursor-pointer text-left"
            >
              <FolderClosed size={15} className="shrink-0 text-[var(--text-muted)]" />
              <span className="truncate">General Knowledge</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all cursor-pointer text-left"
            >
              <FolderClosed size={15} className="shrink-0 text-[var(--text-muted)]" />
              <span className="truncate">Product Engineering</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-1">
        <button
          type="button"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
        >
          <Trash2 size={15} />
          <span>Trash</span>
        </button>
      </div>
    </aside>
  );
};
