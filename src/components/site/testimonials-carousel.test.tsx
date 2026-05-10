import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TestimonialsCarousel } from "./testimonials-carousel";
import type { Testimonial } from "@/lib/content/testimonials";

/*
 * TestimonialsCarousel tests.
 *
 * The component uses a rAF loop that writes translateX directly to the track
 * element's style — no Embla, no scrollLeft, no DOM APIs needed for the
 * static shape. SSR render via renderToStaticMarkup covers structure,
 * content, and accessibility.
 *
 * rAF / transform behaviour is browser-only and is covered by visual QA.
 *
 * Covers:
 *   - Renders without crashing.
 *   - All testimonial quotes are present.
 *   - Author attribution (name + role · company) is rendered.
 *   - ARIA region/roledescription on the track.
 *   - Slide role/roledescription on semantic cards only (not the duplicate track).
 *   - No prev/next arrow buttons.
 *   - Duplicate track is present and marked aria-hidden.
 *   - Marquee wrapper carries overflow-hidden.
 *   - Kicker "Trusted by" is rendered.
 *   - Returns null for empty testimonials array.
 */

const mockTestimonials: Testimonial[] = [
  {
    id: "t1",
    firstName: "Sofia",
    lastName: "Martínez",
    company: "HelloDojo",
    role: "CEO",
    quote: "Working with Ary didn't just improve our product — it helped us define it.",
  },
  {
    id: "t2",
    firstName: "Marco",
    lastName: "Torres",
    company: "UMA",
    role: "Head of Product",
    quote: "Ary brings a rare combination of strategic thinking and hands-on execution.",
  },
];

describe("TestimonialsCarousel", () => {
  it("renders without crashing in SSR", () => {
    expect(() =>
      renderToStaticMarkup(<TestimonialsCarousel testimonials={mockTestimonials} />),
    ).not.toThrow();
  });

  it("returns null for empty testimonials array", () => {
    const html = renderToStaticMarkup(<TestimonialsCarousel testimonials={[]} />);
    expect(html).toBe("");
  });

  it("renders all testimonial quotes", () => {
    const html = renderToStaticMarkup(<TestimonialsCarousel testimonials={mockTestimonials} />);
    expect(html).toContain("it helped us define it");
    expect(html).toContain("hands-on execution");
  });

  it("renders author name and attribution for each testimonial", () => {
    const html = renderToStaticMarkup(<TestimonialsCarousel testimonials={mockTestimonials} />);
    expect(html).toContain("Sofia Martínez");
    expect(html).toContain("Marco Torres");
    expect(html).toContain("CEO · HelloDojo");
    expect(html).toContain("Head of Product · UMA");
  });

  it("renders carousel ARIA region and roledescription", () => {
    const html = renderToStaticMarkup(<TestimonialsCarousel testimonials={mockTestimonials} />);
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html).toContain('aria-label="Client testimonials"');
  });

  it("renders slide role and roledescription only on semantic cards (not the duplicate track)", () => {
    const html = renderToStaticMarkup(<TestimonialsCarousel testimonials={mockTestimonials} />);
    // Only the semantic copy (N slides) should carry aria-roledescription="slide".
    const slideCount = (html.match(/aria-roledescription="slide"/g) ?? []).length;
    expect(slideCount).toBe(mockTestimonials.length);
  });

  it("does not render prev/next arrow buttons", () => {
    const html = renderToStaticMarkup(<TestimonialsCarousel testimonials={mockTestimonials} />);
    expect(html).not.toContain('aria-label="Previous testimonial"');
    expect(html).not.toContain('aria-label="Next testimonial"');
  });

  it("renders a decorative duplicate track that is aria-hidden", () => {
    const html = renderToStaticMarkup(<TestimonialsCarousel testimonials={mockTestimonials} />);
    expect(html).toContain('aria-hidden="true"');
  });

  it("marquee wrapper carries overflow-hidden", () => {
    const html = renderToStaticMarkup(<TestimonialsCarousel testimonials={mockTestimonials} />);
    expect(html).toContain("overflow-hidden");
  });

  it("renders the section kicker 'Trusted by'", () => {
    const html = renderToStaticMarkup(<TestimonialsCarousel testimonials={mockTestimonials} />);
    expect(html).toContain("Trusted by");
  });
});
