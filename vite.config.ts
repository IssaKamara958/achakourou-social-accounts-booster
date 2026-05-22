/// <reference types="node" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
     tailwindcss(),
    tsconfigPaths(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
  },

  esbuild: {
    target: "es2022",
  },

  build: {
    target: "es2022",
    outDir: "dist",
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],

          "vendor-router": [
            "@tanstack/react-router",
            "@tanstack/react-query",
          ],

          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-popover",
          ],

          "vendor-charts": ["recharts"],

          "vendor-motion": ["framer-motion"],

          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
    },
  },
});