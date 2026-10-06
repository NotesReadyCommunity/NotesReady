# NotesReady — Master Task Tracker

## Phase 0: Project Definition & Architecture
- [x] Initial engineering audit and repository assessment
- [x] Establish official brand "Selected Concept 04" vector assets
- [x] Create core project documentation (`AGENTS.md`, `README.md`, `prd.md`, `architecture.md`, `design.md`, `rules.md`, `tasks.md`, `decisions.md`, `testing.md`, `memory.md`, `research.md`, `plans.md`)

## Phase 1: Foundation & Application Shell
- [ ] Initialize Next.js 15+ + React 19 + TypeScript app scaffold
- [ ] Configure Tailwind CSS v4 / design tokens with monochrome & slate foundation
- [ ] Integrate official Concept 04 brand vectors (SVG emblem, wordmark, favicon, app icons)
- [ ] Build responsive application shell:
  - [ ] Collapsible multi-tier sidebar
  - [ ] Workspace switcher
  - [ ] Global search & quick-find trigger (`Ctrl+K`)
  - [ ] Mobile responsive navigation drawer / sheet
  - [ ] Active route indicator & note list placeholder
- [ ] Set up unit test runner (Vitest) and basic shell tests

## Phase 2: Core Workspace & Note Creation
- [ ] Note domain models & schemas (Zod)
- [ ] In-memory / local storage client state with IndexedDB
- [ ] "New Note" creation flow with immediate title editing
- [ ] Recent notes and Favorites list

## Phase 3: Rich Editor
- [ ] Tiptap modular editor integration
- [ ] Block extensions: Headings (H1-H3), Checklists, Code blocks, Callouts, Quotes, Dividers
- [ ] Keyboard shortcuts and Markdown shortcuts (`# `, `- [ ]`, `> `)
- [ ] Contextual floating toolbar & bubble menu

## Phase 4: Persistence & Organization
- [ ] PostgreSQL schema & migrations
- [ ] Notebooks, folders, and nested organization
- [ ] Tags, favorites, archive, and trash with recovery
- [ ] Resilient autosave with offline fallback

## Phase 5: Real-Time Collaboration
- [ ] Standalone Hocuspocus WebSocket server
- [ ] Yjs document synchronization
- [ ] Ephemeral presence: Multi-user cursors & active selections
- [ ] Connection status indicator (Connected, Syncing, Offline)

## Phase 6: Sharing & Permissions
- [ ] Role-Based Access Control (Owner, Editor, Viewer)
- [ ] Unguessable cryptographic public share links
- [ ] Revocation & permission management

## Phase 7: Search & Retrieval
- [ ] PostgreSQL `tsvector` full-text search
- [ ] Command palette (`Ctrl+K`) with live highlights and filters

## Phase 8: Files & Media
- [ ] S3-compatible object storage integration
- [ ] Presigned upload validation & drag-and-drop file attachment

## Phase 9: Polish, Mobile Web & Performance
- [ ] Touch gestures, mobile virtual keyboard accessory toolbar
- [ ] Performance profiling & Core Web Vitals optimization
- [ ] Comprehensive accessibility audit (WCAG AA compliance)

## Phase 10: Production Security, Legal, SEO & Launch
- [ ] Public marketing landing page (`notesready.in`)
- [ ] Privacy policy, Terms of Service, Cookie notice
- [ ] Meta tags, OpenGraph, sitemap.xml, robots.txt
- [ ] Production security headers & rate limiting
