import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import { server, testQueryClient } from '@hazmapper/test/testUtil';

/***** A) Setup the configuration used for unit testing *****/
jest.mock('@hazmapper/hooks/environment/getLocalAppConfiguration', () => ({
  getLocalAppConfiguration: jest.fn(() => testDevConfiguration),
}));

/***** B) Ignore some known warnings/errors *****/

// List of `console.warn` messages that can be ignored
const ignoredWarnings = ['React Router Future Flag Warning'];

// List of component-related errors to ignore
const ignoredErrors = [
  // Ignore request code errors as 500 is commong for our testing purposes
  /Request failed with status code 500/,
];

// Helper function to determine if a `console.warn` message should be ignored
export function shouldIgnoreWarning(message: string): boolean {
  return ignoredWarnings.some((warning) => message.includes(warning));
}

// Helper function to determine if a defaultProps error is from core-components
// Ingnoring till https://tacc-main.atlassian.net/browse/WI-208 is done
function isDefaultPropsErrorFromCoreComponents(args: any[]): boolean {
  // Check if this is a defaultProps warning
  const isDefaultPropsWarning = args[0]?.includes?.(
    'Support for defaultProps will be removed from function components'
  );
  if (!isDefaultPropsWarning) return false;

  // Look through all arguments for stack trace containing @tacc/core-components
  return args.some(
    (arg) => typeof arg === 'string' && arg.includes('@tacc/core-components')
  );
}

// Helper function to determine if a console.error message should be ignored
export function shouldIgnoreError(args: any[]): boolean {
  // If it's a defaultProps warning from core-components, ignore it
  if (isDefaultPropsErrorFromCoreComponents(args)) {
    return true;
  }

  // Check other error patterns
  const messageStr = typeof args[0] === 'string' ? args[0] : args[0]?.message;
  return ignoredErrors.some((pattern) => pattern.test(messageStr));
}

/***** C) Setup testing and also ensure that we are mocking things in tests *****/

beforeAll(() => {
  // Establish mocking of APIs before all tests
  server.listen({
    onUnhandledRequest: 'error',
  });
  const originalError = console.error;

  jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
    if (shouldIgnoreError(args)) {
      return;
    }
    originalError.apply(console, args);
  });

  const originalWarn = console.warn;

  jest.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
    // Check if contains the 500 status message as common for our testing purposes
    // so not needed to be logged;
    if (typeof args[0] === 'string' && shouldIgnoreWarning(args[0])) {
      return;
    }
    originalWarn.apply(console, args);
  });
});

// Clear the React Query cache before each test
beforeEach(() => {
  testQueryClient.clear();
});

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => {
  server.close();
  jest.restoreAllMocks();
});
