import React, { ReactElement } from 'react';
import { Navigate, useLocation, createBrowserRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import * as ROUTES from '@hazmapper/constants/routes';
import MapProject from '@hazmapper/pages/MapProject';
import MainMenu from '@hazmapper/pages/MainMenu';
import Logout from '@hazmapper/pages/Logout/Logout';
import Login from '@hazmapper/pages/Login/Login';
import LoggedOut from '@hazmapper/pages/LoggedOut/LoggedOut';
import { MapillaryTokenProvider } from '@hazmapper/context/MapillaryTokenProvider';
import { MapillaryViewerProvider } from './context/MapillaryViewerContextProvider';
import {
  getBasePath,
  useAuthenticatedUser,
  getAuthenticatedUserQuery,
  computeAppConfiguration,
  useGeoapiNotifications,
} from './hooks';

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  const {
    data: { isAuthenticated },
  } = useAuthenticatedUser();

  /*TODO: notifications are user specific and lacking additional context.
  See note in react/src/types/notification.ts and WG-431 */
  useGeoapiNotifications();

  if (!isAuthenticated) {
    const url = `/login?to=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={url} replace />;
  }

  return children;
};

const basePath = getBasePath();

const rootLoader = (queryClient: QueryClient) => async () => {
  const { geoapiUrl } = computeAppConfiguration(basePath);
  const data = await queryClient.ensureQueryData(
    getAuthenticatedUserQuery(geoapiUrl)
  );
  return data;
};

export const appRouter = createBrowserRouter(
  [
    {
      id: 'root',
      path: ROUTES.MAIN,
      loader: rootLoader(queryClient),
      errorElement: <div>Error loading application</div>,
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
          path: ROUTES.LOGGED_OUT,
          element: <LoggedOut />,
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
