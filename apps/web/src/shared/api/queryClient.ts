import { QueryClient } from "@tanstack/react-query";

import { isPolarisApiError } from "@/shared/api/apiError";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (isPolarisApiError(error) && error.apiError.status === 401) {
          return false;
        }

        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
