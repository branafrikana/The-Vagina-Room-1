import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({ 
        registerType: 'autoUpdate',
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB limit for precaching
        },
        manifest: {
          name: 'The Vagina Room',
          short_name: 'Vagina Room',
          description: 'A sanctuary for intimate wellness and reproductive education.',
          theme_color: '#C41E3A',
          background_color: '#0a0a0a',
          icons: [
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'build',
      emptyOutDir: true,
      target: 'esnext',
      chunkSizeWarningLimit: 2000,
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
