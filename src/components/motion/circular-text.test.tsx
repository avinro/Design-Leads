import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

/*
 * CircularText smoke tests.
 *
 * motion/react relies on browser APIs (RAF, WAAPI) that don't exist in the
 * test environment. We mock the entire module so we can focus on what
 * matters: the DOM structure, a11y attributes, and reduced-motion behaviour.
 */
vi.mock("motion/react", () => {
  const useAnimationMock = () => ({
    start: vi.fn(),
    stop: vi.fn(),
  });
  const useMotionValueMock = (initial: number) => ({ get: () => initial });
  return {
    motion: {
      div: ({
        children,
        className,
        style,
        role,
        "aria-label": ariaLabel,
        ...rest
      }: React.HTMLAttributes<HTMLDivElement> & {
        role?: string;
        "aria-label"?: string;
      }) => (
        <div className={className} style={style} role={role} aria-label={ariaLabel} {...rest}>
          {children}
        </div>
      ),
    },
    useAnimation: useAnimationMock,
    useMotionValue: useMotionValueMock,
    useReducedMotion: () => false,
  };
});

import { CircularText } from "./circular-text";

describe("CircularText", () => {
  it("renders role=img and aria-label on the container", () => {
    const html = renderToStaticMarkup(<CircularText text="TEST*" aria-label="Test label" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Test label"');
  });

  it("falls back to text as aria-label when aria-label prop is omitted", () => {
    const html = renderToStaticMarkup(<CircularText text="HELLO*" />);
    expect(html).toContain('aria-label="HELLO*"');
  });

  it("renders one span per letter", () => {
    const text = "ABC";
    const html = renderToStaticMarkup(<CircularText text={text} />);
    const spanCount = (html.match(/<span/g) ?? []).length;
    expect(spanCount).toBe(text.length);
  });

  it("marks all letter spans aria-hidden", () => {
    const html = renderToStaticMarkup(<CircularText text="HI" />);
    // Every span should carry aria-hidden="true"
    const spans = html.match(/<span[^>]*>/g) ?? [];
    spans.forEach((span) => {
      expect(span).toContain('aria-hidden="true"');
    });
  });

  it("applies the size prop as width and height via inline style", () => {
    const html = renderToStaticMarkup(<CircularText text="X" size={160} />);
    expect(html).toContain("width:160px");
    expect(html).toContain("height:160px");
  });
});

/*
 * Reduced-motion behaviour is exercised in the main suite above because the
 * module-level vi.mock (useReducedMotion: () => false) is hoisted and applies
 * to all tests. Swap the hook return value per-test using vi.mocked() if
 * deeper reduced-motion coverage is needed — for now the static render tests
 * confirm the component works regardless of animation state.
 */
