import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth";
import { useAppStatus } from "@/lib/app-status";
import { Bell, LayoutDashboard, Sparkles, Calendar, Zap, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const pageTitles: Record<string, string> = {
  "/app": "Dashboard",
  "/app/trends": "Trends Engine",
  "/app/generator": "AI Generator",
  "/app/analytics": "Analytics",
  "/app/social": "Comptes Sociaux",
  "/app/publisher": "Publisher",
  "/app/seo": "SEO Pages",
  "/app/clients": "Clients",
  "/app/scripts": "Bibliothèque",
  "/app/booster": "AI Booster",
  "/app/settings": "Paramètres",
};

const mobileNav = [
  { to: "/app", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/generator", icon: Sparkles, label: "Générer" },
  { to: "/app/publisher", icon: Calendar, label: "Publier" },
  { to: "/app/booster", icon: Zap, label: "Booster" },
  { to: "/app/social", icon: Share2, label: "Réseaux" },
];

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { isOnline, backendAvailable, backendLoading, syncActive, pendingSyncJobs } =
    useAppStatus();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user) {
      const onboarded = localStorage.getItem(`onboarded_${user.id}`);
      if (!onboarded) navigate({ to: "/onboarding" });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!isOnline) {
      toast.error("Connexion réseau perdue. Reconnexion automatique dès que possible.");
    } else if (!backendAvailable && !backendLoading) {
      toast.error("Backend Supabase indisponible. Vérifiez la configuration et réessayez.");
    }
  }, [isOnline, backendAvailable, backendLoading]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white"
            style={{
              background: "linear-gradient(135deg, oklch(0.72 0.20 340), oklch(0.80 0.15 200))",
            }}
          >
            A
          </div>
          <div className="text-sm text-muted-foreground animate-pulse">Chargement…</div>
        </div>
      </div>
    );
  }

  const profileName =
    localStorage.getItem(`profile_name_${user.id}`) || user.email?.split("@")[0] || "Créateur";
  const title = pageTitles[path] ?? "Workspace";
  const isActive = (to: string) => (to === "/app" ? path === "/app" : path.startsWith(to));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex flex-col gap-2 border-b border-border bg-background/80 p-3 sticky top-0 z-10 backdrop-blur-md sm:px-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="shrink-0" />
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <h2 className="text-sm font-semibold text-foreground truncate">{title}</h2>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hidden sm:flex"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Link to="/app/settings">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground max-w-[120px] truncate px-2"
                  >
                    {profileName}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden sm:flex flex-wrap items-center gap-2">
              <Badge variant={isOnline ? "secondary" : "destructive"}>
                {isOnline ? "Connecté" : "Hors ligne"}
              </Badge>
              <Badge variant={backendAvailable ? "default" : "destructive"}>
                {backendLoading
                  ? "Vérification backend..."
                  : backendAvailable
                    ? "Backend OK"
                    : "Backend indisponible"}
              </Badge>
              <Badge variant={syncActive ? "default" : "outline"}>
                {syncActive ? `Sync active (${pendingSyncJobs} en attente)` : "Sync idle"}
              </Badge>
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-6 overflow-auto pb-20 md:pb-6">
            <Outlet />
          </main>

          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 backdrop-blur-md safe-area-inset">
            <div className="flex items-center justify-around h-16 px-1">
              {mobileNav.map(({ to, icon: Icon, label }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className="flex flex-col items-center gap-0.5 px-2 py-2 min-w-0 flex-1"
                  >
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${active ? "text-white" : "text-muted-foreground"}`}
                      style={
                        active
                          ? {
                              background:
                                "linear-gradient(135deg, oklch(0.72 0.20 340), oklch(0.80 0.15 200))",
                            }
                          : {}
                      }
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-[10px] font-medium truncate ${active ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </SidebarProvider>
  );
}
