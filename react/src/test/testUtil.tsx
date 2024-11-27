import React, { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import store from '@hazmapper/redux/store';
import { defaultHandlers } from '@hazmapper/test/handlers';

export const server = setupServer(...defaultHandlers);

export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
      useErrorBoundary: true,
    },
    mutations: {
      retry: false,
    },
  },
});

export function renderInTest(children: ReactElement, path = '/') {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    </Provider>
  );
}
