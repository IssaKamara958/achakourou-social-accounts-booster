import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Connexion — Achakourou Booster AI" }] }),
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const onboarded = localStorage.getItem(`onboarded_${user.id}`);
      navigate({ to: onboarded === "true" ? "/app" : "/onboarding" });
    }
  }, [user, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/onboarding` },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/onboarding" });
        } else {
          toast.success("Compte créé ! Vérifiez votre email puis connectez-vous.");
          setMode("signin");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          const onboarded = localStorage.getItem(`onboarded_${data.user.id}`);
          navigate({ to: onboarded === "true" ? "/app" : "/onboarding" });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'authentification");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: "var(--background)",
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, oklch(0.25 0.08 290 / 0.4) 0%, transparent 70%)",
      }}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.20 340), oklch(0.80 0.15 200))",
              }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-bold">Achakourou Booster AI</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                100% Gratuit 🇸🇳
              </div>
            </div>
          </Link>
        </div>

        <Card className="p-6 sm:p-8 bg-card/90 backdrop-blur border-border space-y-5">
          <div>
            <h1 className="text-2xl font-black">
              {mode === "signin" ? "Bon retour ! 👋" : "Rejoignez la communauté 🇸🇳"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "signin"
                ? "Connectez-vous à votre espace créateur."
                : "Créez votre compte gratuitement."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full font-bold h-11"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.20 340), oklch(0.80 0.15 200))",
                color: "white",
              }}
            >
              {busy
                ? "Chargement…"
                : mode === "signin"
                  ? "Se connecter"
                  : "Créer mon compte gratuit"}
            </Button>
          </form>

          {mode === "signup" && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                ["20", "text-primary", "Géné. IA/j"],
                ["10", "text-secondary", "Posts/j"],
                ["5", "text-green-400", "SEO/j"],
              ].map(([v, c, l]) => (
                <div key={l} className="rounded-xl bg-muted/40 p-2.5">
                  <div className={`font-black text-lg ${c}`}>{v}</div>
                  <div className="text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-sm text-muted-foreground hover:text-foreground w-full text-center transition-colors"
          >
            {mode === "signin"
              ? "Pas encore de compte ? Inscrivez-vous gratuitement →"
              : "Déjà un compte ? Se connecter"}
          </button>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Plateforme 100% gratuite pour les créateurs sénégalais 🇸🇳
        </p>
      </div>
    </div>
  );
}
