import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import * as ROUTES from '@hazmapper/constants/routes';
import MapProject from '@hazmapper/pages/MapProject';
import MainMenu from '@hazmapper/pages/MainMenu';
import Logout from '@hazmapper/pages/Logout/Logout';
import Login from '@hazmapper/pages/Login/Login';
import Callback from '@hazmapper/pages/Callback/Callback';
import StreetviewCallback from '@hazmapper/pages/StreetviewCallback/StreetviewCallback';
import { RootState } from '@hazmapper/redux/store';
import { isTokenValid } from '@hazmapper/utils/authUtils';
import { useBasePath } from '@hazmapper/hooks/environment';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated,
}) => {
  const location = useLocation();

  if (!isAuthenticated) {
    const url = `/login?to=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={url} replace />;
  }

  return children;
};

function AppRouter() {
  const isAuthenticated = useSelector((state: RootState) =>
    isTokenValid(state.auth.authToken)
  );

  const basePath = useBasePath();

  return (
    <BrowserRouter basename={basePath}>
      <Routes>
        <Route
          path={ROUTES.MAIN}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainMenu />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.LOGOUT} element={<Logout />} />
        <Route
          path={ROUTES.PROJECT}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MapProject />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PUBLIC_PROJECT}
          element={<MapProject isPublicView />}
        />
        <Route path={ROUTES.CALLBACK} element={<Callback />} />
        <Route
          path={ROUTES.STREETVIEW_CALLBACK}
          element={<StreetviewCallback />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
