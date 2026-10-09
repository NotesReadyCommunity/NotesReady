# NotesReady — Implementation Plans

## Phase 1 — Project Foundation & Application Shell (Complete)
- **Status**: APPROVED / COMPLETE WITH REVIEW CORRECTIONS
- **Completed Deliverables**:
  1. Project source-of-truth documentation framework and Git initialization.
  2. Next.js 15+ + React 19 + TypeScript application structure.
  3. Official Concept 04 brand vectors (`logo.svg`, `symbol.svg`, `icon-light.svg`, `icon-dark.svg`, `favicon.svg`).
  4. Brand color system finalized: NotesReady Ember (`#E85D3F`).
  5. Application shell components (`AppSidebar`, `AppHeader`, `MobileDrawer`).
  6. Final review corrections: removed browser alert from New Note button.
  7. Automated unit testing (Vitest) and static production build verification.

## Phase 2 — Core Workspace & Note Creation (IMPLEMENTED / APPROVED)
- **Status**: IMPLEMENTED / APPROVED
- **Completed Deliverables**:
  1. Decoupled `Note` domain entity and validation runtime guards (`src/core/`).
  2. Native IndexedDB storage adapter (`notesready-db`) with in-memory test fallback.
  3. Reactive `WorkspaceContext` and `useNote` hook managing 400ms debounced autosave.
  4. Immediate "New Note" creation flow with title auto-focus and instant editing canvas.
  5. Dynamic route `/app/notes/[id]` with refresh persistence, deep-linking, and honest status indicators.
  6. Real reactive recent notes and favorites list in sidebar and workspace directory views.
  7. 25 automated unit and integration tests passing.

## Phase 3 — Rich Editor (IMPLEMENTED & LOCALLY COMMITTED)
- **Status**: IMPLEMENTED & LOCALLY COMMITTED (`5be9bbd`)
- **Completed Deliverables**:
  1. Tiptap v3 rich text editor with restricted schema (H1–H3, bold, italic, inline code, bullet/ordered lists, task lists, blockquotes, code blocks, horizontal dividers, history).
  2. Contextual floating bubble menu positioned via ProseMirror coordinates with NotesReady Ember accents and Escape dismissal.
  3. Content-format marker (`plain-text-v1` and `tiptap-json-v1`) with non-destructive in-memory legacy migration.
  4. Truthful save states (`Saving...`, `Saved locally`, `Could not save`) with failure preservation and retry.
  5. Lifecycle flushing on unmount, `pagehide`, and `visibilitychange` with in-flight save sequencing and stale overwrite protection.
  6. Document size measurements (500 KB soft warning, 2 MB hard blocking limit with ProseMirror transaction filtering and recovery).
  7. Editor error boundary with plain-textarea fallback saving explicit `plain-text-v1`.
  8. Hostile paste sanitization and zero-telemetry content leak prevention (no `error.message` or note content in logs).
  9. 62 automated unit and integration tests passing across 13 test files.

## Phase 4 — Persistence & Organization (IMPLEMENTED & AUDITED)
- **Status**: IMPLEMENTED & AUDITED
- **Completed Deliverables**:
  1. Non-destructive IndexedDB v2 upgrade (`notesready-db`, `DB_VERSION = 2`) with `notebookId` and `archivedAt` indexes on notes, plus a dedicated `notebooks` object store.
  2. Complete Trash & Recovery workflow: soft deletion with `deletedAt`, dedicated `/app/trash` route, restore notes, permanent delete with confirmation, and empty trash.
  3. Trashed note protection: reading trashed notes via direct URL renders a top Trashed Note Banner with read-only controls, disabled autosave, and direct Restore / Delete Forever actions.
  4. Notebooks organization: decoupled `Notebook` domain entity and runtime validators, create notebook, rename notebook, delete notebook with safe note preservation (`notebookId` cleared to `null` to prevent data loss).
  5. Dedicated dynamic notebook view `/app/notebooks/[id]` displaying notebook title, inline renaming, safe deletion, and note cards filtered by notebook.
  6. Tags system: flexible array of tags (`tags?: string[]`) on notes, inline tag creation/removal in editor, and tag filter pills on `/app/notes`.
  7. Archive workflow: archive notes to declutter workspace, dedicated `/app/archive` view with restore/unarchive action.
  8. Sidebar integration: active working links for `/app/trash` (with count badge), `/app/archive` (with count badge), dynamic notebooks with inline "+ Notebook" creation, and honest "Soon" badges on planned Quick Search & Settings.
  9. 91 automated tests passing across 18 test files, zero TypeScript errors (`tsc --noEmit`), zero ESLint errors, and clean production build (`next build`).
