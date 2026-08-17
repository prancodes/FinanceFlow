import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineConfig(({ ssrBuild }) => ({
  plugins: [
    react(),
    tailwindcss(),
    !ssrBuild && sitemap({
      hostname: 'https://financeflow24.vercel.app',
      dynamicRoutes: [
        '/',
        '/login',
        '/signup',
        '/privacy',
        '/terms'
      ]
    })
  ].filter(Boolean),
  ssr: {
    noExternal: ['react-helmet-async']
  },
  build: {
    chunkSizeWarningLimit: 1000
  }
}));
