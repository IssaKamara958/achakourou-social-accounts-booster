import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/trends")({
  component: TrendsPage,
});

function scoreClass(s: number) {
  if (s >= 90) return "text-primary";
  if (s >= 80) return "text-secondary";
  return "text-muted-foreground";
}

function TrendsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["trends"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trends").select("*").order("viral_score", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trends Engine</h1>
        <p className="text-sm text-muted-foreground">Real-time TikTok hashtags scored by virality and growth.</p>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading trends…</div>
      ) : (
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
        >
          {data?.map((t) => (
            <motion.div key={t.id} variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}>
              <Card className="p-5 bg-card border-border hover:border-primary/40 transition-colors h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">{t.category}</div>
                    <div className="text-lg font-bold mt-1">{t.hashtag}</div>
                  </div>
                  <Flame className={`h-5 w-5 ${scoreClass(t.viral_score)}`} />
                </div>
                <div className="text-sm mt-2 text-foreground/90">{t.topic}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline" className="border-secondary/50 text-secondary flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +{Number(t.growth).toFixed(1)}%
                  </Badge>
                  <Badge style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}>
                    {t.viral_score} viral
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}