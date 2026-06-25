import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// base set for GitHub Pages project site at /kailash-2026/.
// When the v4 build replaces the v3 root, switch base to '/'.
export default defineConfig({
  base: '/kailash-2026/',
  plugins: [react(), tailwindcss()],
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
