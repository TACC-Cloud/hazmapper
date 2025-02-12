import React, { useEffect } from 'react';
import { Notification } from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';
import { useNotification } from './useNotification';

const POLLING_INTERVAL = 5000; // 5 seconds

/* TODO
 *   disable if not logged in user
 */

export const useGeoapiNotificationsPolling = () => {
  const notificationToast = useNotification();

  const getStartDate = () => {
    // Get the current timestamp minus the polling interval
    const now = new Date();
    const then = new Date(now.getTime() - POLLING_INTERVAL);
    return then.toISOString();
  };

  const { data: notifications } = useGet<Notification[]>({
    endpoint: '/notifications',
    key: ['notifications'],
    params: {
      startDate: getStartDate(),
    },
    options: {
      refetchInterval: POLLING_INTERVAL,
      refetchIntervalInBackground: true,
      retry: 3,
    },
  });

  useEffect(() => {
    if (notifications?.length) {
      const hasSuccessNotification = notifications.some(
        (note) => note.status === 'success'
      );

      notifications.forEach((note) => {
        notificationToast.open({
          type: 'error',
          message: 'Error!',
          description: note.message,
          placement: 'bottomLeft',
          closable: false,
        });
      });

      if (hasSuccessNotification) {
        console.log('TODO: invalidate relevant queries');
      }
    }
  }, [notifications, notificationToast]);

  return {
    notifications,
    isPolling: true,
  };
};
