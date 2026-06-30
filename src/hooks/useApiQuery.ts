import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export function useApiQuery<T>(
  queryKey: (string | number | undefined)[],
  url: string,
  options?: { enabled?: boolean }
) {
  const { authFetch } = useAuth();

  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      const response = await authFetch(url);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Request failed");
      }
      return response.json();
    },
    enabled: options?.enabled,
  });
}
