import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata = {
  title: "Terms of Service",
  description: "NotesReady Terms of Service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-0)] px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <BrandLogo size="md" />
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 flex-1 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Terms of Service
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Last updated: October 2026 (Draft for Engineering Review)
        </p>

        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] pt-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using NotesReady, you agree to comply with these terms. NotesReady provides a digital note-taking workspace designed for personal and team productivity.
          </p>

          <h2 className="text-base font-semibold text-[var(--text-primary)] pt-2">
            2. Responsible Use
          </h2>
          <p>
            You are responsible for safeguarding your credentials and for all content created within your workspaces. You agree not to use the service for unauthorized distribution or unlawful activities.
          </p>

          <h2 className="text-base font-semibold text-[var(--text-primary)] pt-2">
            3. Service Availability
          </h2>
          <p>
            We strive to provide continuous, high-availability service with real-time sync resilience. We conduct regular data backups to ensure your knowledge workspace remains safe and durable.
          </p>
        </div>
      </main>

      <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-0)] py-8 px-6">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="sm" />
            <span>© {new Date().getFullYear()} NotesReady Inc.</span>
          </div>
          <div className="flex items-center gap-4 text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/app" className="hover:text-[var(--text-primary)] transition-colors">
              Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
