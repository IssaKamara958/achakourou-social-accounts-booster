import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Save, Download, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/generator")({
  component: Generator,
});

type Script = { hook: string; content: string; cta: string; viral_score: number };

function Generator() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("energetic, casual");
  const [clientId, setClientId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [script, setScript] = useState<Script | null>(null);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [ideasBusy, setIdeasBusy] = useState(false);

  const { data: clients } = useQuery({
    queryKey: ["clients-min", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id, name").order("name");
      return data ?? [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchIdeas("general");
    return () => { mounted = false; };
  }, []);

  async function fetchIdeas(niche: string) {
    setIdeasBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");
      const r = await fetch(`/api/ideas?niche=${encodeURIComponent(niche)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      setIdeas(j.ideas ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load ideas");
    } finally {
      setIdeasBusy(false);
    }
  }

  async function generate() {
    if (!topic.trim()) return;
    setBusy(true);
    setScript(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");
      const r = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic, tone }),
      });
      if (r.status === 429) throw new Error("Rate limit reached. Please retry in a moment.");
      if (r.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
      if (!r.ok) throw new Error(await r.text());
      setScript(await r.json());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!script || !user) return;
    const { error } = await supabase.from("generated_scripts").insert({
      user_id: user.id,
      client_id: clientId || null,
      topic,
      hook: script.hook,
      content: script.content,
      cta: script.cta,
      viral_score: script.viral_score,
    });
    if (error) toast.error(error.message);
    else toast.success("Script saved to library");
  }

  function copyAll() {
    if (!script) return;
    navigator.clipboard.writeText(`HOOK:\n${script.hook}\n\nCONTENT:\n${script.content}\n\nCTA:\n${script.cta}`);
    toast.success("Copied to clipboard");
  }

  function exportJson() {
    if (!script) return;
    const blob = new Blob([JSON.stringify({ topic, tone, ...script }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `script-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Script Generator</h1>
        <p className="text-sm text-muted-foreground">Generates HOOK · CONTENT · CTA optimized for retention.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 bg-card border-border">
          <div className="space-y-2">
            <Label>Topic</Label>
            <Textarea rows={3} value={topic} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTopic(e.target.value)} placeholder="e.g. 3 AI tools that 10x designer workflow" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Input value={tone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Client (optional)</Label>
              <select
                value={clientId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClientId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-input px-3 text-sm"
              >
                <option value="">— None —</option>
                {clients?.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <Button onClick={generate} disabled={busy || !topic.trim()} className="w-full font-semibold" style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}>
            <Sparkles className="h-4 w-4 mr-2" />
            {busy ? "Generating…" : "Generate viral script"}
          </Button>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-secondary" /> Idea suggestions</Label>
              <Button variant="ghost" size="sm" onClick={() => fetchIdeas(tone || "general")} disabled={ideasBusy}>
                {ideasBusy ? "…" : "Refresh"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ideas.map((i: string, idx: number) => (
                <button key={idx} onClick={() => setTopic(i)} className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted hover:border-primary/40">
                  {i}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border min-h-100">
          {!script ? (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm">
              Your viral script will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}>Viral score {script.viral_score}</Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={copyAll}><Copy className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={exportJson}><Download className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={save}><Save className="h-4 w-4" /></Button>
                </div>
              </div>
              <Section label="HOOK" text={script.hook} accent />
              <Section label="CONTENT" text={script.content} />
              <Section label="CTA" text={script.cta} accent />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Section({ label, text, accent }: { label: string; text: string; accent?: boolean }) {
  return (
    <div>
      <div className={`text-[11px] font-bold tracking-widest mb-1 ${accent ? "text-primary" : "text-muted-foreground"}`}>{label}</div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-md bg-muted/50 p-3 border border-border">{text}</div>
    </div>
  );
}