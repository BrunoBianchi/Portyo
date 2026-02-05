import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

// Plugin para injetar Service Worker
const injectSWPlugin = (): Plugin => ({
  name: 'inject-sw',
  transformIndexHtml(html) {
    return {
      html,
      tags: [
        {
          tag: 'script',
          injectTo: 'head',
          attrs: { type: 'module' },
          children: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((reg) => console.log('[SW] Registered:', reg.scope))
                  .catch((err) => console.log('[SW] Registration failed:', err));
              });
            }
          `,
        },
      ],
    };
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    // Compressão Gzip
    viteCompression({ 
      algorithm: "gzip",
      threshold: 1024, // Apenas arquivos > 1KB
      filter: /\.(js|css|html|json|svg)$/,
    }),
    // Compressão Brotli (melhor que gzip)
    viteCompression({ 
      algorithm: "brotliCompress",
      threshold: 1024,
      filter: /\.(js|css|html|json|svg)$/,
      ext: '.br',
    }),
    // Injetar Service Worker (somente em produção)
    mode === "production" && injectSWPlugin(),
    // Visualizador de bundle (apenas em análise)
    mode === 'analyze' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ].filter(Boolean),
  
  optimizeDeps: {
    include: ["date-fns", "react", "react-dom", "framer-motion"],
    exclude: ["@react-router/dev", "i18next-fs-backend"],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  
  server: {
    proxy: {
      "/api": {
        target: process.env.API_URL || process.env.VITE_API_URL || "http://localhost:3000",
        changeOrigin: true,
      },
    },
    // Configurações de performance do dev server
    preTransformRequests: true,
  },
  
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    sourcemap: mode === 'development',
    
    // Otimizações de chunk
    rollupOptions: {
      output: {
        // Manual chunks para melhor caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core
            if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
              return 'react-core';
            }
            // React Router
            if (id.includes('react-router') || id.includes('@react-router')) {
              return 'router';
            }
            // Framer Motion (pesado, separado)
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Utilidades
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }
            // Charts e analytics
            if (id.includes('recharts') || id.includes('react-simple-maps')) {
              return 'charts';
            }
            // Resto das libs
            return 'vendor';
          }
          
          // Separar páginas grandes do dashboard
          if (id.includes('/routes/dashboard-')) {
            return 'dashboard';
          }
        },
        // Nomenclatura de chunks para melhor caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name || '';
          if (info.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (info.match(/\.(png|jpg|jpeg|gif|webp|svg|avif)$/)) {
            return 'assets/img/[name]-[hash][extname]';
          }
          if (info.match(/\.(woff2?|ttf|otf|eot)$/)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    
    // Otimizações CSS
    cssCodeSplit: true,
    
    // Tamanho limite de aviso
    chunkSizeWarningLimit: 500,
    
    // Assets inline para arquivos pequenos
    assetsInlineLimit: 4096, // 4KB
  },
  
  // Configurações do esbuild
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },
  
  // Resolução de módulos
  resolve: {
    alias: {
      '~': '/app',
      '@': '/app',
    },
  },
}));