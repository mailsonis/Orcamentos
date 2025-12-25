
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Define process.env para evitar erros no navegador
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY || ''),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false
    // Removido 'minify: terser' para usar o esbuild padrão do Vite
  }
});
