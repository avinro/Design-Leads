/*
 * Home page content — centralised copy.
 *
 * All text lives here so copy can be updated without touching component files.
 * Each field is explicitly typed so TypeScript catches missing keys when the
 * shape evolves.
 */

/**
 * WorkCase shape used by WorkCard.
 * Kept here for WorkCard's import — the actual data now comes from the MDX
 * content layer (src/lib/content/case-studies.ts), not from homeContent.
 */
export interface WorkCase {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  /** Tailwind gradient classes applied to the swatch bar placeholder */
  gradient: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface HomeContent {
  hero: {
    headline: string;
    subheadline: string;
    /**
     * Text rendered inside the CircularText component — the rotation visual
     * protagonist. Repeat the phrase with a separator (e.g. " * ") so the
     * circle looks full. Keep under ~24 chars per phrase to fit the circle.
     */
    circularText: string;
    /** Secondary in-page CTA — outline button, NOT the persistent primary */
    secondaryCta: string;
    secondaryCtaHref: string;
  };
  /**
   * Copy for the CurvedLoop chapter break between hero and selected work.
   * Use a short phrase with a separator that tiles naturally on a curve.
   */
  workDivider: {
    text: string;
  };
  selectedWork: {
    sectionTitle: string;
    /** Short framing sentence rendered below the section label */
    body: string;
    // cases removed (PRO-14): data is now sourced from MDX content layer.
  };
  socialProof: {
    sectionTitle: string;
    testimonial: Testimonial;
    /** Number of decorative client-logo placeholder blocks to render */
    logoCount: number;
  };
  aboutTeaser: {
    sectionTitle: string;
    bio: string;
    linkLabel: string;
    linkHref: string;
  };
  finalCta: {
    heading: string;
    /** Supporting text-link label — secondary, never variant="default" */
    linkLabel: string;
    linkHref: string;
  };
  /** Primary CTA rendered in SiteHeader (md+) and MobileCtaBar (<md) */
  primaryCta: {
    label: string;
    href: string;
  };
}

export const homeContent: HomeContent = {
  hero: {
    headline: "I turn product vision into shipped experiences.",
    subheadline:
      "Most projects fail in the gap between idea and execution. I help teams close it — from early concept to a product they can actually ship.",
    circularText: "Strategy & execution · Product design · ",
    secondaryCta: "See the work",
    secondaryCtaHref: "/work",
  },
  workDivider: {
    text: "SELECTED WORK \u2022 ",
  },
  selectedWork: {
    sectionTitle: "Selected work",
    body: "A selection of 0→1 products and multi-app systems. Each one started as an unclear idea — and ended up shipped.",
  },
  socialProof: {
    sectionTitle: "Trusted by",
    testimonial: {
      quote:
        "Working with Ary didn't just improve our product — it helped us define it. The result is something we could actually ship and scale.",
      author: "Client Name",
      role: "CEO, Company",
    },
    logoCount: 4,
  },
  aboutTeaser: {
    sectionTitle: "About",
    bio: "I'm Ary. Lead Product Designer working at the intersection of product, design and execution. I help teams go from unclear ideas to structured products — and ship them.",
    linkLabel: "More about me",
    linkHref: "/about",
  },
  finalCta: {
    heading: "Have something you're trying to build — but not sure how to structure or ship it?",
    linkLabel: "Let's talk",
    linkHref: "/contact",
  },
  primaryCta: {
    label: "Let's talk",
    href: "/contact",
  },
};
