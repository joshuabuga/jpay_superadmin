import { useState } from "react";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { transactionsApi } from "@/services/transactions";
import { Payout } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TransactionStatusBadge } from "@/components/common/TransactionStatusBadge";
import { MerchantCombobox } from "@/components/common/MerchantCombobox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ArrowUpFromLine, CheckCircle, XCircle, Percent, Receipt } from "lucide-react";

const payoutStatuses: Record<number, string> = {
  0: "Pending",
  1: "Processed",
  2: "Failed",
  3: "Completed",
  4: "Reversed",
};

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

export default function PayoutsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const params: Record<string, any> = { page };
  if (search) params.search = search;
  if (merchantId) params.merchant_id = merchantId;
  if (statusFilter !== "") params.status = parseInt(statusFilter);

  const { data, isLoading } = usePaginatedQuery<Payout>(
    ["payouts", page, search, merchantId, statusFilter],
    transactionsApi.payouts(params)
  );

  const columns = [
    { header: "ID", accessor: "id" as keyof Payout, className: "w-16" },
    {
      header: "Ref No",
      accessor: (row: Payout) => (
        <span className="font-mono text-xs">{row.ref_no}</span>
      ),
    },
    { header: "Merchant", accessor: "merchant_name" as keyof Payout },
    { header: "Amount", accessor: (row: Payout) => `KES ${row.amount}` },
    { header: "Pay To", accessor: "payto" as keyof Payout },
    { header: "Customer", accessor: "customer_name" as keyof Payout },
    {
      header: "Status",
      accessor: (row: Payout) => (
        <TransactionStatusBadge status={row.status} type="payout" />
      ),
    },
    { header: "Gateway", accessor: "gateway" as keyof Payout },
    {
      header: "Date",
      accessor: (row: Payout) =>
        row.created_at ? new Date(row.created_at).toLocaleString() : "-",
    },
  ];

  const items = data?.items || [];
  const totalVolume = items.reduce((acc, item) => acc + parseFloat(item.amount || "0"), 0);
  const completedVolume = items.reduce((acc, item) => acc + (item.status === 3 ? parseFloat(item.amount || "0") : 0), 0);
  const failedVolume = items.reduce((acc, item) => acc + (item.status === 2 ? parseFloat(item.amount || "0") : 0), 0);

  const completedCount = items.filter(item => item.status === 3).length;
  const successRate = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div>
      <PageHeader title="Payouts" description="All payout transactions across merchants" />

      {/* Cumulative Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payouts (Page)</CardTitle>
            <ArrowUpFromLine className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalVolume)}</div>
            <p className="text-xs text-muted-foreground mt-1">Sum of all loaded payouts</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed (Page)</CardTitle>
            <CheckCircle className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(completedVolume)}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully completed payout sum</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Volume (Page)</CardTitle>
            <XCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(failedVolume)}</div>
            <p className="text-xs text-muted-foreground mt-1">Unsuccessful loaded payout sum</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate (Page)</CardTitle>
            <Percent className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">{completedCount} of {items.length} records completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ref, pay to, customer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <MerchantCombobox value={merchantId} onChange={(v) => { setMerchantId(v); setPage(1); }} />
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(payoutStatuses).map(([code, label]) => (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        page={page}
        totalCount={data?.count || 0}
        onPageChange={setPage}
      />
    </div>
  );
}
