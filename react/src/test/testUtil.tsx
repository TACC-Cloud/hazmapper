import React, { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import store from '@hazmapper/redux/store';
import { defaultHandlers } from '@hazmapper/test/handlers';
import { MapPositionProvider } from '@hazmapper/context/MapContext';

export const server = setupServer(...defaultHandlers);

export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
      throwOnError: true,
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
        <MapPositionProvider>
          <QueryClientProvider client={testQueryClient}>
            {children}
          </QueryClientProvider>
        </MapPositionProvider>
      </MemoryRouter>
    </Provider>
  );
}

export const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <MemoryRouter>
      <MapPositionProvider>
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      </MapPositionProvider>
    </MemoryRouter>
  </Provider>
);
