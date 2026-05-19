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
     * Opening line for IntroOpener: mobile-first copy with explicit newline breaks (`\n`).
     * IntroOpener picks mobile vs desktop at mount (Tailwind md breakpoint).
     */
    phrase1: { mobile: string; desktop: string };
    /** Second line typed after the first (delete-then-type sequence). */
    phrase2: string;
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
    /** Text shown inside CircularText on hover — signals navigation to About. */
    circularTextHover: string;
    primaryCta: string;
    primaryCtaHref: string;
    downloadCta: string;
    downloadCtaHref: string;
    /** Profile photo inside the hero CircularText ring (path under public/). */
    profileImageSrc: string;
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
    greeting: string;
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
   * Order matches scroll choreography slots in about-cursor-images.tsx.
   */
  aboutImages: AboutImage[];
}

export const homeContent: HomeContent = {
  intro: {
    phrase1: {
      mobile: "Most ideas die\nbetween\nvision and execution.",
      desktop: "Most ideas die\nbetween vision and execution.",
    },
    phrase2: "I close that gap.",
  },
  hero: {
    badgeText: "Open to Work",
    headline: "Product Design Engineer shipping vision into reality",
    subheadline:
      "I've shipped SaaS products for B2B and B2C teams — from 0→1 discovery to launch. Most projects fail between idea and execution; I help close that gap.",
    circularText: "Strategy & execution · Product design · ",
    circularTextHover: "Get to know me · My Background · ",
    primaryCta: "Explore my work",
    primaryCtaHref: "/work",
    downloadCta: "Download CV",
    downloadCtaHref: "/AryVincench_CV_2026.pdf",
    profileImageSrc: "/images/pfp.jpg",
  },
  workDivider: {
    text: "SELECTED WORK \u2022 ",
  },
  selectedWork: {
    sectionTitle: "Selected work",
    body: "A selection of 0→1 products and multi-app systems. Each one started as an unclear idea — and ended up shipped.",
  },
  socialProof: {
    sectionTitle: "Testimonials",
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
    greeting: "Hey, I'm Ary",
    bio: "Designer, builder, problem solver. Outside of work, probably traveling, working out, watching anime, or spending time with people I care about.",
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
  // About section floating images (see IMAGE_CONFIGS in about-cursor-images.tsx).
  // Order maps to slot index 0–4: 0/2/4 = landscape frames (~1.38 / ~1.18), 1/3 = portrait (~0.73).
  // Asset mix is 2× 4:3 landscape + 3× 3:4 portrait; slot 4 uses a portrait in a landscape frame (object-cover crops sides).
  aboutImages: [
    { src: "/about/lifestyle/01.webp", alt: "" },
    { src: "/about/lifestyle/02.webp", alt: "" },
    { src: "/about/lifestyle/03.webp", alt: "" },
    { src: "/about/lifestyle/04.webp", alt: "" },
    { src: "/about/lifestyle/05.webp", alt: "" },
  ],
};

/**
 * Meta description for the homepage and root layout SEO / social fallbacks.
 * Single source of truth with the hero H1 (`hero.headline` in HomeHero).
 */
export const siteMetaDescription = homeContent.hero.headline;
