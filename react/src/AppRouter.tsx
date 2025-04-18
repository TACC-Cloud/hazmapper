import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, createBrowserRouter } from 'react-router-dom';
import * as ROUTES from '@hazmapper/constants/routes';
import MapProject from '@hazmapper/pages/MapProject';
import MainMenu from '@hazmapper/pages/MainMenu';
import Logout from '@hazmapper/pages/Logout/Logout';
import Login from '@hazmapper/pages/Login/Login';
import Callback from '@hazmapper/pages/Callback/Callback';
import { RootState } from '@hazmapper/redux/store';
import { MapillaryTokenProvider } from '@hazmapper/context/MapillaryTokenProvider';
import { MapillaryViewerProvider } from './context/MapillaryViewerContextProvider';
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
              <MapillaryTokenProvider>
                <MapillaryViewerProvider>
                  <MapProject />
                </MapillaryViewerProvider>
              </MapillaryTokenProvider>
            </ProtectedRoute>
          ),
        },
        {
          path: ROUTES.PUBLIC_PROJECT,
          element: (
            <MapillaryTokenProvider>
              <MapillaryViewerProvider>
                <MapProject isPublicView />
              </MapillaryViewerProvider>
            </MapillaryTokenProvider>
          ),
        },
        {
          path: ROUTES.CALLBACK,
          element: <Callback />,
        },
        {
          path: '*',
          element: <Navigate to={basePath} replace={true} />,
        },
      ],
    },
  ],
  { basename: basePath }
);
