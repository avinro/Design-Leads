/**
 * Flow primitives — visual diagram components for MDX case studies.
 *
 * All components use a child-based API (no array/object props) so they work
 * reliably inside next-mdx-remote/rsc without complex JS prop serialisation.
 *
 * Wrapper components  (accept children):
 *   FlowChain     — linear chain with straight connectors; children = <FlowItem>
 *   FlowSplit     — N side-by-side columns; children = <FlowColumn>
 *   StateGrid     — responsive grid of state cards; children = <StateItem>
 *   PrincipleGrid — larger editorial cards; children = <PrincipleItem>
 *   BranchTree    — root node + branches; children = <Branch>
 *
 * Leaf components  (simple string/bool props, no children needed except Branch/FlowColumn):
 *   FlowItem      — one step inside FlowChain or Branch / FlowColumn
 *   FlowColumn    — one panel inside FlowSplit; children = <FlowItem>
 *   StateItem     — one card inside StateGrid
 *   PrincipleItem — one card inside PrincipleGrid
 *   Branch        — one branch inside BranchTree; children = <FlowItem>
 */

import {
  Children,
  isValidElement,
  Fragment,
  type ReactNode,
  type ReactElement,
  type ComponentType,
} from "react";

import {
  Loader,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Check,
  Clock,
  Upload,
  Camera,
  Receipt,
  FileText,
  Archive,
  Pencil,
  FileSpreadsheet,
  Download,
  MessageCircle,
  Sparkles,
  Smartphone,
  LayoutDashboard,
  LayoutGrid,
  ScrollText,
  BarChart3,
  BarChart2,
  TrendingUp,
  Edit3,
  Tag,
  Database,
  Code2,
  Eye,
  RotateCw,
  Rocket,
  Wrench,
  PieChart,
  Bell,
  User,
  Users,
  ClipboardList,
  UserCog,
  Briefcase,
  Palette,
  Cpu,
  Store,
  Building2,
  Car,
  Map,
  Sailboat,
  Ship,
  Ticket,
  Music,
  Wine,
  Plug,
  Bot,
  Route,
  Cog,
  Radio,
  Link2,
  Flag,
  Network,
  ShieldCheck,
  MapPin,
  Languages,
  Puzzle,
  Layers,
  Target,
  Accessibility,
  FlaskConical,
  Brain,
  Hourglass,
  Coins,
  Mic,
  MessageSquare,
  Keyboard,
  Zap,
  Compass,
  Globe,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Circle,
} from "lucide-react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Tone system
// ---------------------------------------------------------------------------

export type Tone = "neutral" | "accent" | "positive" | "warning" | "negative";

interface ToneStyles {
  badge: string;
  border: string;
  text: string;
  dot: string;
}

function toneStyles(tone: Tone = "neutral"): ToneStyles {
  switch (tone) {
    case "accent":
      return {
        badge: "bg-accent/10 text-accent border-accent/30",
        border: "border-accent/40",
        text: "text-accent",
        dot: "bg-accent",
      };
    case "positive":
      return {
        badge: "bg-success/10 text-success border-success/30",
        border: "border-success/30",
        text: "text-success",
        dot: "bg-success",
      };
    case "warning":
      return {
        badge: "bg-warning/15 text-warning border-warning/40",
        border: "border-warning/30",
        text: "text-warning",
        dot: "bg-warning",
      };
    case "negative":
      return {
        badge: "bg-destructive/10 text-destructive border-destructive/30",
        border: "border-destructive/30",
        text: "text-destructive",
        dot: "bg-destructive",
      };
    default:
      return {
        badge: "bg-muted text-foreground/80 border-border",
        border: "border-border/60",
        text: "text-foreground",
        dot: "bg-foreground/60",
      };
  }
}

// ---------------------------------------------------------------------------
// Icon resolution
// ---------------------------------------------------------------------------

type IconComponent = ComponentType<{ className?: string }>;

const ICONS: Record<string, IconComponent> = {
  accessibility: Accessibility,
  "alert-octagon": AlertOctagon,
  "alert-triangle": AlertTriangle,
  archive: Archive,
  "bar-chart-2": BarChart2,
  "bar-chart-3": BarChart3,
  bell: Bell,
  bot: Bot,
  brain: Brain,
  briefcase: Briefcase,
  "building-2": Building2,
  camera: Camera,
  car: Car,
  check: Check,
  "check-circle-2": CheckCircle2,
  "clipboard-list": ClipboardList,
  clock: Clock,
  "code-2": Code2,
  cog: Cog,
  coins: Coins,
  compass: Compass,
  cpu: Cpu,
  database: Database,
  "dollar-sign": DollarSign,
  download: Download,
  "edit-3": Edit3,
  eye: Eye,
  "file-spreadsheet": FileSpreadsheet,
  "file-text": FileText,
  flag: Flag,
  "flask-conical": FlaskConical,
  globe: Globe,
  hourglass: Hourglass,
  keyboard: Keyboard,
  languages: Languages,
  layers: Layers,
  "layout-dashboard": LayoutDashboard,
  "layout-grid": LayoutGrid,
  link: Link2,
  loader: Loader,
  map: Map,
  "map-pin": MapPin,
  "message-circle": MessageCircle,
  "message-square": MessageSquare,
  mic: Mic,
  music: Music,
  network: Network,
  palette: Palette,
  pencil: Pencil,
  "pie-chart": PieChart,
  plug: Plug,
  puzzle: Puzzle,
  radio: Radio,
  receipt: Receipt,
  rocket: Rocket,
  "rotate-cw": RotateCw,
  route: Route,
  sailboat: Sailboat,
  "scroll-text": ScrollText,
  "shield-check": ShieldCheck,
  ship: Ship,
  smartphone: Smartphone,
  sparkles: Sparkles,
  store: Store,
  tag: Tag,
  target: Target,
  ticket: Ticket,
  "trending-up": TrendingUp,
  upload: Upload,
  user: User,
  "user-cog": UserCog,
  users: Users,
  wine: Wine,
  wrench: Wrench,
  zap: Zap,
};

function resolveIcon(name?: string): IconComponent {
  if (!name) return Circle;
  return ICONS[name] ?? Circle;
}

// ---------------------------------------------------------------------------
// Internal atoms
// ---------------------------------------------------------------------------

function IconBadge({
  icon,
  tone,
  size = "md",
  className,
}: {
  icon: string;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = resolveIcon(icon);
  const styles = toneStyles(tone);
  const dim = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg border",
        dim,
        styles.badge,
        className,
      )}
    >
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon className={iconDim} aria-hidden="true" />
    </span>
  );
}

function FlowConnector({ orientation }: { orientation: "h" | "v" | "auto" }) {
  const chip = cn(
    "relative z-10 flex h-6 w-6 items-center justify-center rounded-md border bg-card text-muted-foreground",
  );

  if (orientation === "v") {
    return (
      <div aria-hidden="true" className="relative flex justify-center">
        <span className={chip}>
          <ChevronDown className="h-3 w-3" strokeWidth={2.25} />
        </span>
      </div>
    );
  }

  if (orientation === "h") {
    return (
      <div aria-hidden="true" className="relative flex items-center justify-center">
        <span className={chip}>
          <ChevronRight className="h-3 w-3" strokeWidth={2.25} />
        </span>
      </div>
    );
  }

  // "auto" — vertical on mobile, horizontal on md+
  return (
    <div aria-hidden="true" className="relative flex items-center justify-center">
      <span className={cn(chip, "md:hidden")}>
        <ChevronDown className="h-3 w-3" strokeWidth={2.25} />
      </span>
      <span className={cn(chip, "hidden md:flex")}>
        <ChevronRight className="h-3 w-3" strokeWidth={2.25} />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FlowItem — leaf node used inside FlowChain, Branch, FlowColumn
// ---------------------------------------------------------------------------

export interface FlowItemProps {
  icon: string;
  label: string;
  hint?: string;
  tone?: Tone;
}

/** Renders nothing by itself — parent wrappers read its props. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FlowItem(_: FlowItemProps): ReactElement | null {
  return null;
}

function FlowItemCard({
  icon,
  label,
  hint,
  tone,
  index,
}: {
  icon: string;
  label: string;
  hint?: string;
  tone?: Tone;
  index: number;
}) {
  const styles = toneStyles(tone);
  return (
    <div
      className={cn(
        "group bg-card relative flex h-full items-start gap-3 rounded-xl border p-4 sm:gap-4 sm:p-5",
        styles.border,
      )}
    >
      <IconBadge icon={icon} tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm leading-tight font-semibold sm:text-base">{label}</p>
        {hint && (
          <p className="text-muted-foreground mt-1 text-xs leading-snug sm:text-[13px]">{hint}</p>
        )}
      </div>
      <span
        aria-hidden="true"
        className="text-muted-foreground/60 absolute top-2.5 right-3 font-mono text-[10px] tracking-widest"
      >
        {String(index).padStart(2, "0")}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FlowChain — linear chain with connector chips between steps
// ---------------------------------------------------------------------------

interface FlowChainProps {
  children: ReactNode;
  direction?: "horizontal" | "vertical" | "auto";
  highlightLast?: boolean;
  className?: string;
}

/** Max cards rendered side-by-side in a horizontal FlowChain row. */
const FLOW_CHAIN_COLS = 4;

export function FlowChain({
  children,
  direction = "auto",
  highlightLast = false,
  className,
}: FlowChainProps) {
  const items = Children.toArray(children).filter((c): c is ReactElement<FlowItemProps> =>
    isValidElement(c),
  );

  if (!items.length) return null;

  const isVertical = direction === "vertical";

  // Vertical direction: single flat list, no chunking.
  if (isVertical) {
    return (
      <div className={cn("my-8", className)}>
        <ol role="list" className="flex flex-col items-stretch gap-3">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            const p = item.props;
            const effectiveTone: Tone | undefined =
              p.tone ?? (highlightLast && isLast ? "accent" : undefined);
            return (
              <Fragment key={i}>
                <li className="w-full">
                  <FlowItemCard
                    icon={p.icon}
                    label={p.label}
                    hint={p.hint}
                    tone={effectiveTone}
                    index={i + 1}
                  />
                </li>
                {!isLast && (
                  <li aria-hidden="true" className="flex justify-center">
                    <FlowConnector orientation="v" />
                  </li>
                )}
              </Fragment>
            );
          })}
        </ol>
      </div>
    );
  }

  // Horizontal / auto: chunk into rows of FLOW_CHAIN_COLS.
  // On mobile each row still collapses to vertical (flex-col); on md+ it's
  // a horizontal flex row. Between rows a downward connector is shown.
  const rows: (typeof items)[] = [];
  for (let i = 0; i < items.length; i += FLOW_CHAIN_COLS) {
    rows.push(items.slice(i, i + FLOW_CHAIN_COLS));
  }

  return (
    <div className={cn("my-8 flex flex-col gap-3", className)}>
      {rows.map((row, rowIdx) => {
        const isLastRow = rowIdx === rows.length - 1;

        return (
          <Fragment key={rowIdx}>
            {/* One horizontal row */}
            <ol
              role="list"
              className="flex flex-col items-stretch gap-3 md:flex-row md:items-stretch md:gap-2"
            >
              {row.map((item, j) => {
                const globalIdx = rowIdx * FLOW_CHAIN_COLS + j;
                const isLastItem = globalIdx === items.length - 1;
                const isLastInRow = j === row.length - 1;
                const p = item.props;
                const effectiveTone: Tone | undefined =
                  p.tone ?? (highlightLast && isLastItem ? "accent" : undefined);

                return (
                  <Fragment key={j}>
                    <li className="min-w-0 flex-1">
                      <FlowItemCard
                        icon={p.icon}
                        label={p.label}
                        hint={p.hint}
                        tone={effectiveTone}
                        index={globalIdx + 1}
                      />
                    </li>
                    {/* Horizontal connector between cards within the row */}
                    {!isLastInRow && (
                      <li aria-hidden="true" className="flex items-center justify-center">
                        {/* On mobile show ↓; on md+ show → */}
                        <FlowConnector orientation="auto" />
                      </li>
                    )}
                  </Fragment>
                );
              })}
            </ol>

            {/* Downward connector between rows */}
            {!isLastRow && (
              <div aria-hidden="true" className="flex justify-center">
                <FlowConnector orientation="v" />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FlowColumn — one panel inside FlowSplit; children = <FlowItem>
// ---------------------------------------------------------------------------

export interface FlowColumnProps {
  title: string;
  subtitle?: string;
  tone?: Tone;
  badgeLabel?: string;
  children: ReactNode;
}

/** Renders nothing standalone — FlowSplit reads its props and children. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FlowColumn(_: FlowColumnProps): ReactElement | null {
  return null;
}

// ---------------------------------------------------------------------------
// FlowSplit — N columns side by side
// ---------------------------------------------------------------------------

interface FlowSplitProps {
  children: ReactNode;
  className?: string;
}

export function FlowSplit({ children, className }: FlowSplitProps) {
  const cols = Children.toArray(children).filter((c): c is ReactElement<FlowColumnProps> =>
    isValidElement(c),
  );

  if (!cols.length) return null;

  const count = cols.length;
  const gridClass =
    count === 2
      ? "md:grid-cols-2"
      : count === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={cn("my-10", className)}>
      <div className={cn("grid grid-cols-1 gap-4 sm:gap-5 md:items-start", gridClass)}>
        {cols.map((col, i) => {
          const p = col.props;
          const styles = toneStyles(p.tone);

          const items = Children.toArray(p.children).filter((c): c is ReactElement<FlowItemProps> =>
            isValidElement(c),
          );

          return (
            <section
              key={i}
              className={cn("bg-card flex flex-col rounded-2xl border p-5 sm:p-6", styles.border)}
            >
              <header className="border-border/40 mb-5 border-b pb-4">
                {p.tone && p.tone !== "neutral" && (
                  <span
                    className={cn(
                      "mb-2 inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase",
                      styles.badge,
                    )}
                  >
                    {p.badgeLabel ?? p.tone}
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
                  {p.title}
                </h3>
                {p.subtitle && (
                  <p className="text-muted-foreground mt-1 text-sm leading-snug">{p.subtitle}</p>
                )}
              </header>

              <ol role="list" className="flex flex-col gap-3">
                {items.map((item, j) => {
                  const ip = item.props;
                  const isLast = j === items.length - 1;
                  return (
                    <Fragment key={j}>
                      <li className="w-full">
                        <FlowItemCard
                          icon={ip.icon}
                          label={ip.label}
                          hint={ip.hint}
                          tone={ip.tone}
                          index={j + 1}
                        />
                      </li>
                      {!isLast && (
                        <li aria-hidden="true" className="flex justify-center">
                          <FlowConnector orientation="v" />
                        </li>
                      )}
                    </Fragment>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StateItem — leaf node for StateGrid
// ---------------------------------------------------------------------------

export interface StateItemProps {
  icon: string;
  label: string;
  hint?: string;
  tone?: Tone;
}

/** Renders nothing standalone — StateGrid reads its props. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StateItem(_: StateItemProps): ReactElement | null {
  return null;
}

// ---------------------------------------------------------------------------
// StateGrid — responsive grid of state cards
// ---------------------------------------------------------------------------

interface StateGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StateGrid({ children, columns, className }: StateGridProps) {
  const items = Children.toArray(children).filter((c): c is ReactElement<StateItemProps> =>
    isValidElement(c),
  );

  if (!items.length) return null;

  const cols =
    columns ?? (items.length <= 4 ? 2 : items.length <= 6 ? 3 : items.length === 8 ? 4 : 3);

  const gridClass =
    cols === 2
      ? "sm:grid-cols-2"
      : cols === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <ul role="list" className={cn("my-8 grid grid-cols-1 gap-3 sm:gap-4", gridClass, className)}>
      {items.map((item, i) => {
        const p = item.props;
        const styles = toneStyles(p.tone);
        return (
          <li
            key={i}
            className={cn(
              "bg-card flex items-start gap-3 rounded-xl border p-4 sm:gap-4 sm:p-5",
              styles.border,
            )}
          >
            <IconBadge icon={p.icon} tone={p.tone} />
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm leading-tight font-semibold sm:text-base">
                {p.label}
              </p>
              {p.hint && (
                <p className="text-muted-foreground mt-1 text-xs leading-snug sm:text-[13px]">
                  {p.hint}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// PrincipleItem — leaf node for PrincipleGrid
// ---------------------------------------------------------------------------

export interface PrincipleItemProps {
  icon: string;
  title: string;
  body: string;
  tone?: Tone;
}

/** Renders nothing standalone — PrincipleGrid reads its props. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PrincipleItem(_props: PrincipleItemProps): ReactElement | null {
  return null;
}

// ---------------------------------------------------------------------------
// PrincipleGrid — larger editorial cards with numbered pills
// ---------------------------------------------------------------------------

interface PrincipleGridProps {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
}

export function PrincipleGrid({ children, columns, className }: PrincipleGridProps) {
  const items = Children.toArray(children).filter((c): c is ReactElement<PrincipleItemProps> =>
    isValidElement(c),
  );

  if (!items.length) return null;

  const cols = columns ?? (items.length <= 2 ? 2 : 3);
  const gridClass = cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  return (
    <ol role="list" className={cn("my-10 grid grid-cols-1 gap-4 md:gap-5", gridClass, className)}>
      {items.map((item, i) => {
        const p = item.props;
        const styles = toneStyles(p.tone);
        return (
          <li
            key={i}
            className={cn(
              "group bg-card relative flex h-full flex-col rounded-2xl border p-5 sm:p-6",
              styles.border,
            )}
          >
            <span
              aria-hidden="true"
              className="text-muted-foreground/50 absolute top-4 right-5 font-mono text-[11px] tracking-widest"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <IconBadge icon={p.icon} tone={p.tone} size="lg" className="mb-4" />
            <h3 className="font-display text-base leading-snug font-semibold tracking-tight sm:text-lg">
              {p.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.body}</p>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Branch — one branch inside BranchTree; children = <FlowItem>
// ---------------------------------------------------------------------------

export interface BranchProps {
  title: string;
  tone?: Tone;
  children: ReactNode;
}

/** Renders nothing standalone — BranchTree reads its props and children. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Branch(_: BranchProps): ReactElement | null {
  return null;
}

// ---------------------------------------------------------------------------
// BranchTree — root node branching into N parallel vertical chains
// ---------------------------------------------------------------------------

interface BranchTreeProps {
  icon: string;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function BranchTree({ icon, label, hint, children, className }: BranchTreeProps) {
  const branches = Children.toArray(children).filter((c): c is ReactElement<BranchProps> =>
    isValidElement(c),
  );

  if (!branches.length) return null;

  const count = branches.length;
  const gridClass =
    count === 2
      ? "md:grid-cols-2"
      : count === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={cn("my-12", className)}>
      {/* Root node — minimal styling */}
      <div className="mb-8 flex justify-center">
        <div className="border-border bg-muted/30 text-foreground inline-flex max-w-lg items-center gap-3 rounded-2xl border px-5 py-4 sm:px-7 sm:py-5">
          <IconBadge icon={icon} className="border-border/50 bg-muted text-foreground" />
          <div className="text-left">
            <p className="font-display text-sm leading-tight font-bold sm:text-base">{label}</p>
            {hint && <p className="text-muted-foreground mt-0.5 text-xs leading-snug">{hint}</p>}
          </div>
        </div>
      </div>

      {/* Vertical connector — subtle divider */}
      <div aria-hidden="true" className="mb-6 flex justify-center">
        <div className="bg-border/50 h-8 w-px" />
      </div>

      {/* Branch columns — neutral styling */}
      <div className={cn("grid grid-cols-1 gap-4 sm:gap-6", gridClass)}>
        {branches.map((branch, i) => {
          const bp = branch.props;

          const items = Children.toArray(bp.children).filter(
            (c): c is ReactElement<FlowItemProps> => isValidElement(c),
          );

          return (
            <section
              key={i}
              className="border-border bg-muted/30 flex flex-col rounded-2xl border p-5 transition-opacity duration-200 hover:opacity-80 sm:p-6"
            >
              <h3 className="font-display text-foreground mb-5 flex items-center gap-2.5 text-sm font-bold tracking-wide uppercase">
                <span className="bg-muted/60 h-2.5 w-2.5 rounded-full" aria-hidden="true" />
                <span className="text-xs tracking-widest">{bp.title}</span>
              </h3>

              <ol role="list" className="flex flex-col gap-3">
                {items.map((item, j) => {
                  const ip = item.props;
                  const isLast = j === items.length - 1;
                  return (
                    <Fragment key={j}>
                      <li className="w-full">
                        <FlowItemCard
                          icon={ip.icon}
                          label={ip.label}
                          hint={ip.hint}
                          tone={ip.tone}
                          index={j + 1}
                        />
                      </li>
                      {!isLast && (
                        <li aria-hidden="true" className="flex justify-center">
                          <FlowConnector orientation="v" />
                        </li>
                      )}
                    </Fragment>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
