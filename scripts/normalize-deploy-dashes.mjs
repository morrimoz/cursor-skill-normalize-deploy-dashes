#!/usr/bin/env node
/**
 * Replace Unicode em dashes (U+2014) with ASCII hyphens in deploy-facing text files.
 *
 * Run after content generators, before static hosting upload.
 *
 * Usage:
 *   node scripts/normalize-deploy-dashes.mjs [dir ...]
 *   NORMALIZE_DASH_DIRS="dist public" node scripts/normalize-deploy-dashes.mjs
 *
 * Also published as a portable Cursor skill:
 *   https://github.com/morrimoz/cursor-skill-normalize-deploy-dashes
 */
import fs from 'node:fs';
import path from 'node:path';

const EM_DASH = '\u2014';
const EN_DASH = '\u2013';
const TEXT_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.css',
  '.txt',
  '.json',
  '.md',
  '.mdx',
  '.xml',
  '.svg',
  '.vue',
  '.svelte',
]);

const SKIP_DIR_NAMES = new Set([
  '.git',
  'node_modules',
  '.next',
  'dist',
  '.cache',
  '.firebase',
]);

function parseArgs(argv) {
  const dirs = [];
  let includeEnDash = false;

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--include-en-dash') {
      includeEnDash = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
    dirs.push(arg);
  }

  if (dirs.length === 0 && process.env.NORMALIZE_DASH_DIRS) {
    dirs.push(...process.env.NORMALIZE_DASH_DIRS.split(/[\s,]+/).filter(Boolean));
  }

  return { dirs, includeEnDash };
}

function printHelp() {
  console.log(`Usage: node normalize-deploy-dashes.mjs [options] [dir ...]

Replace em dashes (${EM_DASH}) with ASCII hyphens (-) in text files before deploy.

Options:
  --include-en-dash   Also replace en dashes (${EN_DASH})
  -h, --help          Show this help

Environment:
  NORMALIZE_DASH_DIRS   Space- or comma-separated directories when no args are passed
`);
}

function shouldSkipDir(name) {
  return SKIP_DIR_NAMES.has(name);
}

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function normalizeContent(content, includeEnDash) {
  let next = content.split(EM_DASH).join('-');
  if (includeEnDash) {
    next = next.split(EN_DASH).join('-');
  }
  return next;
}

function countReplacements(content, includeEnDash) {
  let count = 0;
  for (const ch of content) {
    if (ch === EM_DASH || (includeEnDash && ch === EN_DASH)) count += 1;
  }
  return count;
}

function walkDir(rootDir, includeEnDash, stats) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      walkDir(fullPath, includeEnDash, stats);
      continue;
    }

    if (!entry.isFile() || !isTextFile(fullPath)) continue;

    const original = fs.readFileSync(fullPath, 'utf8');
    if (!original.includes(EM_DASH) && !(includeEnDash && original.includes(EN_DASH))) {
      continue;
    }

    const updated = normalizeContent(original, includeEnDash);
    if (updated === original) continue;

    fs.writeFileSync(fullPath, updated, 'utf8');
    stats.files += 1;
    stats.replacements += countReplacements(original, includeEnDash);
  }
}

function main() {
  const { dirs, includeEnDash } = parseArgs(process.argv);

  if (dirs.length === 0) {
    console.error('[normalize-dashes] No directories provided.');
    printHelp();
    process.exit(1);
  }

  const stats = { files: 0, replacements: 0 };

  for (const dir of dirs) {
    const resolved = path.resolve(dir);
    if (!fs.existsSync(resolved)) {
      console.warn(`[normalize-dashes] Skipping missing directory: ${resolved}`);
      continue;
    }
    if (!fs.statSync(resolved).isDirectory()) {
      console.warn(`[normalize-dashes] Skipping non-directory: ${resolved}`);
      continue;
    }
    walkDir(resolved, includeEnDash, stats);
  }

  if (stats.files === 0) {
    console.log('[normalize-dashes] No em dashes found.');
    return;
  }

  console.log(
    `[normalize-dashes] Updated ${stats.files} file(s), ${stats.replacements} dash replacement(s).`,
  );
}

main();
