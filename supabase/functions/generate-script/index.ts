// @ts-ignore: Importation directe depuis une URL (Deno/Supabase Edge Functions)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const schema = z.object({
  hook: z.string().describe("Powerful 0-2s hook, max 12 words"),
  content: z.string().describe("Body of the script (15-35s spoken). Short punchy sentences."),
  cta: z.string().describe("Engagement call to action"),
  viral_score: z.number().min(0).max(100).describe("Predicted virality 0-100"),
});

const inputSchema = z.object({
  topic: z.string().trim().min(3).max(500),
  tone: z.string().trim().min(1).max(100).optional(),
});

// @ts-ignore: Deno est global dans l'environnement Supabase
Deno.serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // @ts-ignore
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey || (supabaseUrl && supabaseUrl.includes("your-project-id"))) {
      return new Response(JSON.stringify({ error: "Configuration serveur manquante" }), {
        status: 500,
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    let parsed: z.infer<typeof inputSchema>;
    try {
      parsed = inputSchema.parse(await req.json());
    } catch (e) {
      const msg =
        e instanceof z.ZodError ? (e.issues[0]?.message ?? "Invalid input") : "Invalid input";
      return new Response(msg, { status: 400 });
    }
    // @ts-ignore
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

    const gateway = createLovableAiGatewayProvider(key);
    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system:
          "You are a TikTok viral scriptwriter. Always produce HOOK + CONTENT + CTA in punchy short sentences. Optimize for retention and shares.",
        prompt: `Topic: ${parsed.topic}. Tone: ${parsed.tone ?? "energetic, casual"}. Predict a realistic viral_score 50-95.`,
        output: Output.object({ schema }),
      });
      return new Response(JSON.stringify(output), {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI error";
      const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
      return new Response(msg, {
        status,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(JSON.stringify({ error: "Une erreur interne est survenue" }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
