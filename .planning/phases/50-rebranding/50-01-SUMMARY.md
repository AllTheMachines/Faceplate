---
phase: 50-rebranding
plan: 01
subsystem: branding
tags: [rebranding, github, documentation]

# Dependency graph
requires:
  - phase: 49 (Element Bug Fixes)
    provides: stable codebase ready for rebranding
provides:
  - AllTheMachines/Faceplate branding across codebase
  - Updated GitHub issue URLs
  - Updated export headers
  - Consistent documentation references
affects: [51-pro-elements, 52-license-system]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/services/helpService.ts
    - src/components/Layout/HelpPanel.tsx
    - src/services/export/jsGenerator.ts
    - docs/FACEPLATE_SYNC_GUIDE.md
    - docs/FACEPLATE_DOCUMENTATION.md
    - docs/WORKFLOW.md
    - .claude/commands/generate-ui.md
    - package-lock.json
    - src/buildInfo.ts

key-decisions:
  - "Local filesystem paths (D:\\___ATM\\vst3-webview-ui-designer) not modified as they reference dev environment not repo name"
  - "Pre-existing TypeScript build errors not addressed - out of scope for rebranding"

patterns-established: []

# Metrics
duration: 3min
completed: 2026-02-03
---

# Phase 50 Plan 01: Rebranding Summary

**Complete brand name replacement from allthecodeDev/vst3-webview-ui-designer to AllTheMachines/Faceplate across source, docs, and commands**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-03T11:09:46Z
- **Completed:** 2026-02-03T11:12:49Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Replaced all GitHub URLs from allthecodeDev/vst3-webview-ui-designer to AllTheMachines/Faceplate
- Updated export JS header comment to reference Faceplate
- Updated all documentation to reference new brand names
- Regenerated package-lock.json with 'faceplate' package name
- Updated buildInfo.ts timestamp

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace all brand name references** - `9497690` (chore)
2. **Task 2: Regenerate package-lock.json and verify** - `694300c` (chore)

## Files Created/Modified
- `src/services/helpService.ts` - Updated GitHub issue URLs (2 locations)
- `src/components/Layout/HelpPanel.tsx` - Updated bug report URL
- `src/services/export/jsGenerator.ts` - Updated export header comment
- `docs/FACEPLATE_SYNC_GUIDE.md` - Updated all GitHub/raw.githubusercontent URLs
- `docs/FACEPLATE_DOCUMENTATION.md` - Updated GitHub URLs, author, directory references
- `docs/WORKFLOW.md` - Updated clone and path references
- `.claude/commands/generate-ui.md` - Updated project reference
- `package-lock.json` - Regenerated with 'faceplate' name
- `src/buildInfo.ts` - Updated timestamp

## Decisions Made
- Local filesystem paths in generate-vst.md (D:\___ATM\vst3-webview-ui-designer) left unchanged as they reference the dev environment location, not the repository name
- Pre-existing TypeScript build errors noted but not addressed (out of scope for rebranding)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors in codebase cause npm build to fail, but this is documented in STATE.md as expected behavior (dev server works fine)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Codebase fully rebranded to AllTheMachines/Faceplate
- Ready for Phase 51 (Pro Elements) implementation
- GitHub repository rename may be needed for issue URLs to work (when repo is made public/private)

---
*Phase: 50-rebranding*
*Completed: 2026-02-03*
