import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// eslint-disable-next-line
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    server: {
      port: 4200,
      host: 'localhost',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-datepicker')) {
              return 'react-datepicker';
            } else if (id.includes('node_modules/leaflet')) {
              return 'leaflet';
            } else if (id.includes('node_modules/@turf/turf')) {
              return 'turf';
            } else if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
  };
});
