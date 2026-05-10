"use client";

import { useEffect, useRef } from "react";
import type React from "react";
import Image from "next/image";

import type { Testimonial } from "@/lib/content/testimonials";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

/*
 * TestimonialsCarousel — infinite rAF marquee driven by transform.
 *
 * Mechanism:
 *   The track renders two identical copies of the card list. A rAF loop
 *   decrements an offset ref by PIXELS_PER_SECOND each frame and writes it
 *   directly to track.style.transform. When the offset reaches -halfWidth
 *   (= exactly one copy's width, including all gaps), it resets by adding
 *   halfWidth back — making the jump invisible since both halves are
 *   pixel-identical.
 *
 *   Using transform instead of scrollLeft keeps the animation GPU-composited
 *   and avoids conflicts with Lenis and native touch-scroll on mobile.
 *
 * Hover slowdown: speedRef.current is set to 0.1 on mouseenter and restored
 *   to 1 on mouseleave — the rAF multiplies PIXELS_PER_SECOND by this value
 *   each frame, so there is no discontinuity.
 *
 * Reduced motion: rAF is never started; the track is static.
 *
 * Accessibility:
 *   - Semantic track: full ARIA labels (role="group", aria-roledescription="slide").
 *   - Decorative track: aria-hidden="true", no roles — assistive technology
 *     sees exactly N testimonials, not 2N.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PIXELS_PER_SECOND = 40;

// ---------------------------------------------------------------------------
// TestimonialCard
// ---------------------------------------------------------------------------

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  total: number;
  /** When true the card is the decorative duplicate and must be hidden from AT. */
  decorative?: boolean;
}

function TestimonialCard({ testimonial, index, total, decorative }: TestimonialCardProps) {
  const fullName = `${testimonial.firstName} ${testimonial.lastName}`;

  return (
    <article
      role={decorative ? undefined : "group"}
      aria-roledescription={decorative ? undefined : "slide"}
      aria-label={
        decorative ? undefined : `Testimonial ${String(index + 1)} of ${String(total)}: ${fullName}`
      }
      aria-hidden={decorative ? true : undefined}
      // Fixed width ensures the duplicate copy is pixel-identical so the
      // transform loop wraps cleanly at the halfway point.
      className="w-[70vw] flex-shrink-0 sm:w-[400px] lg:w-[360px]"
    >
      <div className="border-border/40 flex h-full flex-col gap-6 rounded-xl border p-6 sm:p-8">
        {/* Quote */}
        <blockquote>
          <p className="text-foreground text-base leading-relaxed text-balance sm:text-lg">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </blockquote>

        {/* Attribution */}
        <figcaption className="mt-auto flex items-center gap-3">
          {testimonial.avatar && (
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={testimonial.avatar}
                alt={fullName}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground text-sm font-medium">{fullName}</span>
            <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
              {testimonial.role} · {testimonial.company}
            </span>
          </div>
        </figcaption>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// TestimonialsCarousel
// ---------------------------------------------------------------------------

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({ testimonials: items }: TestimonialsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Mutable speed multiplier: 1 = full speed, 0.1 = hover slowdown (10%).
  const speedRef = useRef(1);
  // Running pixel offset; negative = scrolled left.
  const offsetRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Skip autoplay for users who prefer reduced motion; track stays static.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000; // seconds since last frame
      lastTime = now;

      offsetRef.current -= PIXELS_PER_SECOND * speedRef.current * dt;

      // Wrap: the track is two identical copies, so halfWidth marks the
      // seam. Resetting by exactly halfWidth is invisible.
      const halfWidth = track.scrollWidth / 2;
      if (offsetRef.current <= -halfWidth) {
        offsetRef.current += halfWidth;
      }

      track.style.transform = `translateX(${String(offsetRef.current)}px)`;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleMouseEnter = () => {
    speedRef.current = 0.1;
  };
  const handleMouseLeave = () => {
    speedRef.current = 1;
  };

  if (!items.length) return null;

  return (
    <Section>
      <Container>
        <p className="text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase">
          Trusted by
        </p>

        {/*
         * Negative margins cancel Container's horizontal padding so the
         * overflow boundary sits at the Container's outer edge — at the
         * viewport edge on mobile and at max-w-6xl on desktop. The gradient
         * fades therefore align with the visible clip boundary on both sizes.
         */}
        <div
          className="relative -mx-4 mt-8 overflow-hidden sm:-mx-6 lg:-mx-8"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Fade — left edge */}
          <div
            aria-hidden="true"
            className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent sm:w-24"
          />
          {/* Fade — right edge */}
          <div
            aria-hidden="true"
            className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent sm:w-24"
          />

          {/*
           * Track — two identical copies rendered inline via flex.
           * The rAF loop writes translateX directly to this element's style.
           */}
          <div
            ref={trackRef}
            role="region"
            aria-label="Client testimonials"
            aria-roledescription="carousel"
            className="flex w-max gap-4 sm:gap-6"
          >
            {/* Semantic copy — visible to assistive technology */}
            {items.map((t, i) => (
              <TestimonialCard key={t.id} testimonial={t} index={i} total={items.length} />
            ))}

            {/* Decorative copy — pixel-identical so the wrap is seamless; hidden from AT */}
            {items.map((t) => (
              <TestimonialCard
                key={`${t.id}-dupe`}
                testimonial={t}
                index={0}
                total={0}
                decorative
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
