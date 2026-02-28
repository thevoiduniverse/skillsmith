# PostHog Event Tracking — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Umami + Vercel Analytics with PostHog Cloud for full-stack product analytics with identified users.

**Architecture:** Client-side `posthog-js` SDK initialized via a React provider. User identification happens automatically via Supabase `onAuthStateChange`. All 19 existing `track()` calls continue working unchanged through a rewritten `lib/analytics.ts` that delegates to PostHog instead of Umami. Six new events are added for coverage gaps.

**Tech Stack:** posthog-js, Next.js 14 App Router, Supabase Auth (Google OAuth), React context provider

---

## Task 1: PostHog Cloud Setup + Environment Variables

**Files:**
- Modify: `.env.local`

**Step 1: Create PostHog Cloud account**

Go to https://app.posthog.com/signup — sign up with Google or email. Create a project called "SkillSmith". Copy the **Project API Key** and **Host** from Settings → Project → API Keys.

**Step 2: Add env vars to `.env.local`**

Add these two lines to the end of `.env.local`:

```
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Replace `phc_your_key_here` with your actual PostHog project API key. The host depends on your region (US or EU).

**Step 3: Verify env vars load**

Run: `grep POSTHOG .env.local`
Expected: Both `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` lines appear.

---

## Task 2: Install posthog-js, Remove Old Analytics Packages

**Files:**
- Modify: `package.json`

**Step 1: Install posthog-js**

```bash
cd /Users/karthik/Documents/Claude/skillforge
npm install posthog-js
```

Expected: `posthog-js` appears in `package.json` dependencies.

**Step 2: Remove @vercel/analytics and @vercel/speed-insights**

```bash
npm uninstall @vercel/analytics @vercel/speed-insights
```

Expected: Both packages removed from `package.json`. No other packages affected.

**Step 3: Verify package.json**

```bash
grep -E "posthog|vercel/analytics|vercel/speed" package.json
```

Expected: Only `posthog-js` appears. No `@vercel/analytics` or `@vercel/speed-insights`.

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add posthog-js, remove vercel analytics packages"
```

---

## Task 3: Rewrite lib/analytics.ts

**Files:**
- Modify: `lib/analytics.ts`

This is the central analytics wrapper. All 19 existing call sites import `track` from here. We rewrite the internals to use PostHog while keeping the same `track(event, data)` signature.

**Step 1: Rewrite the file**

Replace the entire contents of `lib/analytics.ts` with:

```typescript
import posthog from "posthog-js";

/**
 * Track a custom event. Same API surface as before —
 * all 19 existing call sites work unchanged.
 */
export function track(event: string, data?: Record<string, unknown>): void {
  if (typeof window !== "undefined") {
    posthog.capture(event, data);
  }
}

/**
 * Identify a user after login/signup. Called from PostHogProvider
 * when Supabase auth state changes to SIGNED_IN.
 */
export function identify(
  userId: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window !== "undefined") {
    posthog.identify(userId, properties);
  }
}

/**
 * Reset identity on logout. Clears the PostHog distinct_id
 * so subsequent events are anonymous.
 */
export function reset(): void {
  if (typeof window !== "undefined") {
    posthog.reset();
  }
}
```

**Step 2: Verify no type errors**

```bash
cd /Users/karthik/Documents/Claude/skillforge
npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors related to `lib/analytics.ts`. (There may be other pre-existing warnings — ignore those.)

**Step 3: Commit**

```bash
git add lib/analytics.ts
git commit -m "feat: rewrite analytics wrapper to use posthog-js"
```

---

## Task 4: Create PostHogProvider

**Files:**
- Create: `components/providers/posthog-provider.tsx`

This client component:
1. Initializes the PostHog SDK once on mount
2. Listens to Supabase `onAuthStateChange` to auto-identify/reset users
3. Fires `login_completed` and `signup_completed` events (since Google OAuth redirects through a server callback, we can't fire these from the login/signup pages)

**Step 1: Create the provider directory**

```bash
mkdir -p /Users/karthik/Documents/Claude/skillforge/components/providers
```

**Step 2: Create the provider file**

Create `components/providers/posthog-provider.tsx` with:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { createClient } from "@/lib/supabase/client";
import { track, identify, reset } from "@/lib/analytics";

let posthogInitialized = false;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevUserRef = useRef<string | null>(null);

  // Initialize PostHog once
  useEffect(() => {
    if (posthogInitialized) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key) return;

    posthog.init(key, {
      api_host: host || "https://us.i.posthog.com",
      capture_pageview: false, // We fire manually on route change
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
    posthogInitialized = true;
  }, []);

  // Track pageviews on route changes
  useEffect(() => {
    if (!posthogInitialized) return;
    const url = window.origin + pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  // Listen to Supabase auth state for identify/reset
  useEffect(() => {
    if (!posthogInitialized) return;
    const supabase = createClient();

    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        identify(user.id, { email: user.email });
        prevUserRef.current = user.id;
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const user = session.user;
          identify(user.id, { email: user.email });

          // Detect if this is a new signup or returning login
          // PostHog-created_at within the last 60 seconds = new signup
          const createdAt = new Date(user.created_at).getTime();
          const isNewUser = Date.now() - createdAt < 60_000;

          if (isNewUser && prevUserRef.current !== user.id) {
            track("signup_completed", { method: "google" });
          } else if (prevUserRef.current !== user.id) {
            track("login_completed", { method: "google" });
          }
          prevUserRef.current = user.id;
        }

        if (event === "SIGNED_OUT") {
          reset();
          prevUserRef.current = null;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
```

**Step 3: Verify no type errors**

```bash
npx tsc --noEmit 2>&1 | grep -i "posthog-provider"
```

Expected: No errors.

**Step 4: Commit**

```bash
git add components/providers/posthog-provider.tsx
git commit -m "feat: create PostHogProvider with auto-identify via Supabase auth"
```

---

## Task 5: Wire PostHogProvider into Root Layout + Remove Umami

**Files:**
- Modify: `app/layout.tsx`

This is the single most important wiring step. We remove all traces of Umami and Vercel Analytics, and wrap the app with `PostHogProvider`.

**Step 1: Modify app/layout.tsx**

The current file has these lines to remove/change:

1. **Remove** the import: `import { Analytics } from "@vercel/analytics/react";` (line 4)
2. **Remove** the import: `import { SpeedInsights } from "@vercel/speed-insights/next";` (line 5)
3. **Add** import: `import { PostHogProvider } from "@/components/providers/posthog-provider";`
4. **Remove** the entire `<script>` block inside `<head>` (lines 47-51 — the Umami script)
5. **Remove** `<Analytics />` (line 57)
6. **Remove** `<SpeedInsights />` (line 58)
7. **Wrap** `{children}` with `<PostHogProvider>{children}</PostHogProvider>`

After changes, `app/layout.tsx` should look like:

```tsx
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const asgardFat = localFont({
  src: "./fonts/AsgardTrial-Fat.ttf",
  variable: "--font-asgard-fat",
  display: "swap",
});

const brockmann = localFont({
  src: "./fonts/brockmann-medium-webfont.woff2",
  variable: "--font-brockmann",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "SkillSMITH — Build, Test & Share Claude Skills",
  description:
    "Create, test, and share custom Claude skills with an AI-assisted editor and testing playground.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${brockmann.className} ${brockmann.variable} ${jetbrains.variable} ${asgardFat.variable} bg-[#0a0a0a]`}
      >
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
```

**Step 2: Verify the app loads**

```bash
cd /Users/karthik/Documents/Claude/skillforge
rm -rf .next && npm run dev
```

Open http://localhost:3000 — the app should load without errors. Check browser console for `[PostHog]` debug output confirming initialization.

**Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: replace Umami + Vercel Analytics with PostHogProvider in root layout"
```

---

## Task 6: Add `logout` Event in Sidebar

**Files:**
- Modify: `components/layout/sidebar.tsx` (line 30-34, `handleSignOut` function)

**Step 1: Add import**

Add to imports at top of `components/layout/sidebar.tsx`:

```typescript
import { track } from "@/lib/analytics";
```

**Step 2: Add track call in handleSignOut**

Change the `handleSignOut` function from:

```typescript
async function handleSignOut() {
  await supabase.auth.signOut();
  router.push("/login");
  router.refresh();
}
```

To:

```typescript
async function handleSignOut() {
  track("logout");
  await supabase.auth.signOut();
  router.push("/login");
  router.refresh();
}
```

Note: `track("logout")` fires BEFORE `signOut()` — PostHog's `reset()` happens in the provider's `onAuthStateChange` listener when `SIGNED_OUT` fires. This ensures the logout event is captured under the user's identity.

**Step 3: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "feat: add logout event tracking in sidebar"
```

---

## Task 7: Add `split_comparison_run` Event

**Files:**
- Modify: `components/playground/split-comparison.tsx` (line 20, `handleSend` function)

**Step 1: Add import**

Add to imports at top of `components/playground/split-comparison.tsx`:

```typescript
import { track } from "@/lib/analytics";
```

**Step 2: Add track call**

In the `handleSend` function, add the track call right after the early return guard (line 21-22):

```typescript
async function handleSend() {
  if (!prompt.trim() || loading) return;
  track("split_comparison_run");
  // ... rest of function unchanged
```

**Step 3: Commit**

```bash
git add components/playground/split-comparison.tsx
git commit -m "feat: add split_comparison_run event tracking"
```

---

## Task 8: Add `template_searched` Event on Templates Page

**Files:**
- Modify: `app/(app)/templates/page.tsx`

The templates page uses a debounced `useEffect` to fetch templates whenever `search`, `category`, or `sort` change. We'll fire `template_searched` inside that effect, but only when the user has actively set a filter (not on initial load).

**Step 1: Add import**

Add to imports at top of `app/(app)/templates/page.tsx`:

```typescript
import { track } from "@/lib/analytics";
```

**Step 2: Add track call inside the fetch effect**

Modify the `useEffect` (lines 27-48). Add a track call inside `fetchTemplates`, after the params are built but before the fetch:

```typescript
useEffect(() => {
  async function fetchTemplates() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("sort", sort);

    // Track search/filter interactions (skip initial load)
    if (search || category || sort !== "featured") {
      track("template_searched", {
        query: search || undefined,
        category: category || undefined,
        sort,
      });
    }

    try {
      const res = await fetch(`/api/templates?${params}`);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }

  const debounce = setTimeout(fetchTemplates, 300);
  return () => clearTimeout(debounce);
}, [search, category, sort]);
```

**Step 3: Commit**

```bash
git add app/\(app\)/templates/page.tsx
git commit -m "feat: add template_searched event tracking on filter changes"
```

---

## Task 9: Add `template_viewed` Event on Skill Detail Page

**Files:**
- Create: `app/(app)/skills/[id]/template-view-tracker.tsx`
- Modify: `app/(app)/skills/[id]/page.tsx`

The skill detail page (`skills/[id]/page.tsx`) is a **server component** — it uses `async function` and calls `await createClient()`. We cannot call `track()` directly from a server component. Instead, we create a tiny client component that fires `template_viewed` on mount.

**Step 1: Create the tracker component**

Create `app/(app)/skills/[id]/template-view-tracker.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function TemplateViewTracker({ templateId }: { templateId: string }) {
  useEffect(() => {
    track("template_viewed", { template_id: templateId });
  }, [templateId]);
  return null;
}
```

**Step 2: Add tracker to the page**

In `app/(app)/skills/[id]/page.tsx`, add the import near the top:

```typescript
import { TemplateViewTracker } from "./template-view-tracker";
```

Then add `<TemplateViewTracker templateId={skill.id} />` inside the return, right after the opening `<div>`:

```tsx
return (
  <div className="max-w-6xl mx-auto">
    <TemplateViewTracker templateId={skill.id} />
    <div className="flex items-start justify-between mb-6">
    {/* ... rest unchanged */}
```

**Step 3: Commit**

```bash
git add app/\(app\)/skills/\[id\]/template-view-tracker.tsx app/\(app\)/skills/\[id\]/page.tsx
git commit -m "feat: add template_viewed event on skill detail page"
```

---

## Task 10: Add `skill_shared` Event to InstallSkill Component

**Files:**
- Modify: `app/(app)/skills/[id]/install-skill.tsx` (or wherever the install/share UI lives)

**Step 1: Find the component**

```bash
grep -rn "install_command_copied\|skill_shared" /Users/karthik/Documents/Claude/skillforge/components /Users/karthik/Documents/Claude/skillforge/app
```

If `install_command_copied` already exists in `editor-shell.tsx`, verify whether `InstallSkill` in `app/(app)/skills/[id]/install-skill.tsx` also has tracking. If not, add:

```typescript
import { track } from "@/lib/analytics";
```

And in the copy handler:

```typescript
track("skill_shared", { skill_id: skillId, method: "install" });
```

**Step 2: Commit (if changes were needed)**

```bash
git add app/\(app\)/skills/\[id\]/install-skill.tsx
git commit -m "feat: add skill_shared event tracking on install command copy"
```

---

## Task 11: Add `logout` Event in Settings Page

**Files:**
- Modify: `app/(app)/settings/page.tsx` (line 123-127, `handleSignOut` function)

The settings page has its own sign-out button. Add the same tracking.

**Step 1: Add import**

Add to imports at top of `app/(app)/settings/page.tsx`:

```typescript
import { track } from "@/lib/analytics";
```

**Step 2: Add track call**

Change `handleSignOut` from:

```typescript
async function handleSignOut() {
  await supabase.auth.signOut();
  router.push("/login");
  router.refresh();
}
```

To:

```typescript
async function handleSignOut() {
  track("logout");
  await supabase.auth.signOut();
  router.push("/login");
  router.refresh();
}
```

**Step 3: Commit**

```bash
git add app/\(app\)/settings/page.tsx
git commit -m "feat: add logout event tracking in settings page"
```

---

## Task 12: Verify All 19 Existing Track Calls Work

**Files:** None (verification only)

All 19 existing `track()` call sites import from `@/lib/analytics`. The function signature is unchanged: `track(event: string, data?: Record<string, unknown>)`. No changes needed at any call site.

**Step 1: Verify imports resolve**

```bash
npx tsc --noEmit 2>&1 | grep -i "analytics"
```

Expected: No errors.

**Step 2: Verify all 19 call sites still exist**

```bash
grep -rn 'track("' /Users/karthik/Documents/Claude/skillforge/components /Users/karthik/Documents/Claude/skillforge/app --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v ".next"
```

Expected: At least 25 `track()` calls (19 original + 6 new: `logout` ×2, `split_comparison_run`, `template_searched`, `template_viewed`, `skill_shared`).

**Step 3: Full app build test**

```bash
cd /Users/karthik/Documents/Claude/skillforge
npm run build
```

Expected: Build succeeds with no errors.

**Step 4: Manual smoke test**

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Log in with Google
4. Open browser DevTools → Network tab → filter for `posthog`
5. Navigate between pages — you should see `$pageview` events being sent
6. Create a skill → you should see `creation_path_selected`, `skill_created` events
7. Check PostHog dashboard at https://app.posthog.com → Activity tab → events should appear

---

## Task 13: Final Commit + Cleanup

**Step 1: Verify no Umami references remain**

```bash
grep -rn "umami" /Users/karthik/Documents/Claude/skillforge --include="*.tsx" --include="*.ts" --include="*.html" | grep -v node_modules | grep -v ".next"
```

Expected: Zero results (the Umami script tag in layout.tsx was removed in Task 5, the `window.umami` types in analytics.ts were removed in Task 3).

**Step 2: Verify no Vercel Analytics references remain**

```bash
grep -rn "@vercel/analytics\|@vercel/speed-insights\|SpeedInsights\|<Analytics" /Users/karthik/Documents/Claude/skillforge --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v ".next"
```

Expected: Zero results.

**Step 3: Final commit with all changes**

If there are any uncommitted changes from verification fixes:

```bash
git add -A
git commit -m "feat: complete PostHog event tracking migration — replace Umami + Vercel Analytics"
```

---

## Summary of All Changes

| File | Action | What Changed |
|------|--------|-------------|
| `.env.local` | Modify | Add `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |
| `package.json` | Modify | Add `posthog-js`, remove `@vercel/analytics` + `@vercel/speed-insights` |
| `lib/analytics.ts` | Rewrite | PostHog-backed `track()`, `identify()`, `reset()` — same API surface |
| `components/providers/posthog-provider.tsx` | Create | PostHog init, Supabase auth listener, pageview tracking |
| `app/layout.tsx` | Modify | Remove Umami script + Vercel components, wrap with PostHogProvider |
| `components/layout/sidebar.tsx` | Modify | Add `logout` event in handleSignOut |
| `components/playground/split-comparison.tsx` | Modify | Add `split_comparison_run` event |
| `app/(app)/templates/page.tsx` | Modify | Add `template_searched` event on filter changes |
| `app/(app)/skills/[id]/template-view-tracker.tsx` | Create | Client component to fire `template_viewed` on mount |
| `app/(app)/skills/[id]/page.tsx` | Modify | Add TemplateViewTracker component |
| `app/(app)/skills/[id]/install-skill.tsx` | Modify | Add `skill_shared` event |
| `app/(app)/settings/page.tsx` | Modify | Add `logout` event in handleSignOut |

**Total events after migration: 25** (19 existing + 6 new) + PostHog auto-captured `$pageview`, `$pageleave`, `$autocapture`
