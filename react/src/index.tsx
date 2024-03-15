import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from 'react-query';
import App from './AppRouter';
import './index.css';
import store from './redux/store';
import { Provider } from 'react-redux';
import { queryClient } from './queryClient';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
