import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Forward any call starting with /filltrip-db to Apache (XAMPP) backend
      "/filltrip-db": {
        target: "http://localhost", // Apache usually listens on 80
        changeOrigin: true,
        // Do not rewrite path because we keep /filltrip-db folder under htdocs
        // If you move PHP files elsewhere, you could rewrite: pathRewrite: { '^/filltrip-db': '' }
      },
    },
  },
});
