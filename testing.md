# NotesReady — Quality Assurance & Testing Strategy

## 1. Test Pyramid
1. **Unit Tests (Vitest)**:
   - Domain entity validation (`src/core/models/`).
   - Permission evaluation functions (`src/core/permissions/`).
   - String utilities, note tokenizers, and CRDT schema converters.
2. **Integration Tests (React Testing Library + Vitest)**:
   - Component rendering and state changes (Sidebar toggle, Workspace dropdown, Command palette).
   - Mock API endpoint handlers.
3. **End-to-End Tests (Playwright)**:
   - Note creation, editing, and persistence lifecycle.
   - Offline resilience: simulate network disconnect, continue writing, reconnect, and verify zero data loss.
   - Multi-user collaboration: two browser contexts editing concurrently without collisions.
   - Responsive mobile viewports (iPhone 14, Pixel 7, iPad, Desktop 1080p).

## 2. Accessibility Testing
- Automated axe-core scans during Playwright test runs.
- Full keyboard-only navigation checks (`Tab`, `Shift+Tab`, `Escape`, `Enter`, `Ctrl+K`).
- Screen reader ARIA landmark and label audits.
