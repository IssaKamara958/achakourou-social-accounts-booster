import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Share2, CheckCircle2, XCircle, ExternalLink, Plus, Trash2, AlertCircle, RefreshCw
} from "lucide-react";

export const Route = createFileRoute("/app/social")({
  component: SocialAccountsPage,
});

type Platform = { id: string; name: string; color: string; icon: string; description: string; connected: boolean; username?: string; followers?: string };

const initialPlatforms: Platform[] = [
  {
    id: "tiktok",
    name: "TikTok",
    color: "oklch(0.72 0.20 340)",
    icon: "🎵",
    description: "Publiez des vidéos courtes et analysez vos tendances TikTok en temps réel.",
    connected: false,
  },
  {
    id: "instagram",
    name: "Instagram",
    color: "oklch(0.75 0.18 20)",
    icon: "📸",
    description: "Partagez Reels, Stories et posts. Accédez aux insights de votre audience.",
    connected: false,
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "oklch(0.60 0.15 250)",
    icon: "👥",
    description: "Publiez sur votre Page, gérez les Reels et analysez l'engagement.",
    connected: false,
  },
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function SocialAccountsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [open, setOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);

  function openConnect(p: Platform) {
    setActivePlatform(p);
    setUsername("");
    setToken("");
    setOpen(true);
  }

  async function handleConnect() {
    if (!username.trim()) return toast.error("Entrez votre nom d'utilisateur");
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === activePlatform?.id
          ? { ...p, connected: true, username: `@${username.replace("@", "")}`, followers: "—" }
          : p
      )
    );
    setOpen(false);
    setConnecting(false);
    toast.success(`${activePlatform?.name} connecté avec succès !`);
  }

  function disconnect(id: string) {
    setPlatforms((prev) => prev.map((p) => p.id === id ? { ...p, connected: false, username: undefined, followers: undefined } : p));
    toast.success("Compte déconnecté");
  }

  const connectedCount = platforms.filter((p) => p.connected).length;

  return (
    <motion.div
      className="space-y-6 max-w-4xl"
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-black tracking-tight">Réseaux sociaux</h1>
        <p className="text-sm text-muted-foreground mt-1">Connectez vos comptes pour publier et analyser en un clic.</p>
      </motion.div>

      {connectedCount === 0 && (
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border bg-card/50 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-secondary shrink-0" />
            <p className="text-sm text-muted-foreground">
              Aucun réseau connecté. Connectez au moins un compte pour commencer à publier.
            </p>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-4">
        {platforms.map((p) => (
          <Card
            key={p.id}
            className="p-6 bg-card border-border hover:border-primary/30 transition-all flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: `${p.color}22` }}
              >
                {p.icon}
              </div>
              {p.connected
                ? <Badge className="text-[10px] gap-1 bg-secondary/20 text-secondary border-secondary/30">
                    <CheckCircle2 className="h-3 w-3" /> Connecté
                  </Badge>
                : <Badge variant="outline" className="text-[10px] text-muted-foreground">Non connecté</Badge>}
            </div>
            <div>
              <div className="font-bold text-lg">{p.name}</div>
              {p.connected && p.username && (
                <div className="text-sm text-muted-foreground">{p.username}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
            </div>
            <div className="mt-auto flex gap-2">
              {p.connected ? (
                <>
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs">
                    <RefreshCw className="h-3 w-3" /> Sync
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => disconnect(p.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="w-full gap-2 font-semibold"
                  style={{ background: p.color, color: "#fff" }}
                  onClick={() => openConnect(p)}
                >
                  <Plus className="h-3.5 w-3.5" /> Connecter {p.name}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-5 bg-card/40 border-border border-dashed">
          <div className="flex items-start gap-3">
            <Share2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm mb-1">Connexion OAuth officielle</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Les connexions utilisent les APIs officielles de chaque plateforme (TikTok Content Posting API, Meta Graph API).
                Aucun scraping ni automatisation interdite. Configurez vos clés API dans les <strong>Settings</strong> pour activer OAuth complet.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activePlatform?.icon} Connecter {activePlatform?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              Pour la démo, entrez votre nom d'utilisateur. En production, l'OAuth officiel sera utilisé.
            </div>
            <div className="space-y-2">
              <Label>Nom d'utilisateur {activePlatform?.name}</Label>
              <Input
                placeholder="@votre_compte"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Access Token (optionnel)</Label>
              <Input
                type="password"
                placeholder="Token API…"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <Button
              className="w-full font-semibold"
              style={{ background: activePlatform?.color, color: "#fff" }}
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? "Connexion en cours…" : `Connecter ${activePlatform?.name}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
