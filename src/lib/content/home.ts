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

export interface AboutImage {
  src: string;
  /** Decorative alt — empty string means aria-hidden in usage */
  alt: string;
}

export interface HomeContent {
  intro: {
    /**
     * Phrases typed in sequence by IntroOpener (TextType). GAP narrative.
     * Total reading time tuned to ~3.5s including the final hold before exit.
     * Edit here — component reads from this array directly.
     */
    phrases: string[];
  };
  hero: {
    badgeText: string;
    headline: string;
    subheadline: string;
    /**
     * Text rendered inside the CircularText component — the rotation visual
     * protagonist. Repeat the phrase with a separator (e.g. " * ") so the
     * circle looks full. Keep under ~24 chars per phrase to fit the circle.
     */
    circularText: string;
    /** Text shown inside CircularText on hover — signals the element is a link to /contact. */
    circularTextHover: string;
    primaryCta: string;
    primaryCtaHref: string;
    downloadCta: string;
    downloadCtaHref: string;
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
  /**
   * Lifestyle / personal images shown as floating cursor-trail on desktop
   * and as a static parallax collage on mobile in the About section.
   * Use placeholder paths until real assets are provided.
   */
  aboutImages: AboutImage[];
}

export const homeContent: HomeContent = {
  intro: {
    phrases: ["Most ideas die\nbetween vision and execution.", "I close that gap."],
  },
  hero: {
    badgeText: "Open to Work",
    headline: "Product Design Engineer shipping vision into reality",
    subheadline:
      "I've shipped SaaS products for B2B and B2C teams — from 0→1 discovery to launch. Most projects fail between idea and execution; I help close that gap.",
    circularText: "Strategy & execution · Product design · ",
    circularTextHover: "Let's talk · Send me a message · ",
    primaryCta: "Explore my work",
    primaryCtaHref: "/work",
    downloadCta: "Download CV",
    downloadCtaHref: "/AryVincench_CV_2026.pdf",
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
    bio: "I'm Ary. Product Design Engineer working at the intersection of product, design and execution. I help teams go from unclear ideas to structured products — and ship them.",
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
  // Lifestyle images for the About cursor-trail section.
  // Replace these placeholder paths once real assets are available in public/.
  aboutImages: [
    { src: "/about/lifestyle/01.jpg", alt: "" },
    { src: "/about/lifestyle/02.jpg", alt: "" },
    { src: "/about/lifestyle/03.jpg", alt: "" },
    { src: "/about/lifestyle/04.jpg", alt: "" },
    { src: "/about/lifestyle/05.jpg", alt: "" },
  ],
};
