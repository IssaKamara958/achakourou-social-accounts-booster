import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, TrendingUp, Search, Sparkles, Globe, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/app/trends")({
  component: TrendsPage,
});

const MOCK_TRENDS = [
  {
    id: "1",
    hashtag: "#SénégalViral",
    topic: "Buzz culturel Sénégal",
    category: "Culture",
    growth: 124.5,
    viral_score: 97,
    platform: "tiktok",
  },
  {
    id: "2",
    hashtag: "#DakarBusiness",
    topic: "Entrepreneuriat Dakar",
    category: "Business",
    growth: 88.2,
    viral_score: 91,
    platform: "tiktok",
  },
  {
    id: "3",
    hashtag: "#MusiqueAfrique",
    topic: "Afrobeats & Mbalax",
    category: "Musique",
    growth: 76.4,
    viral_score: 89,
    platform: "instagram",
  },
  {
    id: "4",
    hashtag: "#CuisineAfricaine",
    topic: "Recettes traditionnelles",
    category: "Food",
    growth: 63.1,
    viral_score: 84,
    platform: "tiktok",
  },
  {
    id: "5",
    hashtag: "#ModeSénégal",
    topic: "Fashion week Dakar",
    category: "Mode",
    growth: 55.8,
    viral_score: 82,
    platform: "instagram",
  },
  {
    id: "6",
    hashtag: "#TechAfrique",
    topic: "Startups africaines",
    category: "Tech",
    growth: 48.3,
    viral_score: 79,
    platform: "tiktok",
  },
  {
    id: "7",
    hashtag: "#SportSN",
    topic: "Football & sport sénégalais",
    category: "Sport",
    growth: 42.7,
    viral_score: 76,
    platform: "facebook",
  },
  {
    id: "8",
    hashtag: "#HumourDakar",
    topic: "Sketchs et humour local",
    category: "Humour",
    growth: 38.9,
    viral_score: 74,
    platform: "tiktok",
  },
  {
    id: "9",
    hashtag: "#EducationAfrique",
    topic: "Conseils études & carrière",
    category: "Éducation",
    growth: 31.2,
    viral_score: 71,
    platform: "facebook",
  },
];

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "oklch(0.72 0.20 340)",
  instagram: "oklch(0.75 0.18 20)",
  facebook: "oklch(0.60 0.15 250)",
};
const PLATFORM_EMOJI: Record<string, string> = {
  tiktok: "🎵",
  instagram: "📸",
  facebook: "👥",
};

function scoreClass(s: number) {
  if (s >= 90) return "text-primary";
  if (s >= 80) return "text-secondary";
  return "text-muted-foreground";
}

function TrendsPage() {
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["trends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trends")
        .select("*")
        .order("viral_score", { ascending: false });
      if (error || !data?.length) return MOCK_TRENDS;
      return data;
    },
  });

  const trends = data ?? MOCK_TRENDS;
  const filtered = trends.filter((t: any) => {
    const matchSearch =
      search === "" ||
      t.hashtag.toLowerCase().includes(search.toLowerCase()) ||
      t.topic?.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = filterPlatform === "all" || t.platform === filterPlatform;
    return matchSearch && matchPlatform;
  });

  function useForScript(hashtag: string) {
    navigator.clipboard.writeText(hashtag);
    toast.success(`${hashtag} copié — collez-le dans le générateur !`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Trends Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hashtags viraux scorés en temps réel — Afrique de l'Ouest.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
          disabled={isFetching}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Actualiser
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un hashtag ou sujet…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["all", "tiktok", "instagram", "facebook"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPlatform(p)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                filterPlatform === p
                  ? "border-transparent text-white font-semibold"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
              style={
                filterPlatform === p && p !== "all"
                  ? { background: PLATFORM_COLORS[p] }
                  : filterPlatform === p
                    ? { background: "var(--gradient-brand)" }
                    : {}
              }
            >
              {p === "all"
                ? "Tous"
                : `${PLATFORM_EMOJI[p]} ${p.charAt(0).toUpperCase() + p.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 bg-card border-border animate-pulse h-36" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
        >
          {filtered.map((t: any) => (
            <motion.div
              key={t.id}
              variants={{ hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1 } }}
            >
              <Card className="p-5 bg-card border-border hover:border-primary/40 transition-all h-full flex flex-col group">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      {t.platform && <span>{PLATFORM_EMOJI[t.platform]}</span>}
                      {t.category}
                    </div>
                    <div className="text-lg font-bold mt-0.5">{t.hashtag}</div>
                  </div>
                  <Flame className={`h-5 w-5 shrink-0 ${scoreClass(t.viral_score)}`} />
                </div>
                <div className="text-sm text-foreground/80 mb-1">{t.topic}</div>
                {t.description && (
                  <div className="text-xs text-muted-foreground mb-2 flex-1">{t.description}</div>
                )}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                  <Badge
                    variant="outline"
                    className="text-[10px] border-secondary/50 text-secondary gap-1"
                  >
                    <TrendingUp className="h-3 w-3" /> +{Number(t.growth).toFixed(1)}%
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge
                      className="text-[10px]"
                      style={{
                        background: "var(--gradient-brand)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {t.viral_score}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                      onClick={() => useForScript(t.hashtag)}
                    >
                      <Sparkles className="h-3 w-3" /> Utiliser
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="md:col-span-3 text-center py-10 text-muted-foreground text-sm">
              Aucune tendance trouvée pour "{search}"
            </div>
          )}
        </motion.div>
      )}

      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Globe className="h-3.5 w-3.5" />
        Données Sénégal · Côte d'Ivoire · Mali · Afrique de l'Ouest — Moteur de scoring Achakourou
      </div>
    </div>
  );
}
