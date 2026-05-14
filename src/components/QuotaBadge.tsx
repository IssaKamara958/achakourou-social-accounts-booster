import { getQuota, type QuotaKey } from "@/lib/quota";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  quotaKey: QuotaKey;
  label?: string;
  className?: string;
}

export function QuotaBadge({ quotaKey, label, className }: Props) {
  const { used, limit, remaining } = getQuota(quotaKey);
  const pct = (used / limit) * 100;
  const critical = remaining === 0;
  const warning = !critical && pct >= 70;

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] gap-1 font-mono",
        critical && "border-destructive/50 text-destructive",
        warning && !critical && "border-yellow-500/50 text-yellow-400",
        !warning && !critical && "border-secondary/40 text-secondary",
        className
      )}
    >
      {label && <span>{label}</span>}
      {remaining}/{limit}
      {critical && " 🚫"}
    </Badge>
  );
}
