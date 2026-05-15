import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, Sparkles, ArrowRight, User, Share2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", emoji: "🎵", placeholder: "@votre_tiktok", color: "oklch(0.72 0.20 340)" },
  { id: "instagram", label: "Instagram", emoji: "📸", placeholder: "@votre_instagram", color: "oklch(0.75 0.18 20)" },
  { id: "facebook", label: "Facebook", emoji: "👥", placeholder: "votre.page.facebook", color: "oklch(0.60 0.15 250)" },
];

const NICHES = ["Lifestyle", "Business", "Musique", "Sport", "Cuisine", "Mode", "Tech", "Humour", "Beauté", "Fitness", "Éducation", "Voyage"];

function OnboardingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [phone, setPhone] = useState("");
  const [accounts, setAccounts] = useState<Record<string, string>>({
    tiktok: "", instagram: "", facebook: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const done = localStorage.getItem(`onboarded_${user.id}`);
      if (done === "true") navigate({ to: "/app" });
    }
  }, [user, navigate]);

  async function finishOnboarding() {
    setBusy(true);
    try {
      const connected = PLATFORMS.filter((p) => accounts[p.id]?.trim());
      if (user) {
        await supabase.from("social_accounts").upsert(
          connected.map((p) => ({
            user_id: user.id,
            platform: p.id,
            username: accounts[p.id].replace("@", "").trim(),
            connected: true,
          }))
        );
        localStorage.setItem(`onboarded_${user.id}`, "true");
        localStorage.setItem(`profile_name_${user.id}`, name);
        localStorage.setItem(`profile_niche_${user.id}`, niche);
      }
      toast.success("Bienvenue sur Achakourou Booster AI ! 🇸🇳🚀");
      navigate({ to: "/app" });
    } catch {
      if (user) {
        localStorage.setItem(`onboarded_${user.id}`, "true");
        localStorage.setItem(`profile_name_${user.id}`, name);
        localStorage.setItem(`profile_niche_${user.id}`, niche);
      }
      navigate({ to: "/app" });
    } finally {
      setBusy(false);
    }
  }

  const steps = [
    { icon: User, label: "Profil" },
    { icon: Share2, label: "Réseaux" },
    { icon: Sparkles, label: "Prêt !" },
  ];

  const connectedCount = PLATFORMS.filter((p) => accounts[p.id]?.trim()).length;

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "var(--background)", backgroundImage: "radial-gradient(ellipse at 50% 0%, oklch(0.25 0.08 290 / 0.4) 0%, transparent 70%)" }}>
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-lg"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 340), oklch(0.80 0.15 200))" }}>
              A
            </div>
            <span className="font-bold text-lg">Achakourou Booster AI</span>
          </Link>
          <h1 className="text-2xl font-black">
            {step === 0 && "Créez votre profil 🇸🇳"}
            {step === 1 && "Connectez vos réseaux"}
            {step === 2 && "Vous êtes prêt ! 🚀"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 0 && "Dites-nous qui vous êtes pour personnaliser votre expérience."}
            {step === 1 && "Ajoutez vos comptes sociaux pour débloquer toutes les fonctionnalités."}
            {step === 2 && "Tout est configuré. Commencez à booster vos contenus !"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
                i < step ? "text-white" : i === step ? "text-white" : "bg-muted text-muted-foreground"
              }`} style={i <= step ? { background: "linear-gradient(135deg, oklch(0.72 0.20 340), oklch(0.80 0.15 200))" } : {}}>
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              {!i && <div className={`h-0.5 w-8 rounded ${step > 0 ? "bg-primary" : "bg-muted"}`} />}
              {i === 1 && <div className={`h-0.5 w-8 rounded ${step > 1 ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="p-6 bg-card border-border space-y-4">
                <div className="space-y-2">
                  <Label>Votre nom / Pseudo</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Ex : Mamadou Diallo, DjSN Official…" autoFocus />
                </div>
                <div className="space-y-2">
                  <Label>Votre niche principale</Label>
                  <div className="flex flex-wrap gap-2">
                    {NICHES.map((n) => (
                      <button key={n} onClick={() => setNiche(n)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${niche === n
                          ? "border-transparent text-white font-semibold"
                          : "border-border text-muted-foreground hover:border-primary/40"}`}
                        style={niche === n ? { background: "linear-gradient(135deg, oklch(0.72 0.20 340), oklch(0.80 0.15 200))" } : {}}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Numéro WhatsApp <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 000 00 00" type="tel" />
                </div>
                <Button className="w-full font-bold gap-2"
                  style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 340), oklch(0.80 0.15 200))", color: "white" }}
                  onClick={() => setStep(1)} disabled={!name.trim() || !niche}>
                  Continuer <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="p-6 bg-card border-border space-y-5">
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
                  Connectez au moins un réseau social pour pouvoir publier, analyser et booster vos contenus.
                </div>
                {PLATFORMS.map((p) => (
                  <div key={p.id} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <span className="text-base">{p.emoji}</span>
                      {p.label}
                      {accounts[p.id]?.trim() && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                    </Label>
                    <Input value={accounts[p.id]} onChange={(e) => setAccounts({ ...accounts, [p.id]: e.target.value })}
                      placeholder={p.placeholder} />
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Retour</Button>
                  <Button className="flex-1 font-bold gap-2"
                    style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 340), oklch(0.80 0.15 200))", color: "white" }}
                    onClick={() => setStep(2)} disabled={connectedCount === 0}>
                    {connectedCount === 0 ? "Connectez 1 réseau min." : `Continuer (${connectedCount} réseau${connectedCount > 1 ? "x" : ""})`}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <button className="text-xs text-muted-foreground hover:text-foreground w-full text-center" onClick={() => setStep(2)}>
                  Passer cette étape (configurable plus tard)
                </button>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="p-6 bg-card border-border space-y-5 text-center">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl"
                    style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 340), oklch(0.80 0.15 200))" }}>
                    🇸🇳
                  </div>
                </div>
                <div>
                  <div className="text-xl font-black">Bienvenue, {name} !</div>
                  <div className="text-sm text-muted-foreground mt-1">Votre espace creator est prêt.</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-2xl font-black text-primary">20</div>
                    <div className="text-xs text-muted-foreground">Générations IA/j</div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-2xl font-black text-secondary">10</div>
                    <div className="text-xs text-muted-foreground">Posts/jour</div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-2xl font-black" style={{ color: "oklch(0.75 0.18 140)" }}>5</div>
                    <div className="text-xs text-muted-foreground">Pages SEO/j</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Mode Sénégal 🇸🇳 — 100% gratuit</div>
                {connectedCount > 0 && (
                  <div className="flex justify-center gap-2">
                    {PLATFORMS.filter((p) => accounts[p.id]?.trim()).map((p) => (
                      <div key={p.id} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                        style={{ background: p.color + "33", border: `1px solid ${p.color}55`, color: p.color }}>
                        {p.emoji} @{accounts[p.id].replace("@", "")}
                      </div>
                    ))}
                  </div>
                )}
                <Button className="w-full font-bold h-12 text-base gap-2"
                  style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 340), oklch(0.80 0.15 200))", color: "white" }}
                  onClick={finishOnboarding} disabled={busy}>
                  <Sparkles className="h-5 w-5" />
                  {busy ? "Configuration…" : "Entrer dans mon workspace →"}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
