import React, { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { useNotification } from '@hazmapper/hooks';

const WebsocketNotifications = () => {
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws');
  const notification = useNotification();

  useEffect(() => {
    if (lastMessage !== null) {
      notification.success({
        description: lastMessage.data,
      });
    }
  }, [lastMessage, notification]);

  return <></>;
};

export default WebsocketNotifications;
