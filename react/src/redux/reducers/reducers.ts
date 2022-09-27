import { combineReducers } from 'redux';
import { geoapi } from '../api/geoapi';

export const reducer = combineReducers({
  [geoapi.reducerPath]: geoapi.reducer,
});
