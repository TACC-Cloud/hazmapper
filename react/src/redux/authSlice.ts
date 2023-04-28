import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getAuthFromLocalStorage,
  setAuthToLocalStorage,
  removeAuthFromLocalStorage,
} from '../utils/authUtils';

// TODO consider moving to ../types/
export interface AuthState {
  token: string | null;
  expires: number | null;
}

// check local storage for our initial state
const initialState: AuthState = getAuthFromLocalStorage();
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{ token: string; expires: number }>
    ) {
      state.token = action.payload.token;
      state.expires = action.payload.expires;

      // save to local storage
      setAuthToLocalStorage(state);
    },
    logout(state) {
      state.token = null;
      state.expires = null;

      //remove from local storage
      removeAuthFromLocalStorage();
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
