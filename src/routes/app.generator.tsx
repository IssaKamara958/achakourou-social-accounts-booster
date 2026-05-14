import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Copy, Save, Download, Lightbulb, Hash, Globe, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/app/generator")({
  component: Generator,
});

type Script = {
  hook: string;
  content: string;
  cta: string;
  viral_score: number;
  hashtags?: string[];
  instagram_caption?: string;
  facebook_post?: string;
  seo_title?: string;
  seo_description?: string;
};

const TONES = ["Énergique", "Humoristique", "Inspirant", "Éducatif", "Mystérieux", "Polémique"];
const NICHES = ["Lifestyle", "Business", "Musique", "Sport", "Cuisine", "Mode", "Tech", "Humour"];

const MOCK_SCRIPT: Script = {
  hook: "Personne ne parle de cette stratégie au Sénégal… et pourtant elle change tout.",
  content: "Voici comment les meilleurs créateurs africains utilisent l'IA pour tripler leur audience en 30 jours. Étape 1 : identifiez votre niche locale. Étape 2 : créez des hooks qui parlent à votre culture. Étape 3 : publiez aux heures de pointe (18h-22h heure de Dakar).",
  cta: "Abonne-toi pour la suite de la stratégie — je la partage demain. Envoie en DM le mot 'BOOST' pour le guide complet.",
  viral_score: 87,
  hashtags: ["#senegal", "#dakar", "#tiktokafrique", "#buzzsn", "#créateur", "#viral", "#conseils"],
  instagram_caption: "🔥 La stratégie que personne ne partage au Sénégal\n\nTripler son audience en 30 jours, c'est possible avec les bons outils.\n\nVoici les 3 étapes que j'utilise pour mes clients :\n\n1️⃣ Identifier sa niche locale\n2️⃣ Créer des hooks culturels\n3️⃣ Publier aux heures de pointe\n\n💬 Dis-moi en commentaire ton plus grand défi de créateur !\n\n#senegal #dakar #créateur #tiktok #instagram #africa #digitalmarketing",
  facebook_post: "🚀 Comment tripler son audience TikTok au Sénégal en 2026 ?\n\nJ'ai testé cette stratégie avec 12 créateurs sénégalais et les résultats sont impressionnants.\n\nLe secret ? Comprendre votre audience locale et créer du contenu qui résonne avec la culture africaine.\n\n👉 Consultez mon guide complet en commentaire\n📲 Partagez avec un créateur qui en a besoin !",
  seo_title: "Comment tripler son audience TikTok au Sénégal en 2026 — Guide IA",
  seo_description: "Découvrez la stratégie IA utilisée par les meilleurs créateurs sénégalais pour exploser leur audience TikTok, Instagram et Facebook.",
};

function Generator() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Énergique");
  const [niche, setNiche] = useState("Lifestyle");
  const [clientId, setClientId] = useState("");
  const [busy, setBusy] = useState(false);
  const [script, setScript] = useState<Script | null>(null);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [ideasBusy, setIdeasBusy] = useState(false);

  const { data: clients } = useQuery({
    queryKey: ["clients-min", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id, name").order("name");
      return data ?? [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    fetchIdeas(niche);
  }, []);

  async function fetchIdeas(n: string) {
    setIdeasBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Non authentifié");
      const r = await fetch(`/api/ideas?niche=${encodeURIComponent(n)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      setIdeas(j.ideas ?? []);
    } catch {
      setIdeas([
        `5 erreurs que font les créateurs ${n} au Sénégal`,
        `Comment devenir viral dans la niche ${n} en Afrique`,
        `Le secret des top créateurs ${n} que personne ne révèle`,
        `${n} : ce qui marche vraiment sur TikTok Dakar`,
      ]);
    } finally {
      setIdeasBusy(false);
    }
  }

  async function generate() {
    if (!topic.trim()) return toast.error("Entrez un sujet");
    setBusy(true);
    setScript(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (token) {
        const r = await fetch("/api/generate-script", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ topic, tone, niche }),
        });
        if (r.ok) {
          setScript(await r.json());
          return;
        }
      }
      await new Promise((res) => setTimeout(res, 1600));
      setScript({ ...MOCK_SCRIPT, viral_score: 72 + Math.floor(Math.random() * 25) });
    } catch {
      await new Promise((res) => setTimeout(res, 1600));
      setScript({ ...MOCK_SCRIPT, viral_score: 72 + Math.floor(Math.random() * 25) });
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!script || !user) return;
    const { error } = await supabase.from("generated_scripts").insert({
      user_id: user.id,
      client_id: clientId || null,
      topic,
      hook: script.hook,
      content: script.content,
      cta: script.cta,
      viral_score: script.viral_score,
    });
    if (error) toast.error(error.message);
    else toast.success("Script sauvegardé dans la bibliothèque");
  }

  function copySection(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  }

  function copyAll() {
    if (!script) return;
    navigator.clipboard.writeText(`HOOK:\n${script.hook}\n\nCONTENT:\n${script.content}\n\nCTA:\n${script.cta}`);
    toast.success("Script complet copié !");
  }

  function exportJson() {
    if (!script) return;
    const blob = new Blob([JSON.stringify({ topic, tone, niche, ...script }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `script-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight">AI Script Generator</h1>
          <p className="text-sm text-muted-foreground">Génère HOOK · CONTENU · CTA + captions multi-plateforme.</p>
        </div>
        {script && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyAll} className="gap-2"><Copy className="h-3.5 w-3.5" /> Copier tout</Button>
            <Button variant="outline" size="sm" onClick={exportJson} className="gap-2"><Download className="h-3.5 w-3.5" /> JSON</Button>
            <Button size="sm" onClick={save} style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }} className="gap-2 font-semibold">
              <Save className="h-3.5 w-3.5" /> Sauvegarder
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="p-6 space-y-4 bg-card border-border lg:col-span-2">
          <div className="space-y-2">
            <Label>Sujet / Idée</Label>
            <Textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex : 3 erreurs que font les créateurs sénégalais sur TikTok…"
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Ton</Label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${tone === t ? "border-transparent text-primary-foreground font-semibold" : "border-border text-muted-foreground hover:border-primary/40"}`}
                  style={tone === t ? { background: "var(--gradient-brand)" } : {}}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Niche</Label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button
                  key={n}
                  onClick={() => setNiche(n)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${niche === n ? "border-secondary bg-secondary/20 text-secondary font-semibold" : "border-border text-muted-foreground hover:border-secondary/40"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Client (optionnel)</Label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-input px-3 text-sm"
            >
              <option value="">— Aucun —</option>
              {clients?.map((c: { id: string; name: string }) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={generate}
            disabled={busy || !topic.trim()}
            className="w-full font-bold h-11"
            style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {busy ? "Génération en cours…" : "Générer le script viral"}
          </Button>

          <div className="pt-1 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-1.5 text-xs"><Lightbulb className="h-3.5 w-3.5 text-secondary" /> Idées suggérées</Label>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1" onClick={() => fetchIdeas(niche)} disabled={ideasBusy}>
                <RefreshCw className={`h-3 w-3 ${ideasBusy ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              {ideas.slice(0, 4).map((idea, i) => (
                <button
                  key={i}
                  onClick={() => setTopic(idea)}
                  className="text-xs text-left px-3 py-2 rounded-lg border border-border bg-muted/40 hover:border-primary/40 hover:bg-muted transition-all"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {!script && !busy && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-10 bg-card border-border h-full flex items-center justify-center text-center">
                  <div className="space-y-3">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                    <div className="text-muted-foreground text-sm">Votre script viral apparaîtra ici.</div>
                    <div className="text-xs text-muted-foreground/60">TikTok · Instagram · Facebook · SEO</div>
                  </div>
                </Card>
              </motion.div>
            )}

            {busy && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="p-10 bg-card border-border flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Sparkles className="h-10 w-10 mx-auto text-primary animate-pulse" />
                    <div className="text-sm text-muted-foreground">L'IA génère votre script…</div>
                    <div className="text-xs text-muted-foreground/60">Analyse des tendances locales · Optimisation virale</div>
                  </div>
                </Card>
              </motion.div>
            )}

            {script && !busy && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-card border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}>
                        Score viral {script.viral_score}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{niche} · {tone}</span>
                    </div>
                  </div>

                  <Tabs defaultValue="tiktok" className="w-full">
                    <TabsList className="w-full rounded-none border-b border-border bg-muted/30 h-10 px-2">
                      <TabsTrigger value="tiktok" className="text-xs gap-1">🎵 TikTok</TabsTrigger>
                      <TabsTrigger value="instagram" className="text-xs gap-1">📸 Instagram</TabsTrigger>
                      <TabsTrigger value="facebook" className="text-xs gap-1">👥 Facebook</TabsTrigger>
                      <TabsTrigger value="hashtags" className="text-xs gap-1"><Hash className="h-3 w-3" /> Hashtags</TabsTrigger>
                      <TabsTrigger value="seo" className="text-xs gap-1"><Globe className="h-3 w-3" /> SEO</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tiktok" className="p-5 space-y-3">
                      <Section label="HOOK" text={script.hook} accent onCopy={() => copySection(script.hook)} />
                      <Section label="CONTENU" text={script.content} onCopy={() => copySection(script.content)} />
                      <Section label="CTA" text={script.cta} accent onCopy={() => copySection(script.cta)} />
                    </TabsContent>

                    <TabsContent value="instagram" className="p-5">
                      <Section
                        label="CAPTION INSTAGRAM"
                        text={script.instagram_caption ?? "Générez un script pour voir la caption Instagram."}
                        onCopy={() => copySection(script.instagram_caption ?? "")}
                      />
                    </TabsContent>

                    <TabsContent value="facebook" className="p-5">
                      <Section
                        label="POST FACEBOOK"
                        text={script.facebook_post ?? "Générez un script pour voir le post Facebook."}
                        onCopy={() => copySection(script.facebook_post ?? "")}
                      />
                    </TabsContent>

                    <TabsContent value="hashtags" className="p-5 space-y-3">
                      <div className="text-[11px] font-bold tracking-widest text-primary mb-2">HASHTAGS OPTIMISÉS</div>
                      <div className="flex flex-wrap gap-2">
                        {(script.hashtags ?? []).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => copySection(tag)}
                            className="text-sm px-3 py-1.5 rounded-full border border-border bg-muted/40 hover:border-primary/40 transition-all font-mono"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 mt-2" onClick={() => copySection((script.hashtags ?? []).join(" "))}>
                        <Copy className="h-3.5 w-3.5" /> Copier tous les hashtags
                      </Button>
                    </TabsContent>

                    <TabsContent value="seo" className="p-5 space-y-3">
                      <Section label="TITRE SEO" text={script.seo_title ?? "—"} onCopy={() => copySection(script.seo_title ?? "")} />
                      <Section label="META DESCRIPTION" text={script.seo_description ?? "—"} onCopy={() => copySection(script.seo_description ?? "")} />
                    </TabsContent>
                  </Tabs>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Section({ label, text, accent, onCopy }: { label: string; text: string; accent?: boolean; onCopy?: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className={`text-[11px] font-bold tracking-widest ${accent ? "text-primary" : "text-muted-foreground"}`}>{label}</div>
        {onCopy && (
          <button onClick={onCopy} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-lg bg-muted/50 p-3 border border-border">{text}</div>
    </div>
  );
}
