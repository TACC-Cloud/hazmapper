import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './AppRouter';
import './index.css';
import store from './redux/store';
import { Provider } from 'react-redux';
import { queryClient } from './queryClient';
import { ConfigProvider, ThemeConfig } from 'antd';
import { NotificationProvider } from '@hazmapper/context/NotificationProvider';

const themeConfig: ThemeConfig = {
  token: {
    borderRadius: 0,
    colorPrimary: '#74B566',
    colorError: '#d9534f',
    colorPrimaryTextHover: 'black',
    colorBorderSecondary: '#b7b7b7',
    zIndexPopupBase: 2000,
  },
  components: {
    Table: {
      cellPaddingBlock: 8,
      headerBg: 'transparent',
      headerColor: '#333333',
      headerSplitColor: 'transparent',
      rowHoverBg: 'rgb(230, 246, 255)',
      borderColor: 'rgb(215, 215, 215)',
      colorText: 'rgb(112, 112, 112)',
    },
    Layout: {
      bodyBg: 'transparent',
      headerBg: 'transparent',
      headerPadding: 0,
      footerBg: 'transparent',
      footerPadding: '0 16px',
      siderBg: 'transparent',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={themeConfig}>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
