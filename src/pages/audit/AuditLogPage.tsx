import { useState } from "react";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { auditApi } from "@/services/audit";
import { AuditLog } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";

export default function AuditLogPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePaginatedQuery<AuditLog>(
    ["audit-logs", page],
    auditApi.list({ page })
  );

  const columns = [
    { header: "ID", accessor: "id" as keyof AuditLog, className: "w-16" },
    { header: "Admin", accessor: "admin_email" as keyof AuditLog },
    {
      header: "Action",
      accessor: (row: AuditLog) => (
        <Badge variant="outline" className="font-mono text-xs">{row.action}</Badge>
      ),
    },
    { header: "Target Type", accessor: "target_type" as keyof AuditLog },
    { header: "Target ID", accessor: "target_id" as keyof AuditLog },
    {
      header: "Details",
      accessor: (row: AuditLog) => (
        <span className="text-xs text-muted-foreground max-w-xs truncate block">
          {JSON.stringify(row.details).slice(0, 60)}...
        </span>
      ),
    },
    { header: "IP Address", accessor: "ip_address" as keyof AuditLog },
    {
      header: "Date",
      accessor: (row: AuditLog) =>
        row.created_at ? new Date(row.created_at).toLocaleString() : "-",
    },
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" description="Track all admin actions" />

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
