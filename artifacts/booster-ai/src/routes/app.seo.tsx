import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Globe, Sparkles, Copy, Plus, CheckCircle2, FileText, AlertTriangle } from "lucide-react";
import { getQuota, incrementQuota, canUse } from "@/lib/quota";
import { QuotaBadge } from "@/components/QuotaBadge";

export const Route = createFileRoute("/app/seo")({
  component: SeoPage,
});

type SeoPageItem = {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  content: string;
  indexed: boolean;
  createdAt: string;
};

const samplePages: SeoPageItem[] = [
  {
    id: "1",
    slug: "comment-aller-viral-tiktok-senegal",
    title: "Comment aller viral sur TikTok au Sénégal en 2026",
    metaDescription:
      "Découvrez les stratégies IA pour exploser votre audience TikTok au Sénégal. Tendances locales, hooks viraux et hashtags.",
    content: "Le marché TikTok sénégalais est en pleine explosion…",
    indexed: true,
    createdAt: "2026-05-10",
  },
  {
    id: "2",
    slug: "hashtags-viraux-afrique-2026",
    title: "Top 50 hashtags viraux pour l'Afrique de l'Ouest 2026",
    metaDescription:
      "Les meilleurs hashtags pour maximiser votre portée sur TikTok, Instagram et Facebook en Afrique.",
    content: "L'Afrique de l'Ouest représente un marché unique…",
    indexed: false,
    createdAt: "2026-05-12",
  },
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function SeoPage() {
  const [pages, setPages] = useState<SeoPageItem[]>(samplePages);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newPage, setNewPage] = useState({ slug: "", title: "", metaDescription: "", content: "" });
  const [quota, setQuota] = useState(() => getQuota("seo"));

  const refreshQuota = () => setQuota(getQuota("seo"));
  const quotaExhausted = quota.remaining === 0;

  async function generateSeo() {
    if (!topic.trim()) return toast.error("Entrez un sujet");
    if (!canUse("seo")) {
      toast.error(
        `Quota SEO atteint — ${quota.limit} pages/jour en plan gratuit. Revenez demain ! 🇸🇳`,
      );
      return;
    }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);
    const generated: SeoPageItem = {
      id: Date.now().toString(),
      slug,
      title: `${topic} — Guide complet pour l'Afrique 2026`,
      metaDescription: `Tout savoir sur "${topic}" pour les créateurs de contenu africains. Stratégies IA, tendances locales et conseils pratiques.`,
      content: `${topic} est un sujet clé pour les créateurs de contenu au Sénégal et en Afrique de l'Ouest. Voici tout ce que vous devez savoir…`,
      indexed: false,
      createdAt: new Date().toISOString().split("T")[0],
    };
    incrementQuota("seo");
    refreshQuota();
    setPages((prev) => [generated, ...prev]);
    setTopic("");
    setGenerating(false);
    toast.success("Page SEO générée par IA !");
  }

  function addManual(e: React.FormEvent) {
    e.preventDefault();
    if (!newPage.title || !newPage.slug) return toast.error("Titre et slug requis");
    setPages((prev) => [
      {
        ...newPage,
        id: Date.now().toString(),
        indexed: false,
        createdAt: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
    setNewPage({ slug: "", title: "", metaDescription: "", content: "" });
    setShowForm(false);
    toast.success("Page créée !");
  }

  function toggleIndex(id: string) {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, indexed: !p.indexed } : p)));
  }

  function copySlug(slug: string) {
    navigator.clipboard.writeText(`/${slug}`);
    toast.success("Slug copié !");
  }

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
          <h1 className="text-3xl font-black tracking-tight">SEO Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Générez des pages SEO indexables pour chaque contenu.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5 text-primary" /> Pages SEO restantes :
            <QuotaBadge quotaKey="seo" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Ajouter manuellement
          </Button>
        </div>
      </motion.div>

      {quotaExhausted && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/40 bg-destructive/5 text-sm">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <span className="font-semibold text-destructive">Quota journalier atteint — </span>
              <span className="text-muted-foreground">
                {quota.limit} pages SEO/jour en plan gratuit. Renouvellement à minuit. 🇸🇳
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <Card className="p-6 bg-card border-border space-y-4">
          <div className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Génération automatique par IA
          </div>
          <div className="flex gap-3">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Sujet : ex. 'Comment gagner de l'argent avec TikTok au Sénégal'"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && generateSeo()}
              disabled={quotaExhausted}
            />
            <Button
              onClick={generateSeo}
              disabled={generating || quotaExhausted}
              style={
                !quotaExhausted
                  ? { background: "var(--gradient-brand)", color: "var(--primary-foreground)" }
                  : {}
              }
              className="font-semibold shrink-0"
            >
              {quotaExhausted
                ? `Quota atteint (${quota.limit}/j)`
                : generating
                  ? "Génération…"
                  : "Générer page SEO"}
            </Button>
          </div>
          {!quotaExhausted && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {quota.used}/{quota.limit} pages générées aujourd'hui
              </span>
              <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(quota.used / quota.limit) * 100}%`,
                    background:
                      quota.used / quota.limit > 0.7
                        ? "oklch(0.65 0.20 30)"
                        : "var(--gradient-brand)",
                  }}
                />
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            L'IA génère automatiquement : slug SEO, titre optimisé, meta description, contenu de
            base avec schema.org.
          </p>
        </Card>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-6 bg-card border-border border-primary/30">
              <form onSubmit={addManual} className="space-y-4">
                <div className="font-semibold text-sm">Nouvelle page manuelle</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Titre SEO</Label>
                    <Input
                      value={newPage.title}
                      onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug URL</Label>
                    <Input
                      value={newPage.slug}
                      onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                      placeholder="mon-article-seo"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Meta description</Label>
                  <Textarea
                    rows={2}
                    value={newPage.metaDescription}
                    onChange={(e) => setNewPage({ ...newPage, metaDescription: e.target.value })}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contenu</Label>
                  <Textarea
                    rows={4}
                    value={newPage.content}
                    onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    style={{
                      background: "var(--gradient-brand)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    Créer
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={fadeUp} className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Pages créées
          </span>
          <Badge variant="outline">{pages.length} pages</Badge>
        </div>
        {pages.map((page) => (
          <motion.div key={page.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5 bg-card border-border hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <div className="font-semibold text-sm truncate">{page.title}</div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${page.indexed ? "border-green-500/40 text-green-400" : "border-border text-muted-foreground"}`}
                    >
                      {page.indexed ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-0.5" />
                          Indexé
                        </>
                      ) : (
                        "Non indexé"
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary mb-1">
                    <Globe className="h-3 w-3" />
                    <span className="font-mono">/{page.slug}</span>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {page.metaDescription}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{page.createdAt}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copySlug(page.slug)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={page.indexed ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => toggleIndex(page.id)}
                    className="h-8 text-xs px-2"
                  >
                    {page.indexed ? "Désindexer" : "Indexer"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
