import { combineReducers } from 'redux';
import { geoapi } from '../api/geoapi';
import authReducer from '../authSlice';
import projectsReducer from '../projectsSlice';

export const reducer = combineReducers({
  auth: authReducer,
  projects: projectsReducer,
  [geoapi.reducerPath]: geoapi.reducer,
});
