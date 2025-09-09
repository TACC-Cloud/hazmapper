import { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import {
  KEY_USE_FEATURES,
  KEY_USE_POINT_CLOUDS,
  KEY_USE_TILE_SERVERS,
  useAuthenticatedUser,
  TAuthenticatedUserResponse,
  useAppConfiguration,
} from '@hazmapper/hooks';
import { useNotification } from './useNotification';
import { NotificationAPI } from '@hazmapper/context/NotificationProvider';
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
  const { geoapiUrl } = useAppConfiguration();
  const baseUrl = new URL(geoapiUrl);
  const protocol = baseUrl.protocol === 'https:' ? 'wss' : 'ws';
  const { lastMessage } = useWebSocket(
    `${protocol}://${baseUrl.host}${baseUrl.pathname}/ws`
  );

  useEffect(() => {
    if (lastMessage !== null) {
      let data: WebsocketNotification | TAuthenticatedUserResponse;
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
      } else if (
        (data as TAuthenticatedUserResponse).authToken &&
        (data as TAuthenticatedUserResponse).username === username
      ) {
        // If backend sends auth state in websocket, update cached auth state.
        queryClient.setQueryData(
          ['authenticated-user'],
          data as TAuthenticatedUserResponse
        );
      }
    }
  }, [lastMessage, queryClient, notification, username]);
};
