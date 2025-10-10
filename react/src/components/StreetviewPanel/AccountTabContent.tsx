import React from 'react';
import { Typography, Button, Flex, Spin, Alert } from 'antd';
import { useLocation } from 'react-router-dom';
import {
  useMapillaryUserConnection,
  useDeleteMapillaryUserConnection,
  useAppConfiguration,
} from '@hazmapper/hooks';

const { Text } = Typography;

const AccountTabContent = () => {
  const {
    data: mapillaryConnection,
    isLoading,
    error,
  } = useMapillaryUserConnection();
  const {
    mutate: deleteMapillaryConnection,
    isPending: isDeleteMapillaryConnectionPending,
  } = useDeleteMapillaryUserConnection();

  const configuration = useAppConfiguration();

  const location = useLocation();

  const loggedInAuth = !!mapillaryConnection?.token;

  const handleLoginRedirect = () => {
    const toPath = encodeURIComponent(location.pathname);
    window.location.href = `${configuration.geoapiUrl}/streetview/auth/mapillary/login?to=${toPath}`;
  };

  return (
    <Flex justify="center" align="center" style={{ flexDirection: 'column' }}>
      {isLoading && <Spin size="large" data-testid="spin" />}

      {error && (
        <Alert
          message="Authentication Error"
          description={
            error.message || 'Something went wrong. Please try again.'
          }
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {!isLoading &&
        !error &&
        (loggedInAuth ? (
          <>
            {' '}
            <Text strong style={{ fontSize: '18px' }}>
              You are <br /> authenticated to <br /> Mapillary!
            </Text>
            <Button
              type="primary"
              size="large"
              loading={isDeleteMapillaryConnectionPending}
              onClick={() => deleteMapillaryConnection()}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Text strong style={{ fontSize: '18px', textAlign: 'center' }}>
              You are not <br /> authenticated to <br /> Mapillary!
            </Text>
            <Button type="primary" size="large" onClick={handleLoginRedirect}>
              Login To Mapillary
            </Button>
          </>
        ))}
    </Flex>
  );
};

export default AccountTabContent;
