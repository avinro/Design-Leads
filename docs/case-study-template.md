# Case Study Authoring Template

A guide for writing and publishing a new case study on the portfolio. Copy the MDX block at the bottom, rename the file, fill in every placeholder, and the content layer picks it up automatically.

---

## Publication contract

Every non-draft case study must satisfy these rules before being marked ready for review. The test suite in [`src/lib/content/case-studies.test.ts`](../src/lib/content/case-studies.test.ts) enforces items 1–3 automatically at build time.

1. **≥ 5 `<Figure>` blocks distributed across the body** — at minimum one per major narrative beat (problem, process steps, key decision, results). Figures can use `placeholderLabel` until real assets are available; update `src` when artwork is ready.
2. **Required section headings** — the exact strings below must appear in the MDX body:
   - `## Problem statement`
   - `## Process`
   - `## Results and impact`
3. **Non-empty `coverImage`** — must be a valid path to an image under `public/`.
4. **Frontmatter passes zod validation** — the schema is the source of truth: [`src/lib/content/case-studies.ts`](../src/lib/content/case-studies.ts). Any build with invalid frontmatter throws immediately with a clear error message.
5. **Sitemap indexing** — handled by PRO-20 (F1-9 SEO). Do not add a `sitemap.ts` workaround here.

---

## Visual rhythm guide

| Narrative beat           | Suggested figure label                                  |
| ------------------------ | ------------------------------------------------------- |
| Problem context          | Before-state, landscape map, stakeholder context        |
| Research / discovery     | Affinity map, synthesis snapshot, key insight           |
| Information architecture | IA map, flow diagram, decision matrix output            |
| Prototyping              | Lo-fi wireframe, hi-fi screen, user test session        |
| Key decision             | Comparison diagram, trade-off visualisation             |
| Handoff / results        | Component inventory, before/after screens, impact chart |

Figures beyond these beats are welcome. Avoid clustering two figures consecutively without prose between them.

---

## Editorial primitives

All primitives below are registered in the MDX component map and available without explicit imports in any `.mdx` file under `content/case-studies/`.

### `<Figure />`

Image or designed placeholder frame. Use `placeholderLabel` while waiting for assets; swap in `src` when ready.

```mdx
<Figure
  src="/case-studies/my-project/screen.png"
  alt="Descriptive alt text"
  caption="Caption text rendered below the image."
/>

<Figure
  placeholderLabel="Research synthesis"
  caption="Affinity mapping across 8 user interviews — pain points clustered around decision fatigue."
/>
```

### `<Stats />`

Responsive grid of large display stats. Each item needs `value` OR `delta`, plus `label`.

```mdx
<Stats
  data={[
    { value: "5", label: "Stakeholder interviews", sublabel: "Surfaced conflicting assumptions" },
    {
      value: "87%",
      label: "Task completion",
      sublabel: "Round 3, zero prompting",
      sentiment: "positive",
    },
    {
      delta: { from: "2 days", to: "4 hours" },
      label: "QA time per sprint",
      sentiment: "positive",
    },
  ]}
/>
```

### `<BeforeAfter />`

Two-up before/after comparison card with semantic sentiment colouring.

```mdx
<BeforeAfter
  label="Design QA time per sprint"
  before="2 days"
  after="4 hours"
  sentiment="positive"
/>
```

Note: use `before`/`after` (not `from`/`to` — those are JS keywords and cause MDX compile errors).

### `<Bar />`

Single horizontal proportion bar for a percentage metric.

```mdx
<Bar
  value={78}
  label="UI surface area covered by the top 40 components"
  caption="The remaining 22% is refactored as a feature trigger, not a standalone sprint."
/>
```

---

## Frontmatter field reference

The zod schema in [`src/lib/content/case-studies.ts`](../src/lib/content/case-studies.ts) is the authoritative source. These are the current required fields:

| Field        | Type       | Notes                                                                           |
| ------------ | ---------- | ------------------------------------------------------------------------------- |
| `title`      | string     | Display name, e.g. `"UMA"`                                                      |
| `slug`       | string     | URL path segment, e.g. `"uma"`. Must be unique and kebab-case.                  |
| `client`     | string     | Client or company name                                                          |
| `role`       | string     | Your role, e.g. `"Lead Product Designer"`                                       |
| `year`       | number     | Integer, 2000–2100                                                              |
| `coverage`   | string[]   | Tags like `research`, `interaction`, `visual`, `strategy`                       |
| `outcome`    | string     | One-line result shown in `<meta description>` and OG tags                       |
| `coverImage` | string     | Path under `public/`, e.g. `/case-studies/my-project.svg`                       |
| `order`      | number     | Display order in `/work`. Lower = first. Integer ≥ 1.                           |
| `summary`    | string     | Short paragraph for work listing cards                                          |
| `tags`       | string[]   | Product-level tags shown on work cards and slides                               |
| `gradient`   | string     | Tailwind gradient classes, e.g. `"from-violet-500 to-purple-700"`               |
| `draft`      | boolean?   | Defaults to `false`. `true` = built but noindex, excluded from public listings. |
| `kpis`       | KpiItem[]? | Up to 6 outcome KPIs rendered above the body. See schema for shape.             |

---

## Copy-pastable MDX starter

1. Copy the block below.
2. Create `content/case-studies/my-project.mdx` (replace `my-project` with your slug).
3. Add a cover image at `public/case-studies/my-project.svg` (or `.png`).
4. Fill in every `TODO` placeholder.
5. Set `draft: true` while writing; flip to `false` when ready for review.
6. Run `npm test` to confirm the publication contract passes.

```mdx
---
title: TODO — Project Name
slug: my-project
client: TODO — Client Name
role: Lead Product Designer
year: 2025
coverage:
  - research
  - interaction
  - visual
  - strategy
outcome: TODO — One-sentence result with a measurable or clearly stated impact.
coverImage: /case-studies/my-project.svg
order: 3
draft: true

summary: TODO — Two-sentence summary for the work listing card.
tags:
  - TODO — Tag 1
  - TODO — Tag 2
gradient: from-sky-400 to-indigo-600
kpis:
  - value: "TODO"
    label: TODO — Metric label
    sublabel: TODO — Context
    sentiment: positive
  - delta:
      from: "TODO before"
      to: "TODO after"
    label: TODO — Change label
    sentiment: positive
---

## Problem statement

TODO — Describe the problem. What was unclear, broken, or missing? What was at stake?

<Figure
  placeholderLabel="Problem context"
  caption="TODO — What this image shows and why it matters."
/>

## My role and constraints

TODO — What you owned. What you did NOT own. Key constraints (timeline, team size, existing system).

## Process

### TODO — Step 1 name

TODO — What you did and why.

<Stats data={[{ value: "TODO", label: "TODO metric", sublabel: "TODO context" }]} />

<Figure placeholderLabel="TODO — Step 1 artefact" caption="TODO — Caption." />

### TODO — Step 2 name

TODO — What you did and why.

<Figure placeholderLabel="TODO — Step 2 artefact" caption="TODO — Caption." />

### TODO — Step 3 name

TODO — What you did and why.

<Figure placeholderLabel="TODO — Step 3 artefact" caption="TODO — Caption." />

## Key decisions and trade-offs

TODO — Describe one or two decisions where you could have gone a different way. What did you choose and why?

<Figure placeholderLabel="TODO — Key decision diagram" caption="TODO — Caption." />

## Results and impact

<Figure placeholderLabel="TODO — Result or final state" caption="TODO — Caption." />

TODO — Bullet list or prose with measurable outcomes. Link back to the KPIs in the frontmatter.

<BeforeAfter label="TODO — What changed" before="TODO" after="TODO" sentiment="positive" />

## Learnings

TODO — What you would do differently. What this project taught you that changed how you work.
```
