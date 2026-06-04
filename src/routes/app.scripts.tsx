import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Download, FileText } from "lucide-react";
import { toast } from "sonner";

interface GeneratedScript {
  id: string;
  topic: string;
  created_at: string;
  viral_score: number;
  hook: string;
  content: string;
  cta: string;
  clients: { name: string } | null;
}

export const Route = createFileRoute("/app/scripts")({
  component: ScriptsPage,
});

function ScriptsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: scripts } = useQuery<GeneratedScript[]>({
    queryKey: ["scripts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_scripts")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  function copyOne(s: { hook: string; content: string; cta: string }) {
    navigator.clipboard.writeText(`HOOK:\n${s.hook}\n\nCONTENT:\n${s.content}\n\nCTA:\n${s.cta}`);
    toast.success("Copied");
  }

  async function del(id: string) {
    const { error } = await supabase.from("generated_scripts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["scripts"] });
  }

  function exportAll() {
    const blob = new Blob([JSON.stringify(scripts ?? [], null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `achakourou-scripts-${Date.now()}.json`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scripts library</h1>
          <p className="text-sm text-muted-foreground">All generated scripts, ready to ship.</p>
        </div>
        {!!scripts?.length && (
          <Button variant="outline" onClick={exportAll}>
            <Download className="h-4 w-4 mr-2" /> Export JSON
          </Button>
        )}
      </div>

      {!scripts?.length ? (
        <Card className="p-10 text-center text-muted-foreground bg-card border-border">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
          No scripts yet — generate your first one.
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {scripts.map((s) => (
            <Card key={s.id} className="p-5 bg-card border-border space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{s.topic}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                    {s.clients && ` · ${s.clients.name}`}
                  </div>
                </div>
                <Badge
                  style={{
                    background: "var(--gradient-brand)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {s.viral_score}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-primary">HOOK</span>
                  <div>{s.hook}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground">
                    CONTENT
                  </span>
                  <div className="whitespace-pre-wrap">{s.content}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-primary">CTA</span>
                  <div>{s.cta}</div>
                </div>
              </div>
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="sm" onClick={() => copyOne(s)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => del(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}