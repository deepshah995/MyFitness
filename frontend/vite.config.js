import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiBase = process.env.VITE_API_BASE_URL || "http://localhost:8080";
const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [react()],

  // base: "./" is REQUIRED for Capacitor — the iOS WKWebView loads built
  // assets from a file:// context so paths must be relative.
  // In dev mode we use "/" so the Vite dev server works normally.
  base: isProduction ? "./" : "/",

  build: {
    outDir: "dist",
    sourcemap: false,
  },

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: apiBase,
        changeOrigin: true,
      },
    },
  },
});



