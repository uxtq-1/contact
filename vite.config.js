import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true, // Generate source maps for debugging production builds
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contact: resolve(__dirname, 'contact.html'),
        join: resolve(__dirname, 'join.html'),
        // TODO: Add other HTML pages here when they are created
        // Example:
        // 'business-operations': resolve(__dirname, 'business-operations.html'),
        // 'contact-center': resolve(__dirname, 'contact-center.html'),
        // 'it-support': resolve(__dirname, 'it-support.html'),
        // 'professionals': resolve(__dirname, 'professionals.html'),
      }
    },
    // Target modern browsers for better performance and smaller builds,
    // but ensure compatibility with the project's requirements.
    // target: 'esnext', // or specific versions like 'es2020'
    // Minify options are enabled by default for production builds.
    // terserOptions can be specified here if customization is needed,
    // but Vite's defaults are generally good.
  },
  server: {
    open: true, // Automatically open the app in the browser on server start
    // port: 3000, // Optional: specify dev server port
  },
  // Vite automatically handles CSS preprocessors if installed (e.g., SASS, LESS)
  // and CSS minification during the build process.
});
