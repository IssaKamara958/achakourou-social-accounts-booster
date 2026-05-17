// @ts-ignore: Importation directe depuis une URL (Deno/Supabase Edge Functions)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

// @ts-ignore: Deno est global dans l'environnement Supabase
Deno.serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
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

    const { record: user } = await req.json();

    if (!user) {
      return new Response("No user record in webhook payload", { status: 400 });
    }

    const { data, error } = await supabaseClient.from("profiles").insert({
      user_id: user.id,
      username: user.email.split("@")[0],
      email: user.email,
      country: "Senegal",
      free_plan: true,
      tiktok_creator: true,
    });

    if (error) {
      console.error("Error creating user profile:", error);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la création du profil utilisateur" }),
        { status: 500 },
      );
    }

    return new Response(JSON.stringify({ message: "Profile created successfully", data }), {
      status: 200,
    });
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(JSON.stringify({ error: "Une erreur interne est survenue" }), {
      status: 500,
    });
  }
});
