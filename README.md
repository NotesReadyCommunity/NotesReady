# NotesReady

[![CI Quality Gates](https://github.com/NotesReadyCommunity/NotesReady/actions/workflows/ci.yml/badge.svg)](https://github.com/NotesReadyCommunity/NotesReady/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tiptap](https://img.shields.io/badge/Editor-Tiptap_v3-000000)](https://tiptap.dev/)

A modern, full-featured digital note-taking and knowledge workspace engineered for deep focus, local-first reliability, and seamless cross-device synchronization.

> **North Star**: Simple enough to start instantly. Powerful enough to grow with you.  
> **Core UX Philosophy**: Invisible complexity.

---

## Brand & Visual Identity

- **Official Brand**: NotesReady (Official name; never use "Noteapp").
- **Official Logo**: Selected Concept 04 — Custom geometric 'N' emblem with precision neo-grotesque wordmark. Strictly monochrome (black on light surfaces, white on dark surfaces).
- **Color Foundation**: Neutral slate foundation paired with official **NotesReady Ember** (`#E85D3F`) accent (supporting: `#C94A30`, `#FCE8E3`, `#FFF5F2`).
- **Visual Ratio**: **85–95% neutral foundation, 5–10% brand accent, 0% decorative gradients.** Reject generic SaaS clichés (no neon glowing blobs, no purple/blue gradients, no floating geometric shapes).

---

## Technology Stack

- **Application Framework**: [Next.js 15+ (App Router)](https://nextjs.org/) with React 19 and TypeScript 5.7
- **Styling & Design Tokens**: [Tailwind CSS v4](https://tailwindcss.com/) with curated semantic HSL tokens
- **Rich Editor Engine**: Modular headless [Tiptap v3](https://tiptap.dev/) on top of [ProseMirror](https://prosemirror.net/)
- **Local Persistence Engine**: Native zero-dependency client IndexedDB adapter (`notesready-db`)
- **Cloud Backend & Auth (Planned)**: PostgreSQL 15+ with Row Level Security (RLS) via Supabase Auth
- **Testing & Quality Assurance**: [Vitest](https://vitest.dev/), Testing Library, and Next.js static build validation

---

## Project Status & Implementation Roadmap

NotesReady is developed in strictly reviewed, independently verifiable engineering phases:

| Phase | Milestone Name | Status | Branch / Baseline | Key Capabilities |
| :---: | :--- | :---: | :---: | :--- |
| **0** | **Project Definition & Architecture** | **Complete** | `main` | Brand Concept 04, reference studies, core documentation framework. |
| **1** | **Foundation & Application Shell** | **Complete** | `main` | Multi-tier shell, responsive drawer, marketing landing page, legal routes. |
| **2** | **Core Workspace & Note Creation** | **Complete** | `main` | Decoupled note entity, native IndexedDB adapter, 400ms debounced autosave. |
| **3** | **Rich Text Editor & Durability** | **Complete** | `main` *(Stable Baseline)* | Tiptap v3, floating bubble menu, 2 MB size limits, lifecycle flushing, privacy logging. |
| **4** | **Persistence & Organization** | **Audited** | `phase-4-organization` *(Pending Merge)* | IndexedDB v2 migration, notebooks, tags, archive, trash & recovery workflow. |
| **5** | **Cloud Persistence & Sync** | **Planned** | Architectural Plan | Google/Microsoft OAuth, verified email, PostgreSQL RLS, conflict-preserving sync. |
| **6** | **Real-Time Collaboration** | **Planned** | Roadmap | Ephemeral presence, Yjs CRDTs, WebSocket document synchronization. |
| **7** | **Search & Command Palette** | **Planned** | Roadmap | Full-text search index, keyboard command palette (`Cmd+K`). |
| **8** | **Files & Object Media** | **Planned** | Roadmap | S3-compatible attachment uploads with presigned validation. |
| **9** | **Mobile Web & Accessibility** | **Planned** | Roadmap | Touch ergonomics, accessory toolbar, WCAG AA compliance audit. |
| **10** | **Production Security & Launch** | **Planned** | Roadmap | Production rate limiting, CSP security headers, custom domain deployment. |

---

## Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v20.x or higher
- [npm](https://www.npmjs.com/) v10.x or higher

### Installation & Development Server
```bash
# Clone the repository
git clone https://github.com/NotesReadyCommunity/NotesReady.git
cd NotesReady

# Install dependencies cleanly
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## Quality Gates & Verification

Every pull request and release branch must pass all five mandatory automated quality gates:

```bash
# 1. Automated Test Suite (Vitest)
npm test

# 2. Strict TypeScript Compilation Check
npx tsc --noEmit

# 3. Code Style & Linting (ESLint)
npm run lint

# 4. Production Next.js Build
npm run build

# 5. Whitespace & Formatting Validation
git diff --check
```

---

## Engineering Governance & Contributing

- **Stable Branch Strategy**: The `main` branch serves as the protected, stable production baseline.
- **Phase Branch Discipline**: Feature development takes place in isolated phase branches (e.g., `phase-4-organization`).
- **Owner Approval**: No phase branch is merged into `main` without formal review, passing quality gates, and explicit project owner authorization.
- For complete guidelines on PR formatting, architectural rules, and brand invariants, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Security & Privacy Policy

- **Storage Honesty**: The application truthfully surfaces storage failure warnings rather than silently pretending changes are persisted when browser quotas fail.
- **Zero-Telemetry Privacy**: Note titles, contents, and user writing are strictly excluded from diagnostics, error logs, and telemetry.
- **Server-Side Authorization**: Hiding UI buttons is never treated as security. All cloud persistence and APIs enforce server-side Row Level Security.
- To report security concerns, please review our [Security Guidelines](CONTRIBUTING.md#3-engineering-architecture--code-standards).

---

## License

Private and proprietary. All rights reserved by NotesReady Community.
