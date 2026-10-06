# NotesReady — Technical Architecture

## 1. System Topology
- **Web Client**: Next.js 15+ (App Router), React 19, TypeScript.
- **Editor Engine**: Headless Tiptap (ProseMirror), structured document schema.
- **Collaboration Server**: Hocuspocus WebSocket server synchronizing Yjs CRDT documents.
- **Application Database**: PostgreSQL (relational metadata, accounts, memberships, notes, tags).
- **Blob Storage**: S3-compatible Object Storage for media and file attachments.

## 2. Real-Time Data Model
- **Ephemeral State (Presence)**: User cursors, selections, active status transmitted via WebSockets and kept in-memory. Never stored permanently in the database.
- **Document Content (CRDT)**: Yjs binary document updates persisted to PostgreSQL/S3. Guaranteed convergence across offline and simultaneous edits.
- **Application Metadata**: Relational models for users, workspaces, folders, permissions, tags, and audit logs.

## 3. Future Cross-Platform Portability
- All core business rules, permission checks, data validators (Zod), and CRDT sync helpers are decoupled from React components into `src/core/`.
- Ready for future native platforms (Android, iOS via React Native/Capacitor, Desktop via Tauri/Electron).
