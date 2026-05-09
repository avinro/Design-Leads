/*
 * Testimonials content layer.
 *
 * Schema is designed to be compatible with an eventual Typeform integration
 * (firstName, lastName, company, role, quote, avatar).
 *
 * For now, testimonials are seeded manually here. Remote/database loading
 * would require backend changes and is explicitly out of scope for this phase.
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
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    firstName: "Sofia",
    lastName: "Martínez",
    company: "HelloDojo",
    role: "CEO",
    quote:
      "Working with Ary didn't just improve our product — it helped us define it. The result is something we could actually ship and scale.",
    avatar: undefined,
  },
  {
    id: "t2",
    firstName: "Marco",
    lastName: "Torres",
    company: "UMA",
    role: "Head of Product",
    quote:
      "Ary brings a rare combination of strategic thinking and hands-on execution. He turned our vague requirements into a product the whole team is proud of.",
    avatar: undefined,
  },
  {
    id: "t3",
    firstName: "Priya",
    lastName: "Nair",
    company: "Fintech Studio",
    role: "Co-founder",
    quote:
      "We went from a cluttered roadmap to a focused MVP in three weeks. The clarity Ary brought to our design process was exactly what we needed.",
    avatar: undefined,
  },
  {
    id: "t4",
    firstName: "James",
    lastName: "Okafor",
    company: "Stacklane",
    role: "CTO",
    quote:
      "Most designers hand off specs and disappear. Ary stayed in the build loop with us — catching edge cases we never would have caught on our own.",
    avatar: undefined,
  },
  {
    id: "t5",
    firstName: "Laura",
    lastName: "Schreiber",
    company: "Forma Health",
    role: "Director of Design",
    quote:
      "The systems Ary put in place didn't just solve our immediate problem — they gave our team a language to keep building on. That's the rarest kind of output.",
    avatar: undefined,
  },
];
