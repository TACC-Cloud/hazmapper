import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, createBrowserRouter } from 'react-router-dom';
import * as ROUTES from '@hazmapper/constants/routes';
import MapProject from '@hazmapper/pages/MapProject';
import MainMenu from '@hazmapper/pages/MainMenu';
import Logout from '@hazmapper/pages/Logout/Logout';
import Login from '@hazmapper/pages/Login/Login';
import Callback from '@hazmapper/pages/Callback/Callback';
import StreetviewCallback from '@hazmapper/pages/StreetviewCallback/StreetviewCallback';
import { RootState } from '@hazmapper/redux/store';
import { isTokenValid } from '@hazmapper/utils/authUtils';
import { getBasePath } from './hooks';

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector((state: RootState) =>
    isTokenValid(state.auth.authToken)
  );

  if (!isAuthenticated) {
    const url = `/login?to=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={url} replace />;
  }

  return children;
};

const basePath = getBasePath();

export const appRouter = createBrowserRouter(
  [
    {
      id: 'root',
      path: ROUTES.MAIN,
      children: [
        {
          path: '',
          element: (
            <ProtectedRoute>
              <MainMenu />
            </ProtectedRoute>
          ),
        },
        {
          path: ROUTES.LOGIN,
          element: <Login />,
        },
        {
          path: ROUTES.LOGOUT,
          element: <Logout />,
        },
        {
          path: ROUTES.PROJECT,
          element: (
            <ProtectedRoute>
              <MapProject />
            </ProtectedRoute>
          ),
        },
        {
          path: ROUTES.PUBLIC_PROJECT,
          element: <MapProject isPublicView />,
        },
        {
          path: ROUTES.CALLBACK,
          element: <Callback />,
        },
        {
          path: ROUTES.STREETVIEW_CALLBACK,
          element: <StreetviewCallback />,
        },
        {
          path: '*',
          element: <Navigate to={'/'} replace={true} />,
        },
      ],
    },
  ],
  { basename: basePath }
);
