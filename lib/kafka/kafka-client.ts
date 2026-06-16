import { Kafka, type KafkaConfig, logLevel } from "kafkajs";

/**
 * Singleton KafkaJS client.
 * Config is driven entirely from environment variables so it works
 * against a local Redpanda container, Upstash, Confluent Cloud, etc.
 *
 * Required env vars:
 *   KAFKA_BROKERS      — comma-separated list, e.g. "localhost:9092"
 *   KAFKA_CLIENT_ID    — unique identifier for this application
 *
 * Optional env vars:
 *   KAFKA_USERNAME     — SASL username (Upstash / Confluent)
 *   KAFKA_PASSWORD     — SASL password
 *   KAFKA_SSL          — set to "true" to enable TLS (required for cloud brokers)
 */

function buildKafkaConfig(): KafkaConfig {
  const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  const clientId = process.env.KAFKA_CLIENT_ID ?? "zozo-booking";

  const useSSL = process.env.KAFKA_SSL === "true";
  const username = process.env.KAFKA_USERNAME;
  const password = process.env.KAFKA_PASSWORD;

  const config: KafkaConfig = {
    clientId,
    brokers,
    logLevel: process.env.NODE_ENV === "production" ? logLevel.WARN : logLevel.INFO,
  };

  if (useSSL) {
    config.ssl = true;
  }

  if (username && password) {
    config.sasl = {
      mechanism: "plain",
      username,
      password,
    };
  }

  return config;
}

// Module-level singleton — re-used across hot-reload in dev
let _kafka: Kafka | null = null;

export function getKafkaClient(): Kafka {
  if (!_kafka) {
    _kafka = new Kafka(buildKafkaConfig());
  }
  return _kafka;
}
