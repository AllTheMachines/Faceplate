# Phase 12: Export & Round-Trip Testing - Research

**Researched:** 2026-01-25
**Domain:** Testing, validation, serialization integrity
**Confidence:** HIGH

## Summary

Phase 12 verifies the integrity of the entire export/import pipeline: built-in templates load correctly, JUCE exports produce correct code with the dynamic bridge pattern, and round-trip operations (save → load → export → reimport) preserve state. This is a **validation phase**, not a feature-building phase.

The existing codebase already has:
1. Two built-in templates (Effect Starter, Instrument Starter) in `templates/*.json`
2. Complete export system with JUCE bundle and HTML preview modes
3. Project serialization with Zod schemas for validation
4. Dynamic JUCE bridge pattern (implemented 2026-01-25, tested in INSTvst)

Research confirms no new libraries are needed. This phase requires **systematic verification** using manual testing procedures, not automated test frameworks (no Jest/Vitest in package.json, adding now would be scope creep).

**Primary recommendation:** Create manual test procedures with visual verification checklists rather than automated test infrastructure.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | 4.3.6 | Schema validation | Industry standard for runtime type checking, already used for project serialization |
| JSZip | 3.10.1 | ZIP generation | Export bundles require ZIP archives |
| browser-fs-access | 0.38.0 | File I/O | Progressive enhancement for file save/load |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.0.10 | State management | Template loading, canvas state verification |
| React 18 | 18.3.1 | UI framework | Manual test UI if needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual testing | Vitest + React Testing Library | Adding test framework now is scope creep; v1 ships without automated tests, add in v1.1 if needed |
| Visual verification | Snapshot testing | Snapshot tests brittle for canvas-based UI; manual verification more reliable for this use case |
| JSON diff | deep-equal, lodash.isEqual | Manual JSON inspection sufficient for 2 templates + round-trip; no dependency needed |

**Installation:**
```bash
# No new packages needed - all testing done with existing stack
```

## Architecture Patterns

### Recommended Test Structure
```
.planning/phases/12-export-roundtrip-testing/
├── 12-RESEARCH.md              # This file
├── 12-01-PLAN.md               # Manual test procedures
├── 12-VERIFICATION.md          # Test results checklist
└── test-artifacts/             # Screenshots, exported ZIPs (gitignored)
```

### Pattern 1: Template Loading Verification
**What:** Load each built-in template and verify elements render at correct positions
**When to use:** Template integrity checks
**Example:**
```typescript
// In templateStore.ts (already exists):
// templates/effect-starter.json
// templates/instrument-starter.json

// Manual verification:
// 1. Click "Load Template" → "Effect Starter"
// 2. Verify 6 elements appear (title, status, knob, label, meter, label)
// 3. Check positions match JSON (x, y properties)
// 4. Verify canvas dimensions (500x300)
```

### Pattern 2: Export Verification (JUCE Bundle)
**What:** Export template and verify generated files contain correct patterns
**When to use:** Code generation integrity checks
**Example:**
```typescript
// In codeGenerator.ts (already exists):
// exportJUCEBundle() → ZIP with 6 files

// Manual verification:
// 1. Export "Effect Starter" as JUCE bundle
// 2. Extract ZIP, verify 6 files:
//    - index.html, styles.css, components.js
//    - bindings.js (dynamic bridge pattern)
//    - bindings.cpp (4 native functions)
//    - README.md
// 3. Search bindings.js for:
//    - "createJUCEFunctionWrappers"
//    - "nextResultId++" (NOT Math.random())
//    - "__juce__functions"
// 4. Search bindings.cpp for:
//    - "setParameter"
//    - "getParameter"
//    - "beginGesture"
//    - "endGesture"
```

### Pattern 3: Round-Trip Integrity
**What:** Save project → load project → verify identical state
**When to use:** Serialization/deserialization verification
**Example:**
```typescript
// In fileSystem.ts (already exists):
// saveProjectFile() → JSON
// loadProjectFile() → parse → validate with ProjectSchema

// Manual verification:
// 1. Load template, make modifications
// 2. Save as project.json
// 3. Reload saved JSON
// 4. Compare:
//    - Element count matches
//    - Element IDs match
//    - Position/size properties match
//    - Canvas settings match
// 5. Export both versions, compare ZIPs
```

### Pattern 4: HTML Preview Mode
**What:** Export as HTML preview and verify standalone mode works
**When to use:** Mock JUCE backend verification
**Example:**
```typescript
// In codeGenerator.ts (already exists):
// exportHTMLPreview() → ZIP with mock JUCE

// Manual verification:
// 1. Export as "HTML Preview"
// 2. Extract, open index.html in browser
// 3. Verify status shows "Standalone Mode"
// 4. Interact with controls (drag knobs)
// 5. Check console for "[Mock] setParameter(...)"
```

### Anti-Patterns to Avoid
- **Automated E2E tests without infrastructure:** Adding Playwright/Cypress now is feature creep; v1 ships with manual tests
- **JSON string comparison:** Element order can vary; compare parsed objects semantically, not strings
- **Screenshot comparison:** Brittle; use visual inspection with checklists instead
- **Over-verifying export details:** Focus on integration points (bridge pattern, native functions), not every CSS rule

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ZIP file diffing | Custom unzip + compare | Manual extraction + spot checks | ZIPs are binary; focus on key files (bindings.js/cpp) not byte-level diffs |
| JSON deep equality | Recursive comparison | Manual inspection or `JSON.stringify(sort(obj))` | Only 2 templates to verify; custom deep-equal is overkill |
| Template validation | Ad-hoc checks | Existing Zod ProjectSchema | Already validates on load; use schema errors as test oracle |
| Export validation | String matching | Grep patterns in generated files | `grep -F "createJUCEFunctionWrappers"` is simpler than custom parser |

**Key insight:** Phase 12 is about **systematic verification of existing code**, not building test infrastructure. Use simple, direct checks rather than complex frameworks.

## Common Pitfalls

### Pitfall 1: Scope Creep via Test Frameworks
**What goes wrong:** Attempting to add Jest/Vitest/Playwright for comprehensive automated testing
**Why it happens:** Instinct to "test properly" with frameworks
**How to avoid:** Phase 12 is a validation phase, not a testing infrastructure phase. Manual procedures are sufficient for 2 templates + round-trip. Automated tests are v1.1 work.
**Warning signs:** Installing new test dependencies, writing test configs, setting up CI

### Pitfall 2: False Positives from Element Order
**What goes wrong:** JSON comparison fails because element array order differs
**Why it happens:** Zustand store may reorder elements during operations
**How to avoid:** Compare element counts and spot-check specific elements by ID, not array position
**Warning signs:** Round-trip test fails despite canvas looking identical

### Pitfall 3: Over-Verification of Export Details
**What goes wrong:** Spending time verifying every CSS rule, HTML attribute
**Why it happens:** Completeness instinct
**How to avoid:** Focus on **integration points**: bridge pattern (createJUCEFunctionWrappers), integer resultId, 4 C++ functions. UI details are Phase 8's concern.
**Warning signs:** Checking color hex codes, font sizes, exact HTML structure

### Pitfall 4: Browser Caching Confusion
**What goes wrong:** Loading old version of exported HTML after regenerating
**Why it happens:** Browser caches HTML/CSS/JS aggressively
**How to avoid:** Hard refresh (Ctrl+Shift+R) or open in incognito mode for preview testing
**Warning signs:** Changes to export not appearing in browser preview

## Code Examples

Verified patterns from existing codebase:

### Template Loading (from templateStore.ts)
```typescript
// Source: src/store/templateStore.ts
import effectTemplate from '../../templates/effect-starter.json'
import instrumentTemplate from '../../templates/instrument-starter.json'

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [
    effectTemplate as unknown as Template,
    instrumentTemplate as unknown as Template,
  ],
  // ...
}))

// Manual test:
// 1. Load Effect Starter
// 2. Verify elements.length === 6
// 3. Check element IDs: label-plugin-title, label-status, knob-volume, etc.
```

### Project Serialization (from schemas/project.ts)
```typescript
// Source: src/schemas/project.ts
export const ProjectSchema = z.object({
  version: z.string(),
  canvas: CanvasConfigSchema,
  elements: z.array(ElementConfigSchema),
  selectedIds: z.array(z.string()).optional(),
})

// Round-trip test:
// 1. Save project: ProjectSchema.parse(data) → saveProjectFile()
// 2. Load project: loadProjectFile() → ProjectSchema.parse(json)
// 3. Zod throws if schema invalid → test passes if no throw
```

### JUCE Export Verification (from codeGenerator.ts)
```typescript
// Source: src/services/export/codeGenerator.ts
export async function exportJUCEBundle(options: ExportOptions) {
  // Generate all files
  const bindingsJS = generateBindingsJS(elements, { isPreviewMode: false })
  const cppContent = generateCPP(elements)

  // Create ZIP
  const zip = new JSZip()
  zip.file('bindings.js', bindingsJS)
  zip.file('bindings.cpp', cppContent)
  // ... other files

  const blob = await zip.generateAsync({ type: 'blob' })
  await fileSave(blob, { fileName: `${projectName}-juce.zip` })
}

// Manual test:
// 1. Export JUCE bundle
// 2. Extract ZIP
// 3. Verify files: index.html, styles.css, components.js, bindings.js, bindings.cpp, README.md
// 4. grep "createJUCEFunctionWrappers" bindings.js  # Should find 1 match
// 5. grep "nextResultId++" bindings.js              # Should find 1 match
// 6. grep "withNativeFunction" bindings.cpp         # Should find 4 matches
```

### Dynamic Bridge Pattern Check (from jsGenerator.ts)
```typescript
// Source: src/services/export/jsGenerator.ts (lines 87-132)
// Key patterns to verify in generated bindings.js:

// 1. Integer resultId (NOT Math.random())
let nextResultId = 1;

// 2. Dynamic wrapper creation
function createJUCEFunctionWrappers() {
  const functions = window.__JUCE__.initialisationData.__juce__functions || [];
  // Creates wrappers for ALL registered functions
}

// 3. Polling initialization
async function initializeJUCEBridge() {
  for (let i = 0; i < 100; i++) {
    const functions = juce.initialisationData.__juce__functions || [];
    if (functions.length > 0) {
      bridge = createJUCEFunctionWrappers();
      // Initialize UI elements
      return;
    }
    await new Promise(r => setTimeout(r, 50));
  }
  // Fallback to mock bridge
}

// Manual test grep patterns:
// grep -c "nextResultId = 1" bindings.js           # Should output: 1
// grep -c "Math.random()" bindings.js              # Should output: 0
// grep -c "createJUCEFunctionWrappers" bindings.js # Should output: 1
// grep -c "__juce__functions" bindings.js          # Should output: 3+
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Math.random() for resultId | Integer sequence (nextResultId++) | 2026-01-25 | Eliminates event ID collisions in JUCE |
| Static function list | Dynamic wrapper creation | 2026-01-25 | Works with any registered native functions |
| Immediate initialization | Polling with timeout | 2026-01-25 | Handles async JUCE function registration |
| Throw on missing JUCE | Fallback to mock bridge | 2026-01-24 | Enables standalone preview mode |

**Deprecated/outdated:**
- Static JUCE function wrappers - replaced by dynamic wrapper creation
- Math.random() for event IDs - replaced by integer sequence for reliability

## Open Questions

Things that couldn't be fully resolved:

1. **Round-trip comparison depth**
   - What we know: ProjectSchema validates structure, elements, canvas
   - What's unclear: Should round-trip verify pixel-perfect canvas rendering or just data integrity?
   - Recommendation: Data integrity only. Rendering is Phase 2's concern; if JSON matches, rendering matches.

2. **Template versioning**
   - What we know: Templates have `"version": "1.0"` field
   - What's unclear: Should Phase 12 test template version migration?
   - Recommendation: Out of scope. Templates are static for v1. Version migration is v1.1 feature if needed.

3. **Export format stability**
   - What we know: Export format is fixed (6 files for JUCE, 5 for preview)
   - What's unclear: Should test verify exact file contents or just key patterns?
   - Recommendation: Key patterns only (bridge pattern, C++ functions). Exact HTML/CSS is brittle to verify.

## Sources

### Primary (HIGH confidence)
- **Existing codebase** - src/services/export/*, src/schemas/project.ts, templates/*.json
- **Recent commits** - e06413d (dynamic JUCE bridge), 877b7ad (event-based pattern)
- **SPECIFICATION.md** - Dynamic JUCE bridge pattern documented (lines 760-850)
- **ROADMAP.md** - Phase 12 success criteria defined (lines 290-315)

### Secondary (MEDIUM confidence)
- **PROJECT.md** - JavaScript export pattern documentation (lines 92-160)
- **ISSUES-v1.1.md** - Template import marked out-of-scope (lines 23-43)

### Tertiary (LOW confidence)
- None - all findings verified against existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed, all dependencies already installed
- Architecture: HIGH - Patterns exist in codebase, tested in INSTvst repo
- Pitfalls: MEDIUM - Based on typical testing phase issues, not specific to this codebase

**Research date:** 2026-01-25
**Valid until:** 90 days (stable domain - testing verification patterns don't change rapidly)
