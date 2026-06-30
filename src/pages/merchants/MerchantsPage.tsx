import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { merchantsApi } from "@/services/merchants";
import { Merchant } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export default function MerchantsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const params: Record<string, any> = { page };
  if (search) params.search = search;
  if (statusFilter) params.is_active = statusFilter === "active";

  const { data, isLoading } = usePaginatedQuery<Merchant>(
    ["merchants", page, search, statusFilter],
    merchantsApi.list(params)
  );

  const columns = [
    { header: "ID", accessor: "id" as keyof Merchant, className: "w-16" },
    { header: "Name", accessor: "name" as keyof Merchant },
    { header: "Email", accessor: "email" as keyof Merchant },
    {
      header: "Status",
      accessor: (row: Merchant) => (
        <StatusBadge status={row.is_active ? "Active" : "Inactive"} />
      ),
    },
    {
      header: "Profile",
      accessor: (row: Merchant) => (
        <StatusBadge status={row.profile_status || "pending"} />
      ),
    },
    {
      header: "Created",
      accessor: (row: Merchant) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "-",
    },
  ];

  return (
    <div>
      <PageHeader title="Merchants" description="Manage all registered merchants" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search merchants..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        page={page}
        totalCount={data?.count || 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/merchants/${row.id}`)}
      />
    </div>
  );
}
