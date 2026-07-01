import { useState } from "react";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { transactionsApi } from "@/services/transactions";
import { Collection } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TransactionStatusBadge } from "@/components/common/TransactionStatusBadge";
import { MerchantCombobox } from "@/components/common/MerchantCombobox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ArrowDownToLine, CheckCircle, XCircle, Percent } from "lucide-react";

const collectionStatuses: Record<number, string> = {
  0: "Pending",
  1: "Processed",
  2: "Failed",
  3: "Completed",
};

function formatAmount(amount: string | number, currency = "KES") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatNumber(num: number) {
  return new Intl.NumberFormat("en-KE").format(num);
}

export default function CollectionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const params: Record<string, any> = { page };
  if (search) params.search = search;
  if (merchantId) params.merchant_id = merchantId;
  if (statusFilter !== "") params.status = parseInt(statusFilter);

  const { data, isLoading } = usePaginatedQuery<Collection>(
    ["collections", page, search, merchantId, statusFilter],
    transactionsApi.collections(params)
  );

  const columns = [
    { header: "ID", accessor: "id" as keyof Collection, className: "w-16" },
    {
      header: "Ref No",
      accessor: (row: Collection) => (
        <span className="font-mono text-xs">{row.ref_no}</span>
      ),
    },
    { header: "Merchant", accessor: "merchant_name" as keyof Collection },
    {
      header: "Amount",
      accessor: (row: Collection) => `${row.currency || "KES"} ${row.amount}`,
    },
    { header: "Phone", accessor: "phone_number" as keyof Collection },
    {
      header: "Status",
      accessor: (row: Collection) => (
        <TransactionStatusBadge status={row.status} type="collection" />
      ),
    },
    { header: "Gateway", accessor: "gateway" as keyof Collection },
    {
      header: "Date",
      accessor: (row: Collection) =>
        row.created_at ? new Date(row.created_at).toLocaleString() : "-",
    },
  ];

  const items = data?.items || [];
  const totalVolume = items.reduce((acc, item) => acc + parseFloat(item.amount || "0"), 0);
  const successfulVolume = items.reduce((acc, item) => acc + (item.status === 3 || item.status === 1 ? parseFloat(item.amount || "0") : 0), 0);
  const failedVolume = items.reduce((acc, item) => acc + (item.status === 2 ? parseFloat(item.amount || "0") : 0), 0);

  const successfulCount = items.filter(item => item.status === 3 || item.status === 1).length;
  const successRate = items.length > 0 ? (successfulCount / items.length) * 100 : 0;

  return (
    <div>
      <PageHeader title="Collections" description="All collection transactions across merchants" />

      {/* Cumulative Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collections (Page)</CardTitle>
            <ArrowDownToLine className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalVolume)}</div>
            <p className="text-xs text-muted-foreground mt-1">Sum of all loaded collections</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Successful (Page)</CardTitle>
            <CheckCircle className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(successfulVolume)}</div>
            <p className="text-xs text-muted-foreground mt-1">Processed & Completed collection sum</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Volume (Page)</CardTitle>
            <XCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(failedVolume)}</div>
            <p className="text-xs text-muted-foreground mt-1">Unsuccessful loaded collection sum</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate (Page)</CardTitle>
            <Percent className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">{successfulCount} of {items.length} records successful</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone, checkout ID..."
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
              {Object.entries(collectionStatuses).map(([code, label]) => (
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
