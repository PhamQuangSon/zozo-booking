import type { Producer } from "kafkajs";

import { getKafkaClient } from "./kafka-client";
import type { KafkaEvent, KafkaTopic } from "./topics";

/**
 * Typed Kafka producer wrapper.
 *
 * Usage (server-side only):
 *   const producer = await getProducer();
 *   await producer.publishEvent("order.created", { ... });
 */

let _producer: Producer | null = null;
let _connecting = false;

export async function getProducer(): Promise<KafkaProducer> {
  if (!_producer) {
    const kafka = getKafkaClient();
    _producer = kafka.producer({
      // Idempotent producer prevents duplicate messages on retry
      idempotent: true,
      maxInFlightRequests: 5,
      retry: {
        retries: 5,
        initialRetryTime: 300,
      },
    });
  }

  if (!_connecting) {
    try {
      _connecting = true;
      await _producer.connect();
    } catch {
      // Already connected — KafkaJS will throw if called twice; ignore.
    } finally {
      _connecting = false;
    }
  }

  return new KafkaProducer(_producer);
}

export class KafkaProducer {
  constructor(private readonly producer: Producer) {}

  /**
   * Publish a typed event to the given Kafka topic.
   * The event type narrows the payload automatically.
   */
  async publishEvent<T extends KafkaEvent>(
    topic: KafkaTopic,
    event: T,
  ): Promise<void> {
    const message = JSON.stringify({
      ...event,
      publishedAt: new Date().toISOString(),
    });

    await this.producer.send({
      topic,
      messages: [
        {
          // Use the primary entity ID as the partition key so related events
          // land on the same partition and are processed in order.
          key: String(
            (event.payload as Record<string, unknown>).orderId ??
              (event.payload as Record<string, unknown>).tableId ??
              "unknown",
          ),
          value: message,
        },
      ],
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Kafka] Published ${event.type} to ${topic}`);
    }
  }

  /**
   * Gracefully disconnect. Call this in process shutdown hooks.
   */
  async disconnect(): Promise<void> {
    if (_producer) {
      await _producer.disconnect();
      _producer = null;
    }
  }
}

/**
 * Fire-and-forget helper for server actions.
 * Swallows errors to avoid breaking the primary write path.
 * Logs failures prominently so they are visible in monitoring.
 */
export async function safePublishEvent<T extends KafkaEvent>(
  topic: KafkaTopic,
  event: T,
): Promise<void> {
  try {
    const producer = await getProducer();
    await producer.publishEvent(topic, event);
  } catch (err) {
    console.error(
      `[Kafka] Failed to publish ${event.type} to ${topic}:`,
      err,
    );
    // Do NOT re-throw — Kafka failure must never break the API response.
  }
}
