import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Eye, Heart, MessageCircle, Share2, Clock } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/app/analytics")({
  component: AnalyticsPage,
});

const viewsData = [
  { date: "1 Mai", tiktok: 4200, instagram: 1800, facebook: 900 },
  { date: "3 Mai", tiktok: 5600, instagram: 2100, facebook: 1100 },
  { date: "5 Mai", tiktok: 3800, instagram: 1600, facebook: 850 },
  { date: "7 Mai", tiktok: 7200, instagram: 2900, facebook: 1400 },
  { date: "9 Mai", tiktok: 8900, instagram: 3200, facebook: 1700 },
  { date: "11 Mai", tiktok: 6500, instagram: 2700, facebook: 1300 },
  { date: "13 Mai", tiktok: 11000, instagram: 4100, facebook: 2200 },
];

const engagementData = [
  { metric: "Likes", value: 24600 },
  { metric: "Commentaires", value: 3200 },
  { metric: "Partages", value: 1850 },
  { metric: "Sauvegardes", value: 4100 },
];

const platformPie = [
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
  contentStyle: { background: "oklch(0.20 0.025 270)", border: "1px solid oklch(0.30 0.02 270)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "oklch(0.97 0.01 260)" },
};

const kpis = [
  { label: "Vues totales", value: "47.3K", change: "+23%", icon: Eye },
  { label: "Engagement", value: "8.4%", change: "+1.2%", icon: Heart },
  { label: "Watch time moy.", value: "18s", change: "+3s", icon: Clock },
  { label: "Partages", value: "1,850", change: "+34%", icon: Share2 },
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function AnalyticsPage() {
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp} className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance multi-plateforme — 30 derniers jours</p>
        </div>
        <Badge variant="outline" className="border-secondary/40 text-secondary gap-1">
          <TrendingUp className="h-3 w-3" /> Sénégal · Afrique de l'Ouest
        </Badge>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5 bg-card/60 border-border hover:border-primary/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <k.icon className="h-4 w-4 text-primary" />
              </div>
              <Badge variant="outline" className="text-[10px] border-secondary/40 text-secondary">{k.change}</Badge>
            </div>
            <div className="text-3xl font-black">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{k.label}</div>
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
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "oklch(0.70 0.02 260)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.70 0.02 260)" }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="tiktok" name="TikTok" stroke="oklch(0.72 0.20 340)" strokeWidth={2} fill="url(#gTiktok)" />
              <Area type="monotone" dataKey="instagram" name="Instagram" stroke="oklch(0.80 0.15 200)" strokeWidth={2} fill="url(#gInstagram)" />
              <Area type="monotone" dataKey="facebook" name="Facebook" stroke="oklch(0.7 0.15 280)" strokeWidth={2} fill="url(#gFacebook)" />
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
                <XAxis dataKey="sec" tick={{ fontSize: 11, fill: "oklch(0.70 0.02 260)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.70 0.02 260)" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`, "Rétention"]} />
                <Area type="monotone" dataKey="rate" name="Rétention" stroke="oklch(0.80 0.15 200)" strokeWidth={2} fill="url(#gRetention)" />
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
                <Pie data={platformPie} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                  {platformPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
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
    </motion.div>
  );
}
