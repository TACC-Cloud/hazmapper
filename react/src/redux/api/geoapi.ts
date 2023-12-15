import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import type { RootState } from '../store';

// TODO: make configurable so can be https://agave.designsafe-ci.org/geo-staging/v2 or https://agave.designsafe-ci.org/geo/v2
// See https://tacc-main.atlassian.net/browse/WG-196
const BASE_URL = 'https://agave.designsafe-ci.org/geo/v2';

export const geoapi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, api) => {
      // TODO check if logged in as we don't want to add if public
      const token = (api.getState() as RootState).auth.token;

      if (token) {
        headers.set('Authorization', `Bearer ${token.token}`);
      }

      headers.set('Content-Type', 'application/json;charset=UTF-8');


      // TODO below adding of JWT if localhost and then add JWT
      // we put the JWT on the request to our geoapi API because it is not behind ws02 if in local dev
      // and if user is logged in

      return headers;
    },
  }),
  tagTypes: ['Test'],
  endpoints: (builder) => ({
    getGeoapiProjects: builder.query<any, void>({
      query: () => '/projects/',
    }),
    // NOTE: Currently fails due to cors on localhost (chrome) works when requesting production backend
    getGeoapiUserInfo: builder.query<any, void>({
      query: () => ({
        url: 'https://agave.designsafe-ci.org/oauth2/userinfo?schema=openid',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetGeoapiProjectsQuery, useGetGeoapiUserInfoQuery } = geoapi;
