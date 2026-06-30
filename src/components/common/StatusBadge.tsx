import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "destructive" | "default" | "secondary";

const statusMap: Record<string, StatusVariant> = {
  active: "success",
  approved: "success",
  completed: "success",
  successful: "success",
  pending: "warning",
  pending_approval: "warning",
  review: "warning",
  processing: "warning",
  inactive: "secondary",
  rejected: "destructive",
  failed: "destructive",
  cancelled: "destructive",
};

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  default: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-muted text-muted-foreground border-muted",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");
  const variant = statusMap[normalized] || "default";

  return (
    <Badge
      variant="outline"
      className={cn(variantStyles[variant], "font-medium", className)}
    >
      {status}
    </Badge>
  );
}
