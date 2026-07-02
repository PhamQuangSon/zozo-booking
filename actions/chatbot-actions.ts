"use server";

import prisma from "@/lib/prisma";
import { serializePrismaData } from "@/lib/prisma-helpers";
import { revalidatePath } from "next/cache";

export type ChatbotConfigData = {
  restaurantId: number;
  systemPrompt: string;
  modelName: string;
  isActive: boolean;
  temperature: number;
  maxMessages: number;
};

const DEFAULT_PROMPT = `You are a helpful AI assistant for a restaurant. 
Your goal is to suggest menu items to customers based on their preferences.
Be polite, concise, and only recommend items from the provided menu.`;

export async function getChatbotConfig(restaurantId: number) {
  try {
    let config = await prisma.chatbotConfig.findUnique({
      where: { restaurantId },
    });

    if (!config) {
      // Create a default config if it doesn't exist
      config = await prisma.chatbotConfig.create({
        data: {
          restaurantId,
          systemPrompt: DEFAULT_PROMPT,
          modelName: "gpt-4o-mini",
          isActive: true,
          temperature: 0.7,
          maxMessages: 20,
        },
      });
    }

    return { success: true, data: serializePrismaData(config) };
  } catch (error) {
    console.error(`Failed to fetch chatbot config for restaurant ${restaurantId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load chatbot config",
    };
  }
}

export async function updateChatbotConfig(
  restaurantId: number,
  data: Partial<ChatbotConfigData>
) {
  try {
    const config = await prisma.chatbotConfig.upsert({
      where: { restaurantId },
      update: {
        systemPrompt: data.systemPrompt,
        modelName: data.modelName,
        isActive: data.isActive,
        temperature: data.temperature,
        maxMessages: data.maxMessages,
      },
      create: {
        restaurantId,
        systemPrompt: data.systemPrompt || DEFAULT_PROMPT,
        modelName: data.modelName || "gpt-4o-mini",
        isActive: data.isActive ?? true,
        temperature: data.temperature ?? 0.7,
        maxMessages: data.maxMessages ?? 20,
      },
    });

    revalidatePath(`/admin/restaurants/${restaurantId}/chatbot`);
    
    return { success: true, data: serializePrismaData(config) };
  } catch (error) {
    console.error(`Failed to update chatbot config for restaurant ${restaurantId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update chatbot config",
    };
  }
}
