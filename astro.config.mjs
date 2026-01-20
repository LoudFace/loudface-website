import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  // REQUIRED: Must match your Webflow Cloud mount path
  // Your environment is at /customsite, so all assets need this prefix
  // See: https://developers.webflow.com/webflow-cloud/bring-your-own-app
  base: '/customsite',
  build: {
    // Ensures static assets use the correct path prefix
    assetsPrefix: '/customsite',
  },
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
