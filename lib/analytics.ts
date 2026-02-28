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
