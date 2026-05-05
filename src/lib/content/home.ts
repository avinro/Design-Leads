/*
 * Home page content — centralised copy.
 *
 * All text lives here so copy can be updated without touching component files.
 * Each field is explicitly typed so TypeScript catches missing keys when the
 * shape evolves.
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
    cases: WorkCase[];
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
    circularText: "STRATEGY * EXECUTION * SHIPPED * ",
    secondaryCta: "See the work",
    secondaryCtaHref: "/work",
  },
  workDivider: {
    text: "SELECTED WORK \u2022 ",
  },
  selectedWork: {
    sectionTitle: "Selected work",
    body: "A selection of 0→1 products and multi-app systems. Each one started as an unclear idea — and ended up shipped.",
    cases: [
      {
        slug: "uma",
        title: "UMA",
        summary:
          "Took a wellness platform from early concept to a structured product with a complete UX system — ready for a dev team to pick up and build.",
        tags: ["Product strategy", "UX system", "Web app"],
        gradient: "from-violet-500 to-purple-700",
      },
      {
        slug: "hello-dojo",
        title: "Hello Dojo",
        summary:
          "Designed the full product ecosystem — customer app, driver app, vendor portal — and unified them into a single design system that the team can actually maintain.",
        tags: ["Product design", "Multi-app system", "Design system"],
        gradient: "from-orange-400 to-rose-600",
      },
      {
        slug: "project-3",
        title: "Project 3",
        summary: "Placeholder — replace with real project copy.",
        tags: ["Product design", "Strategy"],
        gradient: "from-sky-400 to-indigo-600",
      },
    ],
  },
  socialProof: {
    sectionTitle: "Trusted by",
    testimonial: {
      quote:
        "Working with Avinro didn't just improve our product — it helped us define it. The result is something we could actually ship and scale.",
      author: "Client Name",
      role: "CEO, Company",
    },
    logoCount: 4,
  },
  aboutTeaser: {
    sectionTitle: "About",
    bio: "I'm Avinro. Lead Product Designer working at the intersection of product, design and execution. I help teams go from unclear ideas to structured products — and ship them.",
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
