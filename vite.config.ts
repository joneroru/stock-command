import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR can be disabled via the DISABLE_HMR environment variable.
      // File watching is disabled when DISABLE_HMR is true to avoid rapid reload loops.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save system resources.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
