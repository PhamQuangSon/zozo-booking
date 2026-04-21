# Project Refactoring and Enhancement Plan

## Refactoring Priorities
- [ ] **Implementation of Error Boundaries** <!-- id: 1 -->
    - [ ] Create `ErrorBoundary` component
    - [ ] Wrap critical application parts (Layouts)
- [ ] **Performance Optimization (N+1 Queries)** <!-- id: 2 -->
    - [ ] Refactor [getRestaurantOrders](file:///Users/quangsonpham/Documents/git/zozo-booking/actions/order-actions.ts#18-75) in [order-actions.ts](file:///Users/quangsonpham/Documents/git/zozo-booking/actions/order-actions.ts)
    - [ ] Refactor [getTableFullData](file:///Users/quangsonpham/Documents/git/zozo-booking/actions/table-actions.ts#410-505) in [table-actions.ts](file:///Users/quangsonpham/Documents/git/zozo-booking/actions/table-actions.ts)
- [ ] **Code Cleanup & Deduplication** <!-- id: 3 -->
    - [ ] Extract common order fetching logic
    - [ ] Extract common user fetching logic
- [ ] **Type Safety Improvements** <!-- id: 4 -->
    - [ ] Replace `any` in [table-actions.ts](file:///Users/quangsonpham/Documents/git/zozo-booking/actions/table-actions.ts)
    - [ ] Replace `any` in [cartStore.tsx](file:///Users/quangsonpham/Documents/git/zozo-booking/store/cartStore.tsx)
    - [ ] Replace `any` in [use-real-time-cart.ts](file:///Users/quangsonpham/Documents/git/zozo-booking/hooks/use-real-time-cart.ts)
- [ ] **WebSocket Reliability** <!-- id: 5 -->
    - [ ] Add reconnection logic
    - [ ] Add heartbeat mechanism

## New Features (Backlog)
- [ ] Push Notifications
- [ ] Analytics Dashboard
- [ ] Payment Integration
- [ ] PWA Support
- [ ] Internationalization (i18n)
