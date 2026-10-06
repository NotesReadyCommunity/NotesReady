# NotesReady — Design System & Visual Standards

## 1. Brand Identity: Concept 04
- **Emblem**: Custom geometric 'N' with smooth curves, continuous contours, and solid presence.
- **Wordmark**: "NotesReady" set in clean, high-precision neo-grotesque sans-serif.
- **Lockup Variations**: Horizontal (Emblem + Wordmark), Stacked, and Emblem Standalone.
- **Scalability**: Legible at all sizes from 16px favicon up to large hero brand displays.
- **Logo Color Rule**: **Strictly monochrome (Black/White).** The Concept 04 logo is never tinted or rendered in brand accent colors. It remains pure black on light surfaces and pure white on dark surfaces.

---

## 2. Color System: Neutral Foundation & NotesReady Ember

The NotesReady color system pairs a calm, high-legibility neutral foundation with a controlled, warm, energetic brand accent.

### A. Official Brand Accent: NotesReady Ember
- **Primary Ember**: `#E85D3F` (Primary CTAs, active highlights, key interactions)
- **Ember Dark**: `#C94A30` (Hover states, pressed buttons, high-contrast borders)
- **Ember Light**: `#FCE8E3` (Subtle selection highlights, light badges)
- **Ember Pale**: `#FFF5F2` (Active sidebar items, subtle hover washes in light mode)

### B. Neutral Foundation (Light Mode)
- **Background**: `#FFFFFF`
- **Surface**: `#FAFAFA`
- **Surface Subtle**: `#F4F4F5`
- **Border**: `#E4E4E7`
- **Text Primary**: `#18181B`
- **Text Secondary**: `#52525B`
- **Text Muted**: `#71717A`

### C. Neutral Foundation (Dark Mode)
- **Background**: `#09090B`
- **Surface**: `#111113`
- **Elevated**: `#18181B`
- **Border**: `#27272A`
- **Text Primary**: `#FAFAFA`
- **Text Secondary**: `#A1A1AA`
- **Text Muted**: `#71717A`

### D. Visual Distribution Ratio
To preserve the calm, distraction-free environment essential for deep thinking, color application must adhere to this strict ratio:
- **85–95% Neutral Foundation**: Backgrounds, surfaces, chrome, typography, and borders.
- **5–10% Brand Accent (Ember)**: Actionable controls, primary CTAs, active selection states, focus rings.
- **0% Decorative Gradients**: Zero gradient meshes, zero neon glows, zero decorative saturation.

### E. Permitted vs. Prohibited Accent Usage
- **Permitted**:
  - Primary call-to-action buttons (e.g., "Start Writing Free", "New Note")
  - Active navigation state indicators and pill highlights
  - Selected tab or segmented control states
  - In-text hyperlink accents where appropriate
  - Keyboard focus rings (`focus-visible`)
  - Key product milestones or badges
- **Prohibited**:
  - Orange backgrounds across entire panels or pages
  - Orange gradient text or glowing drop shadows
  - Orange tinted glassmorphism
  - Tinting the Concept 04 logo emblem or wordmark
  - Using Ember for general decorative borders or cards

### F. Semantic Independence
NotesReady Ember is strictly a brand and interaction accent. Semantic system statuses must remain distinct:
- **Success**: Emerald green (`#10B981`)
- **Warning**: Amber / Yellow (`#F59E0B`)
- **Error / Danger**: Crimson red (`#EF4444`)
- **Information**: Slate blue (`#3B82F6`)

---

## 3. Surface Strategy: Website vs. Application
The public website and application share the NotesReady brand identity, but serve fundamentally different user states:

### A. Public Website (`notesready.in`) — Product-Led Editorial Experience
- **Character**: Expressive, editorial, narrative-driven, and conversion-focused.
- **Purpose**: Communicate what NotesReady is, why it exists, demonstrate genuine product workflows, and guide visitors to immediate note creation.
- **Structure**:
  - Feature / workflow narrative
  - Short, precise explanation
  - Actual NotesReady product demonstration (real UI)
  - Clear conversion actions
- **Key Modules**: Capture, Write, Organize, Find, Collaborate, Files & Media, Knowledge.

### B. Workspace Application (`/app`) — Quiet, Content-First Canvas
- **Character**: Calm, focused, distraction-free, and ergonomic.
- **Purpose**: Provide a fast, highly usable environment where thoughts flow without friction.
- **Principles**:
  - Content First: User writing and knowledge take center stage.
  - Invisible Complexity: Power features (tagging, backlinks, sharing, permissions) disclose progressively.
  - Contextual Controls: Toolbars and actions appear when relevant, not permanently pinned across the view.
  - Information Density: Calm by default, yet capable of compact data density for power users.

---

## 4. Real Product UI Rule
- The public website must showcase **real, functioning NotesReady interface elements**.
- Never fabricate fake dashboards, fictitious statistics widgets, or decorative mockups purely for marketing visuals.
- If a capability is not yet implemented in the application, it must not be falsely presented as an active feature on marketing pages.

---

## 5. Human-Designed Standard & Quality Gate
The design must look and feel crafted by an experienced human design and engineering team.

### Prohibited AI / SaaS Clichés:
- No random purple/blue/cyan AI glowing blobs or gradient meshes.
- No floating 3D meaningless spheres, cubes, or abstract shapes.
- No excessive glassmorphism or blur filters without functional purpose.
- No generic SaaS cards everywhere with decorative borders.
- No excessive rounded pills or oversized badges.
- No fake dashboard analytics charts.
- No generic marketing buzzwords ("Supercharge your productivity with AI").

### Required Human-Design Attributes:
- Intentional, disciplined typography and optical hierarchy.
- Generous, meaningful whitespace with realistic spacing.
- Subdued, purposeful micro-motion communicating state changes, not decoration.
- Thoughtful empty, loading, error, and offline recovery states.
- Robust accessibility and touch-first mobile ergonomics.

> **Quality Gate**:  
> *If a screenshot of NotesReady could reasonably be mistaken for a generic AI-generated SaaS template, the design is not finished.*
