import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { getTokenFromLocalStorage } from './authUtils';

const { token } = getTokenFromLocalStorage();

// TODO: REACT Point to active backend (where nginx is running) use wss:// for secure connection
export const socket = io('http://localhost:8888', {
  auth: {
    token,
  },
});

export const setupSocketListeners = (updateConnectionStatus) => {
  socket.on('connect', () => {
    updateConnectionStatus('Connected');
    console.log('Connected');
  });

  socket.on('disconnect', () => {
    updateConnectionStatus('Disconnected');
    console.log('Disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection Error:', error);
  });

  socket.on('notification', (data) => {
    console.log('Notification received:', data.message);
    toast.info(data.message);
  });

  socket.on('new_notification', (data) => {
    console.log('New Notification received:', data.message);
    toast.info(data.message);
  });

  socket.on('asset_success', (data) => {
    console.log('Notification received:', data.message);
    toast.success(data.message);
  });

  socket.on('asset_failure', (data) => {
    console.log('Notification received:', data.message);
    toast.error(data.message);
  });
};

// Clean up function to remove all listeners
export const removeSocketListeners = () => {
  socket.off('connect');
  socket.off('disconnect');
  socket.off('connect_error');
  socket.off('notification');
  socket.off('new_notification');
  socket.off('asset_success');
  socket.off('asset_failure');
};
