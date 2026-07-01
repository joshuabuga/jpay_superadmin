import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApiQuery } from "@/hooks/useApiQuery";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { useAuth } from "@/contexts/AuthContext";
import { customersApi } from "@/services/customers";
import { transactionsApi } from "@/services/transactions";
import { Collection, Payout } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TransactionStatusBadge } from "@/components/common/TransactionStatusBadge";
import { DataTable } from "@/components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, User, Landmark, Calendar, Phone, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

interface CustomerDetail {
  id: number;
  full_name: string | null;
  email: string | null;
  account_number: string;
  is_active: boolean;
  created_from: string | null;
  merchant_id: number;
  merchant_name: string | null;
  merchant_email: string | null;
  created_at: string | null;
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("collections");
  const [collectionPage, setCollectionPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);

  // Fetch Customer General Details
  const { data: customer, isLoading: isCustomerLoading } = useApiQuery<CustomerDetail>(
    ["customer", id],
    customersApi.detail(Number(id)),
    { enabled: !!id }
  );

  // Fetch collections specifically matching this customer's account_number or full_name
  const collectionParams: Record<string, any> = { page: collectionPage };
  if (customer?.account_number) {
    collectionParams.search = customer.account_number;
  } else if (customer?.full_name) {
    collectionParams.search = customer.full_name;
  }

  const { data: collectionsData, isLoading: isCollectionsLoading } = usePaginatedQuery<Collection>(
    ["customer-collections", id, collectionPage, customer?.account_number],
    transactionsApi.collections(collectionParams),
    { enabled: !!customer }
  );

  // Fetch payouts specifically matching this customer's account_number or full_name/payto
  const payoutParams: Record<string, any> = { page: payoutPage };
  if (customer?.account_number) {
    payoutParams.search = customer.account_number;
  } else if (customer?.full_name) {
    payoutParams.search = customer.full_name;
  }

  const { data: payoutsData, isLoading: isPayoutsLoading } = usePaginatedQuery<Payout>(
    ["customer-payouts", id, payoutPage, customer?.account_number],
    transactionsApi.payouts(payoutParams),
    { enabled: !!customer }
  );

  const collectionColumns = [
    { header: "ID", accessor: "id" as keyof Collection, className: "w-16" },
    {
      header: "Ref No",
      accessor: (row: Collection) => <span className="font-mono text-xs">{row.ref_no}</span>,
    },
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

  const payoutColumns = [
    { header: "ID", accessor: "id" as keyof Payout, className: "w-16" },
    {
      header: "Ref No",
      accessor: (row: Payout) => <span className="font-mono text-xs">{row.ref_no}</span>,
    },
    { header: "Amount", accessor: (row: Payout) => `KES ${row.amount}` },
    { header: "Pay To", accessor: "payto" as keyof Payout },
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

  if (isCustomerLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Customer not found</h3>
        <Button onClick={() => navigate("/customers")} variant="outline" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate("/customers")} variant="ghost" size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title={customer.full_name || "Unknown Customer"}
          description={`Customer Account No: ${customer.account_number}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {(customer.full_name || "U")[0].toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{customer.full_name || "Unknown"}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <StatusBadge status={customer.is_active ? "Active" : "Inactive"} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Email
                </span>
                <span className="font-medium text-foreground">{customer.email || "-"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Landmark className="w-4 h-4" /> Account Number
                </span>
                <span className="font-mono font-medium text-foreground">{customer.account_number}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Joined Date
                </span>
                <span className="font-medium text-foreground text-right">
                  {customer.created_at ? new Date(customer.created_at).toLocaleString() : "-"}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                Associated Merchant
              </h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merchant Name</span>
                  <span className="font-medium text-foreground">{customer.merchant_name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merchant Email</span>
                  <span className="font-medium text-foreground">{customer.merchant_email || "-"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History Tabs */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 max-w-[400px]">
                <TabsTrigger value="collections" className="flex items-center gap-2">
                  <ArrowDownToLine className="w-4 h-4" /> Collections
                </TabsTrigger>
                <TabsTrigger value="payouts" className="flex items-center gap-2">
                  <ArrowUpFromLine className="w-4 h-4" /> Payouts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="collections" className="space-y-4">
                <DataTable
                  columns={collectionColumns}
                  data={collectionsData?.items || []}
                  isLoading={isCollectionsLoading}
                  page={collectionPage}
                  totalCount={collectionsData?.count || 0}
                  onPageChange={setCollectionPage}
                  emptyMessage="No collections history found for this customer"
                />
              </TabsContent>

              <TabsContent value="payouts" className="space-y-4">
                <DataTable
                  columns={payoutColumns}
                  data={payoutsData?.items || []}
                  isLoading={isPayoutsLoading}
                  page={payoutPage}
                  totalCount={payoutsData?.count || 0}
                  onPageChange={setPayoutPage}
                  emptyMessage="No payouts history found for this customer"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
