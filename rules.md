# NotesReady — Engineering Rules & Standards

## 1. Security First
- Never rely on client-side authorization. Hiding a UI button or menu item is not security.
- Every API endpoint and WebSocket connection must validate user identity, workspace membership, and note permissions server-side.
- Zero secrets in client-side bundles. Only `NEXT_PUBLIC_*` variables may be exposed to the browser.
- Validate all incoming payloads with Zod schemas.

## 2. Code Quality & Modularity
- Avoid monolithic components. Extract reusable UI primitives to `src/components/ui/`.
- Domain logic must reside in `src/core/`, never embedded exclusively inside React hooks or components.
- Maintain strict TypeScript type checking (`noImplicitAny: true`, strict null checks).
- Clean dependency hygiene: Never install heavy libraries without documented trade-off evaluation.

## 3. UX & Performance Standards
- Accessible by design: Keyboard navigation, ARIA landmarks, focus rings, semantic HTML.
- Mobile web is a first-class citizen: Minimum tap target of 44x44px. No shrunken desktop interfaces.
- Resilient saving: Offline buffers via IndexedDB; temporary network interruptions must never give the impression of lost work.
