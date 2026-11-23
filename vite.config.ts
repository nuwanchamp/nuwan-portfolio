import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// @encenlab/star-dust is installed from a GitHub release tag (see package.json).
// Release tags ship the built dist-lib/, so it's consumed like any other package.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
