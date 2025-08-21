import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button } from 'antd';
import hazmapperLogo from '@hazmapper/assets/Hazmapper-Stack@4x.png';
import { useAuthenticatedUser } from '@hazmapper/hooks';

function LoggedOut() {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/login');
  };
  const {
    data: { isAuthenticated },
  } = useAuthenticatedUser();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <img src={hazmapperLogo} alt="Hazmapper Logo"></img>
      <Button type="primary" onClick={handleLogin}>
        {'Log in'}
      </Button>
    </Layout>
  );
}

export default LoggedOut;
