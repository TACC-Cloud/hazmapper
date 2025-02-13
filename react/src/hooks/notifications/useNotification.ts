import React from 'react';
import { NotificationContext } from '@hazmapper/context/NotificationProvider';

/**
 * Custom hook to access the notification context for client-side notifications (i.e. toasts) via antd's notifications.
 */
export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};
