import React from 'react';
import useAuthenticatedUser from '@hazmapper/hooks/user/useAuthenticatedUser';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, InlineMessage, LoadingSpinner } from '@tacc/core-components';
import hazmapperHeaderLogo from '@hazmapper/assets/hazmapper-header-logo.png';
import styles from './HeaderNavBar.module.css';
import * as ROUTES from '@hazmapper/constants/routes';

export const HeaderNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: userData,
    isLoading: isUserLoading,
    error: isUserError,
  } = useAuthenticatedUser();

  const handleLogin = (e: React.MouseEvent) => {
    e.stopPropagation();

    const url = `${ROUTES.LOGIN}?to=${encodeURIComponent(location.pathname)}`;
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
    <div
      className={styles.root}
      onKeyDown={() => navigate(ROUTES.MAIN)}
      onClick={() => navigate(ROUTES.MAIN)}
      role="button"
      aria-label="return to project listings"
      tabIndex={0}
    >
      <img width="150px" src={hazmapperHeaderLogo} alt="Hazmapper Logo" />
      {userData?.username ? (
        <div className={styles.userName}>{userData.username}</div>
      ) : (
        <Button type="link" className={styles.userName} onClick={handleLogin}>
          Login
        </Button>
      )}
    </div>
  );
};
export default HeaderNavBar;
