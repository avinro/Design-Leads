/*
 * Contact page content — centralised copy.
 *
 * All user-facing strings live here so they can be updated without touching
 * component or server-action files. Follows the same pattern as about.ts.
 */

import { SOCIAL_LINKS } from "@/lib/seo/site";

export interface SocialLink {
  label: string;
  href: string;
  /** Renders a non-interactive "Soon" badge instead of a live link. */
  comingSoon?: boolean;
}

export interface ContactContent {
  hero: {
    kicker: string;
    heading: string;
    subheading: string;
  };
  aside: {
    sectionLabel: string;
    // TODO: add CV download entry here when the asset is ready
    socials: SocialLink[];
  };
  form: {
    fields: {
      name: { label: string; placeholder: string };
      email: { label: string; placeholder: string };
      company: { label: string; placeholder: string; description: string };
      message: { label: string; placeholder: string; description: string };
    };
    submit: string;
    submitting: string;
  };
  success: {
    heading: string;
    body: string;
    reset: string;
  };
  error: {
    generic: string;
  };
}

export const contactContent: ContactContent = {
  hero: {
    kicker: "Contact",
    heading: "Let's build something worth shipping.",
    subheading:
      "Have a project in mind, a team that needs direction, or an idea you're not sure how to structure? Send a message and I'll get back to you.",
  },
  aside: {
    sectionLabel: "Find me online",
    socials: [
      { label: "LinkedIn", href: SOCIAL_LINKS.linkedin },
      { label: "Behance", href: SOCIAL_LINKS.behance },
      { label: "GitHub", href: SOCIAL_LINKS.github },
      { label: "Instagram", href: SOCIAL_LINKS.instagram },
      { label: "X", href: SOCIAL_LINKS.x },
      { label: "Dribbble", href: "#", comingSoon: true },
    ],
  },
  form: {
    fields: {
      name: {
        label: "Name",
        placeholder: "Your name",
      },
      email: {
        label: "Email",
        placeholder: "you@company.com",
      },
      company: {
        label: "Company",
        placeholder: "Where are you based?",
        description: "Optional",
      },
      message: {
        label: "Message",
        placeholder: "Tell me what you're working on and where you're stuck.",
        description: "At least 20 characters.",
      },
    },
    submit: "Send message",
    submitting: "Sending…",
  },
  success: {
    heading: "Message sent.",
    body: "I'll reply within 1–2 business days. If it's urgent, email me directly at avinroart@gmail.com.",
    reset: "Send another message",
  },
  error: {
    generic: "Something went wrong — please try again or email avinroart@gmail.com directly.",
  },
};
