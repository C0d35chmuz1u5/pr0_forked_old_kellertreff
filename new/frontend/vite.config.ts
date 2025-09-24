import * as path from "node:path";

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [
    react({
      babel: {
        // Ref: https://react.dev/learn/react-compiler
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],

  // https://divotion.com/blog/how-to-configure-import-aliases-in-vite-typescript-and-jest
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
})
