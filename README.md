# Deploy dash normalizer

**Category: Build utilities | Format: Node.js script and agent skill**

Replace Unicode em dashes with ASCII hyphens in generated text files before deployment. An optional flag also replaces en dashes. The script uses Node.js built-ins and has no package dependencies.

Use it when a site or publishing pipeline needs a consistent punctuation convention. It changes files in place, so run it against generated output or a version-controlled working copy.

## Quick start

With Node.js 18 or later:

```bash
git clone https://github.com/morrimoz/cursor-skill-normalize-deploy-dashes.git
cd cursor-skill-normalize-deploy-dashes
node scripts/normalize-deploy-dashes.mjs path/to/output
```

For example, the text `A service\u2014with support` becomes `A service-with support` when the input contains the actual Unicode character U+2014.

## Options

| Option | Behaviour |
| --- | --- |
| Directory arguments | Scan the supplied directories recursively |
| `--include-en-dash` | Also replace U+2013 |
| `NORMALIZE_DASH_DIRS` | Supply default directories when no directory arguments are given |
| `--help` | Print usage |

```bash
node scripts/normalize-deploy-dashes.mjs --include-en-dash public
```

## Add to a build

Copy the script into the project's scripts folder, then run it after generators and before upload:

```json
{
  "scripts": {
    "normalize:dashes": "node scripts/normalize-deploy-dashes.mjs public"
  }
}
```

For a typical generated `dist` directory, pass `dist` explicitly as a root. A nested directory named `dist` is skipped during traversal. Missing paths are reported and skipped; a zero exit status does not prove that every supplied path existed.

## Agent integration

Clone this repository into `~/.cursor/skills/normalize-deploy-dashes` to use it as a Cursor skill. [SKILL.md](SKILL.md) includes deployment-hook examples for Firebase, Vercel, Netlify and GitHub Actions.

## Limits

The script replaces characters in supported text files without parsing their syntax. Review its use on source files, quoted strings and content where punctuation has meaning. It does not translate literal backslash-u escape sequences.

## Related tool

[Webflow to clean code](https://github.com/morrimoz/webflow-to-clean-code) provides a broader static-site migration workflow.

[MIT license](LICENSE)
