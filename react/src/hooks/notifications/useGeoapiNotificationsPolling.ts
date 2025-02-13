import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Notification } from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';
import {
  KEY_USE_FEATURES,
  KEY_USE_POINT_CLOUDS,
  KEY_USE_TILE_SERVERS,
} from '@hazmapper/hooks';
import { useNotification } from './useNotification';

const POLLING_INTERVAL = 5000; // 5 seconds

export const useGeoapiNotificationsPolling = () => {
  const queryClient = useQueryClient();
  const notification = useNotification();

  const getStartDate = () => {
    // Get the current timestamp minus the polling interval
    const now = new Date();
    const then = new Date(now.getTime() - POLLING_INTERVAL);
    return then.toISOString();
  };

  const { data: recentNotifications } = useGet<Notification[]>({
    endpoint: '/notifications/',
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
    if (recentNotifications?.length) {
      const hasSuccessNotification = recentNotifications.some(
        (note) => note.status === 'success'
      );

      recentNotifications.forEach((note) => {
        notification.open({
          type: note.status,
          message: `${note.status[0].toUpperCase()}${note.status.slice(1)}!`,
          description: note.message,
        });
      });

      if (hasSuccessNotification) {
        // we assume that if some action was updated we need to refresh things so
        // we invalidate relevant queries.
        //  Note we are doing a force refetch as makes unique KEY_USE_FEATURES work

        Promise.all(
          [KEY_USE_FEATURES, KEY_USE_POINT_CLOUDS, KEY_USE_TILE_SERVERS].map(
            (key) =>
              queryClient
                .invalidateQueries({
                  queryKey: [key],
                  refetchType: 'all',
                })
                .then(() => {
                  const queries = queryClient.getQueriesData({
                    queryKey: [key],
                  });
                  // Force refetch active queries for each key
                  return Promise.all(
                    queries.map(([queryKey]) =>
                      queryClient.refetchQueries({
                        queryKey,
                        type: 'active',
                        exact: true,
                      })
                    )
                  );
                })
          )
        );
      }
    }
  }, [recentNotifications, notification, queryClient]);

  return {
    recentNotifications,
    isPolling: true,
  };
};
