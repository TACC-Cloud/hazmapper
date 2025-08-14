import React, { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { useNotification } from '@hazmapper/hooks';

type WebsocketNotification = {
  id: number;
  user: string;
  tenant_id: string;
  created: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  viewed: boolean;
};

const WebsocketNotifications = () => {
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws');
  const notification = useNotification();

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data: WebsocketNotification = JSON.parse(lastMessage.data);
        notification[data.status]({
          description: data.message,
        });
      } catch {
        console.error('Failed to parse WebSocket message:', lastMessage.data);
      }
    }
  }, [lastMessage, notification]);

  return <></>;
};

export default WebsocketNotifications;
