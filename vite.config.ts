import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split large dependencies
          'vendor-react': ['react', 'react-dom'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/utilities'],
          'vendor-zustand': ['zustand'],

          // Element renderer chunks - split by category
          // Prepares for future React.lazy adoption per category
          'elements-controls': [
            './src/components/elements/renderers/controls/index.ts',
          ],
          'elements-displays': [
            './src/components/elements/renderers/displays/index.ts',
          ],
          'elements-containers': [
            './src/components/elements/renderers/containers/index.ts',
          ],
          'elements-decorative': [
            './src/components/elements/renderers/decorative/index.ts',
          ],
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
})
