import { QueryClient } from "@tanstack/react-query";

import { isPolarisApiError } from "@/shared/api/apiError";

/**
 * TanStack Query 전역 설정입니다.
 * 인증 실패는 재시도하지 않고, 일반 조회는 한 번만 재시도해서 사용자 경험과 API 부하를 균형 있게 맞춥니다.
 */
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
