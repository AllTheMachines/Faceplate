# Claude Code Instructions

Project-specific instructions for Claude when working on this codebase.

## Build Timestamp

**Always update `src/buildInfo.ts` when finishing code changes.**

This file contains a timestamp displayed in the UI (LeftPanel logo area). Update it with the current time in CET:

```typescript
export const lastUpdated = '27 Jan 07:22 CET'
```

Format: `DD Mon HH:MM CET`
