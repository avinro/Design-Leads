import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/lib/content/works";

/*
 * WorkGalleryFigure — full-width gallery image with optional caption.
 *
 * Used on /work/[slug] detail pages to render gallery items from frontmatter.
 * Different from the MDX <Figure> primitive: no prose width constraints, and
 * it accepts the GalleryItem shape directly.
 *
 * Aspect ratios:
 *   portrait  → 4/5   (default — tall, immersive)
 *   square    → 1/1
 *   landscape → 16/9
 *   wide      → 21/9  (panoramic — hero shots, spatial UI)
 *   natural   → no fixed frame; uses intrinsicWidth/intrinsicHeight for stable layout
 */

const ASPECT_RATIOS = {
  portrait: "4/5",
  square: "1/1",
  landscape: "16/9",
  wide: "21/9",
} as const;

interface WorkGalleryFigureProps {
  item: GalleryItem;
  priority?: boolean;
  className?: string;
}

export function WorkGalleryFigure({ item, priority = false, className }: WorkGalleryFigureProps) {
  if (item.aspect === "natural" && item.intrinsicWidth != null && item.intrinsicHeight != null) {
    return (
      <figure className={cn("w-full", className)}>
        <div className="bg-muted w-full min-w-0 overflow-hidden rounded-xl">
          <Image
            src={item.src}
            alt={item.alt}
            width={item.intrinsicWidth}
            height={item.intrinsicHeight}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
            className="h-auto w-full max-w-full"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        {item.caption && (
          <figcaption className="text-muted-foreground mt-3 text-sm leading-relaxed">
            {item.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  const aspectKey: keyof typeof ASPECT_RATIOS =
    item.aspect === "portrait" ||
    item.aspect === "square" ||
    item.aspect === "landscape" ||
    item.aspect === "wide"
      ? item.aspect
      : "portrait";
  const aspectRatio = ASPECT_RATIOS[aspectKey];

  return (
    <figure className={cn("w-full", className)}>
      <div
        className="bg-muted relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: aspectRatio }}
      >
        <Image
          src={item.src}
          alt={item.alt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
          className="object-cover"
        />
      </div>
      {item.caption && (
        <figcaption className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}
