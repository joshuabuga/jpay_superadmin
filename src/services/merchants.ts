import { API_BASE_URL } from '@/config/api';

const BASE = `${API_BASE_URL}admin/merchants`;

export const merchantsApi = {
  list: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return `${BASE}/${query ? '?' + query : ''}`;
  },

  detail: (id: number) => `${BASE}/${id}`,
  documents: (id: number) => `${BASE}/${id}/documents`,
  wallets: (id: number) => `${BASE}/${id}/wallets`,
  apps: (id: number) => `${BASE}/${id}/apps`,
  activate: (id: number) => `${BASE}/${id}/activate`,
  deactivate: (id: number) => `${BASE}/${id}/deactivate`,
  updateFees: (id: number) => `${BASE}/${id}/fees`,
  topupWallet: (id: number) => `${BASE}/${id}/wallets/topup`,
};
