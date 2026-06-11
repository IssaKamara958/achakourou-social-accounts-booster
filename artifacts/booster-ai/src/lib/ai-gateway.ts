import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createOpenAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    baseURL: "https://api.openai.com/v1",
    apiKey,
  });
}
