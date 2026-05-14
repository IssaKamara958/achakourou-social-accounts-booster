import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/app": "Dashboard",
  "/app/trends": "Trends Engine",
  "/app/generator": "AI Generator",
  "/app/analytics": "Analytics",
  "/app/social": "Social Accounts",
  "/app/publisher": "Publisher",
  "/app/seo": "SEO Pages",
  "/app/clients": "Clients",
  "/app/scripts": "Scripts Library",
  "/app/booster": "AI Booster",
  "/app/settings": "Settings",
};

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-primary-foreground" style={{ background: "var(--gradient-brand)" }}>A</div>
          <div className="text-sm text-muted-foreground animate-pulse">Loading workspace…</div>
        </div>
      </div>
    );
  }

  const title = pageTitles[path] ?? "Workspace";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 gap-3 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
            <SidebarTrigger />
            <div className="flex-1 flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <Bell className="h-4 w-4" />
              </Button>
              <Link to="/app/settings">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                  Issa KAMARA
                </Button>
              </Link>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
