import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// import.meta.dirname, e não __dirname: o Vite avisa que __dirname vai parar
// de funcionar quando o carregador nativo de config virar o padrão.
const raiz = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(raiz, "./src"),
    },
  },
  build: {
    // Duas páginas: o site (index.html) e o aviso de privacidade
    // (privacidade.html), que a Cloudflare serve em /privacidade.
    rolldownOptions: {
      input: {
        index: path.resolve(raiz, "index.html"),
        privacidade: path.resolve(raiz, "privacidade.html"),
      },
    },
  },
});
