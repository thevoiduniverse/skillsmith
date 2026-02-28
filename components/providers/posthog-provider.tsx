"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { createClient } from "@/lib/supabase/client";
import { track, identify, reset } from "@/lib/analytics";

// Initialize at module level so it's ready before any component renders.
// posthog.init is idempotent — safe to call once at import time.
const posthogInitialized =
  typeof window !== "undefined" &&
  (() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key) return false;

    posthog.init(key, {
      api_host: host || "https://us.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
    return true;
  })();

/** Tracks pageviews on route changes — must be inside Suspense because of useSearchParams */
function PostHogPageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthogInitialized) return;
    const url =
      window.origin +
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const prevUserRef = useRef<string | null>(null);

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;
        identify(user.id, { email: user.email });

        // Detect if this is a new signup or returning login
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
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageviewTracker />
      </Suspense>
      {children}
    </>
  );
}
