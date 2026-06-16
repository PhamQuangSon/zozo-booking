import type { Consumer, EachMessagePayload } from "kafkajs";

import { getKafkaClient } from "./kafka-client";
import type { KafkaEvent, KafkaTopic } from "./topics";

export type EventHandler<T extends KafkaEvent = KafkaEvent> = (
  event: T,
) => Promise<void>;

/**
 * Typed Kafka consumer factory.
 *
 * Usage:
 *   const consumer = await createConsumer("zozo-booking-consumers");
 *   await consumer.subscribe(["order.item.status.updated"]);
 *   consumer.on("order.item.status.updated", async (event) => { ... });
 *   await consumer.run();
 */
export class KafkaConsumer {
  private consumer: Consumer;
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor(consumer: Consumer) {
    this.consumer = consumer;
  }

  /** Register a typed handler for a specific event type. */
  on<T extends KafkaEvent>(
    eventType: T["type"],
    handler: EventHandler<T>,
  ): this {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(eventType, [...existing, handler as EventHandler]);
    return this;
  }

  /** Subscribe to one or more Kafka topics. */
  async subscribe(topics: KafkaTopic[]): Promise<void> {
    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }
  }

  /** Start consuming messages and dispatching to registered handlers. */
  async run(): Promise<void> {
    await this.consumer.run({
      // Process one message at a time per partition to preserve order.
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;

        if (!message.value) {
          console.warn(`[Kafka] Received empty message on ${topic}:${partition}`);
          return;
        }

        let event: KafkaEvent;
        try {
          event = JSON.parse(message.value.toString()) as KafkaEvent;
        } catch (err) {
          console.error(
            `[Kafka] Failed to parse message on ${topic}:${partition}`,
            err,
          );
          return;
        }

        const handlers = this.handlers.get(event.type) ?? [];

        if (handlers.length === 0) {
          if (process.env.NODE_ENV !== "production") {
            console.log(`[Kafka] No handler registered for event type: ${event.type}`);
          }
          return;
        }

        for (const handler of handlers) {
          try {
            await handler(event);
          } catch (err) {
            console.error(
              `[Kafka] Handler failed for ${event.type} on ${topic}:${partition} offset ${message.offset}`,
              err,
            );
            // TODO: Route to DLQ topic in a future iteration
          }
        }
      },
    });
  }

  /** Gracefully disconnect the consumer. */
  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }
}

/**
 * Create and connect a new KafkaConsumer with the given group ID.
 */
export async function createConsumer(groupId?: string): Promise<KafkaConsumer> {
  const kafka = getKafkaClient();
  const consumer = kafka.consumer({
    groupId: groupId ?? process.env.KAFKA_GROUP_ID ?? "zozo-booking-consumers",
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    retry: {
      retries: 5,
      initialRetryTime: 300,
    },
  });

  await consumer.connect();
  console.log("[Kafka] Consumer connected");

  return new KafkaConsumer(consumer);
}
