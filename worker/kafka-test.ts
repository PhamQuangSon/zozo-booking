/**
 * Kafka Integration Test Script
 *
 * Tests the full Kafka EDA pipeline:
 *   1. Connects to the broker
 *   2. Verifies all 4 topics exist (creates them if missing)
 *   3. Subscribes a consumer FIRST
 *   4. Produces one message per topic
 *   5. Verifies round-trip receipt by the consumer
 *
 * Run with: pnpm kafka:test
 */

import "dotenv/config";
import { Kafka, logLevel } from "kafkajs";
import { KAFKA_TOPICS } from "../lib/kafka/topics";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

const ok = (msg: string) => console.log(`${GREEN}  ✓ ${msg}${RESET}`);
const fail = (msg: string) => console.log(`${RED}  ✗ ${msg}${RESET}`);
const info = (msg: string) => console.log(`${CYAN}  ℹ ${msg}${RESET}`);
const section = (msg: string) => console.log(`\n${YELLOW}▶ ${msg}${RESET}`);

const BROKERS = (process.env.KAFKA_BROKERS ?? "localhost:19092")
  .split(",")
  .map((b) => b.trim());

const kafka = new Kafka({
  clientId: "zozo-booking-test",
  brokers: BROKERS,
  logLevel: logLevel.ERROR,
  retry: { retries: 3, initialRetryTime: 300 },
});

const admin = kafka.admin();
const producer = kafka.producer({ idempotent: false });
const consumer = kafka.consumer({ groupId: `zozo-test-${Date.now()}` });

const TOPICS = Object.values(KAFKA_TOPICS);

const testMessages: Record<string, object> = {
  [KAFKA_TOPICS.ORDER_CREATED]: {
    type: "order.created",
    payload: {
      orderId: 9001,
      restaurantId: 1,
      tableId: 3,
      totalAmount: 45.99,
      userId: "test-user",
      createdAt: new Date().toISOString(),
    },
    publishedAt: new Date().toISOString(),
  },
  [KAFKA_TOPICS.ORDER_ITEM_STATUS_UPDATED]: {
    type: "order.item.status.updated",
    payload: {
      orderItemId: 1,
      orderId: 9001,
      restaurantId: 1,
      tableId: 3,
      newStatus: "COMPLETED",
      updatedAt: new Date().toISOString(),
    },
    publishedAt: new Date().toISOString(),
  },
  [KAFKA_TOPICS.ORDER_STATUS_UPDATED]: {
    type: "order.status.updated",
    payload: {
      orderId: 9001,
      restaurantId: 1,
      tableId: 3,
      newStatus: "COMPLETED",
      updatedAt: new Date().toISOString(),
    },
    publishedAt: new Date().toISOString(),
  },
  [KAFKA_TOPICS.TABLE_STATUS_UPDATED]: {
    type: "table.status.updated",
    payload: {
      tableId: 3,
      restaurantId: 1,
      newStatus: "AVAILABLE",
      updatedAt: new Date().toISOString(),
    },
    publishedAt: new Date().toISOString(),
  },
};

async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  🚀  Kafka Integration Tests — zozo-booking`);
  console.log(`${"═".repeat(60)}`);
  info(`Broker: ${BROKERS.join(", ")}`);

  // ─────────────────────────────────────────
  // Step 1 — Admin: connect + verify topics
  // ─────────────────────────────────────────
  section("Step 1 — Admin: connect to broker");
  await admin.connect();
  ok(`Connected to broker at ${BROKERS.join(", ")}`);
  passed++;

  section("Step 2 — Verify / create topics");
  const existingTopics = await admin.listTopics();
  info(`Existing topics: ${existingTopics.filter((t) => !t.startsWith("__")).join(", ") || "(none)"}`);

  const missingTopics = TOPICS.filter((t) => !existingTopics.includes(t));
  if (missingTopics.length > 0) {
    await admin.createTopics({
      topics: missingTopics.map((topic) => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1,
      })),
    });
    ok(`Created missing topics: ${missingTopics.join(", ")}`);
  }

  const allTopics = await admin.listTopics();
  for (const topic of TOPICS) {
    if (allTopics.includes(topic)) {
      ok(`Topic "${topic}" exists ✓`);
      passed++;
    } else {
      fail(`Topic "${topic}" not found!`);
      failed++;
    }
  }
  await admin.disconnect();

  // ─────────────────────────────────────────
  // Step 3 — Consumer: subscribe FIRST
  // ─────────────────────────────────────────
  section("Step 3 — Consumer: connect and subscribe");
  await consumer.connect();
  ok("Consumer connected");
  passed++;

  for (const topic of TOPICS) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }
  ok(`Subscribed to ${TOPICS.length} topics (fromBeginning: false)`);
  passed++;

  const received = new Set<string>();
  const TIMEOUT_MS = 8000;

  // Start the consumer running — messages will arrive after producer sends
  const roundTripPromise = new Promise<void>((resolve) => {
    consumer
      .run({
        eachMessage: async ({ topic, message }) => {
          if (!received.has(topic) && message.value) {
            try {
              const parsed = JSON.parse(message.value.toString());
              if (parsed.publishedAt) {
                received.add(topic);
                ok(`Round-trip confirmed: "${topic}" (key: ${message.key?.toString() ?? "null"})`);
                passed++;
              }
            } catch {
              /* ignore malformed messages */
            }
          }
          if (received.size >= TOPICS.length) resolve();
        },
      })
      .catch(() => resolve());

    // Timeout fallback
    setTimeout(resolve, TIMEOUT_MS);
  });

  // Brief pause to let consumer join the group before we produce
  await new Promise((r) => setTimeout(r, 800));

  // ─────────────────────────────────────────
  // Step 4 — Producer: publish test messages
  // ─────────────────────────────────────────
  section("Step 4 — Producer: publish one message per topic");
  await producer.connect();
  ok("Producer connected");
  passed++;

  for (const topic of TOPICS) {
    const message = testMessages[topic];
    try {
      await producer.send({
        topic,
        messages: [
          {
            key: String(
              (message as any).payload?.orderId ??
                (message as any).payload?.tableId ??
                "test",
            ),
            value: JSON.stringify(message),
          },
        ],
      });
      ok(`Published to "${topic}"`);
      passed++;
    } catch (err) {
      fail(`Failed to publish to "${topic}": ${err}`);
      failed++;
    }
  }

  // ─────────────────────────────────────────
  // Step 5 — Wait for round-trip
  // ─────────────────────────────────────────
  section(`Step 5 — Waiting for round-trip confirmations (${TIMEOUT_MS}ms timeout)...`);
  await roundTripPromise;

  for (const topic of TOPICS) {
    if (!received.has(topic)) {
      fail(`No round-trip for "${topic}" within ${TIMEOUT_MS}ms`);
      failed++;
    }
  }

  // ─────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────
  console.log(`\n${"═".repeat(60)}`);
  const status = failed === 0 ? `${GREEN}ALL TESTS PASSED ✓${RESET}` : `${RED}${failed} TESTS FAILED ✗${RESET}`;
  console.log(`  ${status}`);
  console.log(`  ${GREEN}${passed} passed${RESET} / ${failed > 0 ? RED : ""}${failed} failed${RESET}`);
  console.log(`${"═".repeat(60)}\n`);

  await producer.disconnect();
  await consumer.disconnect();

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error(`${RED}[TEST] Fatal error:${RESET}`, err);
  process.exit(1);
});
