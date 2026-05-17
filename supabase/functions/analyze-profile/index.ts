import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return new Response("Invalid request body", { status: 400 });
  }

  const { handle, niche, platform } = body as {
    handle?: string;
    niche?: string;
    platform?: string;
  };
  if (!handle || !niche || !platform) {
    return new Response("handle, niche and platform are required", { status: 400 });
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("VITE_OPENAI_API_KEY");
  if (!apiKey) {
    return new Response("Missing OPENAI_API_KEY", { status: 500 });
  }

  const prompt = `You are a high-performance social media growth specialist for African creators. Analyse the following profile and deliver a JSON response with actionable recommendations.

Profile handle: ${handle}
Niche: ${niche}
Platform: ${platform}

Return only valid JSON with these fields:
{
  "viral_score": number,
  "seo_score": number,
  "bio_optimization": string,
  "hashtags": [string],
  "content_strategy": string,
  "growth_tips": [string],
  "best_posting_times": [string],
  "audience_insights": {"age": string, "gender": string, "location": string},
  "content_pillars": [string]
}

Make the recommendations practical, concise and tailored for francophone West Africa with a growth mindset.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a senior social media strategist and SEO expert." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "OpenAI request failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No content returned from OpenAI" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.warn("Failed to parse OpenAI JSON; returning raw content", parseError);
      return new Response(JSON.stringify({ error: "Could not parse AI response", raw: content }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("analyze-profile error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
