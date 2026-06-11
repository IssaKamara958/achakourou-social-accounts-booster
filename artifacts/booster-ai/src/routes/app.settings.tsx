import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  Settings,
  User,
  Bell,
  Shield,
  Key,
  Globe,
  Zap,
  CreditCard,
  LogOut,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function SettingsPage() {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState("Issa KAMARA");
  const [city, setCity] = useState("Dakar");
  const [bio, setBio] = useState("Créateur de contenu TikTok · Agence digitale Sénégal");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [seoEnabled, setSeoEnabled] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [notifScripts, setNotifScripts] = useState(true);
  const [notifTrends, setNotifTrends] = useState(true);
  const [geminiKey, setGeminiKey] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL ?? "");

  function save() {
    toast.success("Paramètres sauvegardés !");
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "AC";

  return (
    <motion.div
      className="space-y-6 max-w-3xl"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
      }}
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-black tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez votre profil, API et préférences.
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-6 bg-card border-border space-y-5">
          <div className="flex items-center gap-2 font-semibold">
            <User className="h-4 w-4 text-primary" /> Profil
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback
                className="text-lg font-black"
                style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{fullName}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
              <Badge
                variant="outline"
                className="text-[10px] mt-1 border-secondary/40 text-secondary"
              >
                Plan gratuit
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dakar" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Bio</Label>
              <Input value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
          </div>
          <Button
            onClick={save}
            style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}
            className="font-semibold"
          >
            Sauvegarder le profil
          </Button>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-6 bg-card border-border space-y-5">
          <div className="flex items-center gap-2 font-semibold">
            <Key className="h-4 w-4 text-primary" /> Clés API
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            Ces clés sont stockées localement et utilisées pour la génération IA et la connexion
            base de données.
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Google Gemini API Key</Label>
              <Input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza…"
              />
              <p className="text-[11px] text-muted-foreground">
                Utilisée pour la génération de scripts, hooks et SEO.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Supabase URL</Label>
              <Input
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xxxx.supabase.co"
              />
            </div>
          </div>
          <Button onClick={save} variant="outline" className="gap-2">
            <Shield className="h-4 w-4" /> Sauvegarder les clés
          </Button>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-6 bg-card border-border space-y-5">
          <div className="flex items-center gap-2 font-semibold">
            <Zap className="h-4 w-4 text-primary" /> Fonctionnalités IA
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Génération IA activée",
                desc: "Activer/désactiver la génération de scripts par IA",
                value: aiEnabled,
                onChange: setAiEnabled,
              },
              {
                label: "SEO automatique",
                desc: "Générer des pages SEO pour chaque contenu publié",
                value: seoEnabled,
                onChange: setSeoEnabled,
              },
              {
                label: "Publication automatique",
                desc: "Publier automatiquement selon le planning défini",
                value: autoPublish,
                onChange: setAutoPublish,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
                <Switch checked={item.value} onCheckedChange={item.onChange} />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-6 bg-card border-border space-y-5">
          <div className="flex items-center gap-2 font-semibold">
            <Bell className="h-4 w-4 text-primary" /> Notifications
          </div>
          <div className="space-y-4">
            {[
              { label: "Nouveaux scripts générés", value: notifScripts, onChange: setNotifScripts },
              {
                label: "Tendances virales détectées",
                value: notifTrends,
                onChange: setNotifTrends,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="text-sm font-medium">{item.label}</div>
                <Switch checked={item.value} onCheckedChange={item.onChange} />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="p-6 bg-card border-border space-y-4">
          <div className="flex items-center gap-2 font-semibold">
            <CreditCard className="h-4 w-4 text-primary" /> Plan & Abonnement
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div>
              <div className="font-bold">Plan Gratuit</div>
              <div className="text-xs text-muted-foreground">
                10 générations IA · 1 réseau social · Analytics limités
              </div>
            </div>
            <Button
              style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}
              className="font-semibold"
            >
              Upgrade →
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              {
                plan: "Creator",
                price: "9€/mois",
                features: ["IA illimitée", "3 réseaux", "SEO auto", "Scheduler"],
              },
              {
                plan: "Agency",
                price: "29€/mois",
                features: ["Multi-clients", "Analytics avancés", "API accès", "Workers"],
              },
            ].map((p) => (
              <div
                key={p.plan}
                className="p-4 rounded-xl border border-border hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold">{p.plan}</div>
                  <div className="text-sm font-semibold text-primary">{p.price}</div>
                </div>
                <ul className="space-y-1">
                  {p.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-secondary" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Button
          variant="ghost"
          onClick={signOut}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Se déconnecter
        </Button>
      </motion.div>
    </motion.div>
  );
}
