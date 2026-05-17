import { streamText } from "ai";
import { requireUser } from "@/lib/api-auth.server";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { supabase } = await requireUser(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { prompt, on, service } = await request.json();

  const openai = createLovableAiGatewayProvider(process.env.OPENAI_API_KEY!);

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    system:
      "You are a TikTok video script generator. You generate scripts for TikTok videos. The scripts are short, punchy, and engaging. You use emojis and hashtags to make the scripts more appealing to a younger audience. The scripts are formatted in a way that is easy to read and follow. The scripts are also optimized for the TikTok platform. The scripts are creative, original, and tailored to the user’s prompt. The scripts are also safe for work and do not contain any offensive or inappropriate content.",
    prompt: `Generate a TikTok video script about ${prompt} on ${on} for ${service}.`,
  });

  return result.toTextStreamResponse();
}
