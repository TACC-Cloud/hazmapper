import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import * as ROUTES from './constants/routes';
import MapProject from './pages/MapProject';
import MainMenu from './pages/MainMenu';
import Logout from './pages/Logout/Logout';
import Login from './pages/Login/Login';
import Callback from './pages/Callback/Callback';
import StreetviewCallback from './pages/StreetviewCallback/StreetviewCallback';
import { RootState } from './redux/store';
import { isTokenValid } from './utils/authUtils';
import { useBasePath } from './hooks/environment';

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
    isTokenValid(state.auth.token)
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
        <Route path="project" element={<MapProject isPublic />} />
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
