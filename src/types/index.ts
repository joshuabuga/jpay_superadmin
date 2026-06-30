export interface SuperAdmin {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_password_changed: boolean;
  created_at: string;
}

export interface Merchant {
  id: number;
  name: string;
  email: string;
  merchant_key: string;
  is_active: boolean;
  profile_status: 'pending' | 'review' | 'approved' | 'rejected';
  created_at: string;
  profile?: MerchantProfile;
}

export interface MerchantProfile {
  id: number;
  company_name: string | null;
  business_type: string | null;
  industry: string | null;
  nature_of_business: string | null;
  address: string | null;
  business_reg_no: string | null;
  business_email: string | null;
  business_phone: string | null;
  industry_type: string | null;
  monthly_transaction_amount: string;
  certificate_of_incooperation: string | null;
  tax_pin_certificate: string | null;
  director_resolutions: string | null;
  settlement_commission_rate: string | null;
  settlement_transaction_fee: string | null;
  settlement_min_amount: string | null;
  settlement_max_amount: string | null;
  auto_settlement_enabled: boolean;
}

export interface Director {
  id: number;
  first_name: string;
  last_name: string;
  nationa_id_number: string;
  id_front: string | null;
  id_back: string | null;
  created_at: string;
}

export interface WalletBalances {
  collection_balance: string | null;
  payout_balance: string | null;
}

export interface MerchantDetail extends Merchant {
  phone_number: string | null;
  merchant_code: number;
  directors: Director[];
  wallets: WalletBalances | null;
  apps: MerchantApp[];
}

export interface MerchantApp {
  id: number;
  name: string;
  app_key: string;
  is_active: boolean;
  created_at: string;
}

export interface Collection {
  id: number;
  checkout_request_id: string;
  merchant_name: string | null;
  merchant_id: number | null;
  account_number: string;
  amount: string;
  currency: string;
  status: number;
  status_display: string;
  gateway: string | null;
  phone_number: string | null;
  customer_name: string | null;
  created_at: string | null;
}

export interface Payout {
  id: number;
  ref_no: string;
  merchant_name: string | null;
  merchant_id: number | null;
  amount: string;
  status: number;
  status_display: string;
  gateway: string | null;
  payto: string | null;
  customer_name: string | null;
  created_at: string | null;
}

export interface BulkPayout {
  id: number;
  ref_no: string;
  merchant_name: string | null;
  merchant_id: number | null;
  total_amount: string;
  status: number;
  status_display: string;
  total_transactions: number;
  created_at: string | null;
}

export interface Settlement {
  id: number;
  ref_no: string;
  gross_amount: string;
  commission_amount: string;
  transaction_fee: string;
  net_amount: string;
  status: number;
  gateway: string | null;
  source: string | null;
  payto: string | null;
  customer_name: string | null;
  merchant_id: number | null;
  merchant_name: string | null;
  channel_name: string | null;
  created_at: string | null;
  completed_at: string | null;
}

export interface SettlementDetail extends Settlement {
  commission_rate: string;
  gateway_transaction_fee: string;
  status_display: string;
  result_code: string | null;
  result_description: string | null;
  narration: string | null;
  notes: string | null;
  rejection_reason: string | null;
  trans_id: string | null;
  external_transaction_id: string | null;
  initiated_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  ip_address: string | null;
}

export interface Customer {
  id: number;
  full_name: string | null;
  email: string | null;
  account_number: string;
  is_active: boolean;
  created_from: string | null;
  merchant_id: number;
  merchant_name: string | null;
  created_at: string | null;
}

export interface AuditLog {
  id: number;
  admin_email: string | null;
  action: string;
  target_type: string;
  target_id: number;
  details: Record<string, any>;
  ip_address: string | null;
  created_at: string | null;
}

interface VolumeMetric {
  count: number;
  amount: string;
}

export interface OverviewAnalytics {
  total_merchants: number;
  active_merchants: number;
  pending_applications: number;
  total_collections_today: VolumeMetric;
  total_payouts_today: VolumeMetric;
  total_settlements_today: VolumeMetric;
  total_collections_volume: VolumeMetric;
  total_payouts_volume: VolumeMetric;
  pending_settlements: VolumeMetric;
  platform_revenue: string;
  total_customers: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
}
