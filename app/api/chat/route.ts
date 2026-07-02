import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, restaurantId } = await req.json();

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
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

    // Format menu context
    let menuContext = 'Here is the current menu:\n\n';
    if (restaurantData?.categories) {
      for (const category of restaurantData.categories) {
        menuContext += `**${category.name}**\n`;
        for (const item of category.items) {
          menuContext += `- ${item.name}: $${item.price.toString()} ${item.description ? `(${item.description})` : ''}\n`;
        }
        menuContext += '\n';
      }
    }

    const systemPrompt = `
${config.systemPrompt}

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
