# CLAUDE.md — FructoSahel

## What This Is

Farm management platform for the Sahel region of West Africa (Burkina Faso, Mali, Niger). Built as a bilingual (EN/FR) PWA with offline-first architecture.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: Neon PostgreSQL (serverless) + Drizzle ORM
- **Auth**: Neon Auth (beta) — wrappers in `lib/auth/`
- **AI**: Anthropic Claude via `@anthropic-ai/sdk`
- **Styling**: Tailwind CSS v4 + Radix UI (shadcn pattern)
- **i18n**: next-intl with locale-based routing (`/en/`, `/fr/`)
- **Monitoring**: Sentry
- **Package Manager**: bun

## Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run lint         # Lint with Biome
bun run format       # Format with Biome
bun run test         # Unit tests (Vitest)
bun run test:e2e     # E2E tests (Playwright)
```

## Project Structure

```
app/
  [locale]/
    dashboard/       # Authenticated pages (13 sections)
    demo/            # Public demo mode with mock data
    auth/            # Auth pages
  api/               # API routes (CRUD for all entities)
components/
  layout/            # Sidebar, header, dashboard layout
  ui/                # shadcn/Radix primitives
  charts/            # Recharts components
  forms/             # React Hook Form + Zod
lib/
  auth/              # Neon Auth client/server wrappers
  db/                # Drizzle schema, migrations, connection
  hooks/             # Custom React hooks
  ai-agents/         # Claude AI advisor config
  validations/       # Zod schemas
  api/               # API helpers (errors, responses)
messages/            # i18n translation files (en.json, fr.json)
```

## Coding Conventions

- **Linter/Formatter**: Biome (2-space indent, organize imports)
- **Commits**: Conventional commits enforced by commitlint — `feat:`, `fix:`, `docs:`, `chore:`, etc.
- **Components**: Client components use `"use client"` directive. Server components are default.
- **Styling**: Tailwind utility classes. Theme colors use `sahel-*` prefix (terracotta, earth, sand).
- **Forms**: React Hook Form + Zod validation schemas in `lib/validations/`
- **API routes**: Use `handleApiError`, `success`, `created`, `notFound` from `lib/api/errors.ts`
- **i18n**: All user-facing strings use `t()` from `useTranslations()`. Keys in `messages/*.json`.
- **Currency**: XOF base, USD/ECO conversion via `lib/currency.ts`

## Auth Pattern

- Client: `authClient.useSession()` from `lib/auth/client.ts`
- Server: `neonAuth()` from `lib/auth/server.ts` returns `{ session, user }`
- Middleware: `middleware.ts` protects `/api/*` and `/dashboard/*` routes
- API routes: Import `neonAuth` for server-side session checks

## Environment Variables

See `.env.example` for all required and optional variables.
