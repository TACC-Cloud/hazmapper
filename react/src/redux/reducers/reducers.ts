import { combineReducers } from 'redux';
import { geoapi } from '../api/geoapi';
import authReducer from '../authSlice';

export const reducer = combineReducers({
  auth: authReducer,
  [geoapi.reducerPath]: geoapi.reducer,
});
