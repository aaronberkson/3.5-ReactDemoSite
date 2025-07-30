// vite.config.js
import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  resolve: {
    alias: {
      // ensure all "three" imports (and its example files) resolve correctly
      three: path.resolve(__dirname, "node_modules/three")
    }
  },

  optimizeDeps: {
    // pre-bundle three.js and any example modules you plan to import
include: [
  "three",
  "three/examples/jsm/loaders/SVGLoader.js",
  "three/src/extras/ShapeUtils.js",
  "three/examples/jsm/controls/OrbitControls.js",
  "three/examples/jsm/loaders/GLTFLoader.js"
]

  },

  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true
      }
    })
  ],

  server: {
    proxy: {
      "/api": {
        target:       process.env.VITE_FEEDBACK_API,
        changeOrigin: true,
        secure:       false,
        rewrite:      (path) => path.replace(/^\/api/, "")
      }
    }
  }
})
