/*
 * Notifications are currently user-specific and do not include details
 * about affected projects or the type of project entity impacted.
 * This needs to be updated; See: https://tacc-main.atlassian.net/browse/WG-431
 */
export interface Notification {
  status: 'success' | 'warning' | 'error';
  message: string;
  created: string; // ISO timestamp with timezone
  viewed: boolean;
  id: number;
}
