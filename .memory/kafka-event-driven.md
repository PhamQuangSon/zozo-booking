# Kafka Event-Driven Architecture for zozo-booking

## Background

The project is a Next.js restaurant booking/ordering platform. Currently it uses:
- **Socket.IO** for real-time communication (order updates, cart sync, table rooms)
- **Direct DB writes** in server actions (e.g. `updateOrderItemStatus`) that synchronously update order, table, and item statuses in a transaction
- **WebSocket client wrapper** (`lib/websocket-service.ts`) on the frontend
- **Neon PostgreSQL** as the database via Prisma

The goal is to introduce **Kafka** as an event bus to decouple producers (order actions) from consumers (real-time notifications, status propagation, analytics, etc.), following proper event-driven architecture (EDA).

---

## User Review Required

> [!IMPORTANT]
> **Kafka broker setup**: Kafka requires a running broker. This plan uses **KafkaJS** (pure JS Kafka client) and assumes you'll run Kafka locally via Docker Compose or use a managed service (Confluent Cloud, Upstash Kafka, etc.). You'll need to confirm which broker you prefer.

> [!WARNING]
> **Next.js App Router + long-lived consumers**: Kafka consumers are long-lived processes. They cannot live inside Next.js API routes (serverless). This plan introduces a **separate Node.js worker process** (`worker/kafka-consumer.ts`) that runs alongside the Next.js dev server.

> [!IMPORTANT]
> **Existing Socket.IO**: The plan keeps Socket.IO for the real-time push to browsers (Kafka → Consumer → Socket.IO emit). Kafka replaces the direct event emission in server actions, not the browser transport layer.

---

## Open Questions

> [!IMPORTANT]
> 1. **Kafka broker**: Local Docker Compose (Redpanda/Kafka) or managed cloud (Upstash, Confluent)? This impacts `.env` config.
> 2. **Scope**: Should Kafka also handle analytics events (order created, revenue tracking) or only operational events (order status changes, table releases)?
> 3. **Dead-letter queue (DLQ)**: Do you want failed consumer messages retried and routed to a DLQ topic?

---

## Proposed Changes

### Architecture Overview

```
[Next.js Server Action]
    │  (produce event)
    ▼
[Kafka Topic: order-events]
    │
    ├──▶ [Consumer: order-status-processor]  → updates Order/Table status in DB
    └──▶ [Consumer: realtime-notifier]       → emits via Socket.IO to browser
```

**Topics to create:**
| Topic | Events |
|---|---|
| `order.created` | New order placed |
| `order.item.status.updated` | Order item status changed |
| `order.status.updated` | Whole order status changed |
| `table.status.updated` | Table released/occupied |

---

### New Files

#### [NEW] `docker-compose.kafka.yml`
Local Kafka + Zookeeper (or Redpanda as single-node alternative) for development.

#### [NEW] `lib/kafka/kafka-client.ts`
Singleton KafkaJS client with configurable broker list from env.

#### [NEW] `lib/kafka/producer.ts`
`KafkaProducer` wrapper with typed `publishEvent(topic, event)` and graceful shutdown.

#### [NEW] `lib/kafka/consumer.ts`
`KafkaConsumer` base class/factory with typed message handlers and error handling.

#### [NEW] `lib/kafka/topics.ts`
Constants for all topic names + TypeScript event payload types (discriminated union).

#### [NEW] `worker/kafka-consumer.ts`
Long-running Node.js process (not a Next.js route) that:
1. Subscribes to all topics
2. On `order.item.status.updated` → updates DB (order + table status)
3. On any order event → emits to Socket.IO clients in the correct room

#### [NEW] `worker/tsconfig.json`
Separate tsconfig for the worker (ESM, Node target).

---

### Modified Files

#### [MODIFY] [order-actions.ts](file:///Users/quangsonpham/Documents/git/zozo-booking/actions/order-actions.ts)
- `updateOrderItemStatus`: After saving to DB, **publish** `order.item.status.updated` event to Kafka instead of (or in addition to) Socket.IO emit.
- Add `createOrder` server action that publishes `order.created` to Kafka.

#### [MODIFY] [package.json](file:///Users/quangsonpham/Documents/git/zozo-booking/package.json)
- Add `kafkajs` dependency
- Add `worker:dev` script: `ts-node --esm worker/kafka-consumer.ts`

#### [MODIFY] `.env` / `.env.local`
- Add `KAFKA_BROKERS=localhost:9092`
- Add `KAFKA_CLIENT_ID=zozo-booking`
- Add `KAFKA_GROUP_ID=zozo-booking-consumers`

#### [MODIFY] [app/api/socket/route.ts](file:///Users/quangsonpham/Documents/git/zozo-booking/app/api/socket/route.ts)
- Export the `io` server instance so the Kafka consumer worker can reference it (or use a shared Redis adapter for Socket.IO scaling).

---

### Implementation Detail: Event Flow

**Order item status update (current):**
```
Client → Server Action (updateOrderItemStatus)
  → DB transaction (update item, order, table)
  → [nothing emitted to browser currently]
```

**Order item status update (after Kafka):**
```
Client → Server Action (updateOrderItemStatus)
  → DB transaction (update item)
  → Kafka.publish("order.item.status.updated", { orderId, itemId, newStatus, restaurantId, tableId })

Kafka Consumer Worker:
  → Receives event
  → Updates Order status in DB if all items match
  → Updates Table status in DB if order terminal
  → Socket.IO emit to room `restaurant:{id}:table:{id}` → browsers notified in real-time
```

---

## Verification Plan

### Automated Tests
- Unit tests for `KafkaProducer` and `KafkaConsumer` (mock KafkaJS)
- Unit test that `updateOrderItemStatus` calls `producer.publishEvent` with correct payload

### Manual Verification
1. `docker-compose -f docker-compose.kafka.yml up -d` — start Kafka
2. `pnpm worker:dev` — start consumer in a second terminal
3. `pnpm dev` — start Next.js
4. Place an order, update item status → verify DB updates and browser real-time notification
5. Check Kafka topic using Kafka UI (included in docker-compose) at `localhost:8080`
