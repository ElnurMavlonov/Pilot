import { defineConfig } from 'vite'

export default defineConfig({
  // Vite auto-detects index.html as the entry point
  // No additional config needed for a static HTML/JS/CSS project
  build: {
    outDir: 'dist',
  },
})
