import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'bloodbridge'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? `/${repoName}/` : '/',
  plugins: [react()],
})
