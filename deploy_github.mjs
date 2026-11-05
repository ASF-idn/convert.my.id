#!/usr/bin/env node
/**
 * ============================================================================
 * convert.my.id — One-Click Auto Sitemap & GitHub Repo Re-Uploader
 * ============================================================================
 * Script otomatis untuk:
 * 1. Men-generate ulang `public/sitemap.xml` terbaru (`generate_sitemap.mjs`)
 * 2. Menjalankan `git add .`
 * 3. Menjalankan `git commit` dengan timestamp otomatis
 * 4. Menjalankan `git push origin main` (Auto Re-Upload ke GitHub Repository)
 *
 * Cara pakai di terminal:
 *   npm run deploy
 * ============================================================================
 */

import { execSync } from 'node:child_process';

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  console.log('🚀 [1/4] Membuat ulang sitemap.xml terbaru...');
  run('node generate_sitemap.mjs');

  console.log('📦 [2/4] Menambahkan semua perubahan file ke Git...');
  run('git add -A');

  // Cek apakah ada perubahan file yang perlu di-commit
  const status = execSync('git status --porcelain').toString().trim();
  if (!status) {
    console.log('ℹ️ Tidak ada perubahan file baru. Mencoba push ke GitHub...');
  } else {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const customMsg = process.argv.slice(2).join(' ');
    const commitMsg =
      customMsg || `chore: auto-update repo & sitemap.xml (${timestamp})`;

    console.log(`📝 [3/4] Melakukan commit: "${commitMsg}"...`);
    run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
  }

  console.log('☁️ [4/4] Meng-upload (push) otomatis ke GitHub branch main...');
  run('git pull --rebase origin main');
  run('git push -u origin main');

  console.log(
    '\n✅ Selesai! Seluruh file & sitemap.xml terbaru berhasil di-upload ke GitHub.'
  );
} catch (err) {
  console.error(
    '\n❌ Gagal melakukan auto-upload ke GitHub:',
    err instanceof Error ? err.message : err
  );
  process.exit(1);
}
