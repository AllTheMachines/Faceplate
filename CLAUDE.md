# Claude Code Instructions

Project-specific instructions for Claude when working on this codebase.

## Build Timestamp

**Always update `src/buildInfo.ts` when finishing code changes.**

This file contains a timestamp displayed in the UI (LeftPanel logo area). Update it with the current time in CET.

**IMPORTANT: Do NOT guess the time. Always run this command first:**

```bash
date "+%d %b %H:%M CET"
```

Then use the exact output in buildInfo.ts:

```typescript
export const lastUpdated = '30 Jan 21:35 CET'
```

Format: `DD Mon HH:MM CET`

## Releases

**ALWAYS test before creating a release.**

Before running `gh release create`:

1. Run `npm run dev` and verify the UI loads correctly
2. Test the specific fix or feature that prompted the release
3. Check for console errors in the browser

Never create multiple rapid-fire releases to fix issues - test locally first, then release once when it works.

## Embed Deploy (GitHub Pages)

**After every release**, update the GitHub Pages embed build:

```bash
npm run build:embed
git checkout gh-pages
# Remove old assets
git rm -rf assets/ index.html FACEPLATE_LOGO_UI.png .nojekyll 2>/dev/null
# Copy new build
cp -r dist/* .
touch .nojekyll
git add index.html assets/ .nojekyll FACEPLATE_LOGO_UI.png
git commit -m "deploy: update embed build"
git push origin gh-pages
git checkout main
```

This keeps the live embed at `https://allthemachines.github.io/Faceplate/` in sync with releases.
