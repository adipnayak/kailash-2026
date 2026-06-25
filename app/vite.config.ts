import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// base set for GitHub Pages project site at /kailash-2026/.
// When the v4 build replaces the v3 root, switch base to '/'.
export default defineConfig({
  base: '/kailash-2026/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Kailash Mansarovar Yatra 2026',
        short_name: 'Kailash 2026',
        description: '13-day Hindu pilgrimage tracker for the yatra to Mt Kailash and Lake Manasarovar (7 to 19 July 2026).',
        theme_color: '#c69347',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/kailash-2026/',
        scope: '/kailash-2026/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache all static assets: HTML, JS, CSS, fonts, SVG, images.
        globPatterns: ['**/*.{html,js,css,woff2,svg,png,jpg,jpeg,gif,webp}'],
        // The Material Symbols woff2 font is ~4 MB. Raise the limit to 5 MB
        // so Workbox precaches it and the site renders correctly offline.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // CartoDB tile layers: light_all and dark_all.
            // CacheFirst because tile content at a given z/x/y never changes.
            // 1000 entries (pre-warm fills ~400 tiles for parikrama + cities;
            // remaining budget covers tiles fetched interactively). 30-day TTL.
            urlPattern: /^https:\/\/.*basemaps\.cartocdn\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cartodb-tiles',
              expiration: { maxEntries: 1000, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            // Open-Meteo weather API. NetworkFirst with 3s timeout so fresh
            // forecasts are preferred; 24h fallback when offline.
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            // ipapi.co for coarse geolocation. NetworkFirst, 2s timeout,
            // 1h cache so offline users can still trigger the location-aware
            // features if they were cached recently.
            urlPattern: /^https:\/\/ipapi\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ipapi',
              networkTimeoutSeconds: 2,
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            // OSRM road routing. Road geometry is stable; CacheFirst is safe.
            // 30-day TTL, 100-entry cap.
            urlPattern: /^https:\/\/router\.project-osrm\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osrm',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Split heavy third-party deps into their own chunks so they are
        // cached independently from app code and from each other.
        // framer-motion + @gsap/react + gsap -> animation-libs chunk
        // leaflet -> map-libs chunk (already lazy but keep isolated)
        // recharts + d3 -> chart-libs chunk (already lazy but keep isolated)
        manualChunks(id) {
          if (id.includes('node_modules/gsap') || id.includes('node_modules/@gsap')) {
            return 'animation-libs'
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'animation-libs'
          }
          if (id.includes('node_modules/leaflet')) {
            return 'map-libs'
          }
          if (
            id.includes('node_modules/recharts') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/victory-')
          ) {
            return 'chart-libs'
          }
          if (id.includes('node_modules/react') && !id.includes('node_modules/react-')) {
            return 'react-core'
          }
        },
      },
    },
  },
})
