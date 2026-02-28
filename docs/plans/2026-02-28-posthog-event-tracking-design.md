# PostHog Event Tracking — Design Document

**Date**: 2026-02-28
**Status**: Approved
**Goal**: Full-stack product analytics with identified users, replacing Umami

---

## Decision

**Platform**: PostHog Cloud (free tier — 1M events/mo, 5K session replays/mo)
**SDK**: `posthog-js` (client-side only)

**Replaces**: Umami, @vercel/analytics, @vercel/speed-insights

### Why PostHog

- All-in-one: events, funnels, retention, session replays, user paths — all on free tier
- Identified users with `posthog.identify(userId)` for user-level journeys
- Auto-captures pageviews and clicks — replaces Umami's page tracking
- Next.js App Router support with React provider pattern
- Same `track()` API surface means zero changes to existing 19 call sites

---

## Event Taxonomy

### Acquisition & Auth
| Event | Properties |
|-------|-----------|
| `signup_completed` | `{ method: "email" }` |
| `login_completed` | `{ method: "email" }` |
| `logout` | — |

### Skill Creation Flow
| Event | Properties |
|-------|-----------|
| `creation_path_selected` | `{ path: "ai" \| "template" \| "blank" }` |
| `category_selected` | `{ category }` |
| `skill_name_randomised` | — |
| `skill_created` | `{ method: "ai" \| "blank", category }` |
| `template_forked` | `{ template_id }` |

### Editing
| Event | Properties |
|-------|-----------|
| `ai_draft_triggered` | — |
| `ai_suggest_triggered` | `{ section }` |
| `editor_mode_switched` | `{ mode: "guided" \| "markdown" }` |
| `skill_saved` | — |
| `skill_exported` | — |
| `visibility_toggled` | `{ visibility }` |
| `install_command_copied` | — |
| `skill_deleted` | — |

### Testing
| Event | Properties |
|-------|-----------|
| `test_case_added` | — |
| `test_run_single` | — |
| `test_run_all` | `{ count }` |
| `split_comparison_run` | — |

### Sharing & Discovery
| Event | Properties |
|-------|-----------|
| `skill_forked` | `{ source_skill_id }` |
| `template_searched` | `{ query, category, sort }` |
| `template_viewed` | `{ template_id }` |
| `skill_shared` | `{ skill_id, method: "link" \| "install" }` |

### Auto-Captured by PostHog
- `$pageview` — every route change
- `$pageleave` — time on page
- `$autocapture` — button clicks, link clicks, form submissions

---

## Key Funnels

1. **Creation**: `creation_path_selected` -> `skill_created` -> `skill_saved` -> `skill_tested`
2. **Onboarding**: `signup_completed` -> first `skill_created` (time-to-value)
3. **Template**: `template_searched` -> `template_viewed` -> `template_forked`
4. **Testing adoption**: `skill_saved` -> `test_case_added` -> `test_run_single`

---

## Architecture

### New Files
| File | Purpose |
|------|---------|
| `components/providers/posthog-provider.tsx` | Client component: initializes PostHog, handles identify/reset via Supabase auth state |
| `lib/analytics.ts` | Rewritten: `track()`, `identify()`, `reset()` backed by posthog-js |

### Modified Files
| File | Change |
|------|--------|
| `app/layout.tsx` | Remove Umami script + Vercel Analytics/SpeedInsights, wrap with PostHogProvider |
| `app/(auth)/login/page.tsx` | Add `login_completed` event |
| `app/(auth)/signup/page.tsx` | Add `signup_completed` event |
| `components/layout/sidebar.tsx` | Add `logout` event in handleSignOut |
| `components/playground/split-comparison.tsx` | Add `split_comparison_run` event |
| `app/(app)/templates/page.tsx` | Add `template_searched` event on filter changes |
| `app/(app)/skills/[id]/page.tsx` | Add `template_viewed` event |
| `package.json` | Add `posthog-js`, remove `@vercel/analytics` + `@vercel/speed-insights` |
| `.env.local` | Add `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |

### User Identification Flow

```
signup/login -> Supabase returns user -> redirect to /dashboard
                                              |
                               PostHogProvider detects user via
                               Supabase onAuthStateChange listener
                                              |
                               posthog.identify(user.id, { email })
```

On logout: `posthog.reset()` clears identity.

### Analytics API (lib/analytics.ts)

```typescript
// Same API surface — all 19 existing track() calls work unchanged
export function track(event: string, data?: Record<string, unknown>): void
export function identify(userId: string, properties?: Record<string, unknown>): void
export function reset(): void
```

---

## PostHog Dashboard Setup

After implementation, create these dashboards in PostHog:

1. **Overview**: daily active users, total events, top events
2. **Onboarding funnel**: signup -> first skill created -> first test run
3. **Creation funnel**: path selected -> skill created -> saved -> tested
4. **Retention**: weekly retention by cohort
5. **Feature usage**: heatmap of which features get used most
