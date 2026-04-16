import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Ethanol_Optimiseur/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Ethanol 50',
        short_name: 'Ethanol 50',
        description: 'Calculateur de mélange E85 / essence pour réservoir FlexFuel',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/Ethanol_Optimiseur/',
        icons: [
          {
            src: '/Ethanol_Optimiseur/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/Ethanol_Optimiseur/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/Ethanol_Optimiseur/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  build: {
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
})
