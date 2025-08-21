import React from 'react';
import { useAuthenticatedUser } from '@hazmapper/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@tacc/core-components';
import hazmapperHeaderLogo from '@hazmapper/assets/hazmapper-header-logo.png';
import styles from './HeaderNavBar.module.css';
import * as ROUTES from '@hazmapper/constants/routes';

export const HeaderNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: { username },
  } = useAuthenticatedUser();

  const handleLogin = (e: React.MouseEvent) => {
    e.stopPropagation();

    const url = `${ROUTES.LOGIN}?to=${encodeURIComponent(location.pathname)}`;
    navigate(url);
  };

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
      {username ? (
        <div className={styles.userName}>{username}</div>
      ) : (
        <Button type="link" className={styles.userName} onClick={handleLogin}>
          Login
        </Button>
      )}
    </div>
  );
};
export default HeaderNavBar;
