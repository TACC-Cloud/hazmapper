/* Helper functions to be used in test setup in jest.setup.ts */

// List of `console.warn` messages that can be ignored
const ignoredWarnings = ['React Router Future Flag Warning'];

// Helper function to determine if a `console.warn` message should be ignored
export function shouldIgnoreWarning(message: string): boolean {
  return ignoredWarnings.some((warning) => message.includes(warning));
}
