import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { applicationsApi } from "@/services/applications";
import { Merchant } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const params: Record<string, any> = { page };
  if (statusFilter) params.profile_status = statusFilter;

  const { data, isLoading } = usePaginatedQuery<Merchant>(
    ["applications", page, statusFilter],
    applicationsApi.list(params)
  );

  const columns = [
    { header: "ID", accessor: "id" as keyof Merchant, className: "w-16" },
    { header: "Name", accessor: "name" as keyof Merchant },
    { header: "Email", accessor: "email" as keyof Merchant },
    {
      header: "Status",
      accessor: (row: Merchant) => (
        <StatusBadge status={row.profile_status || "pending"} />
      ),
    },
    {
      header: "Submitted",
      accessor: (row: Merchant) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "-",
    },
  ];

  return (
    <div>
      <PageHeader title="Applications" description="Review merchant applications" />

      <div className="flex gap-3 mb-4">
        <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
        onRowClick={(row) => navigate(`/applications/${row.id}`)}
      />
    </div>
  );
}
