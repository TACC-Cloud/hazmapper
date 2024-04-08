import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
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
import CreateMapModal from '../../components/CreateMapModal/CreateMapModal';
import { ProjectListing } from '../../components/Projects/ProjectListing';
import io from 'socket.io-client';

const socket = io('http://localhost:8888');

function MainMenu() {
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useAuthenticatedUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const [selectedSystem, setSelectedSystem] = useState('');

  useEffect(() => {
    // Listen for the 'connect' and 'disconnect' events to update the connection status
    socket.on('connect', () => {
      setConnectionStatus('Connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('Disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection Error:', error);
    });

    socket.on('notifications', (data) => {
      toast.info(data.message);
    });

    // Clean up the event listeners when the component unmounts
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('notifications');
    };
  }, []);

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
        <Button type="primary" size="small" onClick={toggleModal}>
          Create Map
        </Button>
      </div>
      <InlineMessage type="info">
        Welcome, {userData?.username || 'User'} <Icon name="user"></Icon>
      </InlineMessage>
      <CreateMapModal isOpen={isModalOpen} toggle={toggleModal} />
      <ProjectListing />
      <ToastContainer />
      {selectedSystem && <div>Current system selected: {selectedSystem}</div>}
      <SystemSelect onSystemSelect={handleSelectChange}></SystemSelect>
    </>
  );
}

export default MainMenu;
