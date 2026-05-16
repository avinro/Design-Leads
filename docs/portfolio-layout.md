# Portfolio Layout System

The portfolio layout is a thin, mobile-first composition system built on top of the design tokens delivered by PRO-7. It provides three primitives — `Container`, `Section`, `Grid/GridItem` — and a semantic spacing scale, so portfolio pages stay consistent without re-deciding rhythm and width on every page.

## Breakpoints

The site follows Tailwind v4 default breakpoints, applied mobile-first. Base styles target a 375 px viewport; responsive prefixes only expand or adjust upward.

| Prefix | Min-width | Typical device                   |
| ------ | --------- | -------------------------------- |
| (base) | 375 px    | small phone portrait             |
| `sm:`  | 640 px    | large phone landscape            |
| `md:`  | 768 px    | tablet portrait                  |
| `lg:`  | 1024 px   | tablet landscape / small desktop |
| `xl:`  | 1280 px   | desktop                          |
| `2xl:` | 1536 px   | wide desktop                     |

Rules (enforced by [`/.cursor/rules/mobile-first.mdc`](../.cursor/rules/mobile-first.mdc)):

- Base classes target mobile, never desktop.
- Responsive prefixes are additive only.
- `max-sm:` / `max-md:` and similar max-width prefixes are not allowed.

## Spacing scale

Defined in [`src/app/globals.css`](../src/app/globals.css) under `@theme inline`. Hero and section tokens use `clamp()` so they scale fluidly with the viewport — no media queries are needed in components.

| Token             | Value                    | Use                                             |
| ----------------- | ------------------------ | ----------------------------------------------- |
| `--space-inline`  | `0.75rem` (12 px)        | gap between adjacent inline elements            |
| `--space-card`    | `1.5rem` (24 px)         | internal padding of cards / compact blocks      |
| `--space-section` | `clamp(3rem, 6vw, 5rem)` | vertical gap between page sections (48 → 80 px) |
| `--space-hero`    | `clamp(4rem, 8vw, 6rem)` | vertical padding for hero blocks (64 → 96 px)   |

Static values (`inline`, `card`) stay constant on purpose: component-level density is predictable. Fluid values (`section`, `hero`) breathe with the viewport because they govern page-level rhythm.

## Layout primitives

All three primitives follow the project component pattern (`cva` + `cn` + `data-slot`/`data-variant`). They are server-component compatible and never render `"use client"`.

`className` always wins over variant styles via `cn()`, so consumers can override defaults without copying the variant logic.

### Container

Centers its children, applies a responsive max-width, and applies adaptive horizontal gutters (`px-4 sm:px-6 lg:px-8`).

| Prop    | Values                                    | Default   |
| ------- | ----------------------------------------- | --------- |
| `width` | `narrow` \| `default` \| `wide` \| `full` | `default` |

Width semantics:

- `narrow` (`max-w-prose`) — long-form prose, case study body copy.
- `default` (`max-w-6xl`) — standard portfolio sections.
- `wide` (`max-w-7xl`) — hero blocks, gallery grids.
- `full` (`max-w-none`) — edge-to-edge sections.

```tsx
<Container width="default">
  <h1 className="text-4xl">Selected work</h1>
</Container>
```

### Section

Applies vertical padding from the spacing scale and renders a semantic landmark (`section` by default). Use the `as` prop to render `header`, `main`, `article` or `div` when the page hierarchy requires it.

| Prop      | Values                                                | Default   |
| --------- | ----------------------------------------------------- | --------- |
| `spacing` | `hero` \| `section` \| `card` \| `none`               | `section` |
| `as`      | `section` \| `header` \| `main` \| `article` \| `div` | `section` |

```tsx
<Section as="header" spacing="hero">
  <Container width="wide">…</Container>
</Section>
```

### Grid / GridItem

A single-column grid below the `lg` breakpoint, full 12-column grid from `lg` (1024 px) up. Tablet portrait stays single-column on purpose: 12 columns at 768 px produce columns that are too narrow for editorial content.

`Grid` props:

| Prop  | Values                          | Default   |
| ----- | ------------------------------- | --------- |
| `gap` | `tight` \| `default` \| `loose` | `default` |

Gap semantics:

- `tight` (`gap-3`, 12 px) — dense card lists.
- `default` (`gap-6`, 24 px) — standard portfolio grid.
- `loose` (`gap-8`, 32 px) — gallery-style spacing.

`GridItem` props:

| Prop | Values   | Default             |
| ---- | -------- | ------------------- |
| `lg` | `1`–`12` | full row on desktop |

```tsx
<Grid gap="default">
  <GridItem lg={8}>main content</GridItem>
  <GridItem lg={4}>aside</GridItem>
</Grid>
```

> Note: `GridItem` only exposes the `lg` span. Mobile is always single-column. If a layout needs different column tracks at other breakpoints, drop down to plain Tailwind grid utilities — the `Grid/GridItem` API is intentionally narrow.

## Home page composition (PRO-13 — rotation rebrand)

> **Direction change**: The previous editorial-minimalist direction (plain mono kicker, no JS animation, pure CSS entrance staggers) was superseded by the rotation rebrand after PRO-13. The restraint-as-signal brand premise was traded for an expressive React Bits-inspired direction where **rotation is the dominant motion language**. The CTA contract, accessibility requirements, and layout primitives remain intact.

The public home (`/`) is assembled from section components that live in `src/components/site/`. All copy is centralised in `src/lib/content/home.ts`.

### Section tree (rotation rebrand)

```
RootLayout
└── <main id="main-content">
    ├── <HomeHero>       min-h-screen; CircularText absolute on wide grid right edge (md+)
    ├── <WorkDivider>    CurvedLoop chapter break (decorative, aria-hidden)
    ├── <SelectedWork>   Section, numbered editorial rows (flex-col, no Grid)
    ├── <SocialProof>    Section, large-type testimonial
    └── <AboutTeaser>    Section, Container width="narrow", bio-as-heading
```

Global chrome in `RootLayout`:

- `<SiteHeader>` — sticky top, skip link, primary CTA ("Let's talk") at `md+`
- `<SiteFooter>` — full-screen dark closing section: final CTA + nav + copyright (plain text home link; no `CircularText` echo)
- `<MobileCtaBar>` — fixed bottom, `md:hidden`, `pb-[env(safe-area-inset-bottom)]`

### Motion components

Two wrapper components live in `src/components/motion/`. Both are `"use client"`, lazy-loaded via `next/dynamic({ ssr: false })` in their consuming sections.

| Component      | Source          | Role in page                                                                                                     |
| -------------- | --------------- | ---------------------------------------------------------------------------------------------------------------- |
| `CircularText` | React Bits port | Hero circle only (sizes 120 / 180); optional `textChangeTransition="shuffle"` (GSAP stagger) when phrase changes |
| `CurvedLoop`   | React Bits port | WorkDivider chapter break                                                                                        |

**Reduced-motion contract**: Both wrappers call `useReducedMotion()` from `motion/react`. When `prefers-reduced-motion: reduce` is set:

- `CircularText` renders letters statically positioned around the circle. No rotation, no hover handlers.
- `CurvedLoop` skips the `requestAnimationFrame` loop entirely. Text renders on its SVG path statically.

Layout and content remain identical in both motion states.

### Motion cadence tokens

| Token                  | Value | Used by                                                  |
| ---------------------- | ----- | -------------------------------------------------------- |
| `--motion-spin-slow`   | `30`  | Reserved / legacy (footer no longer uses `CircularText`) |
| `--motion-spin-medium` | `20`  | Hero CircularText protagonist                            |

Values are unitless numbers (seconds) passed to `CircularText`'s `spinDuration` prop.

### Editorial type system

Three fluid display tokens live in `globals.css` alongside the Tailwind scale. Applied via `style={{ fontSize: "var(--text-display-*)" }}`.

| Token               | Value                           | Used by                   |
| ------------------- | ------------------------------- | ------------------------- |
| `--text-display-sm` | `clamp(1.75rem, 3.5vw, 2.5rem)` | `SocialProof` large quote |
| `--text-display-md` | `clamp(3.5rem, 8vw, 6rem)`      | Footer CTA heading        |
| `--text-display-lg` | `clamp(4rem, 12vw, 9rem)`       | `HomeHero` h1             |

### Section design patterns

- **Hero layout**: single column of copy. A ghost strip mirrors `Container width="wide"` (`max-w-7xl` + `px-4 sm:px-6 lg:px-8`); `CircularText` is `absolute right-0` inside that strip so it sits on the inner right edge of the editorial grid (not the viewport). Shown from `md` up only.
- **WorkDivider**: `aria-hidden="true"` div containing a `CurvedLoop`. Carries the "SELECTED WORK" signal that used to live in the removed section kicker.
- **Editorial rows** (`SelectedWork`): projects are numbered `01`/`02`/`03` flex rows. Static numeric index retained (CircularText echoes limited to hero and footer to avoid visual noise).
- **Footer closing section**: `bg-foreground text-background` on `<SiteFooter>`. The final CTA heading + text-link live inside the footer, followed by the wordmark/nav/copyright block. This avoids stacking a CTA section and footer as two separate endings.

### CTA strategy — one and only one primary CTA

- **`md+`**: `SiteHeader` renders the primary `Button` ("Let's talk") in a sticky bar at the top.
- **`<md`**: `MobileCtaBar` renders the same CTA in a fixed bar at the bottom.
- **In-page/footer sections**: `HomeHero` uses `variant="outline"`; the footer CTA uses a plain text-link. Neither competes with the persistent primary CTA.

### Accessibility additions (ui-ux-pro-max §1)

- Skip link (`href="#main-content"`) is the first focusable element in `SiteHeader`; it becomes visible on keyboard focus.
- `<main id="main-content">` is the skip link target.
- `scroll-padding-top: 4rem` in `globals.css` prevents the sticky header from covering anchor targets or keyboard-focused elements.
- Decorative elements (gradient swatch, logo placeholders, quotation mark ornament) carry `aria-hidden="true"`.
- Touch targets meet ≥44px via `min-h-[44px]` on interactive row content and the sticky CTA button.

### Spacing tokens

| Token             | Value    | Use                                                             |
| ----------------- | -------- | --------------------------------------------------------------- |
| `--space-cta-bar` | `4.5rem` | Bottom padding on `SiteFooter` on `<md` to clear `MobileCtaBar` |

## Validation checklist (ui-ux-pro-max §5)

Apply on every portfolio page before merging:

- mobile-first — base classes target mobile, responsive prefixes are additive.
- breakpoint-consistency — only `sm`, `md`, `lg`, `xl`, `2xl` are used.
- container-width — pages use `Container` (or document why they don't).
- spacing-scale — vertical rhythm comes from `Section.spacing`, not ad-hoc `py-*`.
- viewport-units — `min-h-dvh` instead of `100vh` (already applied in [`src/app/layout.tsx`](../src/app/layout.tsx)).
- horizontal-scroll — verified at 375 px that nothing overflows.
- safe-area — `Container` gutters keep content away from screen edges.
- skip-link — `SiteHeader` includes a visible-on-focus skip link targeting `#main-content`.
- single-primary-cta — only `SiteHeader` (md+) and `MobileCtaBar` (<md) use `variant="default"`.
- touch-targets — interactive elements have a minimum 44px touch area.
