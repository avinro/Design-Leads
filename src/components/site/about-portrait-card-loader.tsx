"use client";

import dynamic from "next/dynamic";

/*
 * Client-side loader for AboutPortraitCard.
 *
 * next/dynamic with ssr: false must live inside a Client Component — Server
 * Components do not support it. This thin wrapper owns the dynamic import so
 * the About page (Server Component) can render it without triggering the
 * Next.js build error.
 *
 * ssr: false prevents Motion hooks (useMotionValue, useSpring) from running
 * during server-side rendering and in renderToStaticMarkup test contexts.
 */
const AboutPortraitCard = dynamic(
  () => import("@/components/site/about-portrait-card").then((m) => m.AboutPortraitCard),
  {
    ssr: false,
    loading: () => (
      <figure
        aria-hidden="true"
        className="relative flex w-full items-center justify-center"
        data-testid="portrait-card-fallback"
      >
        <div className="border-border/40 bg-muted relative aspect-[3/4] w-full overflow-hidden rounded-xl border">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="bg-muted-foreground/20 h-16 w-16 rounded-full" />
            <div className="bg-muted-foreground/10 h-20 w-24 rounded-t-full" />
          </div>
        </div>
      </figure>
    ),
  },
);

export interface AboutPortraitCardLoaderProps {
  imageSrc: string;
}

export function AboutPortraitCardLoader({ imageSrc }: AboutPortraitCardLoaderProps) {
  return <AboutPortraitCard imageSrc={imageSrc} />;
}
