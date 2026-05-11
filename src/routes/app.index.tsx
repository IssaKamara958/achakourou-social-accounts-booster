import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Flame, Sparkles, Users, FileText, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [trends, scripts, clients] = await Promise.all([
        supabase.from("trends").select("id, hashtag, viral_score, growth, topic").order("viral_score", { ascending: false }).limit(5),
        supabase.from("generated_scripts").select("id, viral_score", { count: "exact" }),
        supabase.from("clients").select("id", { count: "exact", head: true }),
      ]);
      const avg = scripts.data && scripts.data.length > 0
        ? Math.round(scripts.data.reduce((acc: number, item: any) => acc + (item.viral_score ?? 0), 0) / scripts.data.length)
        : 0;
      return {
        topTrends: trends.data ?? [],
        scriptsCount: scripts.count ?? 0,
        clientsCount: clients.count ?? 0,
        avgScore: avg,
      };
    },
  });

  const kpis = [
    { label: "Trending now", value: stats?.topTrends.length ?? 0, icon: Flame },
    { label: "Scripts generated", value: stats?.scriptsCount ?? 0, icon: Sparkles },
    { label: "Clients", value: stats?.clientsCount ?? 0, icon: Users },
    { label: "Avg viral score", value: stats?.avgScore ?? 0, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Live overview of your TikTok agency.</p>
        </div>
        <Link to="/app/generator">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm" style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}>
            <Sparkles className="h-4 w-4" /> New script
          </span>
        </Link>
      </div>

      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {kpis.map((k, i) => (
          <motion.div key={k.label} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <Card className="p-5 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.1)]">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{k.label}</div>
                <k.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-3xl font-black mt-2">{k.value}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-base font-semibold flex items-center gap-2"><Flame className="h-4 w-4 text-primary" /> Top trends right now</div>
            <div className="text-xs text-muted-foreground">Ranked by viral score</div>
          </div>
          <Link to="/app/trends" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        <div className="divide-y divide-border">
          {stats?.topTrends.map((t: { id: string; hashtag: string; topic: string; growth: number; viral_score: number }) => (
            <div key={t.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{t.hashtag} <span className="text-muted-foreground text-sm">· {t.topic}</span></div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="border-secondary/50 text-secondary">+{Number(t.growth).toFixed(1)}%</Badge>
                <Badge style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}>{t.viral_score}</Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground mt-4 flex items-center gap-1">
          <FileText className="h-3 w-3" /> Powered by Achakourou viral scoring engine
        </div>
      </Card>
      </motion.div>
    </div>
  );
}