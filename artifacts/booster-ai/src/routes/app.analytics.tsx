import React, { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAnalyticsDashboard } from "@/hooks/use-analytics-dashboard";
import {
  useSeoOptimization,
  useSocialAccounts,
  useSyncAccounts,
} from "@/hooks/use-social-accounts";

export const Route = createFileRoute("/app/analytics")({
  component: AnalyticsPage,
});

const defaultViewsData = [
  { date: "1 Mai", tiktok: 4200, instagram: 1800, facebook: 900 },
  { date: "3 Mai", tiktok: 5600, instagram: 2100, facebook: 1100 },
  { date: "5 Mai", tiktok: 3800, instagram: 1600, facebook: 850 },
  { date: "7 Mai", tiktok: 7200, instagram: 2900, facebook: 1400 },
  { date: "9 Mai", tiktok: 8900, instagram: 3200, facebook: 1700 },
  { date: "11 Mai", tiktok: 6500, instagram: 2700, facebook: 1300 },
  { date: "13 Mai", tiktok: 11000, instagram: 4100, facebook: 2200 },
];

const defaultEngagementData = [
  { metric: "Likes", value: 24600 },
  { metric: "Commentaires", value: 3200 },
  { metric: "Partages", value: 1850 },
  { metric: "Sauvegardes", value: 4100 },
];

const defaultPlatformPie = [
  { name: "TikTok", value: 62 },
  { name: "Instagram", value: 27 },
  { name: "Facebook", value: 11 },
];

const retentionData = [
  { sec: "0s", rate: 100 },
  { sec: "5s", rate: 84 },
  { sec: "10s", rate: 71 },
  { sec: "15s", rate: 62 },
  { sec: "20s", rate: 54 },
  { sec: "25s", rate: 47 },
  { sec: "30s", rate: 41 },
  { sec: "60s", rate: 28 },
];

const PIE_COLORS = ["oklch(0.72 0.20 340)", "oklch(0.80 0.15 200)", "oklch(0.7 0.15 280)"];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "oklch(0.20 0.025 270)",
    border: "1px solid oklch(0.30 0.02 270)",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "oklch(0.97 0.01 260)" },
};

const defaultKpis = [
  { label: "Vues totales", value: "47.3K", change: "+23%", icon: Eye },
  { label: "Engagement", value: "8.4%", change: "+1.2%", icon: Heart },
  { label: "Watch time moy.", value: "18s", change: "+3s", icon: Clock },
  { label: "Partages", value: "1,850", change: "+34%", icon: Share2 },
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalyticsDashboard();
  const { accounts, isLoading: accountsLoading } = useSocialAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [niche, setNiche] = useState("");

  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) || accounts[0] || null,
    [accounts, selectedAccountId],
  );

  const {
    seoOptimization,
    isLoading: seoLoading,
    error: seoError,
    analyze,
  } = useSeoOptimization(
    selectedAccount && niche
      ? { handle: selectedAccount.account_name, niche, platform: selectedAccount.platform }
      : undefined,
  );

  const {
    syncJobs,
    scheduleSync,
    isScheduling,
    error: syncError,
  } = useSyncAccounts(selectedAccount?.id);

  const analyticsSummary = data;
  const kpis = analyticsSummary
    ? [
        {
          label: "Vues totales",
          value: analyticsSummary.totalReach.toLocaleString(),
          change: "+ " + (analyticsSummary.totalReach > 0 ? "12%" : "0%"),
          icon: Eye,
        },
        {
          label: "Engagement",
          value: `${analyticsSummary.totalEngagement}`,
          change:
            analyticsSummary.engagementRate > 0 ? `+ ${analyticsSummary.engagementRate}%` : "+0%",
          icon: Heart,
        },
        {
          label: "Likes",
          value: analyticsSummary.totalLikes.toLocaleString(),
          change: "+4%",
          icon: MessageCircle,
        },
        {
          label: "Partages",
          value: analyticsSummary.totalShares.toLocaleString(),
          change: "+3%",
          icon: Share2,
        },
      ]
    : defaultKpis;

  const viewsData = analyticsSummary
    ? analyticsSummary.trend.map((point) => ({
        date: point.date,
        tiktok: point.reach * 0.6,
        instagram: point.reach * 0.25,
        facebook: point.reach * 0.15,
      }))
    : defaultViewsData;

  const platformPie = analyticsSummary
    ? [
        { name: "TikTok", value: analyticsSummary.topPlatforms.tiktok.reach || 0 },
        { name: "Instagram", value: analyticsSummary.topPlatforms.instagram.reach || 0 },
        { name: "Facebook", value: analyticsSummary.topPlatforms.facebook.reach || 0 },
      ]
    : defaultPlatformPie;

  const engagementData = analyticsSummary
    ? [
        { metric: "Likes", value: analyticsSummary.totalLikes },
        { metric: "Commentaires", value: analyticsSummary.totalComments },
        { metric: "Partages", value: analyticsSummary.totalShares },
        { metric: "Sauvegardes", value: analyticsSummary.totalSaves },
      ]
    : defaultEngagementData;

  const bestTimes = analyticsSummary?.bestPostingTimes || ["09:00", "12:00", "18:00", "20:00"];

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
          <h1 className="text-3xl font-black tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance multi-plateforme — 30 derniers jours
          </p>
        </div>
        <Badge variant="outline" className="border-secondary/40 text-secondary gap-1">
          <TrendingUp className="h-3 w-3" /> Sénégal · Afrique de l'Ouest
        </Badge>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
        <Card className="p-5 border-border bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-[0.2em]">
                AI SEO Optimizer
              </p>
              <h2 className="text-xl font-semibold">Optimisation IA de contenu</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Compte
                </label>
                <select
                  value={selectedAccount?.id || ""}
                  onChange={(event) => setSelectedAccountId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_name} ({account.platform})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Niche
                </label>
                <Input
                  value={niche}
                  onChange={(event) => setNiche(event.target.value)}
                  placeholder="Ex: mode urbaine, fintech, lifestyle"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <p className="text-sm text-muted-foreground">
              Lancez une analyse IA basée sur votre compte sélectionné pour générer des hashtags,
              hooks et recommandations SEO.
            </p>
            <Button
              onClick={() => analyze()}
              disabled={!selectedAccount || !niche || seoLoading}
              className="h-11 w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />{" "}
              {seoLoading ? "Analyse en cours..." : "Analyser maintenant"}
            </Button>
          </div>

          {seoError && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="inline-block mr-2 align-text-bottom" /> Impossible de
              récupérer l’analyse IA. Veuillez réessayer.
            </div>
          )}

          {seoOptimization ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { label: "SEO", value: seoOptimization.seo_score, color: "oklch(0.80 0.15 200)" },
                  {
                    label: "Viral",
                    value: seoOptimization.overall_viral_score,
                    color: "oklch(0.72 0.20 340)",
                  },
                  {
                    label: "Engagement",
                    value: seoOptimization.audience_engagement_prediction,
                    color: "oklch(0.72 0.22 120)",
                  },
                  {
                    label: "Hook",
                    value: seoOptimization.hooks_score,
                    color: "oklch(0.70 0.15 280)",
                  },
                ].map((metric) => (
                  <Card key={metric.label} className="p-4 border-border bg-card/80">
                    <div className="text-sm text-muted-foreground uppercase tracking-[0.2em] mb-3">
                      {metric.label}
                    </div>
                    <div className="text-3xl font-black" style={{ color: metric.color }}>
                      {metric.value}%
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="p-4 border-border bg-card/80">
                  <div className="text-sm font-semibold mb-3">Recommandations SEO</div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {(seoOptimization.seo_suggestions || []).slice(0, 4).map((item, index) => (
                      <li key={index} className="list-disc pl-4">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-4 border-border bg-card/80">
                  <div className="text-sm font-semibold mb-3">Hashtags optimisés</div>
                  <div className="flex flex-wrap gap-2">
                    {(seoOptimization.hashtags_suggestions || []).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[11px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              Sélectionnez un compte et une niche pour démarrer l’analyse IA.
            </div>
          )}
        </Card>

        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground uppercase tracking-[0.2em]">
                Synchronisation
              </div>
              <div className="text-lg font-semibold">État du moteur</div>
            </div>
            <Button
              onClick={() =>
                scheduleSync({
                  accountId: selectedAccount?.id,
                  platform: selectedAccount?.platform,
                })
              }
              disabled={isScheduling || !selectedAccount}
              className="h-11"
            >
              <RefreshCw className="mr-2 h-4 w-4" />{" "}
              {isScheduling ? "Planification..." : "Sync maintenant"}
            </Button>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Compte connecté</span>
              <span className="font-semibold">
                {accounts.filter((account) => account.connected).length}/{accounts.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Dernière synchronisation</span>
              <span className="font-semibold">
                {accounts
                  .map((account) => account.last_sync_at || "")
                  .filter(Boolean)
                  .sort()
                  .reverse()[0] || "Aucune"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Jobs en attente</span>
              <span className="font-semibold">
                {syncJobs.filter((job) => job.status === "pending").length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Erreurs API</span>
              <span className="font-semibold">
                {syncJobs.filter((job) => job.status === "failed").length}
              </span>
            </div>
            {syncError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="inline-block mr-2 align-text-bottom" /> Problème de
                synchronisation détecté.
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(analyticsSummary ? kpis : kpis).map((k) => (
          <Card
            key={k.label}
            className="p-5 bg-card/60 border-border hover:border-primary/40 transition-all group"
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

      <motion.div variants={fadeUp}>
        <Card className="p-5 bg-card border-border">
          <div className="font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" /> Vues par plateforme
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={viewsData}>
              <defs>
                <linearGradient id="gTiktok" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.72 0.20 340)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="oklch(0.72 0.20 340)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gInstagram" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.80 0.15 200)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="oklch(0.80 0.15 200)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gFacebook" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.7 0.15 280)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="oklch(0.7 0.15 280)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 270)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "oklch(0.70 0.02 260)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.70 0.02 260)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="tiktok"
                name="TikTok"
                stroke="oklch(0.72 0.20 340)"
                strokeWidth={2}
                fill="url(#gTiktok)"
              />
              <Area
                type="monotone"
                dataKey="instagram"
                name="Instagram"
                stroke="oklch(0.80 0.15 200)"
                strokeWidth={2}
                fill="url(#gInstagram)"
              />
              <Area
                type="monotone"
                dataKey="facebook"
                name="Facebook"
                stroke="oklch(0.7 0.15 280)"
                strokeWidth={2}
                fill="url(#gFacebook)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="p-5 bg-card border-border">
            <div className="font-semibold flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" /> Courbe de rétention vidéo
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={retentionData}>
                <defs>
                  <linearGradient id="gRetention" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.80 0.15 200)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.80 0.15 200)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 270)" />
                <XAxis
                  dataKey="sec"
                  tick={{ fontSize: 11, fill: "oklch(0.70 0.02 260)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.70 0.02 260)" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`, "Rétention"]} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Rétention"
                  stroke="oklch(0.80 0.15 200)"
                  strokeWidth={2}
                  fill="url(#gRetention)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <Card className="p-5 bg-card border-border">
            <div className="font-semibold flex items-center gap-2 mb-4">
              <Share2 className="h-4 w-4 text-primary" /> Distribution
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={platformPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {platformPie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 mt-2">
              {platformPie.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span>{p.name}</span>
                  </div>
                  <span className="font-semibold">{p.value}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-card border-border">
            <div className="font-semibold text-sm mb-3">Engagement détaillé</div>
            <div className="space-y-2">
              {engagementData.map((e) => (
                <div key={e.metric} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{e.metric}</span>
                  <span className="font-semibold">{e.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 border-border bg-card">
          <div className="text-sm font-semibold mb-3">Heures d'engagement optimales</div>
          <div className="space-y-2">
            {bestTimes.map((time) => (
              <div key={time} className="rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium">
                {time}
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 border-border bg-card">
          <div className="text-sm font-semibold mb-3">Engagement moyen</div>
          <div className="text-4xl font-black">
            {analyticsSummary ? `${analyticsSummary.engagementRate}%` : "--"}
          </div>
          <div className="text-xs text-muted-foreground">
            Moyenne quotidienne calculée sur la période
          </div>
        </Card>
        <Card className="p-5 border-border bg-card">
          <div className="text-sm font-semibold mb-3">Source de trafic</div>
          <div className="text-sm leading-relaxed text-muted-foreground">
            Les plateformes les plus performantes sont identifiées ici pour optimiser la stratégie
            cross-network.
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
