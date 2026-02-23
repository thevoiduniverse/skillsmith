# Skill Creation Flow Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Holistically improve the create-skill wizard, guided editor UX, error handling, and code quality across SkillForge.

**Architecture:** Evolve the existing card-stack wizard (Framer Motion spring animations) with a 3-way path selector in Step 0, add a toast system for error feedback, improve the guided editor with a completion card and AI undo, and fix several latent bugs.

**Tech Stack:** Next.js 14, React, Framer Motion, Tabler Icons, Supabase, Sonner (new — toast library)

**Design doc:** `docs/plans/2026-02-23-skill-creation-flow-redesign.md`

---

## Task 1: Install Sonner and Create Toast Infrastructure

No existing toast library in the project. Sonner is lightweight, unstyled-friendly, and works with Next.js App Router.

**Files:**
- Modify: `package.json`
- Create: `components/ui/toast-provider.tsx`
- Modify: `app/(app)/layout.tsx`

**Step 1: Install sonner**

```bash
npm install sonner
```

**Step 2: Create toast provider component**

Create `components/ui/toast-provider.tsx`:

```tsx
"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "rgba(23, 23, 23, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#fff",
          backdropFilter: "blur(12px)",
        },
      }}
    />
  );
}
```

**Step 3: Add ToastProvider to app layout**

Modify `app/(app)/layout.tsx` — add `<ToastProvider />` inside the layout wrapper (after the existing children render).

```tsx
import { ToastProvider } from "@/components/ui/toast-provider";

// Inside the layout JSX, after {children}:
<ToastProvider />
```

Also add to `app/(auth)/layout.tsx` if it exists (for the creation wizard on `/skills/new`). Actually, `/skills/new` is under `(app)` layout, so just `(app)/layout.tsx` is sufficient.

**Step 4: Verify sonner works**

```bash
npm run build
```

Expected: Clean build with no errors.

**Step 5: Commit**

```bash
git add components/ui/toast-provider.tsx app/\(app\)/layout.tsx package.json package-lock.json
git commit -m "feat: add sonner toast infrastructure"
```

---

## Task 2: Extract Shared Constants

Categories are hardcoded in 3 files. Extract to a single source of truth.

**Files:**
- Create: `lib/constants.ts`
- Modify: `app/(app)/skills/new/page.tsx:29`
- Modify: `components/templates/template-filters.tsx:16`

**Step 1: Create constants file**

Create `lib/constants.ts`:

```ts
export const SKILL_CATEGORIES = [
  "Writing",
  "Code",
  "Business",
  "Education",
  "Productivity",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
```

**Step 2: Update new skill page**

In `app/(app)/skills/new/page.tsx`:
- Add import: `import { SKILL_CATEGORIES } from "@/lib/constants";`
- Remove line 29: `const categories = ["Writing", "Code", "Business", "Education", "Productivity"];`
- Replace all references to `categories` with `SKILL_CATEGORIES` in the JSX (line 216).

**Step 3: Update template filters**

In `components/templates/template-filters.tsx`:
- Add import: `import { SKILL_CATEGORIES } from "@/lib/constants";`
- Remove the local `categories` array (line 16).
- Replace references to `categories` with `SKILL_CATEGORIES`.

**Step 4: Verify**

```bash
npm run build
```

Expected: Clean build.

**Step 5: Commit**

```bash
git add lib/constants.ts app/\(app\)/skills/new/page.tsx components/templates/template-filters.tsx
git commit -m "refactor: extract SKILL_CATEGORIES to shared constants"
```

---

## Task 3: Fix AI Prompt / Parser Mismatch

The draft system prompt uses `**Assistant:**` but the parser expects `**Claude:**`.

**Files:**
- Modify: `lib/claude/prompts.ts:22,24,26,30`

**Step 1: Fix the prompt**

In `lib/claude/prompts.ts`, replace all 4 occurrences of `**Assistant:**` with `**Claude:**` in `DRAFT_SYSTEM_PROMPT` (lines 22, 24, 26, 30).

**Step 2: Verify parser compatibility**

Read `lib/skill-parser/parse.ts` and confirm it looks for `**Claude:**` — it does at the `parseExamples` function around line 54-73.

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add lib/claude/prompts.ts
git commit -m "fix: align AI prompt example labels with parser expectations (Assistant → Claude)"
```

---

## Task 4: Remove Dead SectionCard Component

`section-card.tsx` is fully implemented but never imported.

**Files:**
- Delete: `components/editor/guided-mode/section-card.tsx`

**Step 1: Verify it's unused**

```bash
grep -r "section-card" --include="*.tsx" --include="*.ts" .
grep -r "SectionCard" --include="*.tsx" --include="*.ts" .
```

Expected: Only the file itself appears, no imports.

**Step 2: Delete the file**

```bash
rm components/editor/guided-mode/section-card.tsx
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add -u components/editor/guided-mode/section-card.tsx
git commit -m "chore: remove unused SectionCard component"
```

---

## Task 5: Add Error Toasts to Editor Shell

Replace silent error handling with user-facing toast notifications.

**Files:**
- Modify: `components/editor/editor-shell.tsx:1-5,43-55,69-90,92-113,115-137`

**Step 1: Add sonner import**

At top of `components/editor/editor-shell.tsx`, add:

```tsx
import { toast } from "sonner";
```

**Step 2: Add error handling to saveSkill (lines 43-55)**

Change the `try...finally` to `try...catch...finally`:

```tsx
const saveSkill = useCallback(async (content?: string) => {
  setSaving(true);
  try {
    const md = content || getCurrentMarkdown();
    const res = await fetch(`/api/skills/${skillId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: md }),
    });
    if (!res.ok) throw new Error("Save failed");
  } catch {
    toast.error("Failed to save. Please try again.");
  } finally {
    setSaving(false);
  }
}, [skillId, title, getCurrentMarkdown]);
```

**Step 3: Add error handling to handleAiDraft (lines 69-90)**

Wrap with catch:

```tsx
async function handleAiDraft() {
  if (!structure.description && !structure.name) return;
  setAiLoading("draft");
  try {
    const res = await fetch("/api/claude/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: structure.description || structure.name,
      }),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.content) {
      updateMarkdown(data.content);
      if (data.parsed?.name && !title) {
        setTitle(data.parsed.name);
      }
    }
  } catch {
    toast.error("AI draft generation failed. Please try again.");
  } finally {
    setAiLoading(null);
  }
}
```

**Step 4: Add error handling to handleAiSuggest (lines 92-113)**

Same pattern — add catch with `toast.error("AI suggestion failed. Please try again.")`.

**Step 5: Add error handling to handleAiImprove (lines 115-137)**

Same pattern — add catch with `toast.error("AI improvement failed. Please try again.")`.

**Step 6: Verify build**

```bash
npm run build
```

**Step 7: Commit**

```bash
git add components/editor/editor-shell.tsx
git commit -m "feat: add error toast notifications to editor actions"
```

---

## Task 6: Add Error Toasts to Creation Wizard

**Files:**
- Modify: `app/(app)/skills/new/page.tsx:1-16,92-155`

**Step 1: Add sonner import**

At top of `app/(app)/skills/new/page.tsx`, add:

```tsx
import { toast } from "sonner";
```

**Step 2: Add error handling to handleCreateWithAI (lines 92-137)**

Replace the bare `catch` block (lines 133-136):

```tsx
} catch {
  toast.error("Failed to generate skill. Please try again.");
  setMode("idle");
  setLoading(false);
}
```

**Step 3: Add error handling to handleCreateBlank (lines 139-155)**

Replace the bare `catch` block (lines 151-154):

```tsx
} catch {
  toast.error("Failed to create skill. Please try again.");
  setMode("idle");
  setLoading(false);
}
```

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add app/\(app\)/skills/new/page.tsx
git commit -m "feat: add error toasts to skill creation wizard"
```

---

## Task 7: Add Error Toast to Template Fork

**Files:**
- Modify: `components/templates/template-card.tsx:27-40`

**Step 1: Add sonner import and error handling**

In `components/templates/template-card.tsx`, add `import { toast } from "sonner";`

Update `handleFork` to check `res.ok` and show error:

```tsx
async function handleFork() {
  setForking(true);
  try {
    const res = await fetch(`/api/skills/${id}/fork`, { method: "POST" });
    if (!res.ok) throw new Error();
    const fork = await res.json();
    router.push(`/skills/${fork.id}/edit`);
  } catch {
    toast.error("Failed to fork template. Please try again.");
  } finally {
    setForking(false);
  }
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add components/templates/template-card.tsx
git commit -m "feat: add error toast to template fork action"
```

---

## Task 8: Unsaved Changes Guard

**Files:**
- Modify: `lib/hooks/use-editor-sync.ts:35` (auto-save timer)
- Modify: `components/editor/editor-shell.tsx` (beforeunload + indicator)

**Step 1: Reduce auto-save timer**

In `lib/hooks/use-editor-sync.ts`, change the auto-save timeout from `30000` to `10000` (line 35).

**Step 2: Add beforeunload handler to EditorShell**

In `components/editor/editor-shell.tsx`, add a new `useEffect` after the Cmd+S handler (after line 67):

```tsx
// Warn before leaving with unsaved changes
useEffect(() => {
  function handleBeforeUnload(e: BeforeUnloadEvent) {
    if (isDirty) {
      e.preventDefault();
    }
  }
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [isDirty]);
```

**Step 3: Add "Unsaved changes" indicator**

In the Save button area of `editor-shell.tsx` (around line 169), update the button label to show a dot indicator when dirty:

The existing label already shows `isDirty ? "Save*" : "Save"` — this is sufficient. No extra UI needed.

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add lib/hooks/use-editor-sync.ts components/editor/editor-shell.tsx
git commit -m "feat: add beforeunload guard and reduce auto-save to 10s"
```

---

## Task 9: Guided Mode Step Memory

**Files:**
- Modify: `components/editor/editor-shell.tsx` (add guidedStep state)
- Modify: `components/editor/guided-mode/guided-editor.tsx` (accept + use external step)

**Step 1: Lift activeStep to EditorShell**

In `components/editor/editor-shell.tsx`, add state:

```tsx
const [guidedStep, setGuidedStep] = useState(0);
```

Pass to GuidedEditor:

```tsx
<GuidedEditor
  structure={structure}
  onUpdate={updateStructure}
  onAiSuggest={handleAiSuggest}
  aiLoadingSection={aiLoading}
  activeStep={guidedStep}
  onStepChange={setGuidedStep}
  onDone={() => {
    saveSkill();
    switchMode("markdown");
  }}
/>
```

**Step 2: Update GuidedEditor to accept external step**

In `components/editor/guided-mode/guided-editor.tsx`:

Update the `GuidedEditorProps` interface (around line 55) to add:

```tsx
activeStep: number;
onStepChange: (step: number) => void;
```

Remove the internal `const [activeStep, setActiveStep] = useState(0);` (line 70).

Update `goNext` and `goBack` to use `onStepChange` instead of `setActiveStep`:

```tsx
function goNext() {
  if (activeStep < TOTAL_STEPS - 1) onStepChange(activeStep + 1);
}
function goBack() {
  if (activeStep > 0) onStepChange(activeStep - 1);
}
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add components/editor/editor-shell.tsx components/editor/guided-mode/guided-editor.tsx
git commit -m "feat: preserve guided editor step when switching modes"
```

---

## Task 10: Guided Editor Completion Card (Step 4)

**Files:**
- Modify: `components/editor/guided-mode/guided-editor.tsx`
- Modify: `components/editor/editor-shell.tsx`

**Step 1: Increase TOTAL_STEPS to 5**

In `guided-editor.tsx`, change `TOTAL_STEPS = 4` to `TOTAL_STEPS = 5` (line 14). Add a label to `stepLabels`: add `"Done"` as the 5th entry.

**Step 2: Add renderStep4 — completion card**

Add a new render function after `renderStep3`:

```tsx
function renderStep4() {
  const exampleCount = structure.examples.filter(
    (e) => e.input.trim() || e.output.trim()
  ).length;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-12 h-12 rounded-full bg-[rgba(191,255,0,0.15)] flex items-center justify-center mb-4">
        <IconCircleCheckFilled size={28} className="text-[#bfff00]" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        Your skill is ready!
      </h3>
      <p className="text-sm text-[rgba(255,255,255,0.6)] mb-6 max-w-sm">
        {structure.name || "Untitled Skill"} — {exampleCount} example{exampleCount !== 1 ? "s" : ""}, {structure.instructions ? "instructions" : "no instructions"}, {structure.edgeCases ? "edge cases" : "no edge cases"}
      </p>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Button size="md" onClick={onTest} className="w-full">
          <IconPlayerPlayFilled size={14} />
          Test it
        </Button>
        <Button variant="secondary" size="md" onClick={onEditMarkdown} className="w-full">
          Edit Markdown
        </Button>
        <Button variant="secondary" size="md" onClick={onDashboard} className="w-full">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
```

**Step 3: Update GuidedEditorProps**

Replace the single `onDone` callback with three specific callbacks:

```tsx
interface GuidedEditorProps {
  structure: SkillStructure;
  onUpdate: (updater: (prev: SkillStructure) => SkillStructure) => void;
  onAiSuggest: (section: string) => void;
  aiLoadingSection: string | null;
  activeStep: number;
  onStepChange: (step: number) => void;
  onTest: () => void;
  onEditMarkdown: () => void;
  onDashboard: () => void;
}
```

**Step 4: Update the "Done" button in renderStep3**

Change the "Done" button in step 3 (Examples) to advance to step 4 instead of calling `onDone`:

```tsx
<Button size="md" onClick={goNext}>
  <IconCircleCheckFilled size={14} />
  Done
</Button>
```

**Step 5: Add renderStep4 to stepRenderers**

```tsx
const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];
```

**Step 6: Update EditorShell to pass the new callbacks**

In `components/editor/editor-shell.tsx`, update the GuidedEditor usage:

```tsx
<GuidedEditor
  structure={structure}
  onUpdate={updateStructure}
  onAiSuggest={handleAiSuggest}
  aiLoadingSection={aiLoading}
  activeStep={guidedStep}
  onStepChange={setGuidedStep}
  onTest={() => {
    saveSkill();
    router.push(`/skills/${skillId}/test`);
  }}
  onEditMarkdown={() => {
    saveSkill();
    switchMode("markdown");
  }}
  onDashboard={async () => {
    await saveSkill();
    router.push("/dashboard");
  }}
/>
```

**Step 7: Add missing icon imports to guided-editor.tsx**

Add `IconPlayerPlayFilled` to the import from `@tabler/icons-react`.

**Step 8: Verify build**

```bash
npm run build
```

**Step 9: Commit**

```bash
git add components/editor/guided-mode/guided-editor.tsx components/editor/editor-shell.tsx
git commit -m "feat: add completion card (step 4) to guided editor"
```

---

## Task 11: Undo for AI Suggestions

**Files:**
- Modify: `components/editor/editor-shell.tsx`

**Step 1: Add snapshot state and undo logic**

In `components/editor/editor-shell.tsx`, add a ref to store the previous structure snapshot:

```tsx
import { useState, useEffect, useCallback, useRef } from "react";
```

```tsx
const structureSnapshot = useRef<SkillStructure | null>(null);
```

**Step 2: Snapshot before AI actions**

In `handleAiDraft`, before calling the API, snapshot the current state:

```tsx
async function handleAiDraft() {
  if (!structure.description && !structure.name) return;
  structureSnapshot.current = { ...structure, examples: [...structure.examples] };
  setAiLoading("draft");
  try {
    // ... existing fetch logic ...
    if (data.content) {
      updateMarkdown(data.content);
      if (data.parsed?.name && !title) {
        setTitle(data.parsed.name);
      }
      toast("AI draft applied", {
        action: {
          label: "Undo",
          onClick: () => {
            if (structureSnapshot.current) {
              updateStructure(() => structureSnapshot.current!);
            }
          },
        },
        duration: 10000,
      });
    }
  } catch {
    toast.error("AI draft generation failed. Please try again.");
  } finally {
    setAiLoading(null);
  }
}
```

**Step 3: Same pattern for handleAiSuggest and handleAiImprove**

Add snapshot + undo toast to both functions. Same pattern: snapshot before fetch, show toast with "Undo" action on success.

**Step 4: Import SkillStructure type**

Add to imports:

```tsx
import type { SkillStructure } from "@/lib/skill-parser/schema";
```

**Step 5: Verify build**

```bash
npm run build
```

**Step 6: Commit**

```bash
git add components/editor/editor-shell.tsx
git commit -m "feat: add undo support for AI suggestions with 10s toast"
```

---

## Task 12: Wizard Step 0 — 3-Way Path Selector

This is the biggest change. Replace the Step 0 inner content with a path selector.

**Files:**
- Modify: `app/(app)/skills/new/page.tsx`

**Step 1: Add new state for creation path**

Add to state declarations (after line 69):

```tsx
const [creationPath, setCreationPath] = useState<"ai" | "template" | "blank">("ai");
```

**Step 2: Update canProceed for Step 0**

Update `canProceed` (line 73-76) to handle the three paths:

```tsx
function canProceed(step: number) {
  if (step === 0) {
    if (creationPath === "ai") return description.trim().length > 0;
    return true; // blank path always can proceed
  }
  return true;
}
```

**Step 3: Add template state and fetching**

Add template state:

```tsx
const [templates, setTemplates] = useState<any[]>([]);
const [templateSearch, setTemplateSearch] = useState("");
const [templateLoading, setTemplateLoading] = useState(false);
```

Add a `useEffect` to fetch templates when the template path is selected:

```tsx
useEffect(() => {
  if (creationPath !== "template") return;
  setTemplateLoading(true);
  fetch("/api/templates")
    .then((r) => r.json())
    .then(setTemplates)
    .catch(() => toast.error("Failed to load templates"))
    .finally(() => setTemplateLoading(false));
}, [creationPath]);
```

Add an import for `useEffect`:

```tsx
import { useState, useEffect } from "react";
```

**Step 4: Add handleForkTemplate function**

```tsx
async function handleForkTemplate(templateId: string) {
  setLoading(true);
  setMode("creating");
  setActiveStep(2);
  try {
    const res = await fetch(`/api/skills/${templateId}/fork`, { method: "POST" });
    if (!res.ok) throw new Error();
    const fork = await res.json();
    router.push(`/skills/${fork.id}/edit`);
  } catch {
    toast.error("Failed to use template. Please try again.");
    setMode("idle");
    setLoading(false);
    setActiveStep(0);
  }
}
```

**Step 5: Rewrite renderStep0**

Replace the entire `renderStep0` function (lines 159-194):

```tsx
function renderStep0() {
  return (
    <div className="flex flex-col h-full">
      {/* Path selector */}
      <div className="flex gap-2 mb-4">
        {([
          { key: "ai" as const, label: "Describe with AI", icon: IconSparkles },
          { key: "template" as const, label: "From Template", icon: IconBookmarkFilled },
          { key: "blank" as const, label: "Start Blank", icon: IconPlus },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCreationPath(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl transition-colors",
              creationPath === key
                ? "bg-[rgba(191,255,0,0.12)] text-[#bfff00] border border-[rgba(191,255,0,0.25)]"
                : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.5)] hover:text-white border border-transparent"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Dynamic content based on path */}
      <div className="flex-1">
        {creationPath === "ai" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.6)]">
              What should this skill do?
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Review code and provide feedback focusing on security vulnerabilities, performance issues, and best practices."
              rows={4}
              className="text-base"
            />
          </div>
        )}

        {creationPath === "template" && (
          <div className="space-y-3">
            <Input
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Search templates..."
              className="text-sm"
            />
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {templateLoading ? (
                <p className="text-sm text-[rgba(255,255,255,0.4)] text-center py-4">Loading templates...</p>
              ) : templates
                  .filter((t) =>
                    t.title.toLowerCase().includes(templateSearch.toLowerCase())
                  )
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleForkTemplate(t.id)}
                      disabled={loading}
                      className="w-full text-left p-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.06)] transition-colors"
                    >
                      <div className="font-medium text-sm text-white">{t.title}</div>
                      <div className="text-xs text-[rgba(255,255,255,0.5)] line-clamp-1 mt-0.5">
                        {t.description}
                      </div>
                    </button>
                  ))}
              {!templateLoading && templates.length === 0 && (
                <p className="text-sm text-[rgba(255,255,255,0.4)] text-center py-4">No templates available</p>
              )}
            </div>
          </div>
        )}

        {creationPath === "blank" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[rgba(255,255,255,0.5)]">
              You'll set up the name and category next, then start with a blank editor.
            </p>
          </div>
        )}
      </div>

      {/* Footer — only show Next for AI and Blank paths */}
      {creationPath !== "template" && (
        <div className="flex items-center justify-end mt-auto pt-4">
          <Button onClick={goNext} disabled={!canProceed(0)} size="md">
            Next
            <IconChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Step 6: Add missing icon imports**

Add to the icon import line:

```tsx
import {
  IconSparkles,
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconBookmarkFilled,
  IconPlus,
} from "@tabler/icons-react";
```

**Step 7: Update handleCreateBlank to use wizard data**

Modify `handleCreateBlank` (around line 139) to include category and description:

```tsx
async function handleCreateBlank() {
  setActiveStep(2);
  setMode("creating");
  setLoading(true);
  try {
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: skillName.trim() || "Untitled Skill",
        category: category || undefined,
      }),
    });
    if (!res.ok) throw new Error();
    const skill = await res.json();
    router.push(`/skills/${skill.id}/edit`);
  } catch {
    toast.error("Failed to create skill. Please try again.");
    setMode("idle");
    setLoading(false);
  }
}
```

**Step 8: Update Step 2 to be path-aware**

In `renderStep2`, update the summary and primary button to reflect the blank path:

- If `creationPath === "blank"`, show "Create Skill" instead of "Generate with AI".
- If `creationPath === "blank"`, the primary button calls `handleCreateBlank()` instead of `handleCreateWithAI()`.
- Remove the "Start from scratch" link from Step 2 (it's now in Step 0).

**Step 9: Verify build**

```bash
npm run build
```

**Step 10: Commit**

```bash
git add app/\(app\)/skills/new/page.tsx
git commit -m "feat: add 3-way path selector (AI, template, blank) to Step 0"
```

---

## Task 13: Atomicity Fix for AI Creation

Prevent orphan skill records when AI draft fails.

**Files:**
- Modify: `app/(app)/skills/new/page.tsx` (handleCreateWithAI)

**Step 1: Reorder API calls**

Rewrite `handleCreateWithAI` to generate the draft first, then create the skill with content:

```tsx
async function handleCreateWithAI() {
  if (!description.trim()) return;
  setActiveStep(2);
  setMode("generating");
  setLoading(true);

  try {
    // Generate draft FIRST — no DB record yet
    const draftRes = await fetch("/api/claude/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        name: skillName.trim() || undefined,
        category: category || undefined,
      }),
    });
    if (!draftRes.ok) throw new Error("Draft generation failed");
    const draft = await draftRes.json();

    // Now create the skill WITH the content
    const createRes = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.parsed?.name || skillName.trim() || description.slice(0, 60),
        description,
        category,
        content: draft.content || "",
      }),
    });
    if (!createRes.ok) throw new Error("Skill creation failed");
    const skill = await createRes.json();

    router.push(`/skills/${skill.id}/edit`);
  } catch {
    toast.error("Failed to generate skill. Please try again.");
    setMode("idle");
    setLoading(false);
  }
}
```

**Step 2: Verify the POST /api/skills route accepts `content`**

Check `app/api/skills/route.ts` — the POST handler already destructures `content` from the body and inserts it. Confirmed at the existing code. No API change needed.

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add app/\(app\)/skills/new/page.tsx
git commit -m "fix: generate AI draft before creating DB record to prevent orphans"
```

---

## Task 14: Template Fork Naming Deduplication

**Files:**
- Modify: `app/api/skills/[id]/fork/route.ts`

**Step 1: Add deduplication logic**

After line 28 (where the fork title is computed), add a check for existing forks:

```tsx
// Generate unique fork title
const baseTitle = `${skill.title} (Fork)`;
const { data: existingForks } = await supabase
  .from("skills")
  .select("title")
  .eq("author_id", user.id)
  .like("title", `${skill.title} (Fork%`);

let forkTitle = baseTitle;
if (existingForks && existingForks.some((f) => f.title === baseTitle)) {
  let counter = 2;
  while (existingForks.some((f) => f.title === `${skill.title} (Fork ${counter})`)) {
    counter++;
  }
  forkTitle = `${skill.title} (Fork ${counter})`;
}
```

Then use `forkTitle` instead of the hardcoded `${skill.title} (Fork)` in the insert.

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/api/skills/\[id\]/fork/route.ts
git commit -m "feat: deduplicate fork titles (Fork 2, Fork 3, etc.)"
```

---

## Task 15: Template Preview Modal

**Files:**
- Create: `components/templates/template-preview.tsx`
- Modify: `components/templates/template-card.tsx`

**Step 1: Create the preview modal component**

Create `components/templates/template-preview.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseSkillMarkdown } from "@/lib/skill-parser/parse";

interface TemplatePreviewProps {
  template: {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string | null;
    tags: string[];
    author_name?: string;
    usage_count: number;
  };
  onClose: () => void;
  onUseTemplate: () => void;
  forking: boolean;
}

export function TemplatePreview({
  template,
  onClose,
  onUseTemplate,
  forking,
}: TemplatePreviewProps) {
  const parsed = parseSkillMarkdown(template.content || "");

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-white">{template.title}</h2>
            <p className="text-sm text-[rgba(255,255,255,0.5)] mt-0.5">{template.description}</p>
          </div>
          <button onClick={onClose} className="text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">
            <IconX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {parsed.instructions && (
            <div>
              <h3 className="text-xs font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">Instructions</h3>
              <p className="text-sm text-[rgba(255,255,255,0.8)] whitespace-pre-wrap">{parsed.instructions}</p>
            </div>
          )}
          {parsed.edgeCases && (
            <div>
              <h3 className="text-xs font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">Edge Cases</h3>
              <p className="text-sm text-[rgba(255,255,255,0.8)] whitespace-pre-wrap">{parsed.edgeCases}</p>
            </div>
          )}
          {parsed.examples.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">Examples ({parsed.examples.length})</h3>
              <div className="space-y-3">
                {parsed.examples.map((ex, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3 space-y-2">
                    <div>
                      <span className="text-[10px] font-semibold text-[rgba(255,255,255,0.4)] uppercase">User</span>
                      <p className="text-sm text-[rgba(255,255,255,0.7)] mt-0.5">{ex.input}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-[rgba(255,255,255,0.4)] uppercase">Claude</span>
                      <p className="text-sm text-[rgba(255,255,255,0.7)] mt-0.5">{ex.output}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex gap-1.5">
            {template.category && <Badge>{template.category}</Badge>}
            {template.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <Button onClick={onUseTemplate} disabled={forking} size="md">
            {forking ? "Forking..." : "Use Template"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add preview trigger to TemplateCard**

In `components/templates/template-card.tsx`:

Add state: `const [showPreview, setShowPreview] = useState(false);`

Add import: `import { TemplatePreview } from "./template-preview";`

Make the card title/description area clickable to open the preview. Add after the card JSX closing tag:

```tsx
{showPreview && (
  <TemplatePreview
    template={{ id, title, description, content, category, tags, author_name: authorName, usage_count: usageCount }}
    onClose={() => setShowPreview(false)}
    onUseTemplate={handleFork}
    forking={forking}
  />
)}
```

Add an `onClick={() => setShowPreview(true)}` to the card body area (not the "Use Template" button).

**Note:** The `TemplateCard` will need to receive `content` as a prop. Update `TemplateCardProps` to include `content: string`. Ensure the templates API returns the `content` field — check `app/api/templates/route.ts` and add `content` to the select if not already included.

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add components/templates/template-preview.tsx components/templates/template-card.tsx
git commit -m "feat: add template preview modal with full content view"
```

---

## Summary — Execution Order

| Task | Description | Depends On |
|------|-------------|------------|
| 1 | Toast infrastructure (Sonner) | — |
| 2 | Extract shared constants | — |
| 3 | Fix AI prompt/parser mismatch | — |
| 4 | Remove dead SectionCard | — |
| 5 | Error toasts in editor | Task 1 |
| 6 | Error toasts in wizard | Task 1 |
| 7 | Error toasts in template fork | Task 1 |
| 8 | Unsaved changes guard | — |
| 9 | Guided mode step memory | — |
| 10 | Guided editor completion card | Task 9 |
| 11 | Undo for AI suggestions | Task 1, Task 5 |
| 12 | Wizard Step 0 — 3-way selector | Task 1, Task 2, Task 6 |
| 13 | Atomicity fix for AI creation | Task 6 |
| 14 | Template fork naming | — |
| 15 | Template preview modal | — |

**Tasks 1-4 are independent and can be parallelized.**
**Tasks 8-9 are independent and can be parallelized.**
**Tasks 14-15 are independent and can be parallelized.**
