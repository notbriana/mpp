import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const keyPath = process.env.HTTPS_KEY_PATH || 'frontend/localhost-key.pem'
const certPath = process.env.HTTPS_CERT_PATH || 'frontend/localhost-cert.pem'

let httpsOptions = false
try {
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsOptions = { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
  }
} catch (e) { /* ignore */ }

export default defineConfig({
  plugins: [react()],
  server: {
    https: httpsOptions,
    host: '0.0.0.0',
    port: 5173
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js'
  },
})