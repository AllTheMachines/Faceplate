---
phase: 53
plan: 03
subsystem: schema-migration
status: complete
tags: [schema, migration, serialization, v3]
dependencies:
  requires: [53-01, 53-02]
  provides:
    - Project schema v3.0.0 with elementStyles
    - Auto-migration from v2 to v3
    - Serialization with elementStyles support
  affects: [53-04, 53-05, 54-01, 55-01]
tech-stack:
  added: []
  patterns:
    - Additive schema migration (preserve knobStyles, add elementStyles)
    - Discriminated union validation with Zod
    - SVG re-sanitization on load
key-files:
  created: []
  modified:
    - src/schemas/project.ts
    - src/services/serialization.ts
decisions:
  - choice: "Additive migration strategy"
    rationale: "Preserve knobStyles in v3 for backward compatibility while adding elementStyles"
    alternatives: ["Replace knobStyles entirely", "Keep v2 format"]
  - choice: "Auto-migrate on load"
    rationale: "Transparent upgrade - users don't need to manually convert projects"
    alternatives: ["Require manual migration", "Show migration dialog"]
metrics:
  duration: 2m 48s
  tasks_completed: 2
  files_modified: 2
  commits: 2
  tests_added: 0
  bugs_fixed: 0
completed: 2026-02-04
---

# Phase 53 Plan 03: Project Schema v3.0.0 and Migration Summary

**One-liner:** Extended project schema to v3.0.0 with elementStyles array, auto-migrating v2 knobStyles to v3 format on load while preserving backward compatibility.

## What Was Built

Implemented project schema v3.0.0 with support for the new elementStyles array, which extends the knobStyles pattern to all five visual control categories (rotary, linear, arc, button, meter). The migration is additive - existing knobStyles are preserved and automatically migrated to elementStyles when v2 projects are loaded.

**Schema enhancements:**
- ElementStyleSchema as Zod discriminated union with 5 variants
- ProjectSchemaV3 with elementStyles array field
- Category-specific layer schemas (RotaryLayers, LinearLayers, ArcLayers, ButtonLayers, MeterLayers)

**Migration system:**
- v2 → v3 auto-migration on project load
- knobStyles copied to elementStyles with category='rotary'
- Original knobStyles preserved for backward compatibility
- SVG re-sanitization applied to elementStyles

**Serialization updates:**
- CURRENT_VERSION updated to '3.0.0'
- serializeProject saves elementStyles array
- deserializeProject validates against v3 schema
- Version check extended to support v1.x, v2.x, and v3.x

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add ElementStyleSchema and v3.0.0 to project.ts | 9a8708c* | src/schemas/project.ts |
| 2 | Update serialization with v3 migration | 976902a | src/services/serialization.ts |

*Note: Task 1 changes were already present from prior execution (53-02), but fulfilled the requirements.

## Decisions Made

### Additive Migration Strategy
**Decision:** Keep knobStyles in v3 format while adding elementStyles
**Rationale:** Maximum backward compatibility - old code can still read knobStyles, new code uses elementStyles
**Impact:** Project files contain both arrays during transition period
**Alternatives considered:**
- Replace knobStyles entirely → would break backward compatibility
- Keep only v2 format → wouldn't support new element categories

### Auto-Migration on Load
**Decision:** Transparently upgrade v2 projects to v3 when loaded
**Rationale:** Zero friction for users - they don't need to know about schema versions
**Impact:** All projects automatically benefit from new capabilities
**Implementation:** isV2Format check triggers migrateV2ToV3 before validation

## Technical Implementation

### Schema Architecture

```typescript
// Discriminated union with category field
ElementStyleSchema = z.discriminatedUnion('category', [
  rotary (indicator, track, arc, glow, shadow + minAngle, maxAngle)
  linear (thumb, track, fill)
  arc (thumb, track, fill, arc + minAngle, maxAngle, arcRadius)
  button (body, label, icon, pressed, normal)
  meter (body, fill, scale, peak, segments)
])

// v3.0.0 schema
ProjectSchemaV3 {
  version: string
  elementStyles: ElementStyle[]  // NEW
  knobStyles: KnobStyle[]        // Kept for backward compat
  // ... all v2 fields
}
```

### Migration Flow

```
v2 Project Load
  ↓
isV2Format() → true
  ↓
migrateV2ToV3()
  - Copy knobStyles to elementStyles (category='rotary')
  - Preserve original knobStyles array
  - Set version to '3.0.0'
  ↓
ProjectSchemaV3.safeParse()
  ↓
Re-sanitize SVG content (elementStyles + knobStyles + assets)
  ↓
v3 Project Data
```

### Security: SVG Re-Sanitization

All SVG content is re-sanitized on load (SEC-02 tampering protection):
- elementStyles SVG content
- knobStyles SVG content
- assets SVG content

Warnings logged if content changes during re-sanitization.

## Deviations from Plan

None - plan executed exactly as written.

## Integration Points

**Upstream dependencies:**
- 53-01: ElementStyle type system (RotaryLayers, LinearLayers, etc.)
- 53-02: Layer detection services (not directly used, but informed schema design)

**Downstream consumers:**
- 53-04: UI components will read elementStyles from store
- 53-05: Store actions will update elementStyles array
- 54-01: Style editor will create/edit elementStyles
- 55-01: Element rendering will apply elementStyles

**Store integration needed:**
- elementStylesSlice must be created (Plan 53-05)
- Store must pass elementStyles to serializeProject

## Next Phase Readiness

**Blockers:** None

**Requirements for next plans:**
- ✅ ElementStyle type exists (src/types/elementStyle.ts)
- ✅ ElementStyleSchema validates data (src/schemas/project.ts)
- ✅ Migration preserves existing data (additive, not destructive)
- ✅ TypeScript compiles without errors

**Upcoming work:**
- 53-04: Create elementStylesSlice (store + selectors)
- 53-05: Implement actions (add, update, delete elementStyles)
- Then: UI components + style editor

## Files Modified

### src/schemas/project.ts
- Added ElementStyleSchema (discriminated union, 5 variants)
- Added layer schemas (RotaryLayersSchema, LinearLayersSchema, etc.)
- Added ProjectSchemaV3 with elementStyles field
- Updated ProjectSchema union to include V3
- Updated ProjectData type to v3 format
- Exported ElementStyle type

### src/services/serialization.ts
- Updated CURRENT_VERSION to '3.0.0'
- Added elementStyles to SerializationInput interface
- Updated serializeProject to save elementStyles
- Added isV2Format check function
- Added migrateV2ToV3 migration function
- Updated migrateProject to handle v2 → v3
- Updated deserializeProject to validate against V3 schema
- Added elementStyles SVG re-sanitization
- Updated version check to allow v3.x

## Verification Results

✅ `npx tsc --noEmit` passes (no type errors)
✅ ElementStyleSchema is discriminated union
✅ ProjectSchemaV3 includes elementStyles
✅ CURRENT_VERSION is '3.0.0'
✅ migrateV2ToV3 converts knobStyles to elementStyles
✅ Backward compatibility: knobStyles preserved
✅ Re-sanitization applied to elementStyles SVG

## Performance Considerations

- Migration runs once per project load (O(n) where n = knobStyles count)
- SVG re-sanitization runs on all styles (knob + element + assets)
- Zod validation overhead minimal (discriminated union is O(1) dispatch)

No performance concerns for typical projects (<100 styles).

## Lessons Learned

**What worked well:**
- Additive migration strategy eliminated breaking changes
- Discriminated union provides type-safe schema variants
- Re-sanitization pattern already established, easy to extend

**What could be improved:**
- Consider removing knobStyles in v4.0.0 (after transition period)
- Could add migration metrics/logging for telemetry

## Related Documentation

- Type system: src/types/elementStyle.ts
- Schema definitions: src/schemas/project.ts
- Migration logic: src/services/serialization.ts
- Research: .planning/phases/53-foundation/53-RESEARCH.md

---

**Status:** ✅ Complete
**Next:** Plan 53-04 (elementStylesSlice creation)
**Phase Progress:** 3 of ~8 plans complete in Phase 53
