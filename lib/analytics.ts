import posthog from "posthog-js";

const isDev = process.env.NODE_ENV === "development";

export function track(event: string, data?: Record<string, unknown>): void {
  if (isDev || typeof window === "undefined") return;
  posthog.capture(event, data);
}

export function identify(
  userId: string,
  properties?: Record<string, unknown>
): void {
  if (isDev || typeof window === "undefined") return;
  posthog.identify(userId, properties);
}

export function reset(): void {
  if (isDev || typeof window === "undefined") return;
  posthog.reset();
}
