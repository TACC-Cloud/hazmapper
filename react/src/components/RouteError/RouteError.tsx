import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Result, Button, Typography } from 'antd';

const { Text } = Typography;

const RouteError: React.FC = () => {
  const error = useRouteError();

  let status: 'error' | 'warning' | '500' | '404' = 'error';
  let title = 'Something went wrong';
  let subTitle = 'An unexpected error occurred while loading the application.';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      status = '404';
      title = 'Page Not Found';
      subTitle = 'The page you are looking for does not exist.';
    } else if (error.status === 500) {
      status = '500';
      title = 'Server Error';
      subTitle = error.statusText || 'The server encountered an error.';
    } else {
      title = `Error ${error.status}`;
      subTitle = error.statusText || error.data?.message || subTitle;
    }
  } else if (error instanceof Error) {
    subTitle = error.message;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Result
        status={status}
        title={title}
        subTitle={
          <>
            {subTitle}
            <br />
            <Text type="secondary" style={{ fontSize: '0.875rem' }}>
              This may be due to a backend service being unavailable.
            </Text>
            <br />
            <a
              href="https://www.designsafe-ci.org/help/new-ticket/"
              target="_blank"
              rel="noreferrer"
              style={{ marginTop: '0.5rem', display: 'inline-block' }}
            >
              Click here to submit a ticket to DesignSafe.
            </a>
          </>
        }
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        }
      />
    </div>
  );
};

export default RouteError;
