import dynamic from "next/dynamic";

import { homeContent } from "@/lib/content/home";

/*
 * WorkDivider — chapter break between HomeHero and SelectedWork.
 *
 * Renders a CurvedLoop marquee so the page has a clear chapter transition.
 * The CurvedLoop component is lazy-loaded (`ssr: false`) because it relies
 * on SVG text measurement (getComputedTextLength) which only works in the
 * browser. The fallback is a simple invisible spacer that preserves vertical
 * rhythm without a layout shift.
 *
 * Reduced-motion users see the text on its curved SVG path statically
 * (the CurvedLoop wrapper halts the rAF loop when useReducedMotion is true).
 *
 * aria-hidden="true" is applied in CurvedLoop itself — this is decorative
 * content; the information it carries ("Selected Work") is already in the
 * section heading below.
 */
const CurvedLoop = dynamic(
  () => import("@/components/motion/curved-loop").then((m) => m.CurvedLoop),
  {
    ssr: false,
    loading: () => <div className="h-24 w-full" aria-hidden="true" />,
  },
);

export function WorkDivider() {
  const { workDivider } = homeContent;

  return (
    <div className="text-foreground/70 overflow-hidden">
      <CurvedLoop
        marqueeText={workDivider.text}
        curveAmount={180}
        speed={1.5}
        direction="left"
        interactive={false}
        fontSize="clamp(3rem, 8vw, 6rem)"
      />
    </div>
  );
}
