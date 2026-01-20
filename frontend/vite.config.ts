import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    viteCompression({ algorithm: "gzip" }),
    viteCompression({ algorithm: "brotliCompress" }),
  ],
  optimizeDeps: {
    include: ["date-fns"]
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
            if (id.includes("react-dom") || id.includes("react-router") || id.includes("scheduler") || id.includes("react")) return "vendor";
            return "libs";
          }
        },
      },
    },
  }
});