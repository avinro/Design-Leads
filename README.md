# Design Leads

Strategic design leadership — brand identity, UX systems, and design case studies.

---

## Stack

| Layer     | Technology                               |
| --------- | ---------------------------------------- |
| Framework | Next.js 16 (App Router)                  |
| Language  | TypeScript 5 (strict mode)               |
| Styling   | Tailwind CSS v4 + shadcn/ui (radix-nova) |
| Fonts     | Geist Sans + Geist Mono (next/font)      |
| Runtime   | Node.js ≥ 24                             |

## Folder structure

```
src/
├── app/                    # Next.js App Router
│   ├── (site)/             # Portfolio / public site
│   ├── api/                # Route handlers
│   ├── globals.css         # Tailwind v4 + design tokens
│   └── layout.tsx          # Root layout
├── components/
│   └── ui/                 # shadcn/ui components (owned source)
├── lib/
│   └── utils.ts            # cn() helper
└── hooks/                  # Shared React hooks
```

## Local development

```bash
# Install dependencies
npm install

# Start dev server (Turbopack)
npm run dev

# Type-check
npm run typecheck

# Lint
npm run lint

# Production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

See `.env.local.example` for the complete list of configuration options.

## Design tokens

Provisional brand tokens live in `src/app/globals.css` under the `:root` block.
PRO-7 (F0-3) will define the full token system (colour palette, typography scale, spacing).

## Agent and developer conventions

`AGENTS.md` (added in PRO-11 / F0-7) documents the rules for AI agents and contributors:

- No backend changes without explicit authorisation
- All code comments in English
- Mobile-first CSS — base classes target 375 px; breakpoints expand upward
- Conventional commit format

## Deployment

| Target     | Branch | URL                       |
| ---------- | ------ | ------------------------- |
| Production | `main` | https://avinro.com        |
| Preview    | any PR | unique `*.vercel.app` URL |

- Security headers (HSTS, X-Frame-Options, CSP) are declared in `vercel.json` and applied at the Vercel CDN level on every request.
- Preview deploys are created automatically for every pull request — no extra configuration needed.
- Production deploys are triggered only by pushes to `main`.

## Phases

| Phase | Scope                       |
| ----- | --------------------------- |
| 0     | Foundations (this scaffold) |
| 1     | Portfolio / public site     |
| 2     | LimaLeads outreach system   |
