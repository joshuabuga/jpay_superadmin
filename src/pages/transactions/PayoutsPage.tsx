import { useState } from "react";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { transactionsApi } from "@/services/transactions";
import { Payout } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TransactionStatusBadge } from "@/components/common/TransactionStatusBadge";
import { MerchantCombobox } from "@/components/common/MerchantCombobox";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function PayoutsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [merchantId, setMerchantId] = useState("");

  const params: Record<string, any> = { page };
  if (search) params.search = search;
  if (merchantId) params.merchant_id = merchantId;

  const { data, isLoading } = usePaginatedQuery<Payout>(
    ["payouts", page, search, merchantId],
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

  return (
    <div>
      <PageHeader title="Payouts" description="All payout transactions across merchants" />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ref, pay to, customer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <MerchantCombobox value={merchantId} onChange={(v) => { setMerchantId(v); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        page={page}
        totalCount={data?.count || 0}
        onPageChange={setPage}
      />
    </div>
  );
}
