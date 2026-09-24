import { streamText, tool } from "ai";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import prisma from "@/lib/prisma";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { MAX_GUESTS_PER_RESERVATION } from "@/lib/reservation";
import { reserveTable } from "@/lib/reservation-service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Timezone the assistant uses to interpret "tonight", "7pm tomorrow", etc.
const RESTAURANT_TIMEZONE = process.env.RESTAURANT_TIMEZONE || "Asia/Ho_Chi_Minh";
const MAX_QUANTITY_PER_ITEM = 50;

const checkRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 15 });

export async function POST(req: Request) {
  try {
    const { messages, restaurantId: rawRestaurantId, tableId: rawTableId } = await req.json();

    const restaurantId = Number(rawRestaurantId);
    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    // IP-based Rate Limiting (Simple Anti-Spam)
    if (!checkRateLimit(getClientIp(req.headers)).allowed) {
      return NextResponse.json(
        { error: "Too many requests (Rate Limited). Please slow down." },
        { status: 429 },
      );
    }

    // The table the customer is sitting at (from the table page). Only trust it if it
    // belongs to this restaurant, since the value comes straight from the client.
    let tableId: number | null = null;
    if (rawTableId !== undefined && rawTableId !== null && rawTableId !== "") {
      const table = await prisma.table.findFirst({
        where: { id: Number(rawTableId), restaurantId },
        select: { id: true },
      });
      if (!table) {
        return NextResponse.json({ error: "Table not found for this restaurant" }, { status: 400 });
      }
      tableId = table.id;
    }

    // Fetch config and menu items concurrently
    const [config, restaurantData] = await Promise.all([
      prisma.chatbotConfig.findUnique({
        where: { restaurantId },
      }),
      prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
          categories: {
            orderBy: { displayOrder: "asc" },
            include: {
              items: {
                where: { isAvailable: true },
                orderBy: { displayOrder: "asc" },
              },
            },
          },
        },
      }),
    ]);

    if (!config || !config.isActive) {
      return NextResponse.json(
        { error: "Chatbot is currently disabled for this restaurant." },
        { status: 403 },
      );
    }

    // Session limit check
    if (messages.length > (config.maxMessages || 20)) {
      return NextResponse.json(
        {
          error: `Maximum limit of ${config.maxMessages} messages reached. Please refresh the page to start a new session.`,
        },
        { status: 429 },
      );
    }

    // Format menu context
    let menuContext = "Here is the current menu:\n\n";
    if (restaurantData?.categories) {
      for (const category of restaurantData.categories) {
        menuContext += `**${category.name}**\n`;
        for (const item of category.items) {
          menuContext += `- [ID: ${item.id}] ${item.name}: $${item.price.toString()} ${item.description ? `(${item.description})` : ""}\n`;
        }
        menuContext += "\n";
      }
    }

    // Fetch Active Orders Context if sitting at a table
    let orderContext = "";
    if (tableId) {
      const activeOrders = await prisma.order.findMany({
        where: {
          tableId,
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
        include: {
          orderItems: {
            include: { menuItem: true },
          },
        },
      });

      if (activeOrders.length > 0) {
        orderContext = `\n[CURRENT TABLE ORDERS]\nThe user is currently sitting at Table ${tableId}. Here are their active orders:\n`;
        activeOrders.forEach((order) => {
          orderContext += `- Order #${order.id} (Total: $${order.totalAmount}, Status: ${order.status})\n`;
          order.orderItems.forEach((item) => {
            orderContext += `  * ${item.quantity}x ${item.menuItem.name} (Status: ${item.status})\n`;
          });
        });
        orderContext += `\nIf they ask "where is my food" or "what did I order", use this exact context to answer them! Interpret statuses for them (e.g., NEW = just ordered/received, PREPARING = cooking, READY = serving soon). Do NOT say you cannot check orders.\n`;
      } else {
        orderContext = `\n[CURRENT TABLE ORDERS]\nThe user is currently sitting at Table ${tableId}. They currently have NO active orders.\n`;
      }
    }

    const nowInRestaurant = new Intl.DateTimeFormat("en-GB", {
      timeZone: RESTAURANT_TIMEZONE,
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date());

    const systemPrompt = `
${config.systemPrompt}

[IMPORTANT INSTRUCTIONS FOR AI ASSISTANT]
You have the ability to book tables and place food orders using your tools!
- The current date and time at the restaurant is ${nowInRestaurant} (timezone ${RESTAURANT_TIMEZONE}).
- If the user wants to book a table, collect the number of guests, the date and time, their name and their phone number (ask for anything missing), then use the 'book_table' tool. Convert the requested time into ISO 8601 with the restaurant's UTC offset. Once booked, tell them their table number and reservation time.
  * Only if the reservation is for right now, also provide a clickable link to their table in this format: [Go to Table](/restaurants/${restaurantId}/{tableId}).
- If the user wants to order food OR check their order status, you MUST check if you are currently at a table (see [CURRENT TABLE ORDERS] below). 
  * If you ARE at a table, use the 'order_food' tool with the exact [ID: ...] of the menu items they want.
  * If you ARE NOT at a table (the context says NO active orders or the context is missing), politely inform them: "Bạn cần phải truy cập vào trang Bàn của mình (hoặc yêu cầu tôi đặt một bàn mới) trước khi có thể gọi món hoặc kiểm tra trạng thái món ăn nhé!"
- NEVER ask the user to provide their table number in the chat to check orders. They must click the link to go to their table first.
- ALWAYS use tools when the user explicitly requests to book or order.
${orderContext}

${menuContext}
    `.trim();

    // Handle deprecated models transparently
    let modelName = config.modelName;
    if (modelName === "gemini-1.5-flash") modelName = "gemini-2.5-flash";
    if (modelName === "gemini-1.5-pro") modelName = "gemini-2.5-pro";

    // Select the model based on config
    const isGemini = modelName.includes("gemini");

    // Choose model provider with explicit API keys
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const model = isGemini ? google(modelName) : openai(modelName);

    const result = await streamText({
      model,
      messages,
      system: systemPrompt,
      temperature: config.temperature,
      maxSteps: 5,
      tools: {
        book_table: tool({
          description:
            "Reserves a table for a party at a given date and time. The restaurant automatically assigns the smallest free table that fits.",
          parameters: z.object({
            guests: z
              .number()
              .int()
              .min(1)
              .max(MAX_GUESTS_PER_RESERVATION)
              .describe("The number of guests/people to seat."),
            reservedAt: z
              .string()
              .datetime({ offset: true })
              .describe(
                "Reservation start time in ISO 8601 with UTC offset, e.g. 2026-09-24T19:00:00+07:00.",
              ),
            customerName: z.string().min(1).max(100).describe("Name for the reservation."),
            customerPhone: z.string().min(8).max(20).describe("Contact phone number."),
            notes: z.string().max(500).optional().describe("Special requests, if any."),
          }),
          execute: async ({ guests, reservedAt, customerName, customerPhone, notes }) => {
            try {
              const result = await reserveTable({
                restaurantId,
                reservedAt: new Date(reservedAt),
                guests,
                customerName,
                customerPhone,
                notes,
                source: "chatbot",
              });

              if (!result.success) {
                return { success: false, message: result.error };
              }

              const { reservation } = result;
              return {
                success: true,
                reservationId: reservation.id,
                tableId: reservation.tableId,
                tableNumber: reservation.tableNumber,
                reservedAt: reservation.reservedAt.toISOString(),
                message: `Successfully reserved table ${reservation.tableNumber} for ${guests} guests.`,
              };
            } catch (error) {
              console.error("Chatbot book_table failed:", error);
              return { success: false, message: "Failed to create the reservation." };
            }
          },
        }),
        order_food: tool({
          description: "Places a food order for the table the customer is currently sitting at.",
          parameters: z.object({
            items: z
              .array(
                z.object({
                  menuItemId: z
                    .number()
                    .int()
                    .describe("The exact ID of the menu item from the menu context."),
                  quantity: z
                    .number()
                    .int()
                    .min(1)
                    .max(MAX_QUANTITY_PER_ITEM)
                    .describe("The quantity of this item."),
                }),
              )
              .min(1)
              .describe("List of items to order."),
          }),
          execute: async ({ items }) => {
            // Never trust a table chosen by the model: only the verified table from the page context.
            if (!tableId) {
              return {
                success: false,
                message: "The customer must open their table page before ordering.",
              };
            }

            try {
              // Only items from this restaurant's current menu can be ordered.
              const menuItemIds = items.map((i) => i.menuItemId);
              const menuItems = await prisma.menuItem.findMany({
                where: { id: { in: menuItemIds }, restaurantId, isAvailable: true },
              });

              let totalAmount = 0;
              const validItems = [];

              for (const item of items) {
                const dbItem = menuItems.find((mi) => mi.id === item.menuItemId);
                if (dbItem) {
                  totalAmount += Number(dbItem.price) * item.quantity;
                  validItems.push({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    unitPrice: dbItem.price,
                  });
                }
              }

              if (validItems.length === 0) {
                return { success: false, message: "No valid menu items found to order." };
              }

              const order = await prisma.order.create({
                data: {
                  restaurantId,
                  tableId,
                  status: "NEW",
                  totalAmount: totalAmount,
                  notes: "Ordered via AI Chatbot",
                  orderItems: {
                    create: validItems.map((vi) => ({
                      menuItemId: vi.menuItemId,
                      quantity: vi.quantity,
                      unitPrice: vi.unitPrice,
                      status: "NEW",
                    })),
                  },
                },
              });

              return {
                success: true,
                orderId: order.id,
                totalAmount: totalAmount,
                skippedItems: items.length - validItems.length,
                message: "Order has been placed successfully and sent to the kitchen.",
              };
            } catch (error) {
              console.error("Chatbot order_food failed:", error);
              return { success: false, message: "Failed to place order." };
            }
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "An error occurred during your request." }, { status: 500 });
  }
}
