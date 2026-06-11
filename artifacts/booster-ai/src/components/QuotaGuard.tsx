import type { ReactNode } from "react";
import { getQuota, LIMITS, type QuotaKey } from "@/lib/quota";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const LABEL: Record<QuotaKey, string> = {
  ai: "générations IA",
  posts: "publications",
  seo: "pages SEO",
};

interface Props {
  quotaKey: QuotaKey;
  children: ReactNode;
}

export function QuotaGuard({ quotaKey, children }: Props) {
  const { remaining } = getQuota(quotaKey);

  if (remaining > 0) return <>{children}</>;

  return (
    <Card className="p-6 border-destructive/40 bg-destructive/5 text-center space-y-2">
      <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
      <div className="font-semibold">Quota journalier atteint</div>
      <div className="text-sm text-muted-foreground">
        Vous avez utilisé vos {LIMITS[quotaKey]} {LABEL[quotaKey]} gratuites aujourd'hui.
        <br />
        Le quota se renouvelle automatiquement à minuit.
      </div>
      <div className="text-xs text-muted-foreground pt-1">
        Plan gratuit 🇸🇳 — 100% accessible au Sénégal
      </div>
    </Card>
  );
}
