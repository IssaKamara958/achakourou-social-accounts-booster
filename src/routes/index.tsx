import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Flame, BarChart3, Users, Zap, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen text-foreground" style={{ background: "var(--background)", backgroundImage: "var(--gradient-radial)" }}>
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center font-black text-primary-foreground" style={{ background: "var(--gradient-brand)" }}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold">Achakourou TikTok AI</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Agency SaaS</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/login"><Button style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}>Get started</Button></Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs text-muted-foreground mb-6">
          <Zap className="h-3 w-3" /> AI-powered viral engine for TikTok agencies
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
          Generate <span style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>viral TikTok</span><br />scripts in seconds.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time trend scoring, multi-client management and AI scriptwriting tuned for hooks, retention and CTAs. Built for agencies that ship daily.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/login">
            <Button size="lg" className="font-semibold" style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}>
              Launch your agency workspace <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-4">
        {[
          { icon: Flame, title: "Trends Engine", desc: "Live viral score (0–100) with growth indicators across niches." },
          { icon: Sparkles, title: "AI Scripts", desc: "HOOK · CONTENT · CTA generated for retention and shares." },
          { icon: BarChart3, title: "Agency Dashboard", desc: "Track output, scores and clients in one premium UI." },
          { icon: Users, title: "Multi-Client", desc: "Assign content to each TikTok client you manage." },
          { icon: Zap, title: "Public API", desc: "REST endpoints for trends, ideas and script generation." },
          { icon: ArrowRight, title: "Export-ready", desc: "Copy or export scripts as JSON for your video pipeline." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
            <f.icon className="h-5 w-5 text-primary" />
            <div className="mt-3 font-semibold">{f.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{f.desc}</div>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Achakourou Digital Services — Dev Issa KAMARA · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
