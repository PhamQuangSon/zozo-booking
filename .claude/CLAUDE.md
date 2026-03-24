# Claude Project Instructions (Zozo Booking)

## Project Summary
- Next.js (App Router) + TypeScript + Tailwind + Prisma
- Main code lives in `app/`, shared UI in `components/`, utilities in `lib/`, data in `prisma/`

## Key Commands
- Dev server: `npm run dev`
- Build (with Prisma generate): `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`
- Format: `npm run format .`
- Seed database: `npm run prisma:seed`

## Code Conventions
- Default to Server Components in `app/`; add `"use client"` only when needed.
- Use TypeScript for all new files and keep types close to usage.
- Use `cn` from `lib/utils.ts` to compose `className` values.
- Keep UI primitives in `components/` and feature-specific UI close to its route in `app/`.
- Access the database via Prisma helpers in `lib/` (e.g., `lib/prisma.ts`).
- Prefer small, focused components and pure functions; avoid side effects inside render.
- Keep API routes in `app/api` and validate inputs with `zod` where applicable.

## PR Expectations
- Keep changes scoped and explain the intent in the summary.
- Run `npm run lint` for UI or logic changes when feasible.
