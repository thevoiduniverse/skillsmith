import OpenAI from "openai";

let client: OpenAI | null = null;

export function getAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",
      apiKey: process.env.GITHUB_TOKEN!,
    });
  }
  return client;
}

export const AI_MODEL = process.env.AI_MODEL || "gpt-4.1";
