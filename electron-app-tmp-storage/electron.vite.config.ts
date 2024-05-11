import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';
import '@sveltejs/kit'; // having this fixes cannot find vite module in next line
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts'),
        },
        output: {
          format: 'es',
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts'),
        },
        output: {
          format: 'es',
        },
      },
    },
  },
  renderer: {
    plugins: [sveltekit()],
  },
});
