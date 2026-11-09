#!/usr/bin/env node
/**
 * ============================================================================
 * convert.my.id — Automated XML Sitemap, robots.txt & Cloudflare _headers Generator
 * ============================================================================
 * Menghasilkan:
 * 1. `public/sitemap.xml` (Standar protokol sitemaps.org 0.9 murni untuk Googlebot)
 * 2. `public/robots.txt` (Mengarahkan Googlebot ke https://convert.my.id/sitemap.xml)
 * 3. `public/_headers` (Konfigurasi resmi Cloudflare Pages agar /sitemap.xml
 *    selalu dikirim dengan HTTP Header `Content-Type: application/xml; charset=utf-8`)
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://convert.my.id';

// 1. Daftar Halaman Utama / Statis
const STATIC_PAGES = ['/'];

const CONVERTERS_JSON_PATH = path.join(__dirname, 'data', 'converters.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const OUT_DIR = path.join(__dirname, 'out');

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSeoFiles() {
  let dynamicTools = [];
  if (fs.existsSync(CONVERTERS_JSON_PATH)) {
    const rawJson = fs.readFileSync(CONVERTERS_JSON_PATH, 'utf-8');
    dynamicTools = JSON.parse(rawJson);
  }

  // Gabungkan URL statis dan 200 URL converter dinamis
  const allUrls = [
    ...STATIC_PAGES.map((p) => (p === '/' ? `${SITE_URL}/` : `${SITE_URL}${p}`)),
    ...dynamicTools.map((tool) => `${SITE_URL}/convert/${tool.slug}`),
  ];

  // 1. Format XML Sitemap yang bersih & 100% kompatibel dengan Google Search Console
  const urlEntriesXml = allUrls
    .map((url) =>
      [
        '  <url>',
        `    <loc>${escapeXml(url.trim())}</loc>`,
        '  </url>',
      ].join('\n')
    )
    .join('\n');

  const xmlContent =
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      urlEntriesXml,
      '</urlset>',
    ].join('\n') + '\n';

  // 2. robots.txt
  const robotsContent =
    [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${SITE_URL}/sitemap.xml`,
    ].join('\n') + '\n';

  // 3. File _headers khusus Cloudflare Pages agar Googlebot selalu menerima Content-Type XML yang valid
  const headersContent =
    [
      '/sitemap.xml',
      '  Content-Type: application/xml; charset=utf-8',
      '  Cache-Control: public, max-age=0, must-revalidate',
      '  X-Content-Type-Options: nosniff',
      '',
      '/sitemap-main.xml',
      '  Content-Type: application/xml; charset=utf-8',
      '  Cache-Control: public, max-age=0, must-revalidate',
      '  X-Content-Type-Options: nosniff',
      '',
      '/BingSiteAuth.xml',
      '  Content-Type: application/xml; charset=utf-8',
      '  Cache-Control: public, max-age=0, must-revalidate',
      '  X-Content-Type-Options: nosniff',
      '',
      '/robots.txt',
      '  Content-Type: text/plain; charset=utf-8',
      '  Cache-Control: public, max-age=0, must-revalidate',
    ].join('\n') + '\n';

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xmlContent, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-main.xml'), xmlContent, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsContent, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, '_headers'), headersContent, 'utf-8');

  console.log(
    `✅ Berhasil membuat public/sitemap.xml & public/sitemap-main.xml (${allUrls.length} URL), public/robots.txt, dan public/_headers`
  );

  if (fs.existsSync(OUT_DIR)) {
    fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), xmlContent, 'utf-8');
    fs.writeFileSync(path.join(OUT_DIR, 'sitemap-main.xml'), xmlContent, 'utf-8');
    fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), robotsContent, 'utf-8');
    fs.writeFileSync(path.join(OUT_DIR, '_headers'), headersContent, 'utf-8');
    console.log(`✅ Berhasil menyalin file SEO ke folder out/`);
  }
}

generateSeoFiles();
