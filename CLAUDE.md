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
