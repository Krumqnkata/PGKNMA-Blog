import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { buildSiteKnowledge } from "./src/content/site-knowledge";

/**
 * Texts that exist only in the frontend (FAQ, rules, contacts, team, page map…)
 * become /site-knowledge.json, which the backend indexes for the AI assistant.
 */
function siteKnowledge(): Plugin {
  return {
    name: "pgknma-site-knowledge",
    configureServer(server) {
      server.middlewares.use("/site-knowledge.json", (_req, res) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(buildSiteKnowledge()));
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "site-knowledge.json",
        source: JSON.stringify(buildSiteKnowledge(), null, 2),
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_DEV_BACKEND_URL || "http://127.0.0.1:8000";

  return {
  server: {
    host: "::",
    // Django uses port 8000 locally. Keeping Vite on a separate port prevents
    // the frontend dev server from intercepting requests intended for the API.
    port: 5173,
    proxy: {
      "/api": { target: backendUrl, changeOrigin: true },
      "/files": { target: backendUrl, changeOrigin: true },
      "/valentines": { target: backendUrl, changeOrigin: true },
    },
  },
  plugins: [react(), siteKnowledge(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
            // Data fetching
            'vendor-query': ['@tanstack/react-query'],
            
            // UI компоненти и икони
            'vendor-ui': ['lucide-react', 'yet-another-react-lightbox', 'embla-carousel-react'],
            
            // PDF визуализация (разделяме ядрото от работника)
            'pdf-viewer': ['@react-pdf-viewer/core', '@react-pdf-viewer/default-layout'],
            'pdf-worker': ['pdfjs-dist'],
            
            // Markdown обработка
            'markdown-base': ['react-markdown', 'remark-gfm', 'rehype-raw'],
            
            // Графики
            'charts': ['recharts'],
            
            // Анимации и частици
            'particles': ['tsparticles', '@tsparticles/react'],
          }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});
