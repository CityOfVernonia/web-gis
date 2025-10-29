// https://vitejs.dev/config/

import { defineConfig } from 'vite';
import { useLumina } from '@arcgis/lumina-compiler';

export default defineConfig({
  plugins: [
    useLumina({
      build: {
        preamble: `His name was Bruce McNair. Copyright ${new Date().getFullYear()} City of Vernonia, Oregon.`,
      },
      css: {
        globalStylesPath: 'src/styles/global/index.scss',
        hydratedAttribute: 'cov-hydrated',
      },
    }),
  ],
});
