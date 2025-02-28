import React, { ReactNode, ReactElement } from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http } from 'msw';
import store from '@hazmapper/redux/store';
import { defaultHandlers } from '@hazmapper/test/handlers';
import { MapPositionProvider } from '@hazmapper/context/MapContext';
import { useFeatures } from '@hazmapper/hooks';

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

export async function waitForAllQueriesToResolve(queryClient: QueryClient) {
  await waitFor(() => expect(queryClient.isFetching()).toBe(0));
}

export async function renderInTestWaitForQueries(
  children: ReactElement,
  path = '/'
) {
  const rendered = renderInTest(children, path);

  // Wait for all queries to finish before proceeding
  await waitForAllQueriesToResolve(testQueryClient);

  return rendered;
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
 * Helper component to add useFeatures hook
 */
export const WithUseFeaturesComponent: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data, isLoading } = useFeatures({
    projectId: 1,
    isPublicView: false,
    assetTypes: ['type1', 'type2'],
  });

  if (isLoading) {
    return <div>loading. Consider using waitForAllQueriesToResolve </div>;
  }

  return <>{children}</>;
};

interface SpyHandlerArgs {
  request: Request;
  params?: any;
  body?: any;
}

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
  const spy = jest.fn<void, [SpyHandlerArgs]>();
  const method = originalHandler.info.method.toLowerCase();
  const path = originalHandler.info.path;
  const resolver = originalHandler.resolver;

  const handler = http[method](path, async (...args) => {
    // Try to extract JSON body if possible
    let processedArgs: SpyHandlerArgs | undefined;
    try {
      if (args[0] && args[0].request) {
        // Only try to parse JSON for POST, PUT, PATCH
        const shouldParseBody = ['post', 'put', 'patch'].includes(method);
        const bodyOrPromise =
          shouldParseBody && args[0].request.json
            ? await args[0].request.json()
            : null;
        processedArgs = {
          ...args[0],
          body: bodyOrPromise,
          params: args[0].params, // Explicitly include params
        };
      }
    } catch (error) {
      console.warn('Failed to parse JSON body', error);

      processedArgs = {
        ...args[0],
        body: null,
        params: args[0].params,
      };
    }

    // Call spy with processed arguments
    if (processedArgs) {
      spy(processedArgs);
    }
    return resolver(...args);
  });

  return { handler, spy };
};
