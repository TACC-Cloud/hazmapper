import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../redux/authSlice';

function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    dispatch(logout);
  }, [dispatch]);

  return (
    <div>
      <button onClick={handleLogin}>{'Log in'}</button>
    </div>
  );
}

export default Logout;
