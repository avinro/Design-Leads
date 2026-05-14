import { Container } from "@/components/layout/container";
import { WorkGalleryCard } from "./work-gallery-card";
import type { Work } from "@/lib/content/works";

/*
 * WorkGalleryGrid — editorial asymmetric grid for /work.
 *
 * Layout rules (mobile-first):
 *   - 1 column on mobile.
 *   - 2 columns from md upward.
 *   - featured === true  → col-span-2 (full row — dominant project).
 *   - featured === false → col-span-1 (half-row card).
 *
 * Addresses the "scattered attention" critique of flat thumbnail grids by
 * giving featured work visual weight over standard items.
 *
 * Cards use portrait (4:5) aspect ratio by default — visually distinct from
 * case-study cards (16:9) so the two domains feel different at a glance.
 */

interface WorkGalleryGridProps {
  works: Work[];
}

export function WorkGalleryGrid({ works }: WorkGalleryGridProps) {
  return (
    <Container>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2" aria-label="Visual work">
        {works.map((work) => (
          <li key={work.frontmatter.slug}>
            <WorkGalleryCard work={work} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
