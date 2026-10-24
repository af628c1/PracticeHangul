import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { pages, SITE_URL, type PageMeta } from './src/data/seo'

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const pageUrl = (page: PageMeta) => SITE_URL + (page.path === '/' ? '/' : `${page.path}/`)

function seoHead(page: PageMeta): string {
  const title = escapeHtml(page.title)
  const description = escapeHtml(page.description)
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${pageUrl(page)}" />`,
    page.noindex ? '<meta name="robots" content="noindex" />' : '',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Practice Hangul" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${pageUrl(page)}" />`,
    `<meta property="og:image" content="${SITE_URL}/og-image.png" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ]
    .filter(Boolean)
    .join('\n    ')
}

/**
 * Writes an HTML file for every page so each URL is a real page with its own
 * title and description for search engines, plus a 404 fallback and sitemap.
 */
function seoPages(): Plugin {
  let outDir = 'dist'
  return {
    name: 'seo-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      const render = (page: PageMeta) =>
        template.replace(/<!-- seo:start[\s\S]*?seo:end -->/, seoHead(page))

      for (const page of pages) {
        const file = path.join(outDir, page.path, 'index.html')
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, render(page))
      }
      // GitHub Pages serves this for unknown paths; the app sends them home
      fs.writeFileSync(path.join(outDir, '404.html'), render({ ...pages[0], noindex: true }))

      const urls = pages
        .filter((p) => !p.noindex)
        .map((p) => `  <url><loc>${pageUrl(p)}</loc></url>`)
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Served from the root of practicehangul.com
  base: '/',
  plugins: [react(), tailwindcss(), seoPages()],
})
