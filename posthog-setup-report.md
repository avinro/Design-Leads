<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of your portfolio project. PostHog was already installed and extensively instrumented; this session patched the two remaining coverage gaps (case study listing card clicks and related rail sidebar clicks), updated environment variables with the correct US-region values, and built a fresh "Analytics basics" dashboard with five insights.

## Changes made

### Environment

- Updated `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` in `.env.local` with confirmed US-region values.

### New / updated events

| Event                                            | Description                                                                                                                                                                                      | File                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `work_card_click` (source: `case_study_listing`) | Case study grid cards in `/case-studies` now carry `data-work-card-*` attributes so the delegator fires `work_card_click` with `source=case_study_listing`. Previously these clicks were silent. | `src/components/case-study/case-study-grid-card.tsx` |
| `related_card_click`                             | Fired when a visitor clicks a related item in the case study right-rail sidebar. Tracks `slug`, `kind`, and `source`.                                                                            | `src/components/analytics/click-delegator.tsx`       |

### Modified files

| File                                                 | Change                                                                                                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/analytics/events.ts`                        | Added `case_study_listing` to `WorkCardSource`; added `related_card_click` to `AppEvent` union; added `trackRelatedCardClick` helper.                 |
| `src/components/analytics/click-delegator.tsx`       | Imported `trackRelatedCardClick`; added `data-related-card-*` delegation branch; added `return` guard after work-card branch to prevent double-fires. |
| `src/components/case-study/case-study-grid-card.tsx` | Added `data-work-card-slug`, `data-work-card-title`, `data-work-card-source="case_study_listing"` attributes to the `<Link>`.                         |

## Next steps

We've built a dashboard and five insights to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1610175)
- [Pageviews over time](/insights/wr2Bbljf) — Daily $pageview count (last 30 days)
- [Booking conversion funnel](/insights/gdKzCQTV) — Pageview → CTA click → Calendly opened → Booking scheduled
- [Work & case study card clicks](/insights/Cctwpiih) — Unique users clicking work cards and flowing work items
- [AI chat engagement](/insights/xvP7F0xO) — AI chat opens vs messages sent
- [CTA clicks by position](/insights/f0yL869Q) — CTA clicks broken down by surface (header, footer, hero, etc.)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
