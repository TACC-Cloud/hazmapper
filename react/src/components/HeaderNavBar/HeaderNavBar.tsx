import React from 'react';
import { Layout } from 'antd';
import useAuthenticatedUser from '@hazmapper/hooks/user/useAuthenticatedUser';
import { useNavigate } from 'react-router-dom';
import { Button, InlineMessage, LoadingSpinner } from '@tacc/core-components';
import styles from './HeaderNavBar.module.css';

export const HeaderNavBar: React.FC = () => {
  const { Header } = Layout;
  const navigate = useNavigate();

  const {
    data: userData,
    isLoading: isUserLoading,
    error: isUserError,
  } = useAuthenticatedUser();

  const handleLogin = () => {
    const url = `/login?to=${encodeURIComponent(location.pathname)}`;
    navigate(url);
  };

  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  if (isUserError) {
    return (
      <InlineMessage type="error">
        {' '}
        There was an error loading your username.
      </InlineMessage>
    );
  }

  return (
    <Header className={styles.root}>
      <img
        width="150px"
        src="./src/assets/hazmapper-header-logo.png"
        alt="Hazmapper Logo"
      />
      {userData && userData.username ? (
        <div className={styles.userName}>{userData.username}</div>
      ) : (
        <Button type="link" className={styles.userName} onClick={handleLogin}>
          Login
        </Button>
      )}
    </Header>
  );
};
export default HeaderNavBar;
