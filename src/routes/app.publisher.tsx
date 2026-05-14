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
import { Calendar, Clock, Send, Plus, Trash2, Hash, AlertTriangle } from "lucide-react";
import { getQuota, incrementQuota, canUse } from "@/lib/quota";
import { QuotaBadge } from "@/components/QuotaBadge";

export const Route = createFileRoute("/app/publisher")({
  component: PublisherPage,
});

type Post = {
  id: string;
  title: string;
  platforms: string[];
  scheduledAt: string;
  status: "pending" | "published" | "failed";
  hook: string;
};

const sampleQueue: Post[] = [
  { id: "1", title: "3 erreurs à éviter sur TikTok", platforms: ["tiktok", "instagram"], scheduledAt: "2026-05-15 08:00", status: "pending", hook: "Tout le monde fait cette erreur…" },
  { id: "2", title: "Comment doubler ton audience en 7 jours", platforms: ["tiktok"], scheduledAt: "2026-05-16 12:00", status: "pending", hook: "Le secret que les grands créateurs cachent…" },
];

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", emoji: "🎵", color: "oklch(0.72 0.20 340)" },
  { id: "instagram", label: "Instagram", emoji: "📸", color: "oklch(0.75 0.18 20)" },
  { id: "facebook", label: "Facebook", emoji: "👥", color: "oklch(0.60 0.15 250)" },
];

const HASHTAG_SUGGESTIONS = ["#senegal", "#dakar", "#tiktokafrique", "#buzzsn", "#viral", "#créateur", "#contenu", "#afrique"];

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function PublisherPage() {
  const [queue, setQueue] = useState<Post[]>(sampleQueue);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["tiktok"]);
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("08:00");
  const [publishing, setPublishing] = useState(false);
  const [quota, setQuota] = useState(() => getQuota("posts"));

  const refreshQuota = () => setQuota(getQuota("posts"));
  const quotaExhausted = quota.remaining === 0;

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }
  function toggleHashtag(tag: string) {
    setHashtags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  async function schedule() {
    if (!title.trim() || !hook.trim() || selectedPlatforms.length === 0)
      return toast.error("Titre, hook et au moins une plateforme sont requis.");
    if (!canUse("posts")) {
      toast.error(`Quota atteint — ${quota.limit} posts/jour en plan gratuit. Revenez demain ! 🇸🇳`);
      return;
    }
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const newPost: Post = {
      id: Date.now().toString(), title, platforms: selectedPlatforms,
      scheduledAt: scheduleDate ? `${scheduleDate} ${scheduleTime}` : "Immédiat",
      status: "pending", hook,
    };
    incrementQuota("posts"); refreshQuota();
    setQueue((prev) => [newPost, ...prev]);
    setTitle(""); setHook(""); setContent(""); setHashtags([]);
    setScheduleDate(""); setSelectedPlatforms(["tiktok"]);
    setPublishing(false);
    toast.success(scheduleDate ? "Post programmé !" : "Post publié !");
  }

  function remove(id: string) {
    setQueue((prev) => prev.filter((p) => p.id !== id));
    toast.success("Post supprimé");
  }

  const statusMap = {
    pending: { label: "Programmé", color: "border-secondary/40 text-secondary" },
    published: { label: "Publié", color: "border-green-500/40 text-green-400" },
    failed: { label: "Échec", color: "border-destructive/40 text-destructive" },
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp} className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Publisher</h1>
          <p className="text-sm text-muted-foreground mt-1">Créez et programmez vos posts sur tous vos réseaux.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Send className="h-3.5 w-3.5 text-primary" /> Posts restants :
          <QuotaBadge quotaKey="posts" />
        </div>
      </motion.div>

      {quotaExhausted && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/40 bg-destructive/5 text-sm">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <span className="font-semibold text-destructive">Quota journalier atteint — </span>
              <span className="text-muted-foreground">{quota.limit} posts/jour en plan gratuit. Renouvellement à minuit. 🇸🇳</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        <motion.div variants={fadeUp} className="lg:col-span-3 space-y-4">
          <Card className="p-6 bg-card border-border space-y-5">
            <div className="font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Nouveau post
            </div>

            <div className="space-y-2">
              <Label>Titre / Sujet</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="3 astuces pour devenir viral au Sénégal…" disabled={quotaExhausted} />
            </div>

            <div className="space-y-2">
              <Label>HOOK <span className="text-muted-foreground text-xs">(première phrase, ultra importante)</span></Label>
              <Textarea rows={2} value={hook} onChange={(e) => setHook(e.target.value)}
                placeholder="Personne ne parle de ça…" className="resize-none" disabled={quotaExhausted} />
            </div>

            <div className="space-y-2">
              <Label>Contenu / Description</Label>
              <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Le contenu principal de votre post…" className="resize-none" disabled={quotaExhausted} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Hash className="h-3.5 w-3.5" /> Hashtags suggérés</Label>
              <div className="flex flex-wrap gap-2">
                {HASHTAG_SUGGESTIONS.map((tag) => (
                  <button key={tag} onClick={() => toggleHashtag(tag)} disabled={quotaExhausted}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all disabled:opacity-40 ${
                      hashtags.includes(tag) ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40"}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Plateformes cibles</Label>
              <div className="flex gap-2">
                {PLATFORMS.map((p) => (
                  <button key={p.id} onClick={() => togglePlatform(p.id)} disabled={quotaExhausted}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${
                      selectedPlatforms.includes(p.id) ? "border-transparent text-white" : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40"}`}
                    style={selectedPlatforms.includes(p.id) ? { background: p.color } : {}}>
                    <span>{p.emoji}</span> {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Date</Label>
                <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} disabled={quotaExhausted} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Heure</Label>
                <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} disabled={quotaExhausted} />
              </div>
            </div>

            <div className="space-y-2">
              <Button className="w-full font-semibold gap-2"
                style={!quotaExhausted ? { background: "var(--gradient-brand)", color: "var(--primary-foreground)" } : {}}
                onClick={schedule} disabled={publishing || quotaExhausted}>
                {quotaExhausted ? `Quota atteint (${quota.limit}/jour)` : publishing ? "Publication…" : scheduleDate
                  ? <><Calendar className="h-4 w-4" /> Programmer</>
                  : <><Send className="h-4 w-4" /> Publier maintenant</>}
              </Button>
              {!quotaExhausted && (
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>{quota.used}/{quota.limit} posts aujourd'hui</span>
                  <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(quota.used / quota.limit) * 100}%`,
                        background: quota.used / quota.limit > 0.7 ? "oklch(0.65 0.20 30)" : "var(--gradient-brand)" }} />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-2 space-y-3">
          <div className="font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> File de publication</span>
            <Badge variant="outline" className="text-xs">{queue.length} posts</Badge>
          </div>

          <AnimatePresence>
            {queue.map((post) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}>
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium text-sm truncate flex-1">{post.title}</div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${statusMap[post.status].color}`}>{statusMap[post.status].label}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground italic mb-2">"{post.hook}"</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {post.platforms.map((pid) => {
                        const pl = PLATFORMS.find((p) => p.id === pid);
                        return pl ? <span key={pid} className="text-sm">{pl.emoji}</span> : null;
                      })}
                      <span className="text-[10px] text-muted-foreground">{post.scheduledAt}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => remove(post.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {queue.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground text-sm bg-card/40 border-dashed">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Aucun post programmé
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
