import { createFileRoute } from "@tanstack/react-router";
import { requireUser } from "@/lib/api-auth.server";

export const Route = createFileRoute("/api/trends")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        let ctx;
        try {
          ctx = await requireUser(request);
        } catch (r) {
          if (r instanceof Response) return r;
          return new Response("Unauthorized", { status: 401 });
        }
        const { data, error } = await ctx.supabase
          .from("trends")
          .select("*")
          .order("viral_score", { ascending: false });
        if (error) return new Response(error.message, { status: 500 });
        return Response.json({ trends: data });
      },
    },
  },
});