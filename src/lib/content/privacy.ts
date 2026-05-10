/*
 * Privacy page content — centralised copy.
 *
 * All user-facing strings live here so they can be updated without touching
 * the page component. Follows the same pattern as about.ts and contact.ts.
 */

export const privacyContent = {
  meta: {
    title: "Privacy",
    description:
      "How avinro.com uses analytics to understand visitor engagement — privacy-first, cookieless, and no third-party ad tracking.",
  },
  hero: {
    kicker: "Privacy",
    heading: "Simple, honest, cookieless.",
    subheading:
      "This site uses privacy-first analytics to understand how visitors engage with the portfolio. No cookies, no ad tracking, no Google Analytics.",
  },
  sections: [
    {
      heading: "Analytics",
      body: [
        "This site uses PostHog in cookieless mode. PostHog tracks anonymous page views and interaction events (CTA clicks, case study scroll depth, contact form usage) to help improve the portfolio.",
        "No cookies are set for analytics. A temporary, random session ID is generated in memory and discarded when you close the tab — it is never stored in localStorage, cookies, or any persistent storage.",
        "Data is sent to PostHog's EU-region servers (eu.i.posthog.com) and subject to PostHog's own privacy policy.",
      ],
    },
    {
      heading: "What we track",
      body: [
        "Page views — which pages you visit and in what order.",
        "CTA clicks — which call-to-action buttons are clicked and on which page.",
        "Case study scroll depth — how far into a case study you read (25%, 50%, 75%, 100% milestones).",
        "Contact form engagement — whether you start or successfully submit the contact form.",
        "No personal information (name, email, IP address) is collected or stored by the analytics system.",
      ],
    },
    {
      heading: "What we do not do",
      body: [
        "No Google Analytics, Facebook Pixel, or any advertising network.",
        "No cross-site tracking or fingerprinting.",
        "No selling or sharing of data with third parties for marketing purposes.",
        "No session recordings or heatmaps.",
      ],
    },
    {
      heading: "Contact",
      body: ["If you have questions about this privacy policy, reach out at avinroart@gmail.com."],
    },
  ],
  lastUpdated: "May 2026",
};
