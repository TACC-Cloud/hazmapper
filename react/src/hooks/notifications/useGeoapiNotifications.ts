import { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import {
  KEY_USE_FEATURES,
  KEY_USE_POINT_CLOUDS,
  KEY_USE_TILE_SERVERS,
  useAuthenticatedUser,
} from '@hazmapper/hooks';
import { useNotification } from './useNotification';
import { NotificationAPI } from '@hazmapper/context/NotificationProvider';
import { AuthState } from '@hazmapper/types';
type WebsocketNotification = {
  status: 'success' | 'warning' | 'error';
  message: string;
};

const processNotification = (
  data: WebsocketNotification,
  queryClient: QueryClient,
  notification: NotificationAPI
) => {
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
};

export const useGeoapiNotifications = () => {
  const queryClient = useQueryClient();
  const notification = useNotification();
  const {
    data: { username },
  } = useAuthenticatedUser();
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws');

  useEffect(() => {
    if (lastMessage !== null) {
      let data: WebsocketNotification | AuthState;
      try {
        data = JSON.parse(lastMessage.data);
      } catch {
        console.error('Failed to parse WebSocket message:', lastMessage.data);
        return;
      }

      if ((data as WebsocketNotification).message) {
        processNotification(
          data as WebsocketNotification,
          queryClient,
          notification
        );
      } else if ((data as AuthState).authToken) {
        // If backend sends auth state in websocket, update local storage auth state.
        // This can be removed once auth state is no longer tracked in local storage.
        if ((data as AuthState).user?.username === username) {
          console.log('Updating auth state from WebSocket:', data);
          queryClient.setQueryData(['authenticated-user'], data);
        }
      }
    }
  }, [lastMessage, queryClient, notification, username]);
};
