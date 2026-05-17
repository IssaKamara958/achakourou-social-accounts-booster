import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  Sparkles,
  Users,
  FileText,
  TrendingUp,
  Share2,
  Calendar,
  Zap,
  ArrowRight,
  CheckCircle2,
  Circle,
  Globe,
  BarChart3,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { getQuota } from "@/lib/quota";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

const weeklyData = [
  { day: "Lun", views: 1200, scripts: 3 },
  { day: "Mar", views: 1900, scripts: 5 },
  { day: "Mer", views: 1500, scripts: 2 },
  { day: "Jeu", views: 2800, scripts: 8 },
  { day: "Ven", views: 3200, scripts: 6 },
  { day: "Sam", views: 4100, scripts: 10 },
  { day: "Dim", views: 3600, scripts: 7 },
];

const platformData = [
  { name: "TikTok", value: 65, color: "var(--primary)" },
  { name: "Instagram", value: 25, color: "var(--secondary)" },
  { name: "Facebook", value: 10, color: "oklch(0.7 0.15 280)" },
];

const onboardingSteps = [
  { id: 1, label: "Create your account", done: true },
  { id: 2, label: "Connect a social account", done: false, link: "/app/social" },
  { id: 3, label: "Generate your first script", done: false, link: "/app/generator" },
  { id: 4, label: "Add a client", done: false, link: "/app/clients" },
  { id: 5, label: "Publish your first post", done: false, link: "/app/publisher" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [trends, scripts, clients] = await Promise.all([
        supabase
          .from("trends")
          .select("id, hashtag, viral_score, growth, topic")
          .order("viral_score", { ascending: false })
          .limit(5),
        supabase.from("generated_scripts").select("id, viral_score", { count: "exact" }),
        supabase.from("clients").select("id", { count: "exact", head: true }),
      ]);
      const avg =
        scripts.data && scripts.data.length > 0
          ? Math.round(
              scripts.data.reduce((acc: number, item: any) => acc + (item.viral_score ?? 0), 0) /
                scripts.data.length,
            )
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
    {
      label: "Scripts générés",
      value: stats?.scriptsCount ?? 0,
      icon: Sparkles,
      change: "+12%",
      positive: true,
    },
    {
      label: "Clients actifs",
      value: stats?.clientsCount ?? 0,
      icon: Users,
      change: "+2",
      positive: true,
    },
    {
      label: "Score viral moyen",
      value: stats?.avgScore ?? 0,
      icon: TrendingUp,
      change: "+5pts",
      positive: true,
    },
    {
      label: "Tendances live",
      value: stats?.topTrends.length ?? 0,
      icon: Flame,
      change: "Sénégal",
      positive: true,
    },
  ];

  const doneCount = onboardingSteps.filter((s) => s.done).length;
  const progress = Math.round((doneCount / onboardingSteps.length) * 100);

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
      }}
    >
      <motion.div variants={fadeUp} className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Bonjour, Issa 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Voici l'état de votre agence TikTok aujourd'hui.
          </p>
        </div>
        <Link to="/app/generator">
          <Button
            className="font-semibold gap-2"
            style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}
          >
            <Sparkles className="h-4 w-4" /> Nouveau script
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card
            key={k.label}
            className="p-5 bg-card/60 backdrop-blur border-border hover:border-primary/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <k.icon className="h-4 w-4 text-primary" />
              </div>
              <Badge variant="outline" className="text-[10px] border-secondary/40 text-secondary">
                {k.change}
              </Badge>
            </div>
            <div className="text-3xl font-black">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              {k.label}
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="p-5 bg-card border-border h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Activité cette semaine
                </div>
                <div className="text-xs text-muted-foreground">Vues estimées & scripts créés</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.72 0.20 340)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.72 0.20 340)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 270)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "oklch(0.70 0.02 260)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.70 0.02 260)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.20 0.025 270)",
                    border: "1px solid oklch(0.30 0.02 270)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "oklch(0.97 0.01 260)" }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="oklch(0.72 0.20 340)"
                  strokeWidth={2}
                  fill="url(#gradViews)"
                  name="Vues"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="p-5 bg-card border-border h-full">
            <div className="font-semibold flex items-center gap-2 mb-4">
              <Share2 className="h-4 w-4 text-primary" /> Réseaux sociaux
            </div>
            <div className="space-y-3">
              {platformData.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">{p.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${p.value}%`, background: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Link to="/app/social">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Connecter un réseau
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" /> Top tendances maintenant
              </div>
              <Link
                to="/app/trends"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {stats?.topTrends.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Aucune tendance trouvée — connectez votre Supabase pour charger les données.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats?.topTrends.map((t: any) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate text-sm">{t.hashtag}</div>
                      <div className="text-xs text-muted-foreground truncate">{t.topic}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className="border-secondary/50 text-secondary text-[10px]"
                      >
                        +{Number(t.growth ?? 0).toFixed(1)}%
                      </Badge>
                      <Badge
                        className="text-[10px]"
                        style={{
                          background: "var(--gradient-brand)",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        {t.viral_score}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="p-5 bg-card border-border h-full">
            <div className="font-semibold flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-primary" /> Démarrage rapide
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              {doneCount}/{onboardingSteps.length} étapes complètes
            </div>
            <Progress value={progress} className="h-1.5 mb-4" />
            <div className="space-y-2.5">
              {onboardingSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-2.5">
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  {step.link && !step.done ? (
                    <Link to={step.link} className="text-sm hover:text-primary transition-colors">
                      {step.label}
                    </Link>
                  ) : (
                    <span
                      className={`text-sm ${step.done ? "line-through text-muted-foreground" : ""}`}
                    >
                      {step.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="grid sm:grid-cols-3 gap-4">
        {(["ai", "posts", "seo"] as const).map((key) => {
          const labels = { ai: "Générations IA", posts: "Publications", seo: "Pages SEO" };
          const limits = { ai: 20, posts: 10, seo: 5 };
          const { used, remaining, limit } = getQuota(key);
          const pct = (used / limit) * 100;
          const critical = remaining === 0;
          const warn = !critical && pct >= 70;
          return (
            <Card key={key} className="p-4 bg-card border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {labels[key]}
                </div>
                <div
                  className={`text-xs font-mono font-bold ${critical ? "text-destructive" : warn ? "text-yellow-400" : "text-secondary"}`}
                >
                  {remaining}/{limit}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: critical
                      ? "oklch(0.65 0.22 30)"
                      : warn
                        ? "oklch(0.75 0.18 70)"
                        : "var(--gradient-brand)",
                  }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground">
                {used} utilisées aujourd'hui · renouvellement à minuit 🇸🇳
              </div>
            </Card>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
