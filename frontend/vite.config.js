import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({ 
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // This is the magic line that forces it to work in dev mode!
      },
      manifest: {
        name: 'Knopper Pharmacy System',
        short_name: 'Knopper POS',
        description: 'Management system for Knopper Pharmacy',
        theme_color: '#0046ad',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})