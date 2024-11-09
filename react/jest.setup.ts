import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import { server } from '@hazmapper/testUtil';

/***** A) Setup the configuration used for unit testing *****/
jest.mock('@hazmapper/hooks/environment/getLocalAppConfiguration', () => ({
  getLocalAppConfiguration: jest.fn(() => testDevConfiguration),
}));

/***** B) Ignore some known warnings/errors *****/
const originalWarn = console.warn;

// List of `console.warn` messages that can be ignored
const ignoredWarnings = ['React Router Future Flag Warning'];

// Helper function to determine if a `console.warn` message should be ignored
export function shouldIgnoreWarning(message: string): boolean {
  return ignoredWarnings.some((warning) => message.includes(warning));
}

console.warn = (...args) => {
  if (typeof args[0] === 'string' && shouldIgnoreWarning(args[0])) {
    return;
  }
  originalWarn.apply(console, args);
};

/***** C) Setup testing and also ensure that we are mocking things in tests *****/

beforeAll(() => {
  // Establish mocking of APIs before all tests
  server.listen({ onUnhandledRequest: 'error' });

  const originalError = console.error;

  jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
    // Check if contains the 500 status message as common for our testing purposes
    // so not needed to be logged;
    if (args[0]?.message?.includes('Request failed with status code 500'))
      return;
    // Use the original console.error for other cases
    originalError.apply(console, args);
  });
});

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => {
  server.close();
  jest.restoreAllMocks();
});
