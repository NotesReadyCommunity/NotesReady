# Contributing to NotesReady

Thank you for your interest in contributing to **NotesReady**!

NotesReady is a modern, full-featured digital note-taking and knowledge workspace engineered for deep focus, local-first reliability, and real-time collaboration.

To maintain professional software quality and data integrity, all contributions must adhere to the engineering standards and governance protocols established below.

---

## 1. Governance & Development Workflow

NotesReady follows a strict, disciplined phased development lifecycle:

```
FEATURE / PHASE SCOPING
  ➔ ISOLATED PHASE BRANCH (phase-*)
  ➔ IMPLEMENTATION & LOCAL TESTS
  ➔ RIGOROUS CODE REVIEW & AUDIT
  ➔ 5 QUALITY GATES VALIDATION
  ➔ PROJECT OWNER EXPLICIT APPROVAL
  ➔ SQUASH / REBASE MERGE TO MAIN
```

### Key Workflow Rules:
1. **The `main` branch is stable and protected**: Direct commits and force pushes to `main` are strictly prohibited. All changes must arrive via reviewed pull requests.
2. **Phase branches isolate active milestones**: Active milestone development occurs on dedicated branches (e.g., `phase-4-organization`, `phase-5-auth-cloud`).
3. **No premature merges**: An unapproved phase branch is never merged into `main` until the phase audit is accepted and the project owner explicitly authorizes the merge.

---

## 2. The 5 Mandatory Quality Gates

Every pull request must pass all five automated quality gates. These gates run in our GitHub Actions CI pipeline and must pass locally prior to submitting a PR:

```bash
# 1. Automated Unit & Integration Tests (Vitest)
npm test

# 2. Strict TypeScript Compilation Check
npx tsc --noEmit

# 3. Code Style & Linting (ESLint)
npm run lint

# 4. Optimized Production Build (Next.js)
npm run build

# 5. Git Whitespace & Formatting Check
git diff --check
```

---

## 3. Engineering Architecture & Code Standards

### A. Domain Logic Decoupling (`src/core/`)
- Critical business logic, models, validation guards, and storage adapters must reside in `src/core/`.
- Domain models must remain platform-agnostic to support future Android, iOS, and Desktop platforms.
- Never place critical domain logic exclusively inside React components or hooks.

### B. Storage Honesty & Durability
- If a storage backend (e.g., IndexedDB) is unavailable or encounters a disk quota error, the application must **truthfully surface a visible warning** rather than silently pretending changes are saved.
- Asynchronous storage transactions must resolve only upon atomic completion (`tx.oncomplete`) and reject on error.

### C. Zero-Telemetry Privacy Rule
- **Never log note titles, note content, or pasted text to diagnostic consoles or telemetry services.**
- Catch blocks must log generic error names (`err.name`), keeping user data confidential.

### D. Real Product UI Rule
- The interface must never display fake simulated features (e.g., fake OCR, fake charts, nonfunctional buttons).
- If a capability is planned for a future release, it must be clearly designated with a non-misleading "Soon" badge and disabled.

---

## 4. Brand & Visual Design Standards

- **Official Brand**: NotesReady (Never use "Noteapp").
- **Official Logo**: Selected Concept 04 geometric 'N' emblem with precision neo-grotesque wordmark.
- **Logo Color Rule**: **Strictly monochrome.** The Concept 04 emblem and wordmark remain pure black on light surfaces and pure white on dark surfaces. The logo is never tinted in Ember.
- **Brand Accent System**:
  - NotesReady Ember: `#E85D3F` (Primary CTAs, active highlights, key interactions)
  - Ember Dark: `#C94A30` (Hover states)
  - Ember Light: `#FCE8E3` (Subtle selection badges)
  - Ember Pale: `#FFF5F2` (Active item washes in light mode)
- **Visual Distribution Ratio**: **85–95% neutral foundation, 5–10% brand accent, 0% decorative gradients.** Reject generic SaaS tropes (no neon glowing blobs, no purple/blue gradients, no floating 3D shapes).

---

## 5. Submitting a Pull Request

1. Fork or branch from the approved `main` branch (or active phase branch as instructed).
2. Write clean, focused, atomic commits using [Conventional Commits](https://www.conventionalcommits.org/) format (e.g., `feat(storage): ...`, `fix(editor): ...`, `test(core): ...`).
3. Verify all 5 quality gates locally.
4. Open a pull request using the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
5. Await review and project owner approval before merging.
