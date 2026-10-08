import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Zap, Sparkles, Smartphone, Users } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--surface-0)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">
              Features
            </a>
            <a href="#workspace" className="hover:text-[var(--text-primary)] transition-colors">
              Workspace
            </a>
            <a href="#collaboration" className="hover:text-[var(--text-primary)] transition-colors">
              Collaboration
            </a>
            <a href="#security" className="hover:text-[var(--text-primary)] transition-colors">
              Security
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/app">
              <Button variant="primary" size="sm" className="text-xs">
                <span>Open NotesReady</span>
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[11px] font-medium text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>NotesReady Foundation Released</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-3xl mx-auto leading-[1.12]">
            A calm, powerful workspace for everything you think and create.
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Capture thoughts instantly, organize knowledge seamlessly, and collaborate with your team without distraction. Simple on the surface, endlessly deep underneath.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/app">
              <Button size="lg" className="w-full sm:w-auto text-sm px-6">
                <span>Start Writing Free</span>
                <ArrowRight size={15} />
              </Button>
            </Link>
            <a href="#workspace">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm px-6">
                <span>Explore the Product</span>
              </Button>
            </a>
          </div>

          {/* Real UI Interactive Preview Box */}
          <div id="workspace" className="pt-12">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-2 sm:p-3 shadow-2xl">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] overflow-hidden text-left">
                {/* Simulated App Window Header */}
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-1)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span className="ml-2 text-xs font-mono text-[var(--text-muted)]">
                      notesready.in/app
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ● Real-Time Sync
                  </span>
                </div>

                {/* Simulated Content Canvas */}
                <div className="p-6 sm:p-10 space-y-4">
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                    Product Architecture & Vision
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    Building the Independent Knowledge Canvas
                  </h2>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    NotesReady brings together the structured clarity of modern block-based writing with the effortless capture and notebook organization you expect from traditional tools.
                  </p>
                  <div className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)]">
                    &gt; Zero clutter. Zero bloated AI widgets. Pure focus on your words and ideas.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars / Features Grid */}
        <section id="features" className="py-20 border-t border-[var(--border-subtle)] bg-[var(--surface-1)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center space-y-3 mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Engineered for serious thinking.
              </h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
                Carefully crafted interactions that stay out of your way until you need them.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-primary)]">
                  <Zap size={18} />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Instant Capture
                </h3>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  Open and start writing with zero delay. No loading screens, no forced categorizations before your first sentence.
                </p>
              </div>

              <div id="collaboration" className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-primary)]">
                  <Users size={18} />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Seamless Collaboration
                </h3>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  Conflict-free real-time synchronization powered by CRDTs. Multiple people editing simultaneously with mathematical convergence.
                </p>
              </div>

              <div id="security" className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-primary)]">
                  <Shield size={18} />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Data Safety & Privacy
                </h3>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  Server-enforced access controls, offline buffers, and cryptographic share links keep your intellectual property safe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-20 px-4 sm:px-6 text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Ready for a workspace that respects your focus?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            Experience the calm, fast, and structured way to write and remember.
          </p>
          <div>
            <Link href="/app">
              <Button size="lg" className="px-8 text-sm">
                <span>Launch NotesReady</span>
                <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Structured Editorial Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-0)] pt-14 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Top: Brand Area & Structured Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Brand Column */}
            <div className="md:col-span-6 space-y-3">
              <Link href="/" className="inline-flex">
                <BrandLogo size="md" />
              </Link>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
                A calm, powerful workspace for everything you think and create. Fast, distraction-free digital knowledge architecture.
              </p>
            </div>

            {/* Product & Workspace Links (Real, existing routes only) */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li>
                  <Link href="/app" className="hover:text-[var(--text-primary)] transition-colors">
                    Open Workspace
                  </Link>
                </li>
                <li>
                  <Link href="/app/notes" className="hover:text-[var(--text-primary)] transition-colors">
                    Notes Directory
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">
                    Core Capabilities
                  </a>
                </li>
                <li>
                  <a href="#workspace" className="hover:text-[var(--text-primary)] transition-colors">
                    Canvas Preview
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Trust Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Trust & Legal
              </h4>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li>
                  <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a href="#security" className="hover:text-[var(--text-primary)] transition-colors">
                    Security Principles
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Status Bar */}
          <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <span>
              © {new Date().getFullYear()} NotesReady Inc. All rights reserved.
            </span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              notesready.in • Independent Knowledge Canvas
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
