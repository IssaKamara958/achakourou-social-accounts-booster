import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const schema = z.object({
  hook: z.string().describe("Powerful 0-2s hook, max 12 words"),
  content: z.string().describe("Body of the script (15-35s spoken). Short punchy sentences."),
  cta: z.string().describe("Engagement call to action"),
  viral_score: z.number().min(0).max(100).describe("Predicted virality 0-100"),
});

export const Route = createFileRoute("/api/generate-script")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { topic?: string; tone?: string };
        if (!body.topic) return new Response("topic required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        try {
          const { output } = await generateText({
            model: gateway("google/gemini-3-flash-preview"),
            system:
              "You are a TikTok viral scriptwriter. Always produce HOOK + CONTENT + CTA in punchy short sentences. Optimize for retention and shares.",
            prompt: `Topic: ${body.topic}. Tone: ${body.tone ?? "energetic, casual"}. Predict a realistic viral_score 50-95.`,
            output: Output.object({ schema }),
          });
          return Response.json(output);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "AI error";
          const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
          return new Response(msg, { status });
        }
      },
    },
  },
});