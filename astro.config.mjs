// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://bekovo.cz',

  vite: {
    plugins: [tailwindcss()]
  },

  // Prototypy pod /test* nejsou v navigaci ani v sitemapě (viz src/layouts/ProtoLayout.astro).
  integrations: [react(), sitemap({ filter: (page) => !/^\/test\d?(\/|$)/.test(new URL(page).pathname) })]
});