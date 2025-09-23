import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/filltrip-db': {
        target: 'http://localhost:5172', // The backend server (where PHP is running)
        changeOrigin: true,              // Ensure the host header matches the target
        secure: false,                   // For HTTP (not HTTPS)
        rewrite: (path) => path.replace(/^\/filltrip-db/, '/filltrip-db'), // Correctly forward the path
      },
    },
  },
});
