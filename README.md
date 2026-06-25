# cursor-skill-normalize-deploy-dashes

Cursor Agent Skill + portable Node script to replace Unicode **em dashes** (`—`) with ASCII **hyphens** (`-`) in deploy-facing text files.

## Why

Em dashes in shipped copy are a common AI-writing tell. Normalizing at deploy time lets authors and generators use either dash while production stays consistent.

## Quick start

### 1. Copy the script

```bash
mkdir -p scripts
curl -fsSL https://raw.githubusercontent.com/morrimoz/cursor-skill-normalize-deploy-dashes/main/scripts/normalize-deploy-dashes.mjs -o scripts/normalize-deploy-dashes.mjs
```

### 2. Run before deploy

```bash
node scripts/normalize-deploy-dashes.mjs public dist
```

### 3. Wire into your deploy hook

**Firebase** — add to `firebase.json` hosting `predeploy` (after any generators):

```json
"predeploy": [
  "npm run build",
  "node scripts/normalize-deploy-dashes.mjs public"
]
```

**npm** — add to `package.json`:

```json
"normalize:dashes": "node scripts/normalize-deploy-dashes.mjs public"
```

See [SKILL.md](./SKILL.md) for Vercel, Netlify, GitHub Actions, and Cursor agent integration.

## Install as a Cursor skill

**Personal (all projects):**

```bash
git clone https://github.com/morrimoz/cursor-skill-normalize-deploy-dashes.git
cp -R cursor-skill-normalize-deploy-dashes ~/.cursor/skills/normalize-deploy-dashes
```

**Per repository:**

```bash
mkdir -p .cursor/skills/normalize-deploy-dashes/scripts
cp SKILL.md .cursor/skills/normalize-deploy-dashes/
cp scripts/normalize-deploy-dashes.mjs .cursor/skills/normalize-deploy-dashes/scripts/
```

Then ask Cursor: *"Use the normalize-deploy-dashes skill to wire em dash replacement into our deploy."*

## Options

| Flag / env | Effect |
|------------|--------|
| `--include-en-dash` | Also replace en dashes (`–`) |
| `NORMALIZE_DASH_DIRS` | Default directories when no CLI args |

## Requirements

- Node.js 18+ (uses built-in `fs` / `path` only — no dependencies)

## License

MIT
