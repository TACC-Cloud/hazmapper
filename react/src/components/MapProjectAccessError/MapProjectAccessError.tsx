import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Message, Button } from '@tacc/core-components';
import { useAuthenticatedUser } from '@hazmapper/hooks';
import * as ROUTES from '@hazmapper/constants/routes';

import styles from './MapProjectAccessError.module.css';

interface MapProjectAccessErrorProps {
  error: any;
}

const MapProjectAccessError: React.FC<MapProjectAccessErrorProps> = ({
  error,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data: { hasValidTapisToken },
  } = useAuthenticatedUser();
  const isLoggedIn = !!hasValidTapisToken;

  const getMessage = () => {
    if (!error?.response) {
      return 'Unable to load map project due to a server error';
    }

    switch (error.response.status) {
      case 404:
        return 'This map project does not exist';
      case 403:
        return isLoggedIn
          ? "You don't have permission to access this map project"
          : 'Please log in.'; /* no op as before this point, we ensure users are logged in non-public maps */
      case 500:
        return 'Unable to load map project due to a server error';
      default:
        return 'Unable to access this map';
    }
  };

  const is403AndNotLoggedIn = error?.response?.status === 403 && !isLoggedIn;

  return (
    <div className={styles.errorContainer}>
      <Message type="error" tagName="div">
        <p>{getMessage()}</p>
        {is403AndNotLoggedIn && (
          <Button
            type="link"
            onClick={() => {
              const url = `${ROUTES.LOGIN}?to=${encodeURIComponent(
                location.pathname
              )}`;
              navigate(url);
            }}
            dataTestid="access-error-login-button"
          >
            Login
          </Button>
        )}
      </Message>
    </div>
  );
};

export default MapProjectAccessError;
