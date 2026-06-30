import { useApiQuery } from "@/hooks/useApiQuery";
import { merchantsApi } from "@/services/merchants";
import { PaginatedResponse } from "@/types";

interface MerchantOption {
  id: number;
  name: string;
}

export function useMerchantOptions() {
  const { data, isLoading } = useApiQuery<PaginatedResponse<MerchantOption>>(
    ["merchants", "options"],
    merchantsApi.list({ page_size: 500 })
  );

  const options = (data?.items || []).map((m) => ({
    value: String(m.id),
    label: m.name || `Merchant #${m.id}`,
  }));

  return { options, isLoading };
}
