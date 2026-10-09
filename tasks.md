# NotesReady — Master Task Tracker

## Phase 0: Project Definition & Architecture — COMPLETE
- [x] Initial engineering audit and repository assessment
- [x] Establish official brand "Selected Concept 04" vector assets
- [x] Complete 4-product reference study (Evernote, Notion, Supernotes, Notejoy)
- [x] Finalize official brand color system: NotesReady Ember (`#E85D3F`)
- [x] Create core project documentation (`AGENTS.md`, `README.md`, `prd.md`, `architecture.md`, `design.md`, `rules.md`, `tasks.md`, `decisions.md`, `testing.md`, `memory.md`, `research.md`, `plans.md`)

## Phase 1: Foundation & Application Shell — APPROVED / COMPLETE WITH REVIEW CORRECTIONS
- [x] Initialize Next.js 15+ + React 19 + TypeScript app scaffold
- [x] Configure Tailwind CSS v4 / design tokens with monochrome & slate foundation
- [x] Integrate official Concept 04 brand vectors (SVG emblem, wordmark, favicon, app icons)
- [x] Build responsive application shell:
  - [x] Collapsible multi-tier sidebar
  - [x] Workspace switcher
  - [x] Global search & quick-find trigger (`⌘K`)
  - [x] Mobile responsive navigation drawer / sheet
  - [x] Active route indicators & sub-route views (`/app`, `/app/notes`, `/app/favorites`, `/app/shared`)
  - [x] Public marketing landing page (`/`), Privacy (`/privacy`), Terms (`/terms`), and Custom 404 (`/_not-found`)
- [x] Set up unit test runner (Vitest) and basic shell tests
- [x] Validate production build (`next build`) and cross-viewport browser rendering
- [x] Final Phase 1 corrections: Removed native browser alert from New Note button
- [x] Phase 1 recovery corrections: Concept 04 Latin 'N' vector geometry rectified, Ember CSS tokens integrated, primary CTA/New Note updated, and marketing/legal footers restructured

## Phase 2: Core Workspace & Note Creation — IMPLEMENTED / PENDING OWNER APPROVAL
- [x] Note domain models & schemas (TypeScript runtime validation)
- [x] Local-first client state with zero-dependency IndexedDB adapter (`notesready-db`)
- [x] Storage honesty: browser detects IndexedDB unavailability without silent RAM masquerading
- [x] Transaction durability: `saveNote` and `hardDeleteNote` resolve on `tx.oncomplete` and reject on error/abort
- [x] Reset cached rejected `dbPromise` on error to allow retries
- [x] "New Note" creation flow with immediate title editing and auto-focus
- [x] Title Enter key navigation: Enter in title input seamlessly focuses content textarea
- [x] Safe note deletion: inline confirmation protection ("Move to trash?", "Cancel", "Move to Trash")
- [x] Header route & status synchronization: contextually reflects "Workspace", "All Notes", "Favorites", or note title; hides note save indicator on overview routes
- [x] Recent notes limit (`repo.listRecentNotes(6)`) and in-memory reactive updates to prevent unnecessary full-workspace re-queries on autosave
- [x] Debounced autosave (400ms) with honest local save status
- [x] Soft-deletion support and missing note error handling

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
