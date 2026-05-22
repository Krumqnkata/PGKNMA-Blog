import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8000,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
            
            // Синтактично подчертаване (основният ти проблем - 1.1MB)
            'syntax-highlight': ['highlight.js'],
            
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
}));
