import React from 'react';
import { useAuthenticatedUser } from '@hazmapper/hooks';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button, Dropdown } from 'antd';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
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
    <div className={styles.root}>
      <Link to={ROUTES.MAIN} aria-label="return to project listings">
        <img width="150px" src={hazmapperHeaderLogo} alt="Hazmapper Logo" />
      </Link>
      {username ? (
        <Dropdown
          menu={{
            items: [
              {
                key: 'logout',
                label: (
                  <a
                    href={ROUTES.LOGOUT}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    Logout
                  </a>
                ),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<UserOutlined />}
            className={styles.userButton}
            onClick={(e) => e.stopPropagation()}
          >
            {username}
            <DownOutlined />
          </Button>
        </Dropdown>
      ) : (
        <Button type="text" className={styles.userButton} onClick={handleLogin}>
          Login
        </Button>
      )}
    </div>
  );
};
export default HeaderNavBar;
