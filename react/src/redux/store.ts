import { configureStore } from '@reduxjs/toolkit';
import { reducer } from './reducers/reducers';
import { geoapi } from './api/geoapi';

const store = configureStore({
  reducer: reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      geoapi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
