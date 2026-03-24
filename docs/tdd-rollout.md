# Zozo Booking TDD Rollout (2 weeks)

## Goal
- Reduce regressions in booking/order flow before adding new features.
- Enforce Red -> Green -> Refactor workflow on business-critical modules first.

## Scope (high risk first)
- `actions/order-actions.ts`
- `actions/table-actions.ts`
- `store/cartStore.tsx`
- `hooks/use-real-time-cart.ts`

## Week 1
1. Day 1: test foundation
- Add Vitest scripts (`test`, `test:watch`) and define naming conventions.
- Rule: no business logic change without a failing test first.

2. Day 2-3: order state transitions
- Cover status mapping and table-release rules in isolated unit tests.
- Refactor status decision logic into pure functions (`lib/order-status.ts`).

3. Day 4-5: table/order creation guardrails
- Add tests for table number uniqueness and basic order input validation paths.
- Start extracting pure validation helpers from server actions to improve testability.

## Week 2
1. Day 1-2: cart merge/sync behavior
- Add unit tests for cart merge deduplication and submitted/pending item behavior.
- Refactor cart key generation and merge functions into reusable pure utilities.

2. Day 3-4: real-time synchronization behavior
- Add tests around payload builders and event filtering decisions used by socket hooks.
- Keep socket wiring thin; move testable logic out of React effect bodies.

3. Day 5: stabilization gate
- Add CI gate: `npm run test` must pass before merge.
- Track flaky tests and document deterministic patterns.

## Red-Green-Refactor working agreement
- Red: write one failing test for one business rule change.
- Green: implement minimal code to pass that test.
- Refactor: improve names/structure while keeping tests green.

## Definition of done for each change
- New or changed rule has at least one failing test introduced first.
- Tests pass locally.
- Refactor does not change behavior; no skipped tests.
