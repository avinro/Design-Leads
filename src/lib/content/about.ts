/*
 * About page content — centralised copy.
 *
 * All text lives here so copy can be updated without touching component files.
 * Each field is explicitly typed so TypeScript catches missing keys when the
 * shape evolves.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExperienceEntry {
  /** Date range string, e.g. "Mar 2023 – 2025", rendered in mono tabular-nums. */
  year: string;
  role: string;
  company: string;
  /** 2–3 sentence outcome or context for the role. */
  outcome: string;
}

export interface EducationEntry {
  /** Year range string, e.g. "2012–2018". Omit when description replaces the date slot. */
  years: string;
  degree: string;
  institution: string;
  /** Optional prose description shown below degree/institution instead of the year slot. */
  description?: string;
}

export interface ToolGroup {
  label: string;
  items: string[];
}

export interface ProcessStage {
  number: string;
  title: string;
  subtitle: string;
  body: string;
}

export interface AboutContent {
  hero: {
    /** 3–5 sentence bio. Product Design Engineer is the primary identity. */
    bio: string[];
  };
  experience: {
    sectionTitle: string;
    entries: ExperienceEntry[];
  };
  education: {
    sectionTitle: string;
    entries: EducationEntry[];
  };
  tools: {
    sectionTitle: string;
    groups: ToolGroup[];
  };
  process: {
    sectionTitle: string;
    intro: string;
    stages: ProcessStage[];
  };
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export const aboutContent: AboutContent = {
  hero: {
    bio: [
      "I'm Ary — Product Design Engineer working at the intersection of strategy, design, and execution.",
      "I help teams turn unclear ideas into structured products they can actually ship. My work spans 0→1 products, multi-app ecosystems, and design systems built to last beyond the first release.",
      "I care deeply about the gap between concept and delivery — and I've spent the last several years closing it across different industries, team sizes, and constraints.",
    ],
  },

  experience: {
    sectionTitle: "Experience",
    entries: [
      {
        year: "2025 – present",
        role: "Product Design Engineer Lead",
        company: "helloDojo",
        outcome:
          "Lead the end-to-end UX across a multi-surface ecosystem — customer, driver, vendor, and fleet portals. Built the design system from zero and pair design with AI-assisted front-end using Cursor and Claude to close the gap between Figma and production code.",
      },
      {
        year: "Mar 2023 – 2025",
        role: "Senior Product Designer",
        company: "110 Theory",
        outcome:
          "Led mobile UX for the Baptist Health iOS and Android app and designed Smart TV interfaces deployed across hospital environments. Defined features alongside product and engineering, connecting UX decisions to operational KPIs and measurable outcomes.",
      },
      {
        year: "Nov 2022 – May 2023",
        role: "Product Designer",
        company: "Alyssum Digital",
        outcome:
          "Designed end-to-end UX and UI for digital product clients in an agency setting. Shipped responsive web and mobile work across multiple concurrent projects on tight iteration cycles.",
      },
      {
        year: "May 2022 – Oct 2022",
        role: "UI/UX & Branding Designer",
        company: "G Estudios Multimedia",
        outcome:
          "Delivered UI/UX, motion graphics, and brand identity work for client accounts across multiple industries. Took projects from concept to production-ready visual systems.",
      },
      {
        year: "Jan 2018 – Jan 2021",
        role: "Branding & Motion Designer",
        company: "Union of Journalists of Cuba",
        outcome:
          "Owned brand identity and motion design for institutional communications, visual campaigns, and editorial output over three years.",
      },
    ],
  },

  education: {
    sectionTitle: "Education",
    entries: [
      {
        years: "2012–2018",
        degree: "BA Visual Communication Design",
        institution: "University of Havana, Cuba",
        description:
          "Five-year programme covering the foundations of visual communication: typography, grid systems, colour theory, image, and design history. During my fifth year I specialised in UI/UX design — focusing on interaction principles, user-centred methods, and digital interface design.",
      },
    ],
  },

  tools: {
    sectionTitle: "Tools & methods",
    groups: [
      {
        label: "Design",
        items: [
          "Product Design",
          "Interaction Design",
          "Information Architecture",
          "Prototyping",
          "Mobile-First",
          "Accessibility (WCAG)",
          "Design Systems",
          "Dev Handoff",
        ],
      },
      {
        label: "AI & Front-End",
        items: [
          "Cursor",
          "Claude",
          "v0",
          "AI-assisted UI",
          "React / React Native",
          "Next.js",
          "TypeScript",
          "Tailwind",
        ],
      },
      {
        label: "Product & Tools",
        items: [
          "Product Strategy",
          "Journey Mapping",
          "Cross-functional Collaboration",
          "Agile / Scrum",
          "Figma",
          "Linear",
          "GitHub",
          "Vercel",
        ],
      },
    ],
  },

  process: {
    sectionTitle: "My Process",
    intro:
      "My process moves between strategy, systems, and implementation until the product is clear enough to build.",
    stages: [
      {
        number: "01",
        title: "Discover",
        subtitle: "Audit, research, benchmarking",
        body: "I start by mapping the product landscape: what exists, where the interface breaks, and what users are trying to accomplish. For 0→1 work, I use research and AI-assisted synthesis to find the patterns before touching the canvas.",
      },
      {
        number: "02",
        title: "Define",
        subtitle: "Framing, IA, strategic flows",
        body: "I turn raw input into structure: jobs-to-be-done, information architecture, product constraints, and high-level flows. This is where product and systems thinking enter the design work, so the UI solves a specific pain point instead of decorating uncertainty.",
      },
      {
        number: "03",
        title: "Design",
        subtitle: "Lo-fi → logic → hi-fi",
        body: "I work from low fidelity into interaction logic before polishing the visual layer. Mobile-first by default: hierarchy, states, and edge cases have to hold up before desktop density or brand expression gets layered in.",
      },
      {
        number: "04",
        title: "Validate",
        subtitle: "Prototypes & usability",
        body: "I prototype the key flows and test them against real tasks, especially the moments where users can get stuck. The goal is to expose wrong assumptions early, not after engineering has already paid for them.",
      },
      {
        number: "05",
        title: "Deliver",
        subtitle: "Handoff, code, design QA",
        body: "I hand off organised tokens, documented states, and accessibility specs, then stay close during implementation. When useful, I build or review front-end with Cursor and Claude to close the gap between Figma intent and production quality.",
      },
    ],
  },
};
