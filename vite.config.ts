import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.join(root, "src") } },
  build: { outDir: "dist/client", sourcemap: true },
  server: {
    port: 5173,
    proxy: { "/trpc": "http://127.0.0.1:3000", "/health": "http://127.0.0.1:3000" },
  },
});
