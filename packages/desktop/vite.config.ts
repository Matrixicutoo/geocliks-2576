import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import ports from "../../__ports.cjs";

export default defineConfig({
  build: {
    rollupOptions: {
      input: path.join(__dirname, "electron/__no-renderer.ts"),
    },
  },
  plugins: [
    electron({
      main: {
        entry: "electron/main.ts",
      },
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
      },
    }),
  ],
  server: {
    port: ports.desktop,
    strictPort: true,
    allowedHosts: true,
    // The Electron shell has no renderer of its own — it loads the web app. Without this,
    // hitting the desktop port in a browser returns an empty 404 (blank preview panel), so
    // proxy everything through to the web dev server, websockets included.
    proxy: {
      "^/": {
        target: `http://localhost:${ports.website}`,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
