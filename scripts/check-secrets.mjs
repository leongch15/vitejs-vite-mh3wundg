#!/usr/bin/env node

/**
 * Capi — Secret scanner léger
 *
 * Usage :
 * node scripts/check-secrets.mjs
 *
 * Objectif :
 * détecter les clés évidentes dans les fichiers du projet avant un push.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'dist-ssr',
  '.vercel',
  '.bolt',
  '.stackblitz',
]);

const IGNORED_FILES = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
]);

const ALLOWED_DOC_FILES = new Set([
  'docs/SECRETS_SECURITY.md',
  'docs/PRODUCT_DECISIONS.md',
  'docs/PROJECT_STATUS.md',
  'docs/lot_6_2_README.md',
  'docs/lot_6_3_README.md',
  'docs/lot_6_4_README.md',
  'docs/lot_6_5_README.md',
]);

const PATTERNS = [
  {
    name: 'OpenAI key',
    regex: /sk-[A-Za-z0-9_\-]{20,}/g,
  },
  {
    name: 'Gemini / Google API key',
    regex: /AIza[0-9A-Za-z_\-]{20,}/g,
  },
  {
    name: 'Potential secret assignment',
    regex: /(OPENAI_API_KEY|GEMINI_API_KEY|STRIPE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY)\s*[:=]\s*["']?[^"'\n\s]+/g,
  },
];

const isTextFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  return [
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.json',
    '.md',
    '.html',
    '.css',
    '.env',
    '.local',
    '.yml',
    '.yaml',
    '.txt',
  ].includes(ext) || path.basename(filePath).startsWith('.env');
};

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (IGNORED_FILES.has(entry.name)) continue;
    if (!isTextFile(fullPath)) continue;

    files.push(fullPath);
  }

  return files;
};

const relative = (filePath) => path.relative(ROOT, filePath).replaceAll('\\', '/');

const findings = [];

for (const file of walk(ROOT)) {
  const rel = relative(file);
  const content = fs.readFileSync(file, 'utf8');

  for (const pattern of PATTERNS) {
    const matches = [...content.matchAll(pattern.regex)];

    for (const match of matches) {
      const value = match[0];

      const isPlaceholder =
        value.includes('sk-xxx') ||
        value.includes('sk-...') ||
        value.includes('AIza...') ||
        value.includes('configurée') ||
        value.includes('configured') ||
        value.includes('ta_clé') ||
        value.includes('ta clé');

      const isAllowedDoc = ALLOWED_DOC_FILES.has(rel) && isPlaceholder;

      if (isPlaceholder || isAllowedDoc) continue;

      findings.push({
        file: rel,
        type: pattern.name,
        match: value.slice(0, 80),
      });
    }
  }
}

if (findings.length > 0) {
  console.error('\n❌ Secrets potentiels détectés :\n');

  for (const finding of findings) {
    console.error(`- ${finding.type} dans ${finding.file}`);
    console.error(`  ${finding.match}`);
  }

  console.error('\nAction : supprime la clé, rotate la clé si elle a été exposée, puis relance le scan.\n');
  process.exit(1);
}

console.log('✅ Aucun secret évident détecté.');
