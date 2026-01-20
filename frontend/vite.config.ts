import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { createRequire } from "node:module";
import tsconfigPaths from "vite-tsconfig-paths";
import viteCompression from "vite-plugin-compression";

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    viteCompression({ algorithm: "gzip" }),
    viteCompression({ algorithm: "brotliCompress" }),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "scheduler"],
    alias: {
      scheduler: require.resolve("scheduler"),
      "scheduler/tracing": require.resolve("scheduler/tracing"),
    },
  },
  optimizeDeps: {
    include: ["date-fns", "react", "react-dom", "scheduler"]
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.API_URL || process.env.VITE_API_URL || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("lucide-react")) return "icons";
            if (id.includes("date-fns")) return "utils";
            if (id.includes("react-dom") || id.includes("react-router") || id.includes("react") || id.includes("scheduler")) return "vendor";
            return "libs";
          }
        },
      },
    },
  }
  ,
  ssr: {
    noExternal: ["react", "react-dom", "scheduler"],
  }
});
