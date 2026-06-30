import { useParams, useNavigate, Link } from "react-router-dom";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useAuth } from "@/contexts/AuthContext";
import { merchantsApi } from "@/services/merchants";
import { MerchantDetail } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, Check, X, ExternalLink, Pencil, Plus, Wallet } from "lucide-react";
import { useState } from "react";

export default function MerchantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupDetails, setTopupDetails] = useState("");
  const [feesOpen, setFeesOpen] = useState(false);
  const [feesForm, setFeesForm] = useState({
    commission_rate: "",
    transaction_fee: "",
    min_amount: "",
    max_amount: "",
  });

  const { data: merchant, isLoading, refetch } = useApiQuery<MerchantDetail>(
    ["merchant", id],
    merchantsApi.detail(Number(id)),
    { enabled: !!id }
  );

  const handleAction = async (action: "activate" | "deactivate") => {
    setActionLoading(action);
    try {
      const url = action === "activate"
        ? merchantsApi.activate(Number(id))
        : merchantsApi.deactivate(Number(id));
      const response = await authFetch(url, { method: "PATCH" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || `Failed to ${action} merchant`);
      }
      toast.success(`Merchant ${action}d successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTopup = async () => {
    if (!topupAmount || Number(topupAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setActionLoading("topup");
    try {
      const response = await authFetch(merchantsApi.topupWallet(Number(id)), {
        method: "POST",
        body: JSON.stringify({ amount: topupAmount, details: topupDetails }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to top up wallet");
      }
      toast.success("Payout wallet topped up successfully");
      setTopupOpen(false);
      setTopupAmount("");
      setTopupDetails("");
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const openFeesDialog = () => {
    if (merchant?.profile) {
      const rate = merchant.profile.settlement_commission_rate;
      setFeesForm({
        commission_rate: rate ? String(Number(rate) * 100) : "",
        transaction_fee: merchant.profile.settlement_transaction_fee || "",
        min_amount: merchant.profile.settlement_min_amount || "",
        max_amount: merchant.profile.settlement_max_amount || "",
      });
    }
    setFeesOpen(true);
  };

  const handleUpdateFees = async () => {
    setActionLoading("fees");
    try {
      const payload: Record<string, string> = {};
      if (feesForm.commission_rate !== "") {
        payload.settlement_commission_rate = String(Number(feesForm.commission_rate) / 100);
      }
      if (feesForm.transaction_fee !== "") {
        payload.settlement_transaction_fee = feesForm.transaction_fee;
      }
      if (feesForm.min_amount !== "") {
        payload.settlement_min_amount = feesForm.min_amount;
      }
      if (feesForm.max_amount !== "") {
        payload.settlement_max_amount = feesForm.max_amount;
      }

      const response = await authFetch(merchantsApi.updateFees(Number(id)), {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to update fees");
      }
      toast.success("Fee settings updated successfully");
      setFeesOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!merchant) {
    return <div className="text-center py-12 text-muted-foreground">Merchant not found</div>;
  }

  const profile = merchant.profile;

  return (
    <div>
      <PageHeader title={merchant.name} description={merchant.email}>
        <Button variant="outline" size="sm" onClick={() => navigate("/merchants")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        {merchant.is_active ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleAction("deactivate")}
            disabled={!!actionLoading}
          >
            <X className="w-4 h-4 mr-2" /> Deactivate
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => handleAction("activate")}
            disabled={!!actionLoading}
          >
            <Check className="w-4 h-4 mr-2" /> Activate
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={merchant.is_active ? "Active" : "Inactive"} />
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Profile Status</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={merchant.profile_status || "pending"} />
                {(merchant.profile_status === "pending" || merchant.profile_status === "review") && (
                  <Link
                    to={`/applications/${merchant.id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Review <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Merchant Key</span>
              <span className="font-mono text-sm">{merchant.merchant_key}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{merchant.created_at ? new Date(merchant.created_at).toLocaleDateString() : "-"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Business Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business Type</span>
                  <span>{profile.business_type || "-"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry</span>
                  <span>{profile.industry_type || "-"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration No.</span>
                  <span>{profile.business_reg_no || "-"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{profile.business_phone || "-"}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">No profile information available</p>
            )}
          </CardContent>
        </Card>

        {/* Wallets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5" /> Wallets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Collections Wallet</span>
              <span className="font-semibold">KES {merchant.wallets?.collection_balance || "0.00"}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Payouts Wallet</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">KES {merchant.wallets?.payout_balance || "0.00"}</span>
                <Button variant="outline" size="sm" onClick={() => setTopupOpen(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Top Up
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settlement Fees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Settlement Fees</CardTitle>
            {profile && (
              <Button variant="outline" size="sm" onClick={openFeesDialog}>
                <Pencil className="w-3 h-3 mr-1" /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {profile ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission Rate</span>
                  <span>{profile.settlement_commission_rate ? `${(Number(profile.settlement_commission_rate) * 100).toFixed(2)}%` : "-"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction Fee</span>
                  <span>{profile.settlement_transaction_fee ? `KES ${profile.settlement_transaction_fee}` : "-"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Settlement</span>
                  <span>{profile.settlement_min_amount ? `KES ${profile.settlement_min_amount}` : "-"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Settlement</span>
                  <span>{profile.settlement_max_amount ? `KES ${profile.settlement_max_amount}` : "-"}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">No profile — fees cannot be configured</p>
            )}
          </CardContent>
        </Card>

        {/* Directors */}
        {merchant.directors && merchant.directors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Directors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {merchant.directors.map((director) => (
                  <div key={director.id} className="flex justify-between items-center">
                    <span>{director.first_name} {director.last_name}</span>
                    <span className="text-muted-foreground text-sm">{director.nationa_id_number}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top-up Dialog */}
      <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top Up Payout Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (KES)</Label>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Details / Reason (optional)</Label>
              <Textarea
                value={topupDetails}
                onChange={(e) => setTopupDetails(e.target.value)}
                placeholder="e.g. Wallet credit for merchant"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopupOpen(false)}>Cancel</Button>
            <Button onClick={handleTopup} disabled={actionLoading === "topup"}>Top Up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fees Dialog */}
      <Dialog open={feesOpen} onOpenChange={setFeesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Settlement Fees</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Commission Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={feesForm.commission_rate}
                onChange={(e) => setFeesForm({ ...feesForm, commission_rate: e.target.value })}
                placeholder="e.g. 1.5"
              />
            </div>
            <div className="space-y-2">
              <Label>Transaction Fee (KES)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={feesForm.transaction_fee}
                onChange={(e) => setFeesForm({ ...feesForm, transaction_fee: e.target.value })}
                placeholder="e.g. 20"
              />
            </div>
            <div className="space-y-2">
              <Label>Min Settlement Amount (KES)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={feesForm.min_amount}
                onChange={(e) => setFeesForm({ ...feesForm, min_amount: e.target.value })}
                placeholder="e.g. 100"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Settlement Amount (KES)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={feesForm.max_amount}
                onChange={(e) => setFeesForm({ ...feesForm, max_amount: e.target.value })}
                placeholder="e.g. 1000000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeesOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateFees} disabled={actionLoading === "fees"}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
