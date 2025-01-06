import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // Map '@' to the 'src' folder
      util: "util/",
    },
  },
  server: {
    port: 3000, // Set the desired port number
  },
});
