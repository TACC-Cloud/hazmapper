import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
  removeTokenFromLocalStorage,
} from '../utils/authUtils';
import { AuthState, AuthenticatedUser } from '../types';
import { geoapi } from './api/geoapi';

// TODO consider moving to ../types/
// check local storage for our initial state
const initialState: AuthState = {
  token: getTokenFromLocalStorage(),
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
      state.token = {
        token: action.payload.token,
        expires: action.payload.expires,
      };

      // save to local storage
      setTokenToLocalStorage(state.token);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      //remove from local storage
      removeTokenFromLocalStorage();
    },

    setUser(state, action: PayloadAction<{ user: AuthenticatedUser }>) {
      state.user = action.payload.user;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      geoapi.endpoints.getGeoapiUserInfo.matchFulfilled,
      (state, action: PayloadAction<any>) => {
        const u: any = {
          username: action.payload.name,
          email: action.payload.email,
        };
        state.user = u;
      }
    );
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
