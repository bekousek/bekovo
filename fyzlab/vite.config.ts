/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@engine': r('./src/engine'),
      '@worker': r('./src/worker'),
      '@render': r('./src/render'),
      '@editor': r('./src/editor'),
      '@app': r('./src/app'),
      '@share': r('./src/share'),
    },
  },
  build: {
    target: 'es2022',
    // 'hidden': mapy se pořád generují (dají se dohledat k chybě), ale
    // nejsou linkované z buildu, takže je běžný návštěvník nestahuje.
    sourcemap: 'hidden',
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20_000,
  },
});
