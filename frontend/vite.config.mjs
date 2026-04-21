import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Auto-discover all HTML pages as Rollup entry points for build
const htmlEntries = Object.fromEntries(
  readdirSync(__dirname)
    .filter(f => f.endsWith('.html'))
    .map(f => [f.replace('.html', ''), resolve(__dirname, f)])
)

export default defineConfig({
  root: __dirname,
  server: {
    port: 3000,
    open: '/index.html',
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: htmlEntries,
    },
  },
})
