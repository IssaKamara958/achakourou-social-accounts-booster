import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Flame, Sparkles, Users, FileText, LogOut,
  Share2, Calendar, BarChart3, Globe, Settings, Zap, ChevronRight
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarFooter, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const mainItems = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Trends Engine", url: "/app/trends", icon: Flame },
  { title: "AI Generator", url: "/app/generator", icon: Sparkles },
  { title: "Analytics", url: "/app/analytics", icon: BarChart3 },
];

const publishItems = [
  { title: "Social Accounts", url: "/app/social", icon: Share2, badge: "New" },
  { title: "Publisher", url: "/app/publisher", icon: Calendar, badge: "New" },
  { title: "SEO Pages", url: "/app/seo", icon: Globe, badge: "New" },
];

const manageItems = [
  { title: "Clients", url: "/app/clients", icon: Users },
  { title: "Scripts Library", url: "/app/scripts", icon: FileText },
  { title: "AI Booster", url: "/app/booster", icon: Zap },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { signOut, user } = useAuth();

  const isActive = (url: string) =>
    url === "/app" ? path === "/app" : path.startsWith(url);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "AC";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/app" className="flex items-center gap-2 px-2 py-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-black text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-brand)" }}
          >
            A
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <div className="text-sm font-bold tracking-tight">Achakourou</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Social AI</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Publish</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publishItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2 w-full">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="flex-1 flex items-center justify-between">
                          {item.title}
                          {item.badge && (
                            <Badge className="text-[9px] px-1.5 py-0 h-4 ml-1" style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}>
                              {item.badge}
                            </Badge>
                          )}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && user?.email && (
          <div className="flex items-center gap-2 px-2 py-2">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px] font-bold" style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{user.email}</div>
              <div className="text-[10px] text-muted-foreground">Free plan</div>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={signOut} className="justify-start gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sign out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
