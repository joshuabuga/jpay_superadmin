import { useState } from "react";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { customersApi } from "@/services/customers";
import { Customer } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MerchantCombobox } from "@/components/common/MerchantCombobox";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [merchantId, setMerchantId] = useState("");

  const params: Record<string, any> = { page };
  if (search) params.search = search;
  if (merchantId) params.merchant_id = merchantId;

  const { data, isLoading } = usePaginatedQuery<Customer>(
    ["customers", page, search, merchantId],
    customersApi.list(params)
  );

  const columns = [
    { header: "ID", accessor: "id" as keyof Customer, className: "w-16" },
    { header: "Name", accessor: "full_name" as keyof Customer },
    { header: "Email", accessor: "email" as keyof Customer },
    {
      header: "Account No.",
      accessor: (row: Customer) => <span className="font-mono text-xs">{row.account_number}</span>,
    },
    { header: "Merchant", accessor: "merchant_name" as keyof Customer },
    {
      header: "Status",
      accessor: (row: Customer) => (
        <StatusBadge status={row.is_active ? "Active" : "Inactive"} />
      ),
    },
    {
      header: "Created",
      accessor: (row: Customer) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "-",
    },
  ];

  return (
    <div>
      <PageHeader title="Customers" description="All customers across merchants" />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, account..."
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
