import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getAuthenticatedUserFromLocalStorage,
  setAuthenticatedUserFromLocalStorage,
  removeAuthenticatedUserFromLocalStorage,
} from '../utils/authUtils';
import { AuthenticatedUser, AuthToken } from '@hazmapper/types';

// check local storage for our initial state
const initialState = getAuthenticatedUserFromLocalStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{ user: AuthenticatedUser; authToken: AuthToken }>
    ) {
      state = {
        user: action.payload.user,
        authToken: action.payload.authToken,
      };

      // save to local storage
      setAuthenticatedUserFromLocalStorage(state);
    },
    logout(state) {
      state.user = null;
      state.authToken = null;
      //remove from local storage
      removeAuthenticatedUserFromLocalStorage();
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
