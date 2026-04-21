# Project Rules & Guidelines

## 🏗️ Architecture & Structure
- Use Next.js App Router conventions (`app/page.tsx`, `app/layout.tsx`).
- Group logic by feature where possible.
- Keep components modular and reusable in the `components/` directory. Use `components/ui/` for generic UI building blocks.
- Server Actions should reside in the `actions/` directory and explicitly use `"use server"`.

## 📜 Coding Standards
- **TypeScript**: Strict typing is required. Avoid using `any`; define precise interfaces or types for all data structures.
- **Styling**: Use utility classes via TailwindCSS. Keep class strings manageable, consider using `cn()` (clsx + tailwind-merge) utility for dynamic classes.
- **State**: Prefer Server Components for data fetching. Use React Query for client-side data fetching/caching and Zustand for global UI state only when necessary.

## 🔄 Real-time Practices
- Websocket events should have clear typed payloads.
- Always handle reconnection and disconnect logic gracefully on the client.

## ✅ Quality & Performance
- Handle N+1 query problems in Prisma by using `include` correctly.
- Implement proper Error Boundaries for React components to prevent full app crashes.
- Avoid hardcoding configuration values (like ratings, text placeholders); move them to DB or constants.
