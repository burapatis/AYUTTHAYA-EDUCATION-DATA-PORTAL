import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const site = process.env.PUBLIC_SITE_URL ?? 'https://example.github.io';
const base = process.env.PUBLIC_BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [react()],
  build: {
    assets: 'assets',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
