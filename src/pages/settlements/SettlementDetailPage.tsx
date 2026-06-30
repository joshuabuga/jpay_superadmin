import { useParams, useNavigate } from "react-router-dom";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useAuth } from "@/contexts/AuthContext";
import { settlementsApi } from "@/services/settlements";
import { SettlementDetail } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Check, X } from "lucide-react";
import { useState } from "react";

const statusLabels: Record<number, string> = {
  0: "Pending Approval",
  1: "Approved",
  2: "Processing",
  3: "Completed",
  4: "Failed",
  5: "Rejected",
};

export default function SettlementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { data: settlement, isLoading, refetch } = useApiQuery<SettlementDetail>(
    ["settlement", id],
    settlementsApi.detail(Number(id)),
    { enabled: !!id }
  );

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await authFetch(settlementsApi.approve(Number(id)), { method: "PATCH" });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail || "Failed");
      toast.success("Settlement approved");
      refetch();
    } catch (error: any) { toast.error(error.message); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!reason.trim()) { toast.error("Please provide a reason"); return; }
    setActionLoading(true);
    try {
      const response = await authFetch(settlementsApi.reject(Number(id)), {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail || "Failed");
      toast.success("Settlement rejected");
      setRejectOpen(false);
      refetch();
    } catch (error: any) { toast.error(error.message); }
    finally { setActionLoading(false); }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!settlement) return <div className="text-center py-12 text-muted-foreground">Settlement not found</div>;

  const isPending = settlement.status === 0;

  return (
    <div>
      <PageHeader title={`Settlement ${settlement.ref_no}`} description={settlement.merchant_name || ""}>
        <Button variant="outline" size="sm" onClick={() => navigate("/settlements")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        {isPending && (
          <>
            <Button size="sm" onClick={handleApprove} disabled={actionLoading}>
              <Check className="w-4 h-4 mr-2" /> Approve
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setRejectOpen(true)} disabled={actionLoading}>
              <X className="w-4 h-4 mr-2" /> Reject
            </Button>
          </>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Settlement Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={statusLabels[settlement.status] || String(settlement.status)} /></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Gross Amount</span><span className="font-semibold">KES {settlement.gross_amount}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Commission ({settlement.commission_rate}%)</span><span>KES {settlement.commission_amount}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Transaction Fee</span><span>KES {settlement.transaction_fee}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Net Amount</span><span className="font-semibold text-primary">KES {settlement.net_amount}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Transaction Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Gateway</span><span>{settlement.gateway || "-"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Pay To</span><span>{settlement.payto || "-"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{settlement.customer_name || "-"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Channel</span><span>{settlement.channel_name || "-"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{settlement.created_at ? new Date(settlement.created_at).toLocaleString() : "-"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span>{settlement.completed_at ? new Date(settlement.completed_at).toLocaleString() : "-"}</span></div>
          </CardContent>
        </Card>

        {(settlement.initiated_by || settlement.approved_by || settlement.rejection_reason) && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-lg">Approval Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {settlement.initiated_by && <div className="flex justify-between"><span className="text-muted-foreground">Initiated By</span><span>{settlement.initiated_by}</span></div>}
              {settlement.approved_by && <><Separator /><div className="flex justify-between"><span className="text-muted-foreground">Approved By</span><span>{settlement.approved_by}</span></div></>}
              {settlement.approved_at && <><Separator /><div className="flex justify-between"><span className="text-muted-foreground">Approved At</span><span>{new Date(settlement.approved_at).toLocaleString()}</span></div></>}
              {settlement.rejection_reason && <><Separator /><div className="flex justify-between"><span className="text-muted-foreground">Rejection Reason</span><span className="text-destructive">{settlement.rejection_reason}</span></div></>}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Settlement</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Reason for rejection</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason..." rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
