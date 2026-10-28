// Site de ZTi : pages fixes publiées sur GitHub Pages.
// L'adresse est donnée par la publication (.github/workflows/publier.yml) : https://<compte>.github.io/ pour le dépôt
// <compte>.github.io, https://<compte>.github.io/<dépôt>/ pour un autre dépôt. En local : http://localhost.
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://zeltuminitiative-com.github.io',
  base: process.env.SITE_BASE || '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
