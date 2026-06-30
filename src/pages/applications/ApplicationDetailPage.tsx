import { useParams, useNavigate } from "react-router-dom";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useAuth } from "@/contexts/AuthContext";
import { applicationsApi } from "@/services/applications";
import { resolveMediaUrl } from "@/config/api";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Check, X, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const { data: app, isLoading, refetch } = useApiQuery<any>(
    ["application", id],
    applicationsApi.detail(Number(id)),
    { enabled: !!id }
  );

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await authFetch(applicationsApi.approve(Number(id)), { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to approve");
      }
      toast.success("Application approved");
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) { toast.error("Please provide a reason"); return; }
    setActionLoading(true);
    try {
      const response = await authFetch(applicationsApi.reject(Number(id)), {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to reject");
      }
      toast.success("Application rejected");
      setRejectDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!infoMessage.trim()) { toast.error("Please provide a message"); return; }
    setActionLoading(true);
    try {
      const response = await authFetch(applicationsApi.requestInfo(Number(id)), {
        method: "POST",
        body: JSON.stringify({ message: infoMessage }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to request info");
      }
      toast.success("Information requested");
      setInfoDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!app) {
    return <div className="text-center py-12 text-muted-foreground">Application not found</div>;
  }

  const isPending = app.profile_status === "pending" || app.profile_status === "review";

  return (
    <div>
      <PageHeader title={app.name || "Application"} description={app.email}>
        <Button variant="outline" size="sm" onClick={() => navigate("/applications")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        {isPending && (
          <>
            <Button size="sm" onClick={handleApprove} disabled={actionLoading}>
              <Check className="w-4 h-4 mr-2" /> Approve
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setRejectDialogOpen(true)} disabled={actionLoading}>
              <X className="w-4 h-4 mr-2" /> Reject
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInfoDialogOpen(true)} disabled={actionLoading}>
              <MessageSquare className="w-4 h-4 mr-2" /> Request Info
            </Button>
          </>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Application Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={app.profile_status || "pending"} />
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business Name</span>
              <span>{app.name || "-"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{app.email || "-"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted</span>
              <span>{app.created_at ? new Date(app.created_at).toLocaleDateString() : "-"}</span>
            </div>
          </CardContent>
        </Card>

        {app.profile && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Business Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business Type</span>
                <span>{app.profile.business_type || "-"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Industry</span>
                <span>{app.profile.industry_type || "-"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration No.</span>
                <span>{app.profile.business_reg_no || "-"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nature of Business</span>
                <span>{app.profile.nature_of_business || "-"}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Documents - from profile */}
        {app.profile && (app.profile.certificate_of_incooperation || app.profile.tax_pin_certificate || app.profile.director_resolutions) && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-lg">Company Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {app.profile.certificate_of_incooperation && (
                  <a href={resolveMediaUrl(app.profile.certificate_of_incooperation)!} target="_blank" rel="noreferrer" className="p-3 border rounded-lg hover:bg-muted transition-colors">
                    <p className="text-sm font-medium">Certificate of Incorporation</p>
                    <p className="text-xs text-primary mt-1">View Document</p>
                  </a>
                )}
                {app.profile.tax_pin_certificate && (
                  <a href={resolveMediaUrl(app.profile.tax_pin_certificate)!} target="_blank" rel="noreferrer" className="p-3 border rounded-lg hover:bg-muted transition-colors">
                    <p className="text-sm font-medium">Tax PIN Certificate</p>
                    <p className="text-xs text-primary mt-1">View Document</p>
                  </a>
                )}
                {app.profile.director_resolutions && (
                  <a href={resolveMediaUrl(app.profile.director_resolutions)!} target="_blank" rel="noreferrer" className="p-3 border rounded-lg hover:bg-muted transition-colors">
                    <p className="text-sm font-medium">Director Resolutions</p>
                    <p className="text-xs text-primary mt-1">View Document</p>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Directors with ID documents */}
        {app.directors && app.directors.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-lg">Directors</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {app.directors.map((director: any) => (
                  <div key={director.id} className="p-4 border rounded-lg space-y-2">
                    <p className="font-medium">{director.first_name} {director.last_name}</p>
                    <p className="text-sm text-muted-foreground">National ID: {director.nationa_id_number}</p>
                    {(director.id_front || director.id_back) && (
                      <div className="flex gap-3 pt-1">
                        {director.id_front && (
                          <a href={resolveMediaUrl(director.id_front)!} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                            View ID Front
                          </a>
                        )}
                        {director.id_back && (
                          <a href={resolveMediaUrl(director.id_back)!} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                            View ID Back
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Application</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Reason for rejection</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason..." rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Information</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Message to merchant</Label>
            <Textarea value={infoMessage} onChange={(e) => setInfoMessage(e.target.value)} placeholder="What information do you need?" rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestInfo} disabled={actionLoading}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
