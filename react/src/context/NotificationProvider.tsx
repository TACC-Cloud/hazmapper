import React from 'react';
import { notification } from 'antd';
import type { ArgsProps } from 'antd/es/notification';

// takes antd's ArgProps or just a descxriptino and optional message
type NotificationConfig = ArgsProps | { description: string; message?: string };

type NotificationAPI = {
  success: (config: NotificationConfig) => void;
  error: (config: NotificationConfig) => void;
  info: (config: NotificationConfig) => void;
  warning: (config: NotificationConfig) => void;
  open: (config: NotificationConfig) => void;
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

  const notificationApi: NotificationAPI = React.useMemo(() => {
    const defaultProps: Partial<ArgsProps> = {
      placement: 'bottomLeft',
      closable: false,
    };

    return {
      success: (config) =>
        api.success({ message: 'Success', ...defaultProps, ...config }),
      error: (config) =>
        api.error({ message: 'Error', ...defaultProps, ...config }),
      info: (config) =>
        api.info({ message: 'Info', ...defaultProps, ...config }),
      warning: (config) =>
        api.warning({ message: 'Warning', ...defaultProps, ...config }),
      open: (config) =>
        api.open({ message: 'Unknown', ...defaultProps, ...config }),
    };
  }, [api]);

  return (
    <NotificationContext.Provider value={notificationApi}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};
