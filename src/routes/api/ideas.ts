import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

export const Route = createFileRoute("/api/ideas")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const niche = url.searchParams.get("niche") ?? "general";
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const gateway = createLovableAiGatewayProvider(key);
        const { text } = await generateText({
          model: gateway("google/gemini-3-flash-preview"),
          system:
            "You generate 6 short, viral TikTok content ideas. Output a JSON array of strings only, no prose, no markdown fences.",
          prompt: `Niche: ${niche}. Punchy, scroll-stopping ideas under 12 words each.`,
        });
        let ideas: string[] = [];
        try {
          const cleaned = text.replace(/```json|```/g, "").trim();
          ideas = JSON.parse(cleaned);
        } catch {
          ideas = text.split("\n").map((l) => l.replace(/^[-\d.\s]+/, "").trim()).filter(Boolean).slice(0, 6);
        }
        return Response.json({ ideas });
      },
    },
  },
});