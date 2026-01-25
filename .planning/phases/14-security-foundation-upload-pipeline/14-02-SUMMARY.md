---
phase: 14-security-foundation-upload-pipeline
plan: 02
subsystem: security
tags: [dompurify, svg, xss, sanitization, security, vitest]

# Dependency graph
requires:
  - phase: 14-01
    provides: SVG validation and test infrastructure
provides:
  - DOMPurify-based SVG sanitization with strict allowlist
  - sanitizeSVG function removing XSS vectors
  - SANITIZE_CONFIG for consistent sanitization across app
  - Comprehensive test coverage (20 test cases)
affects: [14-03, 14-04, asset-import, svg-rendering, export]

# Tech tracking
tech-stack:
  added: [isomorphic-dompurify]
  patterns:
    - "Strict allowlist security: ALLOWED_TAGS over USE_PROFILES"
    - "Block external URLs with ALLOWED_URI_REGEXP: /^(?!.*:)/"
    - "Export config for hook usage in future SafeSVG component"

key-files:
  created:
    - src/lib/svg-sanitizer.ts
  modified:
    - src/lib/svg-sanitizer.test.ts

key-decisions:
  - "Use isomorphic-dompurify for Node and browser compatibility"
  - "KEEP_CONTENT: true to preserve text content in SVG elements"
  - "Strict allowlist approach over blocklist for defense-in-depth"
  - "Block ALL external URLs (only fragment refs #id allowed)"

patterns-established:
  - "TDD with RED-GREEN-REFACTOR cycle: failing test → implementation → cleanup"
  - "Security-first configuration: explicit allowlist of safe elements/attributes"
  - "Export sanitization config for potential hook usage"

# Metrics
duration: 5min
completed: 2026-01-25
---

# Phase 14 Plan 02: SVG Sanitizer Summary

**DOMPurify-based SVG sanitization with strict allowlist blocking script injection, foreignObject, SMIL animations, and external URLs**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-25T22:54:40Z
- **Completed:** 2026-01-25T23:00:29Z
- **Tasks:** 1 (TDD with 3 commits: feat + refactor)
- **Files modified:** 2

## Accomplishments

- Implemented sanitizeSVG function with comprehensive security configuration
- Removed all XSS vectors: scripts, foreignObject, SMIL animations, external URLs
- Preserved safe SVG elements: shapes, text, gradients, filters, transforms, clipping
- 20 comprehensive test cases all passing (100% coverage of security rules)

## Task Commits

TDD cycle for single comprehensive task:

1. **Task 1 (GREEN): Implement SVG sanitizer** - `ed0b511` (feat)
2. **Task 1 (REFACTOR): Clean up config** - `8efd457` (refactor)

_Note: RED phase test was pre-created in 14-01 but verified failing before implementation_

## Files Created/Modified

- `src/lib/svg-sanitizer.ts` - DOMPurify-based sanitization with strict allowlist config
  - sanitizeSVG(svgContent: string): string - Main sanitization function
  - SANITIZE_CONFIG - Security configuration with ALLOWED_TAGS, ALLOWED_ATTR, FORBID_TAGS
  - Blocks: script, foreignObject, iframe, embed, SMIL animations
  - Blocks: all external URLs via ALLOWED_URI_REGEXP
  - Preserves: safe shapes, text (with content), gradients, filters, transforms, clipping

- `src/lib/svg-sanitizer.test.ts` - Comprehensive test coverage (351 lines, 20 tests)
  - Script injection prevention tests
  - ForeignObject removal tests
  - SMIL animation blocking tests
  - External URL blocking tests (http://, javascript:, data:)
  - Safe element preservation tests (shapes, text, gradients, transforms, clipping)
  - Edge case tests (empty SVG, mixed content, only dangerous content)

## Decisions Made

**1. Use isomorphic-dompurify over dompurify**
- Rationale: Works in both Node (tests) and browser (runtime)
- Eliminates need for separate jsdom setup for DOMPurify
- Single dependency for both environments

**2. KEEP_CONTENT: true to preserve text content**
- Rationale: DOMPurify by default strips text content from elements
- Required for SVG text elements to render properly
- Security not compromised (text content has no XSS vectors)

**3. Strict allowlist approach (ALLOWED_TAGS) over USE_PROFILES**
- Rationale: Research showed USE_PROFILES conflicts with ALLOWED_TAGS
- Explicit allowlist provides defense-in-depth
- Easier to audit what's allowed vs what's forbidden

**4. Block ALL external URLs with ALLOWED_URI_REGEXP: /^(?!.*:)/**
- Rationale: Only fragment references (#id) are safe
- Blocks http://, https://, javascript:, data:, etc.
- Prevents external resource loading and XSS via URLs

**5. Include 'a' (anchor) tag in allowlist**
- Rationale: SVG links are safe when href is sanitized by URI regexp
- Common use case for interactive SVGs
- External hrefs blocked automatically by ALLOWED_URI_REGEXP

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test expectation for empty SVG closing tag format**
- **Found during:** GREEN phase test execution
- **Issue:** Test expected `</svg>` but DOMPurify outputs self-closing `<svg/>` for empty elements
- **Fix:** Updated test to accept both formats (self-closing is valid XML and more standard)
- **Files modified:** src/lib/svg-sanitizer.test.ts (line 309)
- **Verification:** All 20 tests pass
- **Committed in:** ed0b511 (feat commit)

---

**Total deviations:** 1 auto-fixed (1 bug in test)
**Impact on plan:** Test had overly strict expectation. Self-closing tags are valid and preferred XML format. No security or functionality impact.

## Issues Encountered

None - plan executed smoothly with expected TDD workflow.

## Authentication Gates

None - all work performed locally without external service requirements.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for 14-03 (SafeSVG Component):**
- Core sanitization logic implemented and tested
- SANITIZE_CONFIG exported for hook usage
- All XSS vectors blocked while preserving safe SVG features

**Ready for future phases:**
- Upload pipeline (14-04): Can use sanitizeSVG on file upload
- Asset rendering: SafeSVG component will wrap sanitizeSVG
- Export: Can re-sanitize on export for extra safety

**No blockers or concerns.**

---
*Phase: 14-security-foundation-upload-pipeline*
*Completed: 2026-01-25*
