import { QueryClient } from 'react-query';

export const testQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, cacheTime: Infinity } },
});
