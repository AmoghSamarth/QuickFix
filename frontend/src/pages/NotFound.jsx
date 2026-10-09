import React from 'react';
import ErrorPage from './ErrorPage';

export function NotFound() {
  return (
    <ErrorPage
      errorCode="404"
      errorTitle="Error 404 (Not Found)"
      subheading="The requested page could not be located."
      message="The maintenance view or resource you are trying to reach does not exist, has been moved, or has expired."
      errorId="MR-ERR-404-ROUTE-NOT-FOUND"
      onRetry={() => {
        window.location.href = '/';
      }}
    />
  );
}

export default NotFound;
