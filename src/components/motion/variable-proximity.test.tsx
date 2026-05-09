import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { useRef } from "react";

import VariableProximity from "./variable-proximity";

/*
 * VariableProximity SSR smoke tests.
 *
 * motion/react hooks that depend on browser APIs are mocked so the component
 * can render in Node without throwing. Covers:
 *   - SSR render without crash.
 *   - sr-only span contains the label text.
 *   - className and style props are forwarded.
 */

vi.mock("motion/react", () => ({
  motion: {
    span: ({
      children,
      style,
      ...rest
    }: React.HTMLAttributes<HTMLSpanElement> & { style?: React.CSSProperties }) => (
      <span style={style} {...rest}>
        {children}
      </span>
    ),
  },
}));

// Helper to render with a fake containerRef
function renderWithRef(props: Partial<React.ComponentProps<typeof VariableProximity>> = {}) {
  // renderToStaticMarkup cannot call hooks directly; wrap in a tiny component
  let html = "";

  function Wrapper() {
    const ref = useRef<HTMLHeadingElement>(null);
    return (
      <h1 ref={ref}>
        <VariableProximity
          label="Hello world"
          containerRef={ref}
          fromFontVariationSettings="'wght' 400, 'opsz' 14"
          toFontVariationSettings="'wght' 900, 'opsz' 40"
          {...props}
        />
      </h1>
    );
  }

  html = renderToStaticMarkup(<Wrapper />);
  return html;
}

describe("VariableProximity", () => {
  it("renders without crashing in SSR", () => {
    expect(() => renderWithRef()).not.toThrow();
  });

  it("renders sr-only span with full label text for accessibility", () => {
    const html = renderWithRef({ label: "Turn vision into product" });
    expect(html).toContain("Turn vision into product");
    expect(html).toContain("sr-only");
  });

  it("forwards className to the root span", () => {
    const html = renderWithRef({ className: "font-display my-custom-class" });
    expect(html).toContain("my-custom-class");
  });
});
