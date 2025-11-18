import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [['babel-plugin-react-compiler']],
    },
  })],
  test: {
    globals: true,
    testTimeout: 50000,
    environment: 'jsdom',
    setupFiles: './src/test/test-setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
