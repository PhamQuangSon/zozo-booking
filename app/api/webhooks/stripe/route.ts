import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (error: any) {
    console.error(`[WEBHOOK_ERROR] ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    // Retrieve metadata
    const orderIdsRaw = session.metadata?.orderIds;

    if (orderIdsRaw) {
      try {
        const orderIds = JSON.parse(orderIdsRaw) as number[];

        // Update all orders to PAID
        await prisma.$transaction(async (tx) => {
          for (const orderId of orderIds) {
            await tx.order.update({
              where: { id: orderId },
              data: { status: "PAID" },
            });

            // Optionally update items too if we track item status similarly
            await tx.orderItem.updateMany({
              where: { orderId },
              data: { status: "COMPLETED" },
            });
          }

          // Optionally release the table if all active orders are PAID
          const tableId = session.metadata?.tableId;
          if (tableId) {
            const activeOrders = await tx.order.count({
              where: {
                tableId: Number(tableId),
                status: { notIn: ["COMPLETED", "PAID", "CANCELLED"] },
              },
            });

            if (activeOrders === 0) {
              await tx.table.update({
                where: { id: Number(tableId) },
                data: { status: "AVAILABLE" },
              });
            }
          }
        });

        console.log(`[WEBHOOK_SUCCESS] Orders ${orderIdsRaw} marked as PAID`);
      } catch (err) {
        console.error("[WEBHOOK_DB_ERROR] Failed to update orders:", err);
        return new NextResponse("Database Error", { status: 500 });
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
