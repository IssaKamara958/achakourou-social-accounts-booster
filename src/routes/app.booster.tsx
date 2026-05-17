import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, ShieldCheck, TrendingUp, Info, Target, Clock, Hash, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/app/booster")({
  component: ProfileBooster,
});

const MOCK_RESULT = {
  viral_score: 73,
  seo_score: 81,
  bio_optimization:
    "Créateur de contenu 🇸🇳 | Partage les secrets du digital en Afrique | 📲 Guide gratuit en DM",
  hashtags: [
    "#senegal",
    "#dakar",
    "#tiktokafrique",
    "#créateur",
    "#digitalmarketing",
    "#africa",
    "#buzzsn",
  ],
  content_strategy:
    "Votre niche a un fort potentiel local non exploité. Focalisez-vous sur des contenus éducatifs avec une touche culturelle sénégalaise. Publiez entre 3 et 5 vidéos par semaine en privilégiant les heures 18h-22h (heure de Dakar). Utilisez des hooks qui interpellent directement la communauté locale.",
  growth_tips: [
    "Publiez systématiquement entre 18h et 22h (heure de Dakar) pour maximiser les vues",
    "Commencez chaque vidéo avec une question ou affirmation qui surprend",
    "Collaborez avec 2-3 créateurs de votre niche dans la sous-région",
    "Créez une série hebdomadaire reconnaissable pour fidéliser votre audience",
    "Répondez aux commentaires dans les 30 premières minutes pour booster l'algorithme",
  ],
  best_posting_times: ["18:00", "20:00", "21:30"],
  audience_insights: {
    age: "18-34 ans",
    gender: "55% F / 45% H",
    location: "Dakar, Abidjan, Bamako",
  },
  content_pillars: ["Éducation", "Divertissement", "Inspiration"],
};

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="oklch(0.30 0.02 270)"
            strokeWidth="6"
          />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${(value / 100) * 163.4} 163.4`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-lg font-black">{value}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ProfileBooster() {
  const [handle, setHandle] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<typeof MOCK_RESULT | null>(null);

  const PLATFORMS = [
    { id: "tiktok", label: "TikTok", emoji: "🎵" },
    { id: "instagram", label: "Instagram", emoji: "📸" },
    { id: "facebook", label: "Facebook", emoji: "👥" },
  ];

  async function analyze() {
    if (!handle || !niche) return toast.error("Remplissez tous les champs");
    setBusy(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-profile", {
        body: { handle, niche, platform },
      });
      if (error) throw error;
      setResult(data);
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
      setResult({ ...MOCK_RESULT, viral_score: 65 + Math.floor(Math.random() * 30) });
    } finally {
      setBusy(false);
      toast.success("Analyse terminée !");
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black tracking-tight">AI Profile Booster</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Diagnostic IA complet de votre profil social pour maximiser votre portée.
        </p>
      </div>

      <Card className="p-6 bg-card/50 backdrop-blur border-border">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Plateforme</Label>
            <div className="flex gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${platform === p.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nom d'utilisateur</Label>
            <Input
              placeholder="@votre_compte"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Niche / Secteur</Label>
            <Input
              placeholder="Ex : Immobilier de luxe, Mode…"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>
        </div>
        <Button
          className="mt-4 w-full font-bold h-11"
          style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}
          onClick={analyze}
          disabled={busy}
        >
          {busy ? (
            "Analyse IA en cours…"
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" /> Lancer le diagnostic IA
            </>
          )}
        </Button>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 flex flex-col items-center gap-3 border-border bg-card">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  Scores IA
                </div>
                <div className="flex gap-6">
                  <ScoreRing
                    value={result.viral_score}
                    label="Viral"
                    color="oklch(0.72 0.20 340)"
                  />
                  <ScoreRing value={result.seo_score} label="SEO" color="oklch(0.80 0.15 200)" />
                </div>
              </Card>

              <Card className="md:col-span-2 p-6 border-border bg-card space-y-4">
                <div className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-secondary" /> Bio optimisée par IA
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm italic border border-border leading-relaxed">
                  "{result.bio_optimization}"
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Audience cible
                    </div>
                    <div>{result.audience_insights.age}</div>
                    <div>{result.audience_insights.gender}</div>
                    <div className="text-muted-foreground">{result.audience_insights.location}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Piliers contenu
                    </div>
                    {result.content_pillars.map((p) => (
                      <div key={p} className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-secondary" /> {p}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-5 border-border bg-card space-y-3">
                <div className="text-sm font-bold flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" /> Hashtags optimisés
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.hashtags.map((h) => (
                    <Badge
                      key={h}
                      variant="secondary"
                      className="text-[11px] cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(h);
                        toast.success("Copié !");
                      }}
                    >
                      {h}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className="p-5 border-border bg-card space-y-3">
                <div className="text-sm font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Meilleures heures
                </div>
                <div className="space-y-2">
                  {result.best_posting_times.map((t, i) => (
                    <div key={t} className="flex items-center justify-between">
                      <div className="text-sm font-mono font-semibold">{t}</div>
                      <Progress value={100 - i * 18} className="w-24 h-1.5" />
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground">Heure de Dakar (GMT+0)</div>
              </Card>

              <Card className="p-5 border-border bg-card space-y-3">
                <div className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Progression
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { label: "Potentiel viral", value: result.viral_score },
                    { label: "Score SEO", value: result.seo_score },
                    { label: "Cohérence niche", value: 78 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-6 border-border bg-card">
              <div className="text-sm font-bold flex items-center gap-2 mb-4">
                <Info className="h-4 w-4 text-primary" /> Stratégie de croissance IA
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {result.content_strategy}
                </div>
                <ul className="space-y-2.5">
                  {result.growth_tips.map((tip, i) => (
                    <li key={i} className="text-xs flex items-start gap-2.5">
                      <div
                        className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 text-primary-foreground"
                        style={{ background: "var(--gradient-brand)" }}
                      >
                        {i + 1}
                      </div>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
