import { QueryClient } from 'react-query';

export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
      // Make React Query throw errors
      useErrorBoundary: true,
    },
  },
});
