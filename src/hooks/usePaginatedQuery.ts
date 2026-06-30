import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PaginatedResponse } from "@/types";

export function usePaginatedQuery<T>(
  queryKey: (string | number | undefined)[],
  url: string,
  options?: { enabled?: boolean }
) {
  const { authFetch } = useAuth();

  return useQuery<PaginatedResponse<T>>({
    queryKey,
    queryFn: async () => {
      const response = await authFetch(url);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Request failed");
      }
      return response.json();
    },
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}
