import React from 'react';
import { notification } from 'antd';
import type { ArgsProps } from 'antd/es/notification';

type NotificationAPI = {
  success: (config: ArgsProps) => void;
  error: (config: ArgsProps) => void;
  info: (config: ArgsProps) => void;
  warning: (config: ArgsProps) => void;
  open: (config: ArgsProps) => void;
};

// Create context with default value and proper typing
export const NotificationContext = React.createContext<NotificationAPI>({
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
  open: () => {},
});

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();

  const notificationApi = React.useMemo(
    () => ({
      success: (config) => api.success(config),
      error: (config) => api.error(config),
      info: (config) => api.info(config),
      warning: (config) => api.warning(config),
      open: (config) => api.open(config),
    }),
    [api]
  );

  return (
    <NotificationContext.Provider value={notificationApi}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};
