import { API_BASE_URL } from '@/config/api';

const BASE = `${API_BASE_URL}admin/transactions`;

export const transactionsApi = {
  collections: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return `${BASE}/collections/${query ? '?' + query : ''}`;
  },

  payouts: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return `${BASE}/payouts/${query ? '?' + query : ''}`;
  },

  bulkPayouts: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return `${BASE}/bulk-payouts/${query ? '?' + query : ''}`;
  },

  sasapayBalance: () => {
    return `${BASE}/sasapay/balance`;
  },

  sasapayMoveFunds: () => {
    return `${BASE}/sasapay/move-funds`;
  },
};
