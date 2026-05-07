/**
 * Tests for MermaidDiagram component.
 *
 * Uses react-dom/server (renderToStaticMarkup) — no jsdom needed.
 *
 * Covers:
 *   - Skeleton is rendered when svg is null (initial state, SSR-equivalent)
 *   - aria-busy is set on the skeleton container
 *   - sr-only pre element is present for screen reader fallback
 *
 * Note: Full client rendering with Mermaid is not tested here because it
 * requires a browser environment and the Mermaid dynamic import. The behaviour
 * is covered by the `npm run build` validation step which SSR-renders the page
 * and confirms no server-side Mermaid import occurs.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { MermaidDiagram } from "./mermaid-diagram";

// Encode a minimal diagram source to base64 as the remark plugin would.
const source = Buffer.from(
  "%% Flowchart example\nflowchart TD\n  A[Start] --> B[End]",
  "utf-8",
).toString("base64");

describe("MermaidDiagram", () => {
  it("renders without throwing during SSR", () => {
    expect(() => renderToStaticMarkup(<MermaidDiagram source={source} />)).not.toThrow();
  });

  it("renders a visually-hidden sr-only pre with the decoded source", () => {
    const html = renderToStaticMarkup(<MermaidDiagram source={source} />);
    expect(html).toContain("sr-only");
    expect(html).toContain("Flowchart example");
  });

  it("renders an aria-busy skeleton when no svg is available (SSR state)", () => {
    const html = renderToStaticMarkup(<MermaidDiagram source={source} />);
    // During SSR, useState(null) means no svg is set — skeleton is rendered.
    expect(html).toContain("aria-busy");
  });
});
