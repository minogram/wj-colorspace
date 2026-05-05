import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon-120.png',
        'apple-touch-icon-152.png',
        'apple-touch-icon-167.png',
        'apple-touch-icon-180.png',
        'apple-splash-1179x2556.png',
        'apple-splash-1290x2796.png',
        'apple-splash-1668x2388.png',
        'apple-splash-2048x2732.png',
      ],
      manifest: {
        id: '/wj-colorspace/',
        name: 'WJ Colorspace Explorer',
        short_name: 'WJ Colorspace',
        description: 'CIELAB 3D 컬러스페이스를 앱처럼 설치하고 오프라인에서도 탐색할 수 있는 시각화 도구',
        theme_color: '#0a0f1e',
        background_color: '#0a0f1e',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ko',
        start_url: '/wj-colorspace/',
        scope: '/wj-colorspace/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'jsdelivr-assets',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@react-three/drei') || id.includes('three-stdlib')) {
            return 'drei-runtime'
          }

          if (id.includes('@react-three/fiber') || id.includes('react-use-measure') || id.includes('its-fine')) {
            return 'fiber-runtime'
          }

          if (id.includes('/three/examples/')) {
            return 'three-examples'
          }

          if (id.includes('/three/src/')) {
            const segment = id.split('/three/src/')[1]?.split('/')[0]

            if (segment) {
              return `three-${segment}`
            }
          }

          if (id.includes('/three/')) {
            return 'three-shared'
          }

          if (id.includes('virtual:pwa-register') || id.includes('workbox-window')) {
            return 'pwa-runtime'
          }
        },
      },
    },
  },
  base: '/wj-colorspace/',
})
