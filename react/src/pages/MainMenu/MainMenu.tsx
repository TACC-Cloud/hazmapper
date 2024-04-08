import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
  Icon,
  Button,
} from '../../core-components';
import useAuthenticatedUser from '../../hooks/user/useAuthenticatedUser';
import { SystemSelect } from '../../components/Systems';
import { ProjectListing } from '../../components/Projects/ProjectListing';
import {
  setupSocketListeners,
  removeSocketListeners,
  socket,
} from '../../utils/socketUtils';

function MainMenu() {
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useAuthenticatedUser();
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  const triggerNotification = () => {
    socket.emit('trigger_notification', {
      message: 'Hello from the client!',
    });
  };

  const [selectedSystem, setSelectedSystem] = useState('');

  useEffect(() => {
    setupSocketListeners(setConnectionStatus);

    // Clean up the event listeners when the component unmounts
    return () => {
      removeSocketListeners();
    };
  }, [setConnectionStatus]);

  if (isUserLoading) {
    return (
      <>
        <SectionHeader isNestedHeader>Main Menu</SectionHeader>
        <LoadingSpinner />
      </>
    );
  }
  if (userError) {
    <>
      <SectionHeader isNestedHeader>Main Menu</SectionHeader>
      <InlineMessage type="error">Unable to retrieve projects.</InlineMessage>
    </>;
  }

  const handleSelectChange = (system: string) => {
    setSelectedSystem(system);
  };

  return (
    <>
      <SectionHeader isNestedHeader>Main Menu</SectionHeader>
      <InlineMessage type="info">
        WebSocket Status: {connectionStatus}
      </InlineMessage>
      <div>
        <InlineMessage type="info">
          Welcome, {userData?.username || 'User'} <Icon name="user"></Icon>
        </InlineMessage>
      </div>
      <div>
        <Button type="primary" onClick={triggerNotification}>
          Trigger Notification
        </Button>
      </div>
      <ProjectListing />
      <ToastContainer />
      {selectedSystem && <div>Current system selected: {selectedSystem}</div>}
      <SystemSelect onSystemSelect={handleSelectChange}></SystemSelect>
    </>
  );
}

export default MainMenu;
