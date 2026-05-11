import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/trends")({
  server: {
    handlers: {
      GET: async () => {
        const { data, error } = await supabaseAdmin
          .from("trends")
          .select("*")
          .order("viral_score", { ascending: false });
        if (error) return new Response(error.message, { status: 500 });
        return Response.json({ trends: data });
      },
    },
  },
});