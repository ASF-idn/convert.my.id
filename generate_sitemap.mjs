#!/usr/bin/env node
/**
 * ============================================================================
 * convert.my.id — Automated XML Sitemap Generator (Node.js Build Script)
 * ============================================================================
 * Menghasilkan file `public/sitemap.xml` (dan `out/sitemap.xml` jika folder
 * hasil build `out/` sudah ada) secara otomatis tanpa library tambahan.
 *
 * Mencakup:
 * 1. Daftar halaman utama/statis (`STATIC_PAGES`) yang mudah ditambah manual.
 * 2. Seluruh halaman converter dinamis (`200+ tools`) dari `data/converters.json`.
 *
 * Cara menjalankan manual:
 *   node generate_sitemap.mjs
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Domain utama website
const SITE_URL = 'https://convert.my.id';

// 1. Daftar Halaman Utama / Statis (Mudah diperbarui atau ditambah manual)
const STATIC_PAGES = [
  {
    path: '/',
    changefreq: 'daily',
    priority: '1.0',
  },
  // Contoh jika nanti ingin menambah halaman statis baru:
  // { path: '/about', changefreq: 'monthly', priority: '0.7' },
  // { path: '/privacy-policy', changefreq: 'monthly', priority: '0.5' },
];

// Lokasi file sumber data dinamis & target output sitemap
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

function generateSitemapXml() {
  // Gunakan format tanggal YYYY-MM-DD sesuai standar Google Sitemap
  // agar tidak memicu commit duplikat setiap detik di CI/CD
  const lastModDate = new Date().toISOString().split('T')[0];

  // Baca daftar tools dinamis dari data/converters.json
  let dynamicTools = [];
  if (fs.existsSync(CONVERTERS_JSON_PATH)) {
    const rawJson = fs.readFileSync(CONVERTERS_JSON_PATH, 'utf-8');
    dynamicTools = JSON.parse(rawJson);
  } else {
    console.warn(
      `[WARN] File ${CONVERTERS_JSON_PATH} tidak ditemukan. Hanya membuat sitemap untuk halaman statis.`
    );
  }

  // Gabungkan URL statis dan URL dinamis (/convert/[slug])
  const allUrls = [
    ...STATIC_PAGES.map((page) => ({
      loc: `${SITE_URL}${page.path === '/' ? '' : page.path}`,
      lastmod: lastModDate,
      changefreq: page.changefreq,
      priority: page.priority,
    })),
    ...dynamicTools.map((tool) => ({
      loc: `${SITE_URL}/convert/${tool.slug}`,
      lastmod: lastModDate,
      changefreq: 'weekly',
      priority: '0.9',
    })),
  ];

  // Susun dokumen XML sesuai standar protokol sitemaps.org
  const urlEntriesXml = allUrls
    .map(
      (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join('\n');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntriesXml}
</urlset>
`;

  // Pastikan folder public/ tersedia dan simpan public/sitemap.xml
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  const publicSitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  fs.writeFileSync(publicSitemapPath, xmlContent, 'utf-8');
  console.log(
    `✅ Berhasil membuat ${publicSitemapPath} (${allUrls.length} total URL)`
  );

  // Jika folder build statis `out/` sudah ada, salin juga ke `out/sitemap.xml`
  if (fs.existsSync(OUT_DIR)) {
    const outSitemapPath = path.join(OUT_DIR, 'sitemap.xml');
    fs.writeFileSync(outSitemapPath, xmlContent, 'utf-8');
    console.log(`✅ Berhasil menyalin sitemap ke ${outSitemapPath}`);
  }
}

generateSitemapXml();
