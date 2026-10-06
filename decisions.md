# NotesReady — Architecture Decision Records (ADR)

## ADR-001: Selection of Next.js App Router for Unified Web Architecture
- **Status**: Accepted
- **Context**: The product requires both a high-converting, SEO-optimized public marketing website (`notesready.in`) and a dynamic, low-latency authenticated workspace application (`/app`).
- **Decision**: Use Next.js 15+ with App Router. Route groups `(marketing)` and `(workspace)` isolate SSR/SEO requirements from client-side stateful application logic while sharing TypeScript types and component primitives.

## ADR-002: Modular Headless Editor with Tiptap / ProseMirror
- **Status**: Accepted
- **Context**: NotesReady requires rich content (checklists, code blocks, callouts, tables) with future extensibility, without monolithic unmaintainable code.
- **Decision**: Adopt Tiptap on top of ProseMirror. Every block type and inline style is implemented as an independent extension. Seamlessly integrates with Yjs for real-time collaboration.

## ADR-003: Real-Time CRDT Sync via Yjs and Hocuspocus
- **Status**: Accepted
- **Context**: Multi-user collaboration and offline resilience are core pillars. Traditional lock-based or operational transformation (OT) architectures suffer from complex merge collisions.
- **Decision**: Implement Yjs CRDTs with Hocuspocus WebSocket synchronization. Ephemeral presence is decoupled from persistent note state.

## ADR-004: Monochrome Brand Foundation & Deferred Color Accents
- **Status**: Accepted
- **Context**: Per official project brief, brand accents remain uncommitted until application visual density matures.
- **Decision**: Build on pure monochrome (black/white) and neutral slate scales. The official "Selected Concept 04" logo will remain strictly black/white.
