import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, Search, ShieldCheck, TrendingUp, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/app/booster")({
  component: ProfileBooster,
});

function ProfileBooster() {
  const [handle, setHandle] = useState("");
  const [niche, setNiche] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function analyze() {
    if (!handle || !niche) return toast.error("Please fill in all fields");
    setBusy(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-profile", {
        body: { handle, niche },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight">TikTok AI Booster</h1>
        <p className="text-muted-foreground">Optimize your profile SEO and branding for maximum reach.</p>
      </div>

      <Card className="p-6 bg-card/50 backdrop-blur border-border">
        <div className="grid md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label>TikTok Handle</Label>
            <Input placeholder="@username" value={handle} onChange={(e) => setHandle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Niche / Industry</Label>
            <Input placeholder="e.g. Luxury Real Estate" value={niche} onChange={(e) => setNiche(e.target.value)} />
          </div>
          <Button 
            className="md:col-span-2 font-bold h-11" 
            style={{ background: "var(--gradient-brand)", color: "var(--primary-foreground)" }}
            onClick={analyze}
            disabled={busy}
          >
            {busy ? "Analyzing with AI..." : "Run AI Diagnostic"} <Zap className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <Card className="p-6 text-center space-y-2 border-primary/20 bg-primary/5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Viral Score</div>
              <div className="text-5xl font-black text-primary">{result.viral_score}%</div>
              <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" /> Potential Reach
              </div>
            </Card>

            <Card className="md:col-span-2 p-6 space-y-4">
              <div>
                <div className="text-sm font-bold flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-secondary" /> Optimized Bio
                </div>
                <p className="text-sm bg-muted p-3 rounded-lg italic">"{result.bio_optimization}"</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Target Keywords</div>
                  <div className="flex flex-wrap gap-1">
                    {result.hashtags.map((h: string) => <Badge key={h} variant="secondary" className="text-[10px]">{h}</Badge>)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Growth Score</div>
                  <div className="text-xl font-bold">{result.seo_score}/100</div>
                </div>
              </div>
            </Card>

            <Card className="md:col-span-3 p-6">
              <div className="text-sm font-bold flex items-center gap-2 mb-4"><Info className="h-4 w-4 text-primary" /> AI Content Strategy</div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-sm leading-relaxed text-muted-foreground">{result.content_strategy}</div>
                <ul className="space-y-2">
                  {result.growth_tips.map((t: string, i: number) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">{i+1}</div>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}