import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'pokemon-data.json'],
      manifest: {
        name: 'Pokémon GO 屬性相剋計算機',
        short_name: 'PoGo相剋',
        description: '提供精確的屬性相剋計算與寶可夢招式查詢',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000 
      }
    })
  ],
})
