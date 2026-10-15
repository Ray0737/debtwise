import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'fonts/lineseedsansth_rg.woff2'],
      manifest: {
        name: 'Debtwise', short_name: 'Debtwise', start_url: '/', display: 'standalone',
        theme_color: '#EEE9DF', background_color: '#EEE9DF',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: { navigateFallbackDenylist: [/^\/api\//] },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'api/**/*.test.ts'] },
})
