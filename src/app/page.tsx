import { Button } from "@/components/ui/button";

/*
 * Placeholder landing page — replaced in Phase 1 (F1-* portfolio/site issues).
 * This component exists to verify the stack is wired correctly:
 * - shadcn Button renders (Radix + Tailwind tokens)
 * - Tailwind utility classes resolve via @theme inline
 * - Mobile-first layout: base styles target 375 px; breakpoints expand upward.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      {/* Logo / wordmark placeholder */}
      <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold select-none">
        DL
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Design Leads</h1>
        <p className="text-muted-foreground max-w-sm text-sm sm:max-w-md sm:text-base">
          Strategic design leadership — brand identity, UX systems, and client portals.
        </p>
      </div>

      {/* Smoke-test: shadcn Button component */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button>Get in touch</Button>
        <Button variant="outline">View work</Button>
      </div>

      {/* Build-phase indicator — remove before Phase 1 launch */}
      <p className="text-muted-foreground/60 text-xs">Phase 0 scaffold · PRO-5 complete</p>
    </main>
  );
}
