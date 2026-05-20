"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * UMA Problem Statement Diagrams
 *
 * Three interactive diagrams with enhanced visual hierarchy, semantic colors,
 * and responsive layout:
 *   1. UmaPainPoints     — pain → solution pairs + outcome (problem-to-solution flow)
 *   2. UmaTransformation — four-step flow + three pillar cards (transformation journey)
 *   3. UmaDifferentiators — six competitive differentiators (product moats)
 *
 * Animation CSS lives in globals.css (@keyframes uma-reveal / uma-bob / uma-shine).
 * Components apply `.uma-reveal` + `animationDelay` inline style for staggered entry.
 */

function reveal(delayMs: number): { animationDelay: string } {
  return { animationDelay: String(delayMs) + "ms" };
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 1 · Pain Points → Solutions → Outcome
// ─────────────────────────────────────────────────────────────────────────────

function PainCard({
  number,
  title,
  desc,
  delayMs,
}: {
  number: number;
  title: string;
  desc: string;
  delayMs: number;
}) {
  return (
    <div
      className="uma-reveal border-destructive/20 bg-destructive/[0.08] flex flex-col items-center justify-center rounded-2xl border px-6 py-7 text-center"
      style={reveal(delayMs)}
    >
      <div className="text-destructive/70 mb-3 font-mono text-[9px] font-semibold tracking-[0.2em] uppercase">
        Challenge {String(number).padStart(2, "0")}
      </div>
      <h4 className="text-destructive/95 mb-2.5 text-[17px] leading-tight font-bold">{title}</h4>
      <p className="text-destructive/70 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

function SolCard({
  number,
  title,
  desc,
  delayMs,
}: {
  number: number;
  title: string;
  desc: string;
  delayMs: number;
}) {
  return (
    <div
      className="uma-reveal flex flex-col items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/[0.08] px-6 py-7 text-center"
      style={reveal(delayMs)}
    >
      <div className="mb-3 font-mono text-[9px] font-semibold tracking-[0.2em] text-lime-600/70 uppercase dark:text-lime-400/70">
        Solution {String(number).padStart(2, "0")}
      </div>
      <h4 className="mb-2.5 text-[17px] leading-tight font-bold text-lime-700/95 dark:text-lime-300/95">
        {title}
      </h4>
      <p className="text-xs leading-relaxed text-lime-700/70 dark:text-lime-300/70">{desc}</p>
    </div>
  );
}

function ArrowConnectorH({ delayMs }: { delayMs: number }) {
  return (
    <div
      className="uma-reveal hidden items-center justify-center md:flex"
      style={reveal(delayMs)}
      aria-hidden="true"
    >
      <div className="uma-connector-h w-full" />
    </div>
  );
}

function OutcomeCard({ delayMs }: { delayMs: number }) {
  return (
    <div
      className={cn(
        "uma-reveal order-last flex flex-col items-center justify-center gap-4 rounded-2xl",
        "border-[1.5px] border-emerald-500/25 bg-gradient-to-br from-emerald-50/50 to-lime-50/30 px-8 py-10 text-center",
        "dark:border-emerald-500/15 dark:from-emerald-950/20 dark:to-lime-950/10",
        // Desktop: pinned to column 4, spanning all 3 pain rows
        "md:order-none md:col-start-4 md:row-span-3 md:row-start-1",
      )}
      style={reveal(delayMs)}
    >
      <div className="font-mono text-[10px] font-semibold tracking-[0.25em] text-emerald-700/70 uppercase dark:text-emerald-300/70">
        Outcome
      </div>
      <div className="flex flex-col gap-2.5">
        <span
          className="text-foreground/60 decoration-destructive/60 block text-base font-semibold line-through"
          style={{ textDecorationThickness: "1.5px" }}
        >
          Manual monthly
          <br />
          batch work
        </span>
        <span
          className="uma-bob block py-2 text-2xl text-emerald-600 dark:text-emerald-400"
          aria-hidden="true"
        >
          ↓
        </span>
        <span className="block text-xl font-bold text-emerald-700 dark:text-emerald-300">
          Automated in
          <br />
          5–10 seconds
        </span>
      </div>
      <div className="mt-2 w-full border-t border-emerald-500/15 pt-4 text-xs font-medium text-emerald-700/70 dark:text-emerald-300/70">
        Real-time visibility &amp; control
      </div>
    </div>
  );
}

export function UmaPainPoints() {
  return (
    <div className="my-12 sm:my-16">
      {/*
       * Mobile: flex-col — outcome pushed last via order-last.
       * Desktop: 4-column grid — outcome explicitly at col 4, rows 1-3.
       * Auto-placement skips col 4 for rows 2-3 because outcome is explicit.
       */}
      <div className="flex flex-col gap-5 md:grid md:grid-cols-[1fr_48px_1fr_1fr] md:gap-5">
        {/* Row 1 */}
        <PainCard
          number={1}
          title="Friction in capture"
          desc="Scan, photograph, manual entry"
          delayMs={120}
        />
        <ArrowConnectorH delayMs={180} />
        <SolCard number={1} title="OCR receipt" desc="extraction & auto-categorize" delayMs={200} />

        {/* Outcome — col 4 rows 1-3 on desktop, last on mobile */}
        <OutcomeCard delayMs={260} />

        {/* Row 2 */}
        <PainCard
          number={2}
          title="No real-time visibility"
          desc="Monthly or quarterly reconciliation"
          delayMs={240}
        />
        <ArrowConnectorH delayMs={300} />
        <SolCard
          number={2}
          title="Live dashboard"
          desc="Expense tracking in real time"
          delayMs={320}
        />

        {/* Row 3 */}
        <PainCard
          number={3}
          title="Sharing with advisors"
          desc="Manual spreadsheet compilation"
          delayMs={360}
        />
        <ArrowConnectorH delayMs={420} />
        <SolCard
          number={3}
          title="Structured export"
          desc="for accountants & financial advisors"
          delayMs={440}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 2 · Transformation Steps + Three Pillars
// ─────────────────────────────────────────────────────────────────────────────

function TransformationStep({
  number,
  title,
  subtitle,
  colorClass,
  delayMs,
}: {
  number: number;
  title: string;
  subtitle: string;
  colorClass: string;
  delayMs: number;
}) {
  return (
    <div
      className={cn(
        "uma-reveal flex min-h-[150px] flex-col items-center justify-center rounded-2xl border px-5 py-7 text-center",
        colorClass,
      )}
      style={reveal(delayMs)}
    >
      <div className="mb-3 font-mono text-[9px] font-semibold tracking-[0.2em] uppercase opacity-70">
        Step {String(number).padStart(2, "0")}
      </div>
      <h4 className="mb-2 text-[17px] leading-tight font-bold">{title}</h4>
      <p className="text-xs leading-relaxed opacity-75">{subtitle}</p>
    </div>
  );
}

function StepConnector({ delayMs }: { delayMs: number }) {
  return (
    <div
      className="uma-reveal hidden items-center justify-center sm:flex"
      style={reveal(delayMs)}
      aria-hidden="true"
    >
      <div className="uma-connector-h w-full" />
    </div>
  );
}

function StepConnectorV({ delayMs, height = 32 }: { delayMs: number; height?: number }) {
  return (
    <div
      className="uma-reveal flex justify-center py-2 sm:hidden"
      style={reveal(delayMs)}
      aria-hidden="true"
    >
      <div className="uma-connector-v" style={{ height: `${String(height)}px` }} />
    </div>
  );
}

function Pillar({
  number,
  title,
  items,
  colorClass,
  delayMs,
}: {
  number: number;
  title: string;
  items: string[];
  colorClass: string;
  delayMs: number;
}) {
  const numerals = ["I", "II", "III"] as const;
  return (
    <div
      className={cn(
        "uma-reveal flex min-h-[220px] flex-col rounded-2xl border px-7 py-8",
        colorClass,
      )}
      style={reveal(delayMs)}
    >
      <div className="mb-4 font-mono text-[10px] font-semibold tracking-[0.2em] uppercase opacity-70">
        Pillar {numerals[number - 1]}
      </div>
      <h4 className="mb-5 text-[19px] leading-snug font-bold">{title}</h4>
      <ul className="flex flex-col gap-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed opacity-85">
            <span
              className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-60"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UmaTransformation() {
  return (
    <div className="my-12 space-y-14 sm:my-16 sm:space-y-16">
      {/* Four-step flow — responsive */}
      {/* Mobile: vertical stack with vertical connectors */}
      <div className="space-y-4 sm:hidden">
        <TransformationStep
          number={1}
          title="Physical receipts"
          subtitle="Paper & photos"
          colorClass="border-border bg-muted/30 text-foreground"
          delayMs={120}
        />
        <StepConnectorV delayMs={200} height={24} />
        <TransformationStep
          number={2}
          title="OCR extraction"
          subtitle="Auto-categorize"
          colorClass="border-border bg-muted/30 text-foreground"
          delayMs={200}
        />
        <StepConnectorV delayMs={280} height={24} />
        <TransformationStep
          number={3}
          title="Live dashboard"
          subtitle="Daily insights"
          colorClass="border-border bg-muted/30 text-foreground"
          delayMs={280}
        />
        <StepConnectorV delayMs={360} height={24} />
        <TransformationStep
          number={4}
          title="Exportable data"
          subtitle="For accountants & POS"
          colorClass="border-border bg-muted/30 text-foreground"
          delayMs={360}
        />
      </div>

      {/* Desktop: horizontal grid with horizontal connectors */}
      <div className="hidden grid-cols-[1fr_32px_1fr_32px_1fr_32px_1fr] items-center gap-2 sm:grid">
        <TransformationStep
          number={1}
          title="Physical receipts"
          subtitle="Paper & photos"
          colorClass="border-border bg-muted/30 text-foreground"
          delayMs={120}
        />
        <StepConnector delayMs={200} />
        <TransformationStep
          number={2}
          title="OCR extraction"
          subtitle="Auto-categorize"
          colorClass="border-border bg-muted/30 text-foreground"
          delayMs={200}
        />
        <StepConnector delayMs={280} />
        <TransformationStep
          number={3}
          title="Live dashboard"
          subtitle="Daily insights"
          colorClass="border-border bg-muted/30 text-foreground"
          delayMs={280}
        />
        <StepConnector delayMs={360} />
        <TransformationStep
          number={4}
          title="Exportable data"
          subtitle="For accountants & POS"
          colorClass="border-border bg-muted/30 text-foreground"
          delayMs={360}
        />
      </div>

      {/* Pillars label */}
      <div className="uma-reveal flex flex-col items-center" style={reveal(440)}>
        <h3 className="font-display text-lg font-bold sm:text-2xl">Three core pillars</h3>
      </div>

      {/* Three pillar cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Pillar
          number={1}
          title="Simplicity"
          items={["Photo to data in one tap", "Mobile-first for back-office"]}
          colorClass="border-border bg-muted/30 text-foreground"
          delayMs={500}
        />
        <Pillar
          number={2}
          title="Financial clarity"
          items={["Real-time cost control", "Standardized reporting"]}
          colorClass="border-border bg-muted/30 text-foreground"
          delayMs={560}
        />
        <Pillar
          number={3}
          title="Operational reliability"
          items={["Accurate OCR", "Integration with POS & advisors"]}
          colorClass="border-border bg-muted/30 text-foreground"
          delayMs={620}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM 3 · Six Differentiators
// ─────────────────────────────────────────────────────────────────────────────

// Lucide-compatible SVG icon paths matching the HTML reference
const Icons = {
  OCR: () => (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 12h10" />
    </svg>
  ),
  Mobile: () => (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  ),
  Realtime: () => (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.5.5 0 0 1-.96 0L9.68 3.18a.5.5 0 0 0-.96 0l-2.35 8.36A2 2 0 0 1 4.45 13H2" />
    </svg>
  ),
  Share: () => (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Tool: () => (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
      <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
      <path d="m2.1 21.8 6.4-6.3" />
      <path d="m19 5-7 7" />
    </svg>
  ),
  Workflow: () => (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="8" x="3" y="3" rx="2" />
      <path d="M7 11v4a2 2 0 0 0 2 2h4" />
      <rect width="8" height="8" x="13" y="13" rx="2" />
    </svg>
  ),
};

interface DiffCardData {
  number: number;
  title: string;
  body: ReactNode;
  tag: string;
  icon: ReactNode;
  delayMs: number;
}

function DifferentiatorCard({ number, title, body, tag, icon, delayMs }: DiffCardData) {
  return (
    <div
      className="uma-reveal border-border/40 bg-card flex min-h-[230px] flex-col gap-4 rounded-2xl border px-7 py-7"
      style={reveal(delayMs)}
    >
      <div className="flex items-start gap-3.5">
        <span className="text-muted-foreground/60 flex h-6 w-6 flex-shrink-0 items-center justify-center">
          {icon}
        </span>
        <div className="flex-1">
          <span className="text-foreground block text-[17px] leading-snug font-bold">{title}</span>
          <span className="text-muted-foreground/50 mt-1 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase">
            Differentiator {String(number).padStart(2, "0")}
          </span>
        </div>
      </div>
      <p className="text-muted-foreground/85 flex-1 text-xs leading-relaxed">{body}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <span className="border-border/40 bg-muted/50 text-muted-foreground inline-block rounded-lg border px-2.5 py-1 font-mono text-[11px] font-semibold">
          {tag}
        </span>
      </div>
    </div>
  );
}

const differentiators: DiffCardData[] = [
  {
    number: 1,
    title: "OCR receipt extraction",
    body: (
      <>
        Converts physical receipts to structured data{" "}
        <em className="uma-em-highlight">in one action</em>. Competitors require manual tagging or
        spreadsheet entry.
      </>
    ),
    tag: "Technical moat",
    icon: <Icons.OCR />,
    delayMs: 120,
  },
  {
    number: 2,
    title: "Mobile-first design",
    body: (
      <>
        Built for <em className="uma-em-highlight">back-office reality</em>, not desktop workflows.
        Photo-to-database in seconds — no PCs required.
      </>
    ),
    tag: "UX defensibility",
    icon: <Icons.Mobile />,
    delayMs: 180,
  },
  {
    number: 3,
    title: "Real-time expense visibility",
    body: (
      <>
        Live dashboard replaces <em className="uma-em-highlight">monthly reconciliation</em> cycles.
        Enables cost control decisions at operational speed.
      </>
    ),
    tag: "Behavioral shift",
    icon: <Icons.Realtime />,
    delayMs: 240,
  },
  {
    number: 4,
    title: "Standardized B2B export",
    body: (
      <>
        Data exportable to{" "}
        <em className="uma-em-highlight">accountants, tax advisors, POS systems</em>. Creates
        switching cost through operational integration.
      </>
    ),
    tag: "Partnership moat",
    icon: <Icons.Share />,
    delayMs: 300,
  },
  {
    number: 5,
    title: "Restaurant-specific logic",
    body: (
      <>
        Auto-categorizes by{" "}
        <em className="uma-em-highlight">supplier, expense type, COGS category</em>. Generic tools
        require manual mapping.
      </>
    ),
    tag: "Vertical focus",
    icon: <Icons.Tool />,
    delayMs: 360,
  },
  {
    number: 6,
    title: "Workflow integration layer",
    body: (
      <>
        Receipt capture feeds into{" "}
        <em className="uma-em-highlight">cost tracking, supplier management, inventory planning</em>
        . No data silos.
      </>
    ),
    tag: "Defensible loop",
    icon: <Icons.Workflow />,
    delayMs: 420,
  },
];

export function UmaDifferentiators() {
  return (
    <div className="my-12 sm:my-16">
      <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {differentiators.map((d) => (
          <DifferentiatorCard key={d.number} {...d} />
        ))}
      </div>
    </div>
  );
}
