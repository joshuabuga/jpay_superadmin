import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { settlementsApi } from "@/services/settlements";
import { Settlement } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Landmark, Percent, Receipt, Coins } from "lucide-react";

const statusLabels: Record<number, string> = {
  0: "Pending Approval",
  1: "Approved",
  2: "Processing",
  3: "Completed",
  4: "Failed",
  5: "Rejected",
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

export default function SettlementsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const params: Record<string, any> = { page };
  if (search) params.search = search;
  if (statusFilter !== "") params.status = parseInt(statusFilter);

  const { data, isLoading } = usePaginatedQuery<Settlement>(
    ["settlements", page, search, statusFilter],
    settlementsApi.list(params)
  );

  const columns = [
    { header: "ID", accessor: "id" as keyof Settlement, className: "w-16" },
    {
      header: "Ref No",
      accessor: (row: Settlement) => <span className="font-mono text-xs">{row.ref_no}</span>,
    },
    { header: "Merchant", accessor: "merchant_name" as keyof Settlement },
    { header: "Gross", accessor: (row: Settlement) => `KES ${row.gross_amount}` },
    { header: "Net", accessor: (row: Settlement) => `KES ${row.net_amount}` },
    {
      header: "Status",
      accessor: (row: Settlement) => (
        <StatusBadge status={statusLabels[row.status] || String(row.status)} />
      ),
    },
    { header: "Channel", accessor: "channel_name" as keyof Settlement },
    {
      header: "Date",
      accessor: (row: Settlement) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "-",
    },
  ];

  const items = data?.items || [];
  const totalGross = items.reduce((acc, item) => acc + parseFloat(item.gross_amount || "0"), 0);
  const totalNet = items.reduce((acc, item) => acc + parseFloat(item.net_amount || "0"), 0);
  const totalCommission = items.reduce((acc, item) => acc + parseFloat(item.commission_amount || "0"), 0);
  const totalFees = items.reduce((acc, item) => acc + parseFloat(item.transaction_fee || "0"), 0);
  const totalRevenue = totalCommission + totalFees;

  return (
    <div>
      <PageHeader title="Settlements" description="All settlements across merchants" />

      {/* Cumulative Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gross (Page)</CardTitle>
            <Landmark className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalGross)}</div>
            <p className="text-xs text-muted-foreground mt-1">Sum of loaded gross settlements</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Net Payout (Page)</CardTitle>
            <Coins className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalNet)}</div>
            <p className="text-xs text-muted-foreground mt-1">Sum of loaded net amounts</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (Page)</CardTitle>
            <Percent className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Commission ({formatAmount(totalCommission)}) + Fees</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Matched Record Count</CardTitle>
            <Receipt className="w-4 h-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data?.count || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">{items.length} records on current page</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ref, pay to..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusLabels).map(([code, label]) => (
              <SelectItem key={code} value={code}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        page={page}
        totalCount={data?.count || 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/settlements/${row.id}`)}
      />
    </div>
  );
}
