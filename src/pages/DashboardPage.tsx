import { useApiQuery } from "@/hooks/useApiQuery";
import { analyticsApi } from "@/services/analytics";
import { OverviewAnalytics } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  CheckCircle,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  Users,
  Coins,
} from "lucide-react";

function formatAmount(amount: string | number) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatNumber(num: number) {
  return new Intl.NumberFormat("en-KE").format(num);
}

export default function DashboardPage() {
  const { data, isLoading } = useApiQuery<OverviewAnalytics>(
    ["analytics", "overview"],
    analyticsApi.overview()
  );

  const cards = [
    {
      title: "Total Merchants",
      value: data ? formatNumber(data.total_merchants) : "-",
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Active Merchants",
      value: data ? formatNumber(data.active_merchants) : "-",
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Pending Applications",
      value: data ? formatNumber(data.pending_applications) : "-",
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "Collections Volume",
      value: data ? formatAmount(data.total_collections_volume.amount) : "-",
      subtitle: data ? `${formatNumber(data.total_collections_volume.count)} transactions` : "",
      icon: ArrowDownToLine,
      color: "text-chart-2",
    },
    {
      title: "Payouts Volume",
      value: data ? formatAmount(data.total_payouts_volume.amount) : "-",
      subtitle: data ? `${formatNumber(data.total_payouts_volume.count)} transactions` : "",
      icon: ArrowUpFromLine,
      color: "text-chart-3",
    },
    {
      title: "Pending Settlements",
      value: data ? formatAmount(data.pending_settlements.amount) : "-",
      subtitle: data ? `${formatNumber(data.pending_settlements.count)} pending` : "",
      icon: Landmark,
      color: "text-chart-4",
    },
    {
      title: "Total Customers",
      value: data ? formatNumber(data.total_customers) : "-",
      icon: Users,
      color: "text-muted-foreground",
    },
    {
      title: "Platform Revenue",
      value: data ? formatAmount(data.platform_revenue) : "-",
      icon: Coins,
      color: "text-primary",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Platform overview and key metrics"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
