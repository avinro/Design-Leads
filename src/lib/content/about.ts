/*
 * About page content — centralised copy.
 *
 * All text lives here so copy can be updated without touching component files.
 * Each field is explicitly typed so TypeScript catches missing keys when the
 * shape evolves.
 *
 * IMPORTANT — experience entries are placeholder data.
 * Replace each entry with your real role, company, year, and outcome before
 * launching the page publicly. The placeholder format is intentional so they
 * are clearly identifiable in code review.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExperienceEntry {
  /** Four-digit year, rendered in mono tabular-nums. */
  year: string;
  role: string;
  company: string;
  /** One-line outcome or context for the role. */
  outcome: string;
}

export interface ToolGroup {
  label: string;
  items: string[];
}

export interface AboutContent {
  hero: {
    /** 3–5 sentence bio. Product Designer is the primary identity. */
    bio: string[];
  };
  experience: {
    sectionTitle: string;
    entries: ExperienceEntry[];
  };
  tools: {
    sectionTitle: string;
    groups: ToolGroup[];
  };
  philosophy: {
    sectionTitle: string;
    body: string;
  };
  /**
   * PM / strategy layer.
   * Framed as a complement to design, never as a parallel or separate service.
   * Acceptance criteria: "PM mentioned as strategic complement, not a separate service."
   */
  pmLayer: {
    sectionTitle: string;
    body: string;
  };
  cta: {
    sectionTitle: string;
    /** Primary CTA — mailto until /contact ships (PRO F1-8). */
    primaryLabel: string;
    primaryHref: string;
    /** Resume download — requires public/resume.pdf. */
    resumeLabel: string;
    resumeHref: string;
  };
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export const aboutContent: AboutContent = {
  hero: {
    bio: [
      "I'm Ary — Lead Product Designer working at the intersection of strategy, design, and execution.",
      "I help teams turn unclear ideas into structured products they can actually ship. My work spans 0→1 products, multi-app ecosystems, and design systems built to last beyond the first release.",
      "I care deeply about the gap between concept and delivery — and I've spent the last several years closing it across different industries, team sizes, and constraints.",
    ],
  },

  experience: {
    sectionTitle: "Experience",
    entries: [
      // PLACEHOLDER — replace with your real roles before going live
      {
        year: "YYYY",
        role: "Lead Product Designer",
        company: "Company Name",
        outcome: "Short outcome or context for this role.",
      },
      {
        year: "YYYY",
        role: "Senior Product Designer",
        company: "Company Name",
        outcome: "Short outcome or context for this role.",
      },
      {
        year: "YYYY",
        role: "Product Designer",
        company: "Company Name",
        outcome: "Short outcome or context for this role.",
      },
      {
        year: "YYYY",
        role: "UX Designer",
        company: "Company Name",
        outcome: "Short outcome or context for this role.",
      },
    ],
  },

  tools: {
    sectionTitle: "Tools & methods",
    groups: [
      {
        label: "Design",
        items: ["Figma", "Design systems", "Component libraries", "Prototyping", "Visual design"],
      },
      {
        label: "Research",
        items: [
          "User interviews",
          "Usability testing",
          "Jobs-to-be-done",
          "Competitive analysis",
          "Journey mapping",
        ],
      },
      {
        label: "Process",
        items: ["Notion", "Linear", "Design critiques", "Async documentation", "Spec writing"],
      },
    ],
  },

  philosophy: {
    sectionTitle: "Design philosophy",
    body: "Good design is not about making things look polished — it is about making the right decisions at the right moment. I work closest to the problem: understanding the constraints, finding the simplest path through them, and shipping something that actually holds up in production. Craft matters, but only when it is pointed at the right target.",
  },

  pmLayer: {
    sectionTitle: "Strategy & PM",
    body: "Most of my projects require thinking beyond the interface — understanding priorities, trade-offs, and how a product fits into a broader business model. That strategic layer is not a separate service; it is how I do design well. A product that is beautifully designed but strategically misaligned does not help anyone.",
  },

  cta: {
    sectionTitle: "Let's work together",
    primaryLabel: "Let's talk",
    primaryHref: "/contact",
    resumeLabel: "Download resume",
    resumeHref: "/resume.pdf",
  },
};
