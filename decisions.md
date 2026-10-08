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

## ADR-004: Monochrome Brand Foundation & Initial Color Deferral
- **Status**: Superseded by ADR-006
- **Context**: Initial engineering brief deferred brand accent colors until the core application visual language had matured.
- **Decision**: Maintained a strict monochrome neutral foundation during project initialization (Phase 0 and Phase 1).

## ADR-005: Product-Led Editorial Website Architecture & Dual-Surface Strategy
- **Status**: Accepted
- **Context**: Informed by the reference study of Evernote, Notion, Supernotes, and Notejoy, the product requires distinct visual/interaction treatments for the marketing website versus the workspace application. Additionally, marketing credibility depends on demonstrating real software capabilities.
- **Decision**:
  1. The public marketing website (`notesready.in`) will be engineered as a product-led editorial website, drawing inspiration from Evernote's structured feature storytelling, Supernotes' conceptual clarity, and Notejoy's concise simplicity without copying their visual assets.
  2. The application workspace (`/app`) will remain a quiet, distraction-free, content-first canvas adhering to Notion's principle of progressive disclosure.
  3. Adopt the **Real Product UI Rule**: Marketing demonstrations must embed or accurately depict real, implemented NotesReady UI components; synthetic marketing dashboards and unbuilt feature claims are prohibited.

## ADR-006: Finalization of NotesReady Ember Brand Accent Color System
- **Status**: Accepted
- **Context**: Following completion of the visual benchmark study, the project technical and product leadership has finalized the official brand accent color to give NotesReady an unmistakable, warm, human-crafted identity without compromising workspace calm.
- **Decision**:
  1. Adopt **NotesReady Ember** (`#E85D3F`) as the official brand accent, supported by Ember Dark (`#C94A30`), Ember Light (`#FCE8E3`), and Ember Pale (`#FFF5F2`).
  2. Enforce a strict **85–95% Neutral Foundation to 5–10% Brand Accent** visual distribution ratio. Ember is restricted to actionable controls, primary CTAs, active selections, links, and focus rings. Full-bleed orange backgrounds, orange gradients, and orange glassmorphism are strictly prohibited.
  3. Preserve the **Concept 04 Logo Invariance**: The official 'N' emblem and wordmark remain strictly monochrome (pure black on light, pure white on dark) and must never be rendered in Ember.
  4. Ensure semantic system colors (success, error, warning, info) remain functionally and visually independent from the Ember brand accent.

## ADR-007: Concept 04 Vector Geometry Correction & Ember Token Integration
- **Status**: Accepted
- **Context**: During post-Phase 1 repository recovery, a concrete vector geometry flaw was identified in the Concept 04 brand assets: the SVG diagonal path had been inverted, rendering an ascending diagonal from bottom-left to top-right (resembling a Cyrillic "И"). Additionally, the NotesReady Ember color tokens approved in ADR-006 were missing from `globals.css`, the primary button primitive was locked to monochrome zinc, and the marketing/legal footers lacked clearspace and structural hierarchy.
- **Decision**:
  1. **Concept 04 Vector Geometry Correction**: Reconstructed the vector path across `BrandSymbol.tsx`, `symbol.svg`, `logo.svg`, `icon-dark.svg`, `icon-light.svg`, and `favicon.svg` so that the diagonal descends from top-left to bottom-right, forming the authentic Latin "N" matching the selected Concept 04 brand sheet. The monochrome logo invariant remains strictly enforced.
  2. **Ember Token Integration**: Added `--brand-ember` (`#E85D3F`), `--brand-ember-dark` (`#C94A30`), `--brand-ember-light` (`#FCE8E3`), and `--brand-ember-pale` (`#FFF5F2`) to `globals.css`, maintaining the 85–95% neutral to 5–10% accent ratio.
  3. **Primary CTA Treatment**: Updated the `Button` primary variant to use NotesReady Ember with high-contrast text and Ember Dark hover states. The "New Note" action visually receives this primary treatment while remaining a clean placeholder.
  4. **Editorial Footer Structure**: Restructured marketing and legal footers into a mature, restrained layout respecting logo clearspace, product tagline, and linking strictly to verified existing routes.
  5. **Logo Scale Standardization**: Standardized `BrandLogo` sizes to `sm` (24px), `md` (32px), and `lg` (48px) aligned with the tested brand matrix.
