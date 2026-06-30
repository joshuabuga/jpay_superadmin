import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ReactNode;
}

const collectionStatusConfig: Record<number, StatusConfig> = {
  0: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning/20",
    icon: <Clock className="w-3 h-3" />,
  },
  1: {
    label: "Processed",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  2: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <XCircle className="w-3 h-3" />,
  },
  3: {
    label: "Completed",
    className: "bg-success/10 text-success border-success/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

const payoutStatusConfig: Record<number, StatusConfig> = {
  ...collectionStatusConfig,
  4: {
    label: "Reversed",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    icon: <RefreshCw className="w-3 h-3" />,
  },
};

const fallback: StatusConfig = {
  label: "Unknown",
  className: "bg-muted text-muted-foreground",
  icon: null,
};

interface TransactionStatusBadgeProps {
  status: number;
  type?: "collection" | "payout";
  className?: string;
}

export function TransactionStatusBadge({
  status,
  type = "collection",
  className,
}: TransactionStatusBadgeProps) {
  const config = type === "payout" ? payoutStatusConfig : collectionStatusConfig;
  const { label, className: badgeClass, icon } = config[status] || fallback;

  return (
    <Badge
      variant="outline"
      className={cn(badgeClass, "font-medium inline-flex items-center gap-1", className)}
    >
      {icon}
      {label}
    </Badge>
  );
}
