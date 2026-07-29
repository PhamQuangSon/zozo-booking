import { NextResponse } from "next/server";
import { getStripeAppUrl, stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, tableId, locale = "en", currency = "USD" } = body;

    if (!restaurantId || !tableId) {
      return new NextResponse("Restaurant ID and Table ID are required", { status: 400 });
    }

    // Find active unpaid orders for this table
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: Number(restaurantId),
        tableId: Number(tableId),
        status: { notIn: ["COMPLETED", "PAID", "CANCELLED"] },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
            orderItemChoices: {
              include: {
                optionChoice: true,
              },
            },
          },
        },
      },
    });

    if (orders.length === 0) {
      return new NextResponse("No active unpaid orders found for this table", { status: 404 });
    }

    const line_items: any[] = [];
    const orderIds: number[] = [];

    // Calculate line items for Stripe Checkout
    for (const order of orders) {
      orderIds.push(order.id);
      
      for (const item of order.orderItems) {
        // Calculate the actual unit price including options
        let unitPrice = Number(item.unitPrice);
        
        if (item.orderItemChoices && item.orderItemChoices.length > 0) {
          for (const choice of item.orderItemChoices) {
            unitPrice += Number(choice.optionChoice.priceAdjustment);
          }
        }

        let unit_amount = Math.round(unitPrice);
        const stripeCurrency = currency.toLowerCase();
        if (stripeCurrency !== "vnd") {
          unit_amount = Math.round(unitPrice * 100);
        }

        line_items.push({
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: item.menuItem.name,
              description: item.notes || undefined,
            },
            unit_amount: unit_amount,
          },
          quantity: item.quantity,
        });
      }
    }

    // Tax calculation (8% as an example, matching frontend logic)
    // You could also use Stripe Tax if configured
    const subtotal = line_items.reduce((acc, item) => acc + (item.price_data.unit_amount * item.quantity), 0);
    const tax = Math.round(subtotal * 0.08);

    if (tax > 0) {
      line_items.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: "Tax (8%)",
          },
          unit_amount: tax,
        },
        quantity: 1,
      });
    }

    const origin = req.headers.get("origin") || req.headers.get("referer") || getStripeAppUrl();
    const appUrl = origin.replace(/\/$/, ""); // Remove trailing slash if any

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Add more if needed (e.g., 'alipay', 'wechat_pay')
      line_items,
      mode: "payment",
      success_url: `${appUrl}/${locale}/payment/success?session_id={CHECKOUT_SESSION_ID}&restaurantId=${restaurantId}&tableId=${tableId}`,
      cancel_url: `${appUrl}/${locale}/restaurants/${restaurantId}/${tableId}?payment_cancelled=true`,
      metadata: {
        orderIds: JSON.stringify(orderIds),
        restaurantId: restaurantId.toString(),
        tableId: tableId.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    
    // Check if it's an API key error to provide a generic message to users
    const isApiKeyError = error instanceof Error && error.message.toLowerCase().includes("api key");
    const errorMessage = isApiKeyError 
      ? "Payment system is currently unavailable. Please contact support." 
      : (error instanceof Error ? error.message : "Internal Server Error");
      
    return new NextResponse(errorMessage, { status: 500 });
  }
}
