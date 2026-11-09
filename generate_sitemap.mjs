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
const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';

// 1. Daftar Halaman Utama / Statis
const STATIC_PAGES = ['/'];

const CONVERTERS_JSON_PATH = path.join(__dirname, 'data', 'converters.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const OUT_DIR = path.join(__dirname, 'out');

function escapeXml(unsafe) {
  return String(unsafe)
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeUrl(rawUrl) {
  const cleaned = String(rawUrl).trim().replace(/\s+/g, '');
  return escapeXml(cleaned);
}

/**
 * Membersihkan spasi ilegal pada tag XML, atribut, dan nilai <loc>
 */
function sanitizeXmlSitemap(xmlString) {
  return xmlString
    .replace(/^\uFEFF/, '') // Hapus BOM jika ada
    .replace(/\r\n/g, '\n') // Paksa baris baru LF murni
    .replace(/<\s+/g, '<') // Hapus spasi setelah '<' (misal: `< url>` -> `<url>`)
    .replace(/<\s*\/\s*/g, '</') // Hapus spasi pada closing tag (misal: `< / url >` -> `</url>`)
    .replace(/\s+>/g, '>') // Hapus spasi sebelum '>' (misal: `<url >` -> `<url>`)
    .replace(/\s*\?>/g, '?>') // Hapus spasi sebelum '?>'
    .replace(/xmlns\s*=\s*"\s*([^"]*?)\s*"/g, 'xmlns="$1"') // Bersihkan spasi atribut xmlns
    .replace(/<loc>\s*([^<]*?)\s*<\/loc>/g, '<loc>$1</loc>'); // Bersihkan spasi di dalam <loc>...</loc>
}

/**
 * Memvalidasi sintaks XML Sitemap agar dijamin 100% lolos parser Google Search Console
 */
function validateXmlSitemap(xmlString) {
  const lines = xmlString.trim().split('\n');

  if (lines[0] !== '<?xml version="1.0" encoding="UTF-8"?>') {
    throw new Error(`Baris pertama XML tidak valid: ${lines[0]}`);
  }

  if (lines[1] !== `<urlset xmlns="${SITEMAP_NAMESPACE}">`) {
    throw new Error(`Tag <urlset> tidak valid: ${lines[1]}`);
  }

  if (lines[lines.length - 1] !== '</urlset>') {
    throw new Error(`Tag penutup </urlset> tidak valid: ${lines[lines.length - 1]}`);
  }

  // Pastikan tidak ada spasi ilegal pada tag atau nilai atribut
  if (/<[/?]?[a-zA-Z0-9_-]+\s+>/.test(xmlString) || /xmlns\s*=\s*"\s+|\s+"/.test(xmlString)) {
    throw new Error('Ditemukan spasi ilegal di dalam tag atau atribut XML.');
  }

  // Pastikan setiap <loc> bersih tanpa spasi di awal/akhir URL
  const locMatches = [...xmlString.matchAll(/<loc>(.*?)<\/loc>/g)];
  for (const match of locMatches) {
    const locValue = match[1];
    if (!locValue.startsWith('https://') || /\s/.test(locValue)) {
      throw new Error(`Nilai <loc> tidak valid atau mengandung spasi: "${locValue}"`);
    }
  }
}

function generateSeoFiles() {
  let dynamicTools = [];
  if (fs.existsSync(CONVERTERS_JSON_PATH)) {
    const rawJson = fs.readFileSync(CONVERTERS_JSON_PATH, 'utf-8');
    dynamicTools = JSON.parse(rawJson);
  }

  // Gabungkan URL statis dan 200 URL converter dinamis tanpa spasi ekstra
  const allUrls = [
    ...STATIC_PAGES.map((p) => {
      const cleanPath = String(p).trim();
      return cleanPath === '/' ? `${SITE_URL}/` : `${SITE_URL}${cleanPath}`;
    }),
    ...dynamicTools.map((tool) => `${SITE_URL}/convert/${String(tool.slug).trim()}`),
  ];

  // 1. Format XML Sitemap yang bersih & 100% kompatibel dengan Google Search Console
  const urlEntriesXml = allUrls
    .map((url) =>
      [
        '  <url>',
        `    <loc>${normalizeUrl(url)}</loc>`,
        '  </url>',
      ].join('\n')
    )
    .join('\n');

  const rawXmlContent =
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<urlset xmlns="${SITEMAP_NAMESPACE}">`,
      urlEntriesXml,
      '</urlset>',
    ].join('\n') + '\n';

  const xmlContent = sanitizeXmlSitemap(rawXmlContent);
  validateXmlSitemap(xmlContent);

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

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xmlContent, { encoding: 'utf-8' });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-main.xml'), xmlContent, { encoding: 'utf-8' });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsContent, { encoding: 'utf-8' });
  fs.writeFileSync(path.join(PUBLIC_DIR, '_headers'), headersContent, { encoding: 'utf-8' });

  console.log(
    `✅ Berhasil membuat & memvalidasi public/sitemap.xml & public/sitemap-main.xml (${allUrls.length} URL), public/robots.txt, dan public/_headers`
  );

  if (fs.existsSync(OUT_DIR)) {
    fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), xmlContent, { encoding: 'utf-8' });
    fs.writeFileSync(path.join(OUT_DIR, 'sitemap-main.xml'), xmlContent, { encoding: 'utf-8' });
    fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), robotsContent, { encoding: 'utf-8' });
    fs.writeFileSync(path.join(OUT_DIR, '_headers'), headersContent, { encoding: 'utf-8' });
    console.log(`✅ Berhasil menyalin file SEO tervalidasi ke folder out/`);
  }
}

generateSeoFiles();
