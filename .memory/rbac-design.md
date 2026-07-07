# RBAC & Order Management Architecture Design

## 1. Role-Based Access Control (RBAC) Expansion
To better reflect real-world restaurant operations, the current `UserRole` will be expanded.

### Current Roles:
`ADMIN`, `STAFF`, `CUSTOMER`

### Proposed Roles:
- **`ADMIN`**: Full system access.
- **`MANAGER`**: (Replaces `STAFF`) Store manager with high-level access (view reports, manage staff).
- **`KITCHEN`**: Kitchen staff. Can only access the KDS (Kitchen Display System).
  - Can view `NEW` and `PREPARING` OrderItems.
  - Can change OrderItemStatus (`NEW` -> `PREPARING` -> `READY`).
- **`CASHIER`**: Cashier staff. Can access POS/Billing screens.
  - Can view all Orders and Tables.
  - Can change OrderStatus to `COMPLETED` or `PAID`.
  - Can release Tables (`OCCUPIED` -> `AVAILABLE`).
- **`WAITER`**: Service staff. Can access tablet POS for taking orders on behalf of customers.
  - Can create Orders.
  - Cannot void payments or finalize bills.
- **`CUSTOMER`**: End-user ordering via QR/Web app.

## 2. Order Status Update
Adding a `PAID` status to `OrderStatus` to clearly separate a meal that is fully served (`COMPLETED` or `DELIVERED`) from a meal that has been financially settled.

**New Flow:**
`NEW` -> `PREPARING` -> (All items served) -> `PAID` (Payment received) -> `COMPLETED` (Table cleaned, session closed).

## 3. The "Order Again" Usecase (Grouping Orders)
Currently, if a customer at an occupied table orders again, a new `Order` record is created, causing multiple orders for a single table session.

**Solution: Append to Active Order**
Instead of creating a new `Order`, the system will look for an active order for that table and append new items to it.

**Logic Workflow:**
1. Customer submits a new cart.
2. Backend queries: `findFirst(Order) WHERE tableId = X AND status NOT IN ('COMPLETED', 'PAID', 'CANCELLED')`
3. If an active order exists:
   - Create new `OrderItem`s and link them to the existing `Order`.
   - Update `Order.totalAmount = Order.totalAmount + new_items_total`.
4. If no active order exists:
   - Create a new `Order`.
   - Set `TableStatus` to `OCCUPIED`.

This ensures the Cashier only sees **1 active bill per table**.
