import React from 'react';
import {
  useGetGeoapiProjectsQuery,
  useGetGeoapiUserInfoQuery,
} from '../../redux/api/geoapi';

function MainMenu() {
  useGetGeoapiProjectsQuery();
  useGetGeoapiUserInfoQuery();
  return <h2>Main Menu</h2>;
}

export default MainMenu;
