import { API_BASE_URL } from '@/config/api';

const BASE = `${API_BASE_URL}admin/applications`;

export const applicationsApi = {
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
  approve: (id: number) => `${BASE}/${id}/approve`,
  reject: (id: number) => `${BASE}/${id}/reject`,
  requestInfo: (id: number) => `${BASE}/${id}/request-info`,
};
