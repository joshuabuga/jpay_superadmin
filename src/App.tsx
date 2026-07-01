import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

import LoginPage from "@/pages/LoginPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import MerchantsPage from "@/pages/merchants/MerchantsPage";
import MerchantDetailPage from "@/pages/merchants/MerchantDetailPage";
import ApplicationsPage from "@/pages/applications/ApplicationsPage";
import ApplicationDetailPage from "@/pages/applications/ApplicationDetailPage";
import CollectionsPage from "@/pages/transactions/CollectionsPage";
import PayoutsPage from "@/pages/transactions/PayoutsPage";
import SettlementsPage from "@/pages/settlements/SettlementsPage";
import SettlementDetailPage from "@/pages/settlements/SettlementDetailPage";
import CustomersPage from "@/pages/customers/CustomersPage";
import CustomerDetailPage from "@/pages/customers/CustomerDetailPage";
import AuditLogPage from "@/pages/audit/AuditLogPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/change-password" element={
              <ProtectedRoute><ChangePasswordPage /></ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute><DashboardLayout /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="merchants" element={<MerchantsPage />} />
              <Route path="merchants/:id" element={<MerchantDetailPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="applications/:id" element={<ApplicationDetailPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="payouts" element={<PayoutsPage />} />
              <Route path="settlements" element={<SettlementsPage />} />
              <Route path="settlements/:id" element={<SettlementDetailPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="audit-logs" element={<AuditLogPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
