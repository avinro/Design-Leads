"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";

import { homeContent } from "@/lib/content/home";
import { Container } from "@/components/layout/container";

/*
 * AboutCursorImages — sticky text with scroll-panning images.
 *
 * Behavior:
 *   The section is tall (300dvh desktop / 250dvh mobile) to give the user
 *   scroll runway. Inside, a sticky viewport-height wrapper keeps the bio text
 *   dead-center while 5 images slide across the screen at different vertical
 *   bands and stagger times.
 *
 *   Z-index alternation:
 *     Indices 0, 2, 4 → z-0  (behind text at z-10)
 *     Indices 1, 3    → z-20 (in front of text)
 *
 *   Each image has a [progressStart, progressEnd] scroll range and an
 *   [xStart → xEnd] translation in viewport-width units so images cross
 *   the full screen independently, entering and exiting on opposite sides.
 *
 * prefers-reduced-motion: static collage rendered instead.
 *
 * Image source: homeContent.aboutImages (5 placeholders in public/).
 * Images that fail to load show a neutral bg placeholder via onError.
 */

// ---------------------------------------------------------------------------
// Image choreography config
// ---------------------------------------------------------------------------

interface ImageConfig {
  /** scroll progress window [0..1] that this image is active */
  range: [number, number];
  /** translateX from → to in vw units (positive = right) */
  xFrom: number;
  xTo: number;
  /** vertical position relative to the sticky viewport */
  top: string;
  /** slight rotation for organic feel */
  rotate: string;
  /** w/h via tailwind-compatible inline style */
  width: string;
  height: string;
  /** z-index: 0 = behind text (z-10), 20 = in front */
  zIndex: number;
}

// Desktop — uniform stagger S=0.10, range W=0.60 → 4S+W=1.0 (perfect fill).
// All 5 images are on screen simultaneously from progress 0.40 to 0.60.
const IMAGE_CONFIGS: ImageConfig[] = [
  {
    range: [0.0, 0.6],
    xFrom: 115,
    xTo: -115,
    top: "8%",
    rotate: "-4deg",
    width: "28vw",
    height: "20vw",
    zIndex: 0,
  },
  {
    range: [0.1, 0.7],
    xFrom: -115,
    xTo: 115,
    top: "55%",
    rotate: "3deg",
    width: "22vw",
    height: "30vw",
    zIndex: 20,
  },
  {
    range: [0.2, 0.8],
    xFrom: 120,
    xTo: -120,
    top: "30%",
    rotate: "5deg",
    width: "25vw",
    height: "18vw",
    zIndex: 0,
  },
  {
    range: [0.3, 0.9],
    xFrom: -120,
    xTo: 120,
    top: "65%",
    rotate: "-3deg",
    width: "20vw",
    height: "28vw",
    zIndex: 20,
  },
  {
    range: [0.4, 1.0],
    xFrom: 115,
    xTo: -115,
    top: "18%",
    rotate: "6deg",
    width: "26vw",
    height: "22vw",
    zIndex: 0,
  },
];

// Mobile — same uniform S=0.10 / W=0.60; wider images for narrow viewport.
const IMAGE_CONFIGS_MOBILE: ImageConfig[] = [
  {
    range: [0.0, 0.6],
    xFrom: 130,
    xTo: -130,
    top: "8%",
    rotate: "-4deg",
    width: "60vw",
    height: "43vw",
    zIndex: 0,
  },
  {
    range: [0.1, 0.7],
    xFrom: -130,
    xTo: 130,
    top: "58%",
    rotate: "3deg",
    width: "53vw",
    height: "67vw",
    zIndex: 20,
  },
  {
    range: [0.2, 0.8],
    xFrom: 130,
    xTo: -130,
    top: "28%",
    rotate: "5deg",
    width: "57vw",
    height: "41vw",
    zIndex: 0,
  },
  {
    range: [0.3, 0.9],
    xFrom: -130,
    xTo: 130,
    top: "62%",
    rotate: "-3deg",
    width: "50vw",
    height: "62vw",
    zIndex: 20,
  },
  {
    range: [0.4, 1.0],
    xFrom: 130,
    xTo: -130,
    top: "15%",
    rotate: "6deg",
    width: "55vw",
    height: "45vw",
    zIndex: 0,
  },
];

// ---------------------------------------------------------------------------
// Single animated image
// ---------------------------------------------------------------------------

interface ScrollPanImageProps {
  src: string;
  config: ImageConfig;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function ScrollPanImage({ src, config, scrollYProgress }: ScrollPanImageProps) {
  const x = useTransform(scrollYProgress, config.range, [
    `${String(config.xFrom)}vw`,
    `${String(config.xTo)}vw`,
  ]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: config.top,
        left: "50%",
        translateX: "-50%",
        x,
        rotate: config.rotate,
        width: config.width,
        height: config.height,
        zIndex: config.zIndex,
      }}
      className="overflow-hidden rounded-lg shadow-xl will-change-transform"
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 768px) 55vw, 28vw"
        className="object-cover"
        loading="lazy"
        aria-hidden="true"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) parent.style.background = "oklch(0.9 0 0)";
        }}
      />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Reduced-motion static fallback
// ---------------------------------------------------------------------------

function StaticCollage() {
  const POSITIONS: React.CSSProperties[] = [
    { top: "5%", left: "3%", width: "30%", height: "22%", rotate: "-4deg" },
    { bottom: "8%", left: "5%", width: "26%", height: "34%", rotate: "3deg" },
    { top: "12%", right: "2%", width: "28%", height: "20%", rotate: "5deg" },
    { bottom: "12%", right: "4%", width: "24%", height: "30%", rotate: "-3deg" },
    { top: "42%", left: "38%", width: "24%", height: "18%", rotate: "6deg" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {homeContent.aboutImages.map((img, i) => (
        <div
          key={img.src}
          className="absolute overflow-hidden rounded-lg shadow-lg"
          style={POSITIONS[i]}
          aria-hidden="true"
        >
          <Image
            src={img.src}
            alt=""
            fill
            sizes="30vw"
            className="object-cover"
            loading="lazy"
            aria-hidden="true"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) parent.style.background = "oklch(0.9 0 0)";
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function AboutCursorImages() {
  const { aboutTeaser } = homeContent;
  const sectionRef = useRef<HTMLElement>(null);
  // Reactive breakpoint detection — updates whenever the viewport crosses 768px.
  // Lazy initializer seeds the correct value on mount; the effect keeps it in sync.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767.5px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.5px)");
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
    };
  }, []);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const configs = isMobile ? IMAGE_CONFIGS_MOBILE : IMAGE_CONFIGS;

  return (
    <section
      ref={sectionRef}
      aria-label="About"
      className="bg-background relative"
      style={{ height: isMobile ? "250dvh" : "300dvh" }}
    >
      {/* Sticky viewport — keeps text and images in view during the scroll */}
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {reducedMotion ? (
          // Reduced-motion: static collage behind text
          <>
            <StaticCollage />
            <div className="relative z-10 flex h-full items-center justify-center px-4">
              <TextContent aboutTeaser={aboutTeaser} />
            </div>
          </>
        ) : (
          <>
            {/* Scroll-panning images */}
            <div className="pointer-events-none absolute inset-0">
              {homeContent.aboutImages.map((img, i) => (
                <ScrollPanImage
                  key={img.src}
                  src={img.src}
                  config={configs[i]}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </div>

            {/* Centered text — z-10 so images alternate in front/behind */}
            <div className="relative z-10 flex h-full items-center justify-center px-4">
              <TextContent aboutTeaser={aboutTeaser} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Bio text block — extracted for reuse in both paths
// ---------------------------------------------------------------------------

interface AboutTeaser {
  bio: string;
  linkLabel: string;
  linkHref: string;
}

function TextContent({ aboutTeaser }: { aboutTeaser: AboutTeaser }) {
  return (
    <Container width="narrow">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
        <p className="font-display text-foreground text-2xl leading-snug font-semibold tracking-tight text-balance sm:text-3xl">
          {aboutTeaser.bio}
        </p>
        <Link
          href={aboutTeaser.linkHref}
          className="focus-ring text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-sm font-mono text-sm underline-offset-4 transition-colors hover:underline"
        >
          {aboutTeaser.linkLabel}
          <span aria-hidden="true" className="transition-transform duration-150">
            →
          </span>
        </Link>
      </div>
    </Container>
  );
}
