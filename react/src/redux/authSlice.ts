import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
  removeTokenFromLocalStorage,
} from '../utils/authUtils';
import { AuthState, AuthenticatedUser } from '../types';

// TODO consider moving to ../types/
// check local storage for our initial state
const initialState: AuthState = {
  authToken: getTokenFromLocalStorage(),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{ token: string; expires: number }>
    ) {
      state.authToken = {
        token: action.payload.token,
        expires: action.payload.expires,
      };

      // save to local storage
      setTokenToLocalStorage(state.authToken);
    },
    logout(state) {
      state.user = null;
      state.authToken = null;
      //remove from local storage
      removeTokenFromLocalStorage();
    },

    setUser(state, action: PayloadAction<{ user: AuthenticatedUser }>) {
      state.user = action.payload.user;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
