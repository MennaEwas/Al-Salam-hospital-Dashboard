import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = "https://salemuatapi.alsalamhosp.com:446";

export default defineConfig({
  base: "/Al-Salam-hospital-Dashboard/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});

