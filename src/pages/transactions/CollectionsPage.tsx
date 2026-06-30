import { useState } from "react";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { transactionsApi } from "@/services/transactions";
import { Collection } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TransactionStatusBadge } from "@/components/common/TransactionStatusBadge";
import { MerchantCombobox } from "@/components/common/MerchantCombobox";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function CollectionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [merchantId, setMerchantId] = useState("");

  const params: Record<string, any> = { page };
  if (search) params.search = search;
  if (merchantId) params.merchant_id = merchantId;

  const { data, isLoading } = usePaginatedQuery<Collection>(
    ["collections", page, search, merchantId],
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

  return (
    <div>
      <PageHeader title="Collections" description="All collection transactions across merchants" />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone, checkout ID..."
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
