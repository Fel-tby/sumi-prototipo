import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(projectRoot, "src/client"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@client": path.resolve(projectRoot, "src/client"),
      "@shared": path.resolve(projectRoot, "src/shared"),
    },
  },
  build: {
    outDir: path.resolve(projectRoot, "dist/client"),
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": "http://localhost:3333",
    },
  },
});
