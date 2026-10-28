---
name: normalize-deploy-dashes
description: >-
  Replaces Unicode em dashes with ASCII hyphens in deploy-facing text files before
  hosting or static deploy. Use when setting up deploy hooks, Firebase/Vercel/Netlify
  predeploy, CI publish steps, or when the user wants to strip em dashes from shipped
  content to match a punctuation convention.
---

# Normalize Deploy Dashes

Ship ASCII hyphens (U+002D) instead of em dashes (U+2014). Run **after** content generators, **before** upload.

## Why

A deploy-time normalization step applies the same punctuation convention after all content generators have run.

## Script

```bash
node scripts/normalize-deploy-dashes.mjs <dir> [dir ...]
```

Optional: `--include-en-dash` also replaces en dashes (U+2013).

Environment fallback when no dirs are passed:

```bash
NORMALIZE_DASH_DIRS="dist public" node scripts/normalize-deploy-dashes.mjs
```

Scans text files (`.html`, `.js`, `.jsx`, `.css`, `.json`, `.md`, `.txt`, etc.). Skips `node_modules`, `.git`, `.next`, `dist`, `.firebase`.

## Integration patterns

Pick the hook that runs **last** among your build/generate steps, **before** the host uploads files.

### Firebase Hosting (`firebase.json`)

```json
"predeploy": [
  "npm run build",
  "node scripts/normalize-deploy-dashes.mjs public"
]
```

If generators run in predeploy (e.g. `docs:sync`), put normalize **after** them:

```json
"predeploy": [
  "npm run docs:sync",
  "node scripts/normalize-deploy-dashes.mjs public"
]
```

### npm script

```json
{
  "scripts": {
    "normalize:dashes": "node scripts/normalize-deploy-dashes.mjs public dist",
    "deploy": "npm run build && npm run normalize:dashes && firebase deploy --only hosting"
  }
}
```

### Vercel / Netlify

Add to `build` command or `postbuild`:

```bash
node scripts/normalize-deploy-dashes.mjs .next/server/app out public
```

Point at whatever directories your framework emits for static HTML/JS/CSS.

### GitHub Actions

```yaml
- run: npm run build
- run: node scripts/normalize-deploy-dashes.mjs dist
- uses: FirebaseExtended/action-hosting-deploy@v0
```

### Generic CI

Any step between **artifact build** and **publish** works. Idempotent - safe to run every deploy.

## Agent workflow

When the user asks to add this to a project:

1. Copy `scripts/normalize-deploy-dashes.mjs` into the repo (or vendor from this skill).
2. Identify deploy output directory (`public`, `dist`, `out`, `.next/static`, etc.).
3. Wire the script into the existing deploy hook (predeploy, postbuild, CI step) **after** generators.
4. Add an npm script for local runs: `"normalize:dashes": "node scripts/normalize-deploy-dashes.mjs <dirs>"`.
5. Run once and confirm `[normalize-dashes] Updated N file(s)` or `No em dashes found.`

Do **not** add postdeploy restore - hyphens are the desired shipped state.

## Install this skill

**Cursor (personal, all projects):**

```bash
git clone https://github.com/morrimoz/cursor-skill-normalize-deploy-dashes.git
cp -R cursor-skill-normalize-deploy-dashes ~/.cursor/skills/normalize-deploy-dashes
```

**Cursor (per repo):**

```bash
mkdir -p .cursor/skills/normalize-deploy-dashes
curl -fsSL https://raw.githubusercontent.com/morrimoz/cursor-skill-normalize-deploy-dashes/main/SKILL.md -o .cursor/skills/normalize-deploy-dashes/SKILL.md
curl -fsSL https://raw.githubusercontent.com/morrimoz/cursor-skill-normalize-deploy-dashes/main/scripts/normalize-deploy-dashes.mjs -o .cursor/skills/normalize-deploy-dashes/scripts/normalize-deploy-dashes.mjs
```

Also copy `scripts/normalize-deploy-dashes.mjs` into the project root `scripts/` folder.
