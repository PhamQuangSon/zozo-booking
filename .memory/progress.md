# Project Refactoring and Enhancement Plan

## Refactoring Priorities
- [x] **Implementation of Error Boundaries** <!-- id: 1 -->
    - [x] Create `error.tsx` component (Replaces generic ErrorBoundary)
    - [x] Create `global-error.tsx` (Wraps root layout)
- [x] **Performance Optimization (N+1 Queries)** <!-- id: 2 -->
    - [x] Refactor [getRestaurantOrders](file:zozo-booking/actions/order-actions.ts#18-75) in [order-actions.ts](file:zozo-booking/actions/order-actions.ts)
    - [x] Refactor [getTableFullData](file:zozo-booking/actions/table-actions.ts#410-505) in [table-actions.ts](file:zozo-booking/actions/table-actions.ts)
- [x] **Code Cleanup & Deduplication** <!-- id: 3 -->
    - [x] Extract common order fetching logic
    - [x] Extract common user fetching logic
- [x] **Type Safety Improvements** <!-- id: 4 -->
    - [x] Replace `any` in [table-actions.ts](file:zozo-booking/actions/table-actions.ts)
    - [x] Replace `any` in [cartStore.tsx](file:zozo-booking/store/cartStore.tsx)
    - [x] Replace `any` in [use-real-time-cart.ts](file:zozo-booking/hooks/use-real-time-cart.ts)
- [x] **WebSocket Reliability** <!-- id: 5 -->
    - [x] Add reconnection logic
    - [x] Add heartbeat mechanism
- [x] **Next.js 15 Compatibility Fixes** <!-- id: 6 -->
    - [x] Refactor dynamic routing async `params` to `await params` in `[restaurantId]` admin routes
    - [x] Update Next.js `PageProps` interface for async routing
- [x] **Prisma Strict Typings & ESLint rules** <!-- id: 7 -->
    - [x] Adjust types handling `decimal` mapping to numbers inside `ServerOrderItem`
    - [x] Nullish fallback conversions enforcing strict schema types on UI Cart Interface
    - [x] Resolve `useImportType` and side effect free biome validations

## New Features (Backlog)
- [ ] Push Notifications
- [ ] Analytics Dashboard
- [ ] Payment Integration
- [ ] PWA Support
- [ ] Internationalization (i18n)
