import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dharmsen.github.io',
  integrations: [sitemap()],
  prefetch: true,
});
