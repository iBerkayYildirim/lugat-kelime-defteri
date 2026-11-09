import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Göreli yol: aynı derleme hem GitHub Pages alt dizininde hem Netlify/Vercel kökünde çalışır.
  base: './',
  plugins: [react(), tailwindcss()],
})
