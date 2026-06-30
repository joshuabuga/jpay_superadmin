import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { settlementsApi } from "@/services/settlements";
import { Settlement } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const statusLabels: Record<number, string> = {
  0: "Pending Approval",
  1: "Approved",
  2: "Processing",
  3: "Completed",
  4: "Failed",
  5: "Rejected",
};

export default function SettlementsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const params: Record<string, any> = { page };
  if (search) params.search = search;

  const { data, isLoading } = usePaginatedQuery<Settlement>(
    ["settlements", page, search],
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

  return (
    <div>
      <PageHeader title="Settlements" description="All settlements across merchants" />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ref, pay to..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        page={page}
        totalCount={data?.count || 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/settlements/${row.id}`)}
      />
    </div>
  );
}
