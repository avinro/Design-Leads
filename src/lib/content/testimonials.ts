/*
 * Testimonials content layer.
 *
 * Schema is designed to be compatible with an eventual Typeform integration
 * (firstName, lastName, company, role, quote, avatar).
 *
 * For now, testimonials are seeded manually here. Remote/database loading
 * would require backend changes and is explicitly out of scope for this phase.
 *
 * linkedInUrl: optional external profile link; keep host linkedin.com if URLs
 * ever move to a CMS (allowlist at integration time).
 */

export interface Testimonial {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  quote: string;
  /** Optional path to an avatar image in public/ */
  avatar?: string;
  /** Public LinkedIn profile URL — name is linked when set */
  linkedInUrl?: string;
  /** BCP 47 tag for quote language (e.g. es) for Language of Parts a11y */
  quoteLang?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t2",
    firstName: "Gonzo",
    lastName: "Torres",
    company: "UMA",
    role: "CEO",
    quote:
      "The challenge was making receipt capture feel effortless. Ary simplified the flow, cut the scope, and made UMA's core product feel obvious.",
  },
  {
    id: "t3",
    firstName: "Laura",
    lastName: "Acosta",
    company: "Alyssum Digital",
    role: "Founder",
    linkedInUrl: "https://www.linkedin.com/in/laura-acosta-sherman-ab0561207/",
    quote:
      "Across multiple client projects, consistency was the hard part. Ary kept UX and UI sharp, moved fast, and delivered work our teams could use.",
  },
  {
    id: "t4",
    firstName: "Eduardo",
    lastName: "Salvatierra",
    company: "110 Theory",
    role: "Product Design Lead",
    linkedInUrl: "https://www.linkedin.com/in/eduardo-salvatierra-visual-designer/",
    quoteLang: "es",
    quote:
      "En un equipo, el detalle y la colaboración importan mucho. Ary fue comprometido, proactivo, empático y aportó muy buen criterio en UI, UX y diseño visual.",
  },
  {
    id: "t5",
    firstName: "Adam",
    lastName: "Noonan",
    company: "helloDojo",
    role: "CTO",
    linkedInUrl: "https://www.linkedin.com/in/adam-noonan/",
    quote:
      "Build churn was the risk. Ary clarified flows, states, and edge cases, then stayed close to implementation so the experience held together.",
  },
  {
    id: "t6",
    firstName: "Scott",
    lastName: "Witters",
    company: "Samachi",
    role: "CEO",
    linkedInUrl: "https://www.linkedin.com/in/scottwitters/",
    quote:
      "The idea was messy and needed focus. Ary brought it back to the user problem, reduced the scope, and helped us shape something we could actually test.",
  },
  {
    id: "t7",
    firstName: "Justin",
    lastName: "DeTolla",
    company: "110 Theory",
    role: "Founder",
    linkedInUrl: "https://www.linkedin.com/in/justin-detolla-2595434/",
    quote:
      "Complex product work needs real ownership. Ary worked closely with product and engineering, and kept UX decisions tied to practical outcomes.",
  },
];
