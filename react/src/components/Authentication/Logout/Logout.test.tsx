import React from 'react';
import {render, waitFor} from '@testing-library/react';
import Logout from './Logout';
import {Provider} from "react-redux";
import store from "../../../redux/store";
import {BrowserRouter} from "react-router-dom";
import { AUTH_KEY} from "../../../utils/authUtils";

test('renders logout', async () => {
  localStorage.setItem(AUTH_KEY, "dummy");

  const { getByText } = render(
    <Provider store={store}>
      <BrowserRouter>
        <Logout />
      </BrowserRouter>
    </Provider>
  );
  expect(getByText(/Log in/)).toBeDefined();
  await waitFor(() => {
    expect(localStorage.getItem(AUTH_KEY)).toBeNull();
  });
  // TODO check local storage etc
});
