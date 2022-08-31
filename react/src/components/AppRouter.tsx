import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as ROUTES from '../constants/routes';
import Map from './Map/Map';
import Menu from './Menu/Menu';
import Logout from './Authentication/Logout/Logout';
import Login from './Authentication/Login/Login';
import Callback from './Authentication/Callback/Callback';
import StreetviewCallback from './Authentication/StreetviewCallback/StreetviewCallback';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.MAIN} element={<Menu />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.LOGOUT} element={<Logout />} />
        <Route path={ROUTES.PROJECT} element={<Map />} />
        <Route path={ROUTES.PUBLIC_PROJECT} element={<Map />} />
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
