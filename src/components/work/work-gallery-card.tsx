import Image from "next/image";
import Link from "next/link";

import { PixelTransition } from "@/components/ui/pixel-transition";
import { cn } from "@/lib/utils";
import type { Work } from "@/lib/content/works";

/*
 * WorkGalleryCard — full-bleed image card for the /work listing grid.
 *
 * Anatomy (3 layers when hoverImage is present):
 *   ┌──────────────────────────────┐
 *   │  [Hover image — z-0]         │  always rendered below
 *   │  [Pixel grid — z-10]         │  default image sliced into N×N cells
 *   │  [Gradient — z-20]           │  mobile: always visible; desktop: hover/focus
 *   │  [Category + title — z-30]   │  mobile: always visible; desktop: hover/focus
 *   └──────────────────────────────┘
 *
 * When hoverImage is absent: static full-bleed card with the same overlay rules.
 *
 * Overlay visibility:
 *   Mobile (<md):   gradient + text always visible.
 *   Desktop (≥md):  gradient + text appear on group-hover / group-focus-visible.
 */

interface WorkGalleryCardProps {
  work: Work;
  className?: string;
}

const CARD_SIZES = "(min-width: 768px) 50vw, 100vw";

/** Gradient + text overlay, shared between both branches. */
function CardOverlay({
  title,
  category,
  tags,
}: {
  title: string;
  category: string;
  tags: string[];
}) {
  return (
    <>
      {/* Gradient scrim — visible on mobile always; desktop via parent group */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          // Mobile: always on
          "opacity-100",
          // Desktop: off by default, on via group-hover/focus
          "md:opacity-0 md:transition-opacity md:duration-300",
          "md:group-hover:opacity-100 md:group-focus-visible:opacity-100",
        )}
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Text block */}
      <div
        className={cn(
          "absolute bottom-0 left-0 z-10 flex flex-col gap-2 p-4 sm:p-5",
          // Mobile: always visible and in position
          "translate-y-0 opacity-100",
          // Desktop: hidden and offset; revealed on group-hover/focus
          "md:translate-y-2 md:opacity-0",
          "md:transition-all md:duration-300 md:ease-out",
          "md:group-hover:translate-y-0 md:group-hover:opacity-100",
          "md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100",
        )}
      >
        <span className="font-mono text-xs tracking-widest text-white/70 uppercase">
          {category}
        </span>

        <h3 className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
          {title}
        </h3>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-white/90 uppercase backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function WorkGalleryCard({ work, className }: WorkGalleryCardProps) {
  const { frontmatter } = work;
  const cardStyle = { aspectRatio: "16/9" };

  return (
    <Link
      href={`/work/${frontmatter.slug}`}
      data-slot="work-gallery-card"
      data-work-slug={frontmatter.slug}
      className={cn("group focus-ring relative block cursor-pointer", className)}
      aria-label={`${frontmatter.title} — ${frontmatter.category}`}
    >
      {frontmatter.hoverImage ? (
        <PixelTransition
          defaultImageSrc={frontmatter.coverImage}
          hoverImageSrc={frontmatter.hoverImage}
          alt={`${frontmatter.title} cover`}
          sizes={CARD_SIZES}
          priority={frontmatter.order === 1}
          className="bg-muted w-full"
          style={cardStyle}
        >
          <CardOverlay
            title={frontmatter.title}
            category={frontmatter.category}
            tags={frontmatter.tags}
          />
        </PixelTransition>
      ) : (
        <div className="bg-muted relative w-full overflow-hidden" style={cardStyle}>
          <Image
            src={frontmatter.coverImage}
            alt={`${frontmatter.title} cover`}
            fill
            sizes={CARD_SIZES}
            priority={frontmatter.order === 1}
            className="object-cover"
          />
          <CardOverlay
            title={frontmatter.title}
            category={frontmatter.category}
            tags={frontmatter.tags}
          />
        </div>
      )}
    </Link>
  );
}
