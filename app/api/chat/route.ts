import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory rate limiting store (cleared on server restart)
type RateLimitInfo = { count: number; resetTime: number };
const ipRateLimits = new Map<string, RateLimitInfo>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 15;

export async function POST(req: Request) {
  try {
    const { messages, restaurantId, tableId } = await req.json();

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // IP-based Rate Limiting (Simple Anti-Spam)
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    const now = Date.now();
    const rateInfo = ipRateLimits.get(ip);

    if (rateInfo) {
      if (now > rateInfo.resetTime) {
        ipRateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      } else if (rateInfo.count >= MAX_REQUESTS_PER_MINUTE) {
        return NextResponse.json(
          { error: 'Too many requests (Rate Limited). Please slow down.' },
          { status: 429 }
        );
      } else {
        rateInfo.count++;
      }
    } else {
      ipRateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    }

    // Optional: Clean up old IPs periodically if Map gets too big (prevent memory leak)
    if (ipRateLimits.size > 1000) {
      const keysToDelete = Array.from(ipRateLimits.entries())
        .filter(([_, info]) => info.resetTime < now)
        .map(([key]) => key);
      keysToDelete.forEach(k => ipRateLimits.delete(k));
    }

    // Fetch config and menu items concurrently
    const [config, restaurantData] = await Promise.all([
      prisma.chatbotConfig.findUnique({
        where: { restaurantId: Number(restaurantId) },
      }),
      prisma.restaurant.findUnique({
        where: { id: Number(restaurantId) },
        include: {
          categories: {
            orderBy: { displayOrder: 'asc' },
            include: {
              items: {
                where: { isAvailable: true },
                orderBy: { displayOrder: 'asc' },
              }
            }
          }
        }
      })
    ]);

    if (!config || !config.isActive) {
      return NextResponse.json(
        { error: 'Chatbot is currently disabled for this restaurant.' },
        { status: 403 }
      );
    }

    // Session limit check
    if (messages.length > (config.maxMessages || 20)) {
      return NextResponse.json(
        { error: `Maximum limit of ${config.maxMessages} messages reached. Please refresh the page to start a new session.` },
        { status: 429 }
      );
    }

    // Format menu context
    let menuContext = 'Here is the current menu:\n\n';
    if (restaurantData?.categories) {
      for (const category of restaurantData.categories) {
        menuContext += `**${category.name}**\n`;
        for (const item of category.items) {
          menuContext += `- [ID: ${item.id}] ${item.name}: $${item.price.toString()} ${item.description ? `(${item.description})` : ''}\n`;
        }
        menuContext += '\n';
      }
    }

    // Fetch Active Orders Context if sitting at a table
    let orderContext = '';
    if (tableId) {
      const activeOrders = await prisma.order.findMany({
        where: {
          tableId: Number(tableId),
          status: { notIn: ['COMPLETED', 'CANCELLED'] }
        },
        include: {
          orderItems: {
            include: { menuItem: true }
          }
        }
      });
      
      if (activeOrders.length > 0) {
        orderContext = `\n[CURRENT TABLE ORDERS]\nThe user is currently sitting at Table ${tableId}. Here are their active orders:\n`;
        activeOrders.forEach(order => {
          orderContext += `- Order #${order.id} (Total: $${order.totalAmount}, Status: ${order.status})\n`;
          order.orderItems.forEach(item => {
            orderContext += `  * ${item.quantity}x ${item.menuItem.name} (Status: ${item.status})\n`;
          });
        });
        orderContext += `\nIf they ask "where is my food" or "what did I order", use this exact context to answer them! Interpret statuses for them (e.g., NEW = just ordered/received, PREPARING = cooking, READY = serving soon). Do NOT say you cannot check orders.\n`;
      } else {
        orderContext = `\n[CURRENT TABLE ORDERS]\nThe user is currently sitting at Table ${tableId}. They currently have NO active orders.\n`;
      }
    }

    const systemPrompt = `
${config.systemPrompt}

[IMPORTANT INSTRUCTIONS FOR AI ASSISTANT]
You have the ability to book tables and place food orders using your tools!
- If the user wants to book a table, ask for the number of guests (if not provided) and use the 'book_table' tool. Once booked, tell them their table number and ALWAYS provide a clickable link to their table in this format: [Go to Table](/restaurants/${restaurantId}/{tableId}).
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
    if (modelName === 'gemini-1.5-flash') modelName = 'gemini-2.5-flash';
    if (modelName === 'gemini-1.5-pro') modelName = 'gemini-2.5-pro';

    // Select the model based on config
    const isGemini = modelName.includes('gemini');

    // Choose model provider with explicit API keys
    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const model = isGemini
      ? google(modelName)
      : openai(modelName);

    const result = await streamText({
      model,
      messages,
      system: systemPrompt,
      temperature: config.temperature,
      maxSteps: 5,
      tools: {
        book_table: tool({
          description: 'Finds an available empty table for the user and marks it as booked/occupied.',
          parameters: z.object({
            guests: z.number().describe('The number of guests/people to seat.'),
          }),
          execute: async ({ guests }) => {
            // Find available table
            const table = await prisma.table.findFirst({
              where: {
                restaurantId: Number(restaurantId),
                status: 'AVAILABLE',
                capacity: { gte: guests },
              },
              orderBy: { capacity: 'asc' }, // Get the smallest table that fits
            });

            if (!table) {
              return { success: false, message: 'No available tables found for that capacity.' };
            }

            // Book it
            await prisma.table.update({
              where: { id: table.id },
              data: { status: 'OCCUPIED' },
            });

            return { 
              success: true, 
              tableId: table.id, 
              tableNumber: table.number, 
              capacity: table.capacity,
              message: `Successfully booked table ${table.number} (capacity: ${table.capacity})` 
            };
          },
        }),
        order_food: tool({
          description: 'Places a food order for a specific table.',
          parameters: z.object({
            tableId: z.number().describe('The ID of the table (NOT the table number).'),
            items: z.array(z.object({
              menuItemId: z.number().describe('The exact ID of the menu item from the menu context.'),
              quantity: z.number().describe('The quantity of this item.'),
            })).describe('List of items to order.'),
          }),
          execute: async ({ tableId, items }) => {
            try {
              // Get menu items to calculate price
              const menuItemIds = items.map(i => i.menuItemId);
              const menuItems = await prisma.menuItem.findMany({
                where: { id: { in: menuItemIds } }
              });

              let totalAmount = 0;
              const validItems = [];

              for (const item of items) {
                const dbItem = menuItems.find(mi => mi.id === item.menuItemId);
                if (dbItem) {
                  totalAmount += Number(dbItem.price) * item.quantity;
                  validItems.push({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    unitPrice: dbItem.price,
                    status: "NEW"
                  });
                }
              }

              if (validItems.length === 0) {
                return { success: false, message: 'No valid menu items found to order.' };
              }

              // Create order directly using Prisma
              const order = await prisma.order.create({
                data: {
                  restaurantId: Number(restaurantId),
                  tableId: tableId,
                  status: 'NEW',
                  totalAmount: totalAmount,
                  notes: 'Ordered via AI Chatbot',
                  orderItems: {
                    create: validItems.map(vi => ({
                      menuItemId: vi.menuItemId,
                      quantity: vi.quantity,
                      unitPrice: vi.unitPrice,
                      status: "NEW"
                    }))
                  }
                }
              });

              return { 
                success: true, 
                orderId: order.id, 
                totalAmount: totalAmount,
                message: 'Order has been placed successfully and sent to the kitchen.' 
              };
            } catch (error: any) {
              return { success: false, message: `Failed to place order: ${error.message}` };
            }
          },
        }),
      }
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during your request.' },
      { status: 500 }
    );
  }
}
