import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/authSlice';
import { queryClient } from '../../queryClient';

function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    // clear react-query cache
    queryClient.clear();

    // logout of auth (handled by rtk/redux)
    dispatch(logout());
  }, [dispatch]);

  return (
    <div>
      <button onClick={handleLogin}>{'Log in'}</button>
    </div>
  );
}

export default Logout;
