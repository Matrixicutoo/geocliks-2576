import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";
import runableAnalyticsPlugin from "./vite/__plugins/runable-analytics-plugin";
import honoDevPlugin from "./vite/__plugins/hono-dev-plugin";
import assetOptimizerPlugin from "./vite/__plugins/asset-optimizer-plugin";
import ports from "../../__ports.cjs";

const root = path.resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  Object.assign(process.env, env);

  return {
    // All env files live at the repo root — keep Vite's own env loading there too,
    // so packages/web/.env* files can never shadow the root .env.
    envDir: root,
    plugins: [
      honoDevPlugin(),
      react(),
      runableAnalyticsPlugin(),
      tailwind(),
      assetOptimizerPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src/web"),
      },
    },
    build: {
      // This box has ~4 GB of RAM and the dev server holds a large share of it.
      // The gzip-size report compresses every emitted chunk in memory purely to
      // print a number, and a single 3 MB bundle has to be minified in one
      // piece — together that pushed `vite build` over the limit and the kernel
      // OOM-killed it mid-bundle, surfacing as a publish timeout. Dropping the
      // report and splitting vendors into several smaller chunks lowers the
      // peak footprint enough for a build to coexist with the dev server.
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return;
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
              return "vendor-react";
            if (id.includes("react-icons") || id.includes("lucide-react"))
              return "vendor-icons";
            if (id.includes("@vis.gl") || id.includes("google-maps"))
              return "vendor-maps";
            if (id.includes("motion")) return "vendor-motion";
            if (id.includes("zod")) return "vendor-zod";
            if (id.includes("@tanstack") || id.includes("@orpc"))
              return "vendor-data";
            return "vendor";
          },
        },
      },
    },
    server: {
      port: ports.website,
      strictPort: true,
      allowedHosts: true,
      hmr: { overlay: false },
      cors: false,
    },
  };
});
