import { combineReducers } from 'redux';
import authReducer from '../authSlice';

export const reducer = combineReducers({
  auth: authReducer,
});
