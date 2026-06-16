/**
 * Kafka topic names used across the application.
 * Keep these in sync with the topics created in docker-compose.kafka.yml.
 */
export const KAFKA_TOPICS = {
  ORDER_CREATED: "order.created",
  ORDER_ITEM_STATUS_UPDATED: "order.item.status.updated",
  ORDER_STATUS_UPDATED: "order.status.updated",
  TABLE_STATUS_UPDATED: "table.status.updated",
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

// ---------------------------------------------------------------------------
// Typed event payloads (discriminated union)
// ---------------------------------------------------------------------------

export interface OrderCreatedEvent {
  type: "order.created";
  payload: {
    orderId: number;
    restaurantId: number;
    tableId: number | null;
    totalAmount: number;
    userId: string | null;
    createdAt: string; // ISO string
  };
}

export interface OrderItemStatusUpdatedEvent {
  type: "order.item.status.updated";
  payload: {
    orderItemId: number;
    orderId: number;
    restaurantId: number;
    tableId: number | null;
    newStatus: string;
    updatedAt: string; // ISO string
  };
}

export interface OrderStatusUpdatedEvent {
  type: "order.status.updated";
  payload: {
    orderId: number;
    restaurantId: number;
    tableId: number | null;
    newStatus: string;
    updatedAt: string;
  };
}

export interface TableStatusUpdatedEvent {
  type: "table.status.updated";
  payload: {
    tableId: number;
    restaurantId: number;
    newStatus: string;
    updatedAt: string;
  };
}

export type KafkaEvent =
  | OrderCreatedEvent
  | OrderItemStatusUpdatedEvent
  | OrderStatusUpdatedEvent
  | TableStatusUpdatedEvent;
