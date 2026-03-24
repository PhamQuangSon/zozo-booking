import { describe, expect, it } from "vitest";

import type { OrderItemStatus } from "@prisma/client";

import {
  areAllOrderItemsAtStatus,
  orderItemStatusToOrderStatus,
  shouldReleaseTableAfterItemStatusUpdate,
} from "./order-status";

describe("orderItemStatusToOrderStatus", () => {
  it("maps terminal statuses correctly", () => {
    expect(orderItemStatusToOrderStatus.COMPLETED).toBe("COMPLETED");
    expect(orderItemStatusToOrderStatus.CANCELLED).toBe("CANCELLED");
  });

  it("keeps READY and DELIVERED at PREPARING order state", () => {
    expect(orderItemStatusToOrderStatus.READY).toBe("PREPARING");
    expect(orderItemStatusToOrderStatus.DELIVERED).toBe("PREPARING");
  });
});

describe("areAllOrderItemsAtStatus", () => {
  it("returns true when all items have target status", () => {
    const statuses: OrderItemStatus[] = ["COMPLETED", "COMPLETED", "COMPLETED"];

    expect(areAllOrderItemsAtStatus(statuses, "COMPLETED")).toBe(true);
  });

  it("returns false for empty status list", () => {
    expect(areAllOrderItemsAtStatus([], "NEW" as OrderItemStatus)).toBe(false);
  });

  it("returns false when at least one item differs", () => {
    const statuses: OrderItemStatus[] = ["PREPARING", "READY"];
    expect(areAllOrderItemsAtStatus(statuses, "PREPARING")).toBe(false);
  });
});

describe("shouldReleaseTableAfterItemStatusUpdate", () => {
  it("releases table for terminal status with no active orders", () => {
    expect(
      shouldReleaseTableAfterItemStatusUpdate({
        newStatus: "COMPLETED" as OrderItemStatus,
        hasTable: true,
        activeOrdersCount: 0,
      })
    ).toBe(true);
  });

  it("does not release table when status is non-terminal", () => {
    expect(
      shouldReleaseTableAfterItemStatusUpdate({
        newStatus: "PREPARING" as OrderItemStatus,
        hasTable: true,
        activeOrdersCount: 0,
      })
    ).toBe(false);
  });

  it("does not release table when there are active orders", () => {
    expect(
      shouldReleaseTableAfterItemStatusUpdate({
        newStatus: "CANCELLED" as OrderItemStatus,
        hasTable: true,
        activeOrdersCount: 2,
      })
    ).toBe(false);
  });
});
