#!/usr/bin/env node
/**
 * ============================================================================
 * convert.my.id — Clean XML Sitemap, robots.txt & Cloudflare _headers Generator
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://convert.my.id';
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

function buildSitemapXml(urls) {
  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `<url><loc>${escapeXml(url.trim())}</loc></url>`),
    '</urlset>',
  ];

  return xmlLines.join('\n') + '\n';
}

function generateSeoFiles() {
  let dynamicTools = [];
  if (fs.existsSync(CONVERTERS_JSON_PATH)) {
    const rawJson = fs.readFileSync(CONVERTERS_JSON_PATH, 'utf-8');
    dynamicTools = JSON.parse(rawJson);
  }

  const allUrls = [
    ...STATIC_PAGES.map((p) => {
      const cleanPath = String(p).trim();
      return cleanPath === '/' ? `${SITE_URL}/` : `${SITE_URL}${cleanPath}`;
    }),
    ...dynamicTools.map((tool) => `${SITE_URL}/convert/${String(tool.slug).trim()}`),
  ];

  const xmlContent = buildSitemapXml(allUrls);

  const robotsContent = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');

  const headersContent = [
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
    '',
  ].join('\n');

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xmlContent, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-main.xml'), xmlContent, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsContent, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, '_headers'), headersContent, 'utf-8');

  if (fs.existsSync(OUT_DIR)) {
    fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), xmlContent, 'utf-8');
    fs.writeFileSync(path.join(OUT_DIR, 'sitemap-main.xml'), xmlContent, 'utf-8');
    fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), robotsContent, 'utf-8');
    fs.writeFileSync(path.join(OUT_DIR, '_headers'), headersContent, 'utf-8');
  }

  console.log(`✅ Sitemap berhasil dibuat (${allUrls.length} URL) tanpa indentasi/spasi ekstra.`);
}

generateSeoFiles();
