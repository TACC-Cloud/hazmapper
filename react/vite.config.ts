import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => { // eslint-disable-line
  return {
    plugins: [react()],
    server: {
      port: 4200,
      host: 'localhost',
    },

  };
});
