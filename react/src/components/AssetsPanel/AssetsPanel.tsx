import React, { useState, useEffect } from 'react';
import styles from './AssetsPanel.module.css';
import {
  socket,
  setupSocketListeners,
  removeSocketListeners,
} from '../../utils/socketUtils';
import { ToastContainer } from 'react-toastify';
import { Button } from '../../core-components';

interface Props {
  /**
   * Whether or not the map project is public.
   */
  isPublic: boolean;
}

/**
 * A component that displays a map project (a map and related data)
 */
const AssetsPanel: React.FC<Props> = ({ isPublic }) => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  const triggerSuccess = () => {
    socket.emit('trigger_asset_success', {
      message: 'Hello from the client!',
    });
  };

  const triggerFailure = () => {
    socket.emit('trigger_asset_failure', {
      message: 'Hello from the client!',
    });
  };

  useEffect(() => {
    setupSocketListeners(setConnectionStatus);
    return () => {
      removeSocketListeners();
    };
  }, []);

  return (
    <>
      <Button size="small" onClick={triggerSuccess}>
        Asset Success
      </Button>
      <Button size="small" onClick={triggerFailure}>
        Asset Failure
      </Button>
      <ToastContainer />
      <div className={styles.root}>Assets Panel TODO, isPublic: {isPublic}</div>
      Connection Status: {connectionStatus}
    </>
  );
};

export default AssetsPanel;
