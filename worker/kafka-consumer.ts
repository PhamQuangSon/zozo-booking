/**
 * Kafka Consumer Worker
 *
 * This is a standalone Node.js process (NOT a Next.js API route).
 * It subscribes to all Kafka topics and handles:
 *   1. order.item.status.updated → cascade order + table status in DB
 *   2. All order events → emit real-time updates via Socket.IO
 *
 * Run with:
 *   pnpm worker:dev
 */

import "dotenv/config";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "node:http";

import { createConsumer } from "../lib/kafka/consumer";
import { KAFKA_TOPICS } from "../lib/kafka/topics";
import type {
  OrderCreatedEvent,
  OrderItemStatusUpdatedEvent,
  OrderStatusUpdatedEvent,
  TableStatusUpdatedEvent,
} from "../lib/kafka/topics";

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

// NOTE: No Prisma client here — DB writes happen in the Next.js server action
// (ACID transaction). This worker is ONLY responsible for real-time Socket.IO
// notifications. Separating concerns prevents double-write bugs.

// We run a lightweight HTTP server just for Socket.IO so the worker can
// broadcast to connected browser clients independently of Next.js.
// In production, configure Socket.IO with a Redis adapter so this worker and
// Next.js share the same pub/sub bus.
const WORKER_SOCKET_PORT = Number(process.env.WORKER_SOCKET_PORT ?? 3001);

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  path: "/socket.io",
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Worker Socket] Client connected: ${socket.id}`);

  socket.on("join-restaurant", ({ restaurantId }: { restaurantId: number }) => {
    const room = `restaurant:${restaurantId}`;
    socket.join(room);
  });

  socket.on(
    "join-table",
    ({ restaurantId, tableId }: { restaurantId: number; tableId: number }) => {
      const room = `restaurant:${restaurantId}:table:${tableId}`;
      socket.join(room);
    },
  );

  socket.on("disconnect", () => {
    console.log(`[Worker Socket] Client disconnected: ${socket.id}`);
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tableRoom(restaurantId: number, tableId: number) {
  return `restaurant:${restaurantId}:table:${tableId}`;
}

function restaurantRoom(restaurantId: number) {
  return `restaurant:${restaurantId}`;
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

/**
 * order.item.status.updated
 *
 * DB cascade (Order status + Table release) is already done ATOMICALLY inside
 * the Prisma transaction in updateOrderItemStatus() — server action.
 *
 * This handler's ONLY job: push real-time Socket.IO notifications to:
 *   - The specific table room  → customer-facing display
 *   - The restaurant room      → kitchen / admin dashboard
 */
async function handleOrderItemStatusUpdated(
  event: OrderItemStatusUpdatedEvent,
): Promise<void> {
  const { orderItemId, orderId, restaurantId, tableId, newStatus } =
    event.payload;

  console.log(
    `[Worker] 📡 Broadcast order.item.status.updated — item #${orderItemId} → ${newStatus}`,
  );

  const itemPayload = {
    type: "order.item.status.updated",
    orderItemId,
    orderId,
    newStatus,
    restaurantId,
    tableId,
  };

  // Emit to table room (customer screen) and restaurant room (kitchen display)
  if (tableId) {
    io.to(tableRoom(restaurantId, tableId)).emit(
      "order-item-status-updated",
      itemPayload,
    );
  }
  io.to(restaurantRoom(restaurantId)).emit(
    "order-item-status-updated",
    itemPayload,
  );
}

/**
 * order.created
 * Notify kitchen / admin dashboard that a new order has arrived.
 */
async function handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
  const { orderId, restaurantId, tableId } = event.payload;

  console.log(`[Worker] New order #${orderId} at restaurant #${restaurantId}`);

  const payload = { type: "order.created", ...event.payload };

  if (tableId) {
    io.to(tableRoom(restaurantId, tableId)).emit("order-created", payload);
  }
  io.to(restaurantRoom(restaurantId)).emit("order-created", payload);
}

/**
 * order.status.updated
 * A direct order-level status change (e.g. CANCELLED by staff).
 */
async function handleOrderStatusUpdated(
  event: OrderStatusUpdatedEvent,
): Promise<void> {
  const { orderId, restaurantId, tableId, newStatus } = event.payload;

  console.log(
    `[Worker] Order #${orderId} status → ${newStatus}`,
  );

  const payload = { type: "order.status.updated", ...event.payload };

  if (tableId) {
    io.to(tableRoom(restaurantId, tableId)).emit("order-status-updated", payload);
  }
  io.to(restaurantRoom(restaurantId)).emit("order-status-updated", payload);
}

/**
 * table.status.updated
 * A direct table status change (e.g. marked as maintenance).
 */
async function handleTableStatusUpdated(
  event: TableStatusUpdatedEvent,
): Promise<void> {
  const { tableId, restaurantId, newStatus } = event.payload;

  console.log(`[Worker] Table #${tableId} status → ${newStatus}`);

  const payload = { type: "table.status.updated", ...event.payload };

  io.to(tableRoom(restaurantId, tableId)).emit("table-status-updated", payload);
  io.to(restaurantRoom(restaurantId)).emit("table-status-updated", payload);
}

// ---------------------------------------------------------------------------
// Main — wire everything together
// ---------------------------------------------------------------------------

async function main() {
  console.log("[Worker] Starting Kafka consumer worker...");

  // Start the Socket.IO server
  await new Promise<void>((resolve) => {
    httpServer.listen(WORKER_SOCKET_PORT, () => {
      console.log(
        `[Worker] Socket.IO server listening on port ${WORKER_SOCKET_PORT}`,
      );
      resolve();
    });
  });

  // Create consumer and register handlers
  const consumer = await createConsumer();

  await consumer.subscribe([
    KAFKA_TOPICS.ORDER_CREATED,
    KAFKA_TOPICS.ORDER_ITEM_STATUS_UPDATED,
    KAFKA_TOPICS.ORDER_STATUS_UPDATED,
    KAFKA_TOPICS.TABLE_STATUS_UPDATED,
  ]);

  consumer
    .on<OrderCreatedEvent>("order.created", handleOrderCreated)
    .on<OrderItemStatusUpdatedEvent>(
      "order.item.status.updated",
      handleOrderItemStatusUpdated,
    )
    .on<OrderStatusUpdatedEvent>(
      "order.status.updated",
      handleOrderStatusUpdated,
    )
    .on<TableStatusUpdatedEvent>(
      "table.status.updated",
      handleTableStatusUpdated,
    );

  await consumer.run();

  console.log("[Worker] Listening for Kafka events...");

  // ---------------------------------------------------------------------------
  // Graceful shutdown
  // ---------------------------------------------------------------------------
  const shutdown = async (signal: string) => {
    console.log(`\n[Worker] Received ${signal}. Shutting down gracefully...`);
    await consumer.disconnect();
    httpServer.close(() => {
      console.log("[Worker] HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[Worker] Fatal error:", err);
  process.exit(1);
});
