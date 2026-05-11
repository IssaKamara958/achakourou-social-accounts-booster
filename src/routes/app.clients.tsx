import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", handle: "", niche: "", notes: "" });

  const { data: clients } = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !form.name.trim()) return;
    const { error } = await supabase.from("clients").insert({ ...form, user_id: user.id });
    if (error) return toast.error(error.message);
    setForm({ name: "", handle: "", niche: "", notes: "" });
    qc.invalidateQueries({ queryKey: ["clients"] });
    toast.success("Client added");
  }

  async function del(id: string) {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground">Manage agency accounts and assign content.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 bg-card border-border lg:col-span-1">
          <div className="font-semibold mb-3 flex items-center gap-2"><Plus className="h-4 w-4" /> Add client</div>
          <form onSubmit={add} className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><Label>TikTok handle</Label><Input value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} placeholder="@brand" /></div>
            <div><Label>Niche</Label><Input value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="Fitness, SaaS…" /></div>
            <div><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button type="submit" className="w-full" style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}>Add client</Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-3">
          {!clients?.length ? (
            <Card className="p-10 text-center text-muted-foreground bg-card border-border">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
              No clients yet. Add your first one.
            </Card>
          ) : (
            clients.map((c) => (
              <Card key={c.id} className="p-4 bg-card border-border flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{c.name} <span className="text-muted-foreground text-sm">{c.handle}</span></div>
                  <div className="text-xs text-muted-foreground mt-1">{c.niche}</div>
                  {c.notes && <div className="text-sm mt-2">{c.notes}</div>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => del(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}