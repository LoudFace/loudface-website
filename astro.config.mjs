import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // Ensure compatibility with Cloudflare Workers
      external: ['node:fs', 'node:path', 'node:fs/promises'],
    },
  },
  security: {
    checkOrigin: true,
  },
});
