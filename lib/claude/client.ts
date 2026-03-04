import OpenAI from "openai";

let client: OpenAI | null = null;

export function getAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: process.env.GOOGLE_API_KEY!,
    });
  }
  return client;
}

export const AI_MODEL = process.env.AI_MODEL || "gemini-2.5-flash";
