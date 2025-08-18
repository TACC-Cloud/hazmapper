import { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { useQueryClient } from '@tanstack/react-query';
import {
  KEY_USE_FEATURES,
  KEY_USE_POINT_CLOUDS,
  KEY_USE_TILE_SERVERS,
} from '@hazmapper/hooks';
import { useNotification } from './useNotification';

type WebsocketNotification = {
  id: number;
  user: string;
  tenant_id: string;
  created: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  viewed: boolean;
};

export const useGeoapiNotifications = () => {
  const queryClient = useQueryClient();
  const notification = useNotification();
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws');

  useEffect(() => {
    if (lastMessage !== null) {
      let data: WebsocketNotification;
      try {
        data = JSON.parse(lastMessage.data);
      } catch {
        console.error('Failed to parse WebSocket message:', lastMessage.data);
        return;
      }
      notification[data.status]({
        description: data.message,
      });

      if (data.status === 'success') {
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
  }, [lastMessage, notification, queryClient]);
};
