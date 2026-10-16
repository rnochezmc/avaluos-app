import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expone la app en la red local (0.0.0.0) para probar en celular
    port: 5173
  }
})
