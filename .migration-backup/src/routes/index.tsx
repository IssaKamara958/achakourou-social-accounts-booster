import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Flame, BarChart3, Users, Zap, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div
      className="min-h-screen text-foreground selection:bg-primary/20 bg-background"
      style={{ backgroundImage: "var(--gradient-radial)", backgroundAttachment: "fixed" }}
    >
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center font-black text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Sparkles className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="text-sm font-bold">Achakourou TikTok AI</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-80">
              Agency SaaS
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button
            className="font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}
            asChild
          >
            <Link to="/login">Get started</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 text-xs font-medium text-muted-foreground mb-8 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-primary fill-primary/20" /> AI-powered viral engine for
            TikTok agencies
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] text-balance">
            Generate{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--gradient-brand)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
              }}
            >
              viral TikTok
            </span>
            <br />
            scripts in seconds.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
            Real-time trend scoring, multi-client management and AI scriptwriting tuned for hooks,
            retention and CTAs. Built for agencies that ship daily.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-8 text-base font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                background: "var(--gradient-brand)",
                color: "var(--primary-foreground)",
                boxShadow: "var(--shadow-glow)",
              }}
              asChild
            >
              <Link to="/login">
                Launch your agency workspace <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-32 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Flame,
              title: "Trends Engine",
              desc: "Live viral score (0–100) with growth indicators across niches.",
            },
            {
              icon: Sparkles,
              title: "AI Scripts",
              desc: "HOOK · CONTENT · CTA generated for retention and shares.",
            },
            {
              icon: BarChart3,
              title: "Agency Dashboard",
              desc: "Track output, scores and clients in one premium UI.",
            },
            {
              icon: Users,
              title: "Multi-Client",
              desc: "Assign content to each TikTok client you manage.",
            },
            {
              icon: Zap,
              title: "Public API",
              desc: "REST endpoints for trends, ideas and script generation.",
            },
            {
              icon: ArrowRight,
              title: "Export-ready",
              desc: "Copy or export scripts as JSON for your video pipeline.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card/50 p-6 hover:border-primary/50 hover:bg-card transition-all duration-300 backdrop-blur-sm"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <f.icon className="h-6 w-6" />
              </div>
              <div className="mt-4 font-bold text-lg">{f.title}</div>
              <div className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/40 py-10 text-center">
        <div className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-80">
          Achakourou Digital Services — Dev Issa KAMARA · © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
