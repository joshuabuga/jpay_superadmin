import { useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useAuth } from "@/contexts/AuthContext";
import { analyticsApi } from "@/services/analytics";
import { transactionsApi } from "@/services/transactions";
import { OverviewAnalytics } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  Users,
  Coins,
  Wallet,
  ArrowRightLeft,
  RefreshCw,
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
  const { authFetch } = useAuth();
  const [moveFundsOpen, setMoveFundsOpen] = useState(false);
  const [moveFundsAmount, setMoveFundsAmount] = useState("");
  const [isMoving, setIsMoving] = useState(false);

  const { data, isLoading } = useApiQuery<OverviewAnalytics>(
    ["analytics", "overview"],
    analyticsApi.overview()
  );

  const { data: sasaPay, isLoading: isSasaPayLoading, refetch: refetchSasaPay } = useApiQuery<{
    statusCode: string;
    message: string;
    data: {
      CurrencyCode: string;
      OrgAccountBalance: number;
      Accounts: Array<{ account_label: string; account_balance: number }>;
    };
  }>(["sasapay", "balance"], transactionsApi.sasapayBalance());

  const handleMoveFunds = async () => {
    if (!moveFundsAmount || parseFloat(moveFundsAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsMoving(true);
    try {
      const response = await authFetch(transactionsApi.sasapayMoveFunds(), {
        method: "POST",
        body: JSON.stringify({ amount: parseFloat(moveFundsAmount) }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to process internal fund movement");
      }
      toast.success("Internal fund movement processed successfully!");
      setMoveFundsOpen(false);
      setMoveFundsAmount("");
      refetchSasaPay();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsMoving(false);
    }
  };

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

      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                SasaPay Platform Gateway status
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Live gateway balances and internal channel liquidity transfer</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchSasaPay()}
                disabled={isSasaPayLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSasaPayLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setMoveFundsOpen(true)}
                disabled={isSasaPayLoading}
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Move Funds
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isSasaPayLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ) : sasaPay?.data ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Aggregate Platform Balance</p>
                  <p className="text-3xl font-extrabold mt-1">
                    {formatAmount(sasaPay.data.OrgAccountBalance)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  {sasaPay.data.Accounts.map((account) => (
                    <div
                      key={account.account_label}
                      className="p-4 bg-muted/40 rounded-lg flex items-center justify-between border"
                    >
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">{account.account_label}</p>
                        <p className="text-xl font-bold mt-1">
                          {formatAmount(account.account_balance)}
                        </p>
                      </div>
                      <div className="p-2 bg-background border rounded-full">
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-warning font-semibold">Unable to fetch SasaPay balance. Please verify service connectivity.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fund Movement Dialog */}
      <Dialog open={moveFundsOpen} onOpenChange={setMoveFundsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Internal Fund Movement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Transfer (KES)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter KES amount"
                value={moveFundsAmount}
                onChange={(e) => setMoveFundsAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This triggers a fund movement between SasaPay utility/settlement and working channels.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveFundsOpen(false)} disabled={isMoving}>
              Cancel
            </Button>
            <Button onClick={handleMoveFunds} disabled={isMoving}>
              {isMoving ? "Processing..." : "Transfer Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
