import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import nock from 'nock';
import { QueryClient } from 'react-query';
import { shouldIgnoreWarning } from './jest.setup.utils';

/***** A) Mock the configuration used for unit testing *****/
jest.mock('@hazmapper/hooks/environment/getLocalAppConfiguration', () => ({
  getLocalAppConfiguration: jest.fn(() => testDevConfiguration),
}));

/***** B) Ignore some known warnings/errors *****/
const originalWarn = console.warn;

console.warn = (...args) => {
  if (typeof args[0] === 'string' && shouldIgnoreWarning(args[0])) {
    return;
  }
  originalWarn.apply(console, args);
};

/***** C) Ensure that we are mocking things in tests *****/

// Configure nock for all requests
nock.disableNetConnect();
nock.enableNetConnect('127.0.0.1'); // Allow localhost if needed

export const queryClient = new QueryClient({
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

// Track if we've seen an unmocked request
let unmockedRequest = false;

beforeEach(() => {
  queryClient.clear();
  nock.cleanAll();
  unmockedRequest = false;

  nock.emitter.on('no match', (req) => {
    const { method, path, hostname, proto } = req;
    console.log(`Intercepted unmocked ${proto} request:`, {
      method,
      hostname,
      path,
      fullUrl: `${proto}://${hostname}${path}`,
    });

    unmockedRequest = true;
    // Throw error that will be caught by React Query
    throw new Error(
      `No mock found for request: ${method} ${proto}://${hostname}${path}\n` +
        'Please add a mock to your test:\n\n' +
        'beforeEach(() => {\n' +
        `  nock('${proto}://${hostname}')\n` +
        `    .${method.toLowerCase()}('${path}')\n` +
        '    .reply(200, YOUR_MOCK_DATA);\n' +
        '});'
    );
  });
});

afterEach(() => {
  if (unmockedRequest) {
    throw new Error(
      'Test contained unmocked requests - see console for details'
    );
  }

  if (!nock.isDone()) {
    const pendingMocks = nock.pendingMocks();
    console.log('Pending mocks:', pendingMocks);
    throw new Error(
      `Not all nock interceptors were used!\n${pendingMocks.join('\n')}`
    );
  }
  nock.emitter.removeAllListeners('no match');
});

afterAll(() => {
  nock.restore();
  nock.enableNetConnect();
});
