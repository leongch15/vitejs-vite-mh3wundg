#!/usr/bin/env node

/**
 * Capi — Secret scanner léger v2
 *
 * Usage :
 * node scripts/check-secrets.mjs
 *
 * Objectif :
 * détecter les vraies clés évidentes dans les fichiers du projet avant un push,
 * sans bloquer sur les placeholders documentaires du type :
 * - OPENAI_API_KEY=sk-xxx
 * - GEMINI_API_KEY=ta clé Gemini
 * - GEMINI_API_KEY=configurée côté Vercel
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

const TEXT_EXTENSIONS = new Set([
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
]);

const SECRET_ASSIGNMENT_NAMES = [
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'STRIPE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'AMADEUS_API_KEY',
  'AMADEUS_API_SECRET',
  'SKYSCANNER_API_KEY',
  'EXPEDIA_RAPID_API_KEY',
  'VIATOR_API_KEY',
  'GETYOURGUIDE_API_KEY',
  'GOOGLE_PLACES_API_KEY',
];

const PATTERNS = [
  {
    name: 'OpenAI key',
    regex: /sk-[A-Za-z0-9_\-]{20,}/g,
  },
  {
    name: 'Gemini / Google API key',
    regex: /AIza[0-9A-Za-z_\-]{20,}/g,
  },
];

const SECRET_ASSIGNMENT_REGEX = new RegExp(
  `(${SECRET_ASSIGNMENT_NAMES.join('|')})\\s*[:=]\\s*["']?([^"'\\n\\r]+)`,
  'g'
);

const isTextFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  return TEXT_EXTENSIONS.has(ext) || path.basename(filePath).startsWith('.env');
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

const normalize = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const isPlaceholderValue = (value = '') => {
  const raw = String(value).trim();
  const normalized = normalize(raw);

  if (!raw) return true;

  return (
    normalized.includes('xxx') ||
    normalized.includes('...') ||
    normalized.includes('placeholder') ||
    normalized.includes('example') ||
    normalized.includes('exemple') ||
    normalized.includes('ta cle') ||
    normalized.includes('ta vraie cle') ||
    normalized.includes('ta cle gemini') ||
    normalized.includes('ta cle openai') ||
    normalized.includes('your key') ||
    normalized.includes('your_api_key') ||
    normalized.includes('configured') ||
    normalized.includes('configuree') ||
    normalized.includes('cote vercel') ||
    normalized.includes('server only') ||
    normalized === 'ta' ||
    normalized === 'value' ||
    normalized === 'secret' ||
    normalized === 'sk-' ||
    normalized === 'aiza' ||
    normalized === 'sk-xxx' ||
    normalized === 'sk-...' ||
    normalized === 'aiza-xxx' ||
    normalized === 'aiza...'
  );
};

const looksLikeRealSecretValue = (name, value) => {
  const raw = String(value).trim();

  if (isPlaceholderValue(raw)) return false;

  if (name === 'OPENAI_API_KEY') {
    return /^sk-[A-Za-z0-9_\-]{20,}/.test(raw);
  }

  if (name === 'GEMINI_API_KEY' || name === 'GOOGLE_PLACES_API_KEY') {
    return /^AIza[0-9A-Za-z_\-]{20,}/.test(raw);
  }

  // Pour les futurs providers, on considère suspecte une valeur longue et non placeholder.
  return raw.length >= 20 && !raw.includes(' ');
};

const findings = [];

for (const file of walk(ROOT)) {
  const rel = relative(file);
  const content = fs.readFileSync(file, 'utf8');

  for (const pattern of PATTERNS) {
    const matches = [...content.matchAll(pattern.regex)];

    for (const match of matches) {
      const value = match[0];

      if (isPlaceholderValue(value)) continue;

      findings.push({
        file: rel,
        type: pattern.name,
        match: value.slice(0, 80),
      });
    }
  }

  const assignments = [...content.matchAll(SECRET_ASSIGNMENT_REGEX)];

  for (const assignment of assignments) {
    const name = assignment[1];
    const value = assignment[2];

    if (!looksLikeRealSecretValue(name, value)) continue;

    findings.push({
      file: rel,
      type: 'Potential secret assignment',
      match: `${name}=${value}`.slice(0, 80),
    });
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
