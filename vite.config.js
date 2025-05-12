import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    // Change from 'terser' to 'esbuild' (which is included in Vite)
    minify: "esbuild",
    sourcemap: true,
  },
})