import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../../redux/authSlice';

export default function CallbackPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse the query parameters from the URL
    const params = new URLSearchParams(location.hash.slice(1));

    // Check the state value against the expected value
    const state = params.get('state');
    const expectedState = localStorage.getItem('authState');
    if (state !== expectedState) {
      console.error('State for callback is incorrect.  Send to login');

      // Redirect the user to the login page
      dispatch(logout());
      return;
    }

    const redirectTo = localStorage.getItem('toParam') || '/';

    const token = params.get('access_token');
    const expiresIn = params.get('expires_in');
    if (token && expiresIn) {
      const expires = Date.now() + parseInt(expiresIn) * 1000;
      // Save the token to the Redux store
      dispatch(loginSuccess({ token, expires }));
      navigate(redirectTo);
    }
  }, []);

  return <div>Logging in...</div>;
}
