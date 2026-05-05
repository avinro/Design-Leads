<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# Project rules and conventions

This repo is the **Design Leads** platform — a Next.js 16 + TypeScript + Supabase + Tailwind v4 monorepo for a solo product designer. It is organized in 4 phases (Foundation, Portfolio Web, Outreach LimaLeads, Client Portal), all sharing the same stack, design system, and Vercel deployment pipeline. Full context: [`.cursor/rules/project-context.mdc`](.cursor/rules/project-context.mdc).

## Backend authorization

Do **not** make backend changes unless the user explicitly authorizes them, or the active Linear issue explicitly authorizes backend work in its description or notes.

Backend-touching scope includes — but is not limited to — any of the following:

- `supabase/migrations/` or Supabase schema changes
- Server Actions, Route Handlers (`app/api/`), and any file that runs exclusively on the server
- Authentication / session logic (Supabase Auth, middleware)
- AI wrappers (`lib/ai/`)
- Environment variables — adding, renaming, or removing
- Production infrastructure (Vercel project config, `vercel.ts`, CI workflows)

If a task you are asked to do touches any of the above, **call it out immediately and wait for explicit approval** before editing. Do not pre-emptively "fix" backend files while working on frontend tasks.

Machine-readable rule: [`.cursor/rules/backend-authorization.mdc`](.cursor/rules/backend-authorization.mdc)

## Code style

### Comments in English

All inline comments and JSDoc in source code must be written in English. No exceptions, regardless of the developer's language preference.

Machine-readable rule: [`.cursor/rules/english-comments.mdc`](.cursor/rules/english-comments.mdc)

### Mobile-first CSS

Base Tailwind utility classes always target mobile (≈ 375 px). Responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) are additive — they override the base, never replace it. Never write desktop-only base styles and add `max-sm:` overrides.

Machine-readable rule: [`.cursor/rules/mobile-first.mdc`](.cursor/rules/mobile-first.mdc)

### Conventional Commits

All commits must follow the Conventional Commits spec enforced by `commitlint`. Format:

```
<type>(<scope>): <subject>
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`.
Scope examples: `auth`, `design`, `infra`, `portfolio`, `outreach`, `portal`, `agents`.

Machine-readable rule: [`.cursor/rules/conventional-commits.mdc`](.cursor/rules/conventional-commits.mdc)

### No secrets

Never commit `.env` files or any file that contains real credentials, tokens, API keys, or passwords. Only `.env.local.example` (with empty values as placeholders) may be committed. Use Vercel environment variables for all secrets in CI/CD.

Machine-readable rule: [`.cursor/rules/no-secrets.mdc`](.cursor/rules/no-secrets.mdc)

## Supabase RLS

Every Supabase table that stores third-party data **must** have Row Level Security (RLS) enabled with at least one policy before any code reads or writes it.

Tables in scope (Phase 2 + 3):
`companies`, `contacts`, `leads`, `sequences`, `sequence_runs`, `messages`, `templates`, `accounts`, `account_members`, `projects`, `milestones`, `deliverables`, `comments`, `intake_forms`, `reminders`, `ai_logs`

Machine-readable rule: [`.cursor/rules/supabase-rls.mdc`](.cursor/rules/supabase-rls.mdc)

## Agent workflow

### Next issue

When the user says **"next issue"**, follow the steps in [`.cursor/rules/next-issue-workflow.mdc`](.cursor/rules/next-issue-workflow.mdc): review recent commits, review Linear issues in progress or available, then propose and confirm the next task before touching any file.

### Linear

- Team key: `PRO`
- Branch naming: `avinroart/pro-<issue-number>-<kebab-slug>` (matching the `gitBranchName` field in Linear)
- Move issue to **In Progress** before making the first edit
- Move issue to **Done** only after the PR is merged to `main`
- Phases are sequential: do not start Phase N+1 issues until the gate for Phase N is met
