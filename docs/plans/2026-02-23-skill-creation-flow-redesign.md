# Skill Creation Flow Redesign

**Date:** 2026-02-23
**Scope:** Creation wizard, guided editor UX, error handling, code cleanup

---

## 1. Creation Wizard — Evolve the Card Stack

### Step 0: "How do you want to start?" (3-way selector)

Keep the existing stacked card animation. Replace the inner content with three selectable option rows:

1. **"Describe with AI"** (default) — when active, shows the description textarea below.
2. **"Start from Template"** — when active, replaces the textarea with a compact scrollable template list (reuse `TemplateCard` in a smaller variant) with search + category filter. Selecting a template forks it and redirects to `/skills/{id}/edit`.
3. **"Start Blank"** — when active, hides the textarea entirely. "Next" advances with no description.

Both "Describe with AI" and "Start Blank" paths advance through Steps 1-2, ensuring the user always gets to set name and category.

### Step 1: Name & Category (unchanged)

Text input for skill name, category pill selector. Both AI and blank paths arrive here.

### Step 2: Review & Create (improved)

- Summary card showing description (AI path) or "Blank skill" (blank path), name, and category.
- **AI path:** "Generate with AI" button.
- **Blank path:** "Create Skill" button — creates skill with name + category + empty content.
- **Error handling:** Toast notification on failure (replaces silent catch/reset).
- **Atomicity fix (AI path):** Call `/api/claude/draft` first to generate content, then create the skill with content in a single POST. If draft fails, no orphan DB record is created.

---

## 2. Editor UX Improvements

### A. Guided Editor Completion Card (Step 4)

After Step 3 (Examples), add a new card in the stack: **"Your skill is ready"**

- Checkmark icon + heading
- Compact summary: skill name, description snippet, section count, example count
- Three action buttons:
  - **"Test it"** (primary) → `/skills/{id}/test`
  - **"Edit Markdown"** (secondary) → switches to markdown mode
  - **"Go to Dashboard"** (secondary) → saves and navigates to `/dashboard`

### B. Undo for AI Suggestions

Before any AI action overwrites content, snapshot the current `SkillStructure`. Show a toast with "Undo" button (10s timeout). Clicking restores the snapshot. Single-level undo only.

### C. Unsaved Changes Guard

- `beforeunload` event listener when `isDirty === true`
- Reduce auto-save timer: 30s → 10s
- Subtle "Unsaved changes" indicator near the Save button

### D. Error Toasts

Replace silent `catch` blocks in `saveSkill`, `handleAiDraft`, `handleAiSuggest`, `handleAiImprove` with toast notifications: "Failed to save", "AI generation failed", etc.

### E. Guided Mode Step Memory

Lift `activeStep` state from `GuidedEditor` to `EditorShell` so switching between Guided/Markdown tabs preserves the user's position.

### F. Atomicity Fix for AI Creation

In `handleCreateWithAI()`: generate draft first via `/api/claude/draft`, then POST to `/api/skills` with the generated content included. Single request = no orphan records on failure.

---

## 3. Code Cleanup & Bug Fixes

### A. Fix AI Prompt / Parser Mismatch

The draft system prompt uses `**Assistant:**` for example outputs, but the parser expects `**Claude:**`. Update the prompt to use `**Claude:**` so generated examples parse correctly.

### B. Extract Shared Category List

Create `lib/constants.ts`:
```ts
export const SKILL_CATEGORIES = ["Writing", "Code", "Business", "Education", "Productivity"] as const;
```
Import from: `skills/new/page.tsx`, `template-filters.tsx`, and the guided editor category picker.

### C. Remove Dead `SectionCard` Component

Delete `components/editor/guided-mode/section-card.tsx` — implemented but never imported or used.

### D. Template Fork Naming

When forking, check if a skill with the same `(Fork)` title exists for the user. If so, increment: `"Code Reviewer (Fork 2)"`, `"Code Reviewer (Fork 3)"`, etc.

### E. Template Preview

Add a modal or expandable detail view on `TemplateCard` to show full template content (instructions, edge cases, examples) before the user commits to forking.
