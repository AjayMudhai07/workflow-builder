import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@App': path.resolve(__dirname, './src/app'),
      '@Assets': path.resolve(__dirname, './src/assets'),
      '@Components': path.resolve(__dirname, './src/components'),
      '@Constants': path.resolve(__dirname, './src/constants'),
      '@Hooks': path.resolve(__dirname, './src/hooks'),
      '@Layout': path.resolve(__dirname, './src/layout'),
      '@Routes': path.resolve(__dirname, './src/routes'),
      '@Services': path.resolve(__dirname, './src/services'),
      '@Utils': path.resolve(__dirname, './src/utils'),
      '@View': path.resolve(__dirname, './src/view'),
    }
  }
})