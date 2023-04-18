import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import store from '../store';

// TODO: make configurable so can be https://agave.designsafe-ci.org/geo-staging/v2 or https://agave.designsafe-ci.org/geo/v2
const BASE_URL = 'https:localhost:8888';

export const geoapi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // TODO check if logged in as we don't want to add if public
      const token = store.getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json;charset=UTF-8');
      headers.set('Authorization', 'anonymous');

      // TODO below adding of JWT if localhost and then add JWT
      // we put the JWT on the request to our geoapi API because it is not behind ws02 if in local dev
      // and if user is logged in

      return headers;
    },
  }),
  tagTypes: ['Test'],
  endpoints: () => ({}),
});
