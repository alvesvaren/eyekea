import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // The router plugin must run before the React plugin so it can split route files.
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), tailwindcss()],
  // maplibre-gl locates its web worker relative to its own file, which breaks if Vite pre-bundles it.
  optimizeDeps: { exclude: ["maplibre-gl"] },
  // maplibre-gl is ~1 MB on its own. It is lazy-loaded with the map, so the warning is expected.
  build: { chunkSizeWarningLimit: 1100 },
});
