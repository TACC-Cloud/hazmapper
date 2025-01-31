import React, { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http } from 'msw';
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

/**
 * Creates a new MSW handler that includes a spy function for testing.
 * Returns both the modified handler and the spy for assertions.
 *
 * @param originalHandler - The existing MSW handler to wrap (e.g., http.get(), http.post())
 * @returns An object containing the new handler and a spy function for assertions
 *
 * @example
 * const { handler, spy } = createSpyHandler(my_get_handler);
 * server.use(handler);
 *
 * // Later in test...
 * expect(spy).toHaveBeenCalled();
 */
export const createSpyHandler = (originalHandler: any) => {
  const spy = jest.fn();
  const method = originalHandler.info.method.toLowerCase();
  const path = originalHandler.info.path;
  const resolver = originalHandler.resolver;

  const handler = http[method](path, async (...args) => {
    spy();
    return resolver(...args);
  });

  return { handler, spy };
};
