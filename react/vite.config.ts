import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

// https://vitejs.dev/config/
// eslint-disable-next-line
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      react(),
      visualizer({
        open: false,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    server: {
      port: 4200,
      host: 'localhost',
    },
    resolve: {
      alias: {
        '@hazmapper': path.resolve(__dirname, './src'),
        '@core-components': path.resolve(__dirname, './src/core-components'),
      },
    },
    resolve: {
      alias: {
        '@hazmapper': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        external: ['react', 'react-dom', 'react-router-dom'], // Ensure these are treated as external
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
