import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ScrollVelocity } from "./scroll-velocity";

/*
 * ScrollVelocity SSR smoke tests.
 *
 * motion/react scroll hooks depend on browser APIs and are mocked so the
 * component renders cleanly in Node. Covers:
 *   - SSR render without crash.
 *   - Each text in the `texts` array appears in the output.
 */

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      style,
      ...rest
    }: React.HTMLAttributes<HTMLDivElement> & { style?: React.CSSProperties }) => (
      <div style={style} {...rest}>
        {children}
      </div>
    ),
  },
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useVelocity: () => ({ get: () => 0 }),
  useSpring: (v: unknown) => v,
  useTransform: (_v: unknown, _from: unknown, to: unknown) => ({
    get: () => (Array.isArray(to) ? (to[0] as unknown) : 0),
  }),
  useMotionValue: (initial: number) => ({
    get: () => initial,
    set: vi.fn(),
  }),
  useAnimationFrame: vi.fn(),
}));

describe("ScrollVelocity", () => {
  it("renders without crashing in SSR", () => {
    expect(() =>
      renderToStaticMarkup(
        <ScrollVelocity texts={["SELECTED WORK \u2022", "SELECTED WORK \u2022"]} velocity={80} />,
      ),
    ).not.toThrow();
  });

  it("renders each text item in the output", () => {
    const html = renderToStaticMarkup(<ScrollVelocity texts={["Hello", "World"]} velocity={60} />);
    expect(html).toContain("Hello");
    expect(html).toContain("World");
  });

  it("renders without crashing when texts is empty", () => {
    expect(() => renderToStaticMarkup(<ScrollVelocity texts={[]} />)).not.toThrow();
  });
});
