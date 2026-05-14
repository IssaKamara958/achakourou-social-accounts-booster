// @ts-ignore: Importation directe depuis une URL (Deno/Supabase Edge Functions)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

/// <reference lib="deno.ns" />

// @ts-ignore: Deno est global dans l'environnement Supabase
Deno.serve(async (req: Request) => {
  try {
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey || (supabaseUrl && supabaseUrl.includes('your-project-id'))) {
      return new Response(JSON.stringify({ error: 'Configuration serveur manquante' }), { status: 500 });
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Vérification du Content-Type pour éviter de parser du non-JSON
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return new Response(JSON.stringify({ error: "Expected application/json" }), { status: 400 });
    }

    let payload;
    try {
      payload = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), { status: 400 });
    }

    const { type, record } = payload;

    // Logique déclenchée lors d'un INSERT dans la table auth.users via Webhook
    if (type === 'INSERT' && record && record.id && record.email) {
      const { id: user_id, email } = record;

      const { data, error } = await supabaseClient.from('profiles').insert({
        user_id,
        username: email.split('@')[0],
        email,
        country: 'Senegal',
        free_plan: true,
        tiktok_creator: true,
      });

      if (error) {
        console.error('Error creating user profile:', error);
        return new Response(JSON.stringify({ error: 'Erreur lors de la création du profil utilisateur' }), { status: 500 });
      }

      return new Response(JSON.stringify({ message: 'Profile created successfully', data }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: 'Payload ignored' }), { status: 200 });
  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: 'Une erreur interne est survenue' }), { status: 500 });
  }
});