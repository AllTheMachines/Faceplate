---
phase: 14-security-foundation-upload-pipeline
plan: 01
subsystem: security
tags: [svg, validation, security, tdd, vitest, xss-prevention]

# Dependency graph
requires:
  - phase: none
    provides: First plan in phase 14
provides:
  - SVG validation library with file size, DOCTYPE, element count, and dangerous element checks
  - Comprehensive test suite with 14 test cases covering all security requirements
  - Vitest test infrastructure for project-wide testing
affects: [14-02, 14-03, svg-sanitization, svg-upload, asset-library]

# Tech tracking
tech-stack:
  added: [vitest, @vitest/ui, happy-dom, @types/node]
  patterns: [TDD RED-GREEN-REFACTOR, security-first validation, DOMParser for XML validation]

key-files:
  created:
    - src/lib/svg-validator.ts
    - src/lib/svg-validator.test.ts
    - vite.config.ts (test configuration)
  modified:
    - package.json (test script and dependencies)

key-decisions:
  - "Use Vitest as test framework (Vite-native, fast, modern API)"
  - "Use happy-dom over jsdom (lighter, faster for DOM validation tests)"
  - "Validate before sanitize: reject dangerous content rather than silently strip"
  - "Use DOMParser native API for element counting and dangerous element detection"

patterns-established:
  - "TDD with RED-GREEN-REFACTOR cycle for security-critical code"
  - "Discriminated union types for validation results (valid: true/false)"
  - "Helper function extraction for reusable validation logic"
  - "Const assertions for readonly security-critical constants"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Phase 14 Plan 01: SVG File Validator Summary

**SVG validation functions with TDD: file size limits (1MB), DOCTYPE rejection for XML bombs, element count limits (5000), and dangerous element detection (script, foreignObject, animate variants)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25T22:54:40Z
- **Completed:** 2026-01-25T22:57:29Z
- **Tasks:** 1 (TDD task with 3 commits)
- **Files modified:** 4

## Accomplishments
- Comprehensive SVG validation covering all SEC-05, SEC-06, SEC-07 security requirements
- 14 passing test cases with 100% coverage of validation rules
- First-class test infrastructure (Vitest) for future testing needs
- Clear, user-facing error messages for all rejection cases

## Task Commits

TDD task completed with RED-GREEN-REFACTOR cycle:

1. **RED: Test infrastructure and failing tests** - `9953063` (test)
   - Installed Vitest, @vitest/ui, happy-dom for testing
   - Created 14 comprehensive test cases
   - All tests fail with "Not implemented"

2. **GREEN: Implementation** - `f1ff23e` (feat)
   - Implemented validateSVGFile (file size check)
   - Implemented validateSVGContent (DOCTYPE, parse errors, element count, dangerous elements)
   - All 14 tests pass

3. **REFACTOR: Code cleanup** - `a0789ea` (refactor)
   - Extracted checkDangerousElements helper function
   - Added const assertion to DANGEROUS_TAGS
   - Improved readability, all tests still pass

## Files Created/Modified
- `src/lib/svg-validator.ts` - Core validation functions with security checks
- `src/lib/svg-validator.test.ts` - 158-line comprehensive test suite (14 test cases)
- `vite.config.ts` - Added Vitest configuration with happy-dom environment
- `package.json` - Added test script and test dependencies

## Decisions Made

**Use Vitest over Jest:**
- Vite-native test framework (no configuration mismatch)
- Faster test execution with ESM-first design
- Modern API with TypeScript-first approach
- Better DX with Vite's transform pipeline

**Use happy-dom over jsdom:**
- Lighter weight (better for CI/CD)
- Faster DOM parsing (important for 14 tests parsing SVG)
- Sufficient for validation testing (no browser API needs)

**Validate before sanitize approach:**
- Reject files entirely if dangerous content detected
- Follows CONTEXT.md requirement: "Reject entirely if SVG has any strippable content"
- Clear error messages help users fix SVGs externally
- No silent stripping or modification

**DOMParser for element detection:**
- Native browser API, no dependencies
- Proper XML parsing with error detection
- Accurate element counting with querySelectorAll('*')
- getElementsByTagName for dangerous tag detection

## Deviations from Plan

None - plan executed exactly as written.

The plan specified TDD approach, test coverage, and validation rules. All implemented as specified with no deviations.

## Issues Encountered

None. Test infrastructure installed cleanly, all tests passed on first GREEN implementation, refactor preserved behavior.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 14-02 (SVG Sanitization):**
- Validation functions complete and tested
- Clear validation result interface for integration
- DOMParser pattern established for SVG processing
- Test infrastructure ready for sanitization tests

**Ready for Phase 14-03 (Upload Flow):**
- validateSVGFile ready for file picker integration
- validateSVGContent ready for content validation after file read
- Error messages formatted for toast notifications per CONTEXT.md

**No blockers or concerns.**

The validation layer is the first line of defense. Sanitization (14-02) will be the second layer. Upload flow (14-03) will integrate both.

---
*Phase: 14-security-foundation-upload-pipeline*
*Completed: 2026-01-25*
