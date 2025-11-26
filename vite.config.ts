import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["0c1570379d91.ngrok-free.app"],
    proxy: {
      "/leetcode-proxy": {
        target: "https://leetcode.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/leetcode-proxy/, "/graphql"),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
