// @ts-ignore: Importation directe depuis une URL (Deno/Supabase Edge Functions)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

/// <reference lib="deno.ns" />

// @ts-ignore: Deno est global dans l'environnement Supabase
Deno.serve(async (req: Request) => {
  try {
    const supabaseClient = createClient(
      // @ts-ignore: Variables d'environnement internes à Supabase
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const payload = await req.json();
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
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }

      return new Response(JSON.stringify({ message: 'Profile created successfully', data }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: 'Payload ignored' }), { status: 200 });
  } catch (error) {
    console.error('Edge Function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});