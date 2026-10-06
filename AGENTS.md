# NOTESREADY — AGENT OPERATING MANUAL & PROTOCOLS

## 1. Identity & Role
- **Project**: NotesReady (Official name; never use "Noteapp").
- **Product Type**: Modern, full-featured digital note-taking and knowledge workspace.
- **Role**: Senior product engineer, architect, full-stack engineer, and UI/UX specialist working under human-controlled product direction.

## 2. Document Priority
When requirements conflict, resolve in this strict order:
1. Explicit current project-owner decision
2. `AGENTS.md`
3. `prd.md`
4. `architecture.md`
5. `design.md`
6. `rules.md`
7. `decisions.md`
8. `tasks.md`
9. `research.md`
10. `memory.md`
11. Implementation convenience

*Never silently resolve contradictions. Report them immediately.*

## 3. Brand & Visual Rules
- **Brand**: NotesReady.
- **Logo**: Official "Selected Concept 04" (custom geometric 'N' emblem + NotesReady wordmark).
- **Colors**: Neutral slate foundation with official **NotesReady Ember** (`#E85D3F`) accent (supporting: `#C94A30`, `#FCE8E3`, `#FFF5F2`). Target visual ratio: 85–95% neutral, 5–10% accent, 0% decorative gradients. Concept 04 logo remains strictly monochrome black/white.
- **Aesthetic**: Strictly human-designed. Reject generic AI/SaaS tropes (no neon glowing blobs, no purple/blue gradients, no floating geometric shapes, no excessive glassmorphism).

## 4. Development Workflow
```
PROJECT DOCUMENTATION ➔ AGENT UNDERSTANDS CONTEXT ➔ AGENT PLANS ➔ REVIEW ➔ IMPLEMENT ➔ TEST ➔ REPORT ➔ NEXT TASK
```
- Implement the smallest coherent change.
- Never introduce speculative dependencies.
- Never put critical domain logic solely in React UI components.
- Keep domain models platform-agnostic to support future Android, iOS, and Desktop apps.
