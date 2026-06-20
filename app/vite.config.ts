import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// base set for GitHub Pages project site at /kailash-2026/.
// When the v4 build replaces the v3 root, switch base to '/'.
export default defineConfig({
  base: '/kailash-2026/',
  plugins: [react(), tailwindcss()],
})
