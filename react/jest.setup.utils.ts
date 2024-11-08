/* Helper functions to be used in test setup in jest.setup.ts */
import nock from 'nock';
import { AppConfiguration } from '@hazmapper/types';

// List of `console.warn` messages that can be ignored
const ignoredWarnings = ['React Router Future Flag Warning'];

// Helper function to determine if a `console.warn` message should be ignored
export function shouldIgnoreWarning(message: string): boolean {
  return ignoredWarnings.some((warning) => message.includes(warning));
}

export const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'access-control-allow-headers': 'content-type,authorization',
  'access-control-allow-credentials': 'true',
};

export const setupCorsMocks = (config: AppConfiguration) => {
  nock(config.geoapiUrl)
    .defaultReplyHeaders(CORS_HEADERS)
    .options(/.*/)
    .reply(204)
    .persist();

  nock(config.designsafePortalUrl)
    .defaultReplyHeaders(CORS_HEADERS)
    .options(/.*/)
    .reply(204)
    .persist();

  nock(config.tapisUrl)
    .defaultReplyHeaders(CORS_HEADERS)
    .options(/.*/)
    .reply(204)
    .persist();
};
