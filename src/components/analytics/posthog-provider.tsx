"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

import { getPosthog } from "@/lib/analytics/posthog";

/**
 * PostHogInit — initialises the PostHog client exactly once on mount.
 *
 * Separating init from pageview capture avoids a race condition: if init and
 * the first capture share the same useEffect, subsequent navigations may call
 * capture on an instance that finished initialising asynchronously, while the
 * effect already ran and returned. By initialising eagerly at mount time, the
 * instance is guaranteed to be ready (or queuing events) before any navigation.
 */
function PostHogInit() {
  useEffect(() => {
    // Trigger lazy init — PostHog queues events internally until ready.
    getPosthog();
  }, []);

  return null;
}

/**
 * PageviewCapturer — fires a manual $pageview on every App Router navigation.
 *
 * App Router replaces the URL via pushState / replaceState, which does not
 * fire native browser navigation events. PostHog's built-in capture_pageview
 * only catches the initial page load, so all client transitions are missed.
 *
 * Placed inside a Suspense boundary because useSearchParams() opts the subtree
 * into dynamic rendering — Suspense prevents the rest of the layout from
 * blocking during SSR.
 */
function PageviewCapturer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ph = getPosthog();
    if (!ph) return;

    const qs = searchParams.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

/**
 * PostHogProvider — mounts once in the root layout.
 *
 * PostHogInit eagerly triggers the lazy PostHog singleton so the instance is
 * ready before the first navigation-triggered pageview capture runs.
 * PageviewCapturer is wrapped in Suspense to isolate the useSearchParams call.
 */
export function PostHogProvider() {
  return (
    <>
      <PostHogInit />
      <Suspense fallback={null}>
        <PageviewCapturer />
      </Suspense>
    </>
  );
}
