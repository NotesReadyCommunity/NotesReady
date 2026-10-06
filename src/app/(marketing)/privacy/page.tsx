import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata = {
  title: "Privacy Policy",
  description: "NotesReady Privacy Policy and data protection practices.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Last updated: October 2026 (Draft for Engineering Review)
        </p>

        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] pt-2">
            1. Overview
          </h2>
          <p>
            At NotesReady, privacy is treated as an architectural foundation, not an afterthought. We collect only the minimum information necessary to authenticate your account and securely synchronize your personal knowledge across devices.
          </p>

          <h2 className="text-base font-semibold text-[var(--text-primary)] pt-2">
            2. Information We Process
          </h2>
          <p>
            When you use NotesReady, we process your email address for account access, metadata regarding your notebooks and notes, and encrypted note documents to provide real-time collaborative editing.
          </p>

          <h2 className="text-base font-semibold text-[var(--text-primary)] pt-2">
            3. Data Ownership & Deletion
          </h2>
          <p>
            You retain 100% ownership of your notes and intellectual property. You may export your workspace data or permanently delete your account and associated notes at any time from your settings panel.
          </p>
        </div>
      </main>

      <footer className="border-t border-[var(--border-subtle)] py-6 text-center text-xs text-[var(--text-muted)]">
        NotesReady Privacy • Draft Policy
      </footer>
    </div>
  );
}
