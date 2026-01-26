---
phase: 17-interactive-svg-knobs
plan: "01"
subsystem: "state-management"
tags: ["zustand", "types", "knob-styles", "svg-knobs"]

requires:
  - phases: [16-static-svg-graphics]
    reason: "Builds on asset management infrastructure for storing SVG knob designs"

provides:
  - "KnobStyle type system for custom SVG knob designs"
  - "KnobStylesSlice for CRUD operations on knob styles"
  - "Global knob styles state in Zustand store"
  - "KnobElementConfig extension with styleId and colorOverrides"

affects:
  - phase: 17-02
    reason: "SVG layer detection utilities will query these types"
  - phase: 17-03
    reason: "Knob style library UI will consume this state"
  - phase: 17-04
    reason: "SVG knob renderer will apply these styles"

tech-stack:
  added:
    - name: "KnobStyle type system"
      purpose: "Type-safe representation of custom SVG knob designs with layer mappings"
  patterns:
    - name: "Zustand slice pattern"
      usage: "Consistent CRUD operations following assetsSlice pattern"
      location: "src/store/knobStylesSlice.ts"
    - name: "Undo/redo inclusion"
      usage: "Knob styles included in temporal history (not excluded from partialize)"
      rationale: "User may want to undo accidental style deletion"

key-files:
  created:
    - path: "src/types/knobStyle.ts"
      purpose: "KnobStyle, KnobStyleLayers, ColorOverrides type definitions"
      lines: 37
    - path: "src/store/knobStylesSlice.ts"
      purpose: "Zustand slice for knob style state management"
      lines: 56

  modified:
    - path: "src/store/index.ts"
      changes: "Integrated KnobStylesSlice into combined store"
      impact: "Store now provides knobStyles state and CRUD operations globally"
    - path: "src/types/elements.ts"
      changes: "Added styleId and colorOverrides fields to KnobElementConfig"
      impact: "Knob elements can now reference custom SVG styles"

decisions:
  - id: "17-01-D1"
    choice: "KnobStyleLayers with optional layer mappings (indicator, track, arc, glow, shadow)"
    rationale: "Allows flexible mapping of SVG elements to functional roles without enforcing rigid structure"
    alternatives: ["Fixed layer structure requiring all layers", "Free-form string mappings"]

  - id: "17-01-D2"
    choice: "ColorOverrides as sparse object (only explicit overrides stored)"
    rationale: "Efficient storage - only store colors that differ from style defaults"
    alternatives: ["Full color object with all layers required"]

  - id: "17-01-D3"
    choice: "Knob styles included in undo/redo history"
    rationale: "User may want to undo accidental style deletion or modification"
    alternatives: ["Exclude from temporal partialize like viewport state"]

  - id: "17-01-D4"
    choice: "Optional styleId and colorOverrides in KnobElementConfig"
    rationale: "Backward compatibility - undefined styleId means render default CSS knob"
    alternatives: ["Required styleId with special 'default' style", "Separate KnobElement types"]

metrics:
  duration: "~3 minutes"
  tasks_completed: 4
  commits: 4
  files_created: 2
  files_modified: 2
  completed: 2026-01-26
---

# Phase 17 Plan 01: KnobStyle Type System and State Management

**One-liner:** Foundation types and Zustand slice for managing custom SVG knob designs with layer mappings and per-instance color overrides

## What Was Built

Created the foundational type system and state management for custom SVG knob designs:

### Type System (src/types/knobStyle.ts)
- **KnobStyleLayers**: Flexible layer mappings for SVG elements (indicator, track, arc, glow, shadow)
- **ColorOverrides**: Sparse color overrides for per-instance customization
- **KnobStyle**: Main interface with id, name, svgContent, layers, rotation config (minAngle/maxAngle), and createdAt

### State Management (src/store/knobStylesSlice.ts)
- Zustand slice following assetsSlice pattern for consistency
- CRUD operations: addKnobStyle, removeKnobStyle, updateKnobStyle, setKnobStyles
- Auto-generate id (crypto.randomUUID()) and createdAt (Date.now())
- getKnobStyle selector for single style lookup
- Included in undo/redo history (not excluded from temporal partialize)

### Store Integration (src/store/index.ts)
- KnobStylesSlice integrated into combined Store type
- Spread createKnobStylesSlice in store creation
- Global access to knobStyles state and operations

### Element Type Extension (src/types/elements.ts)
- KnobElementConfig extended with optional styleId field
- Added optional colorOverrides field for per-instance customization
- Backward compatible: undefined styleId = default CSS knob rendering

## Key Technical Insights

**Layer Mapping Design:**
The KnobStyleLayers interface uses optional fields to support flexible SVG structures. Not all knobs need all layers (e.g., minimalist designs may omit glow/shadow), and the indicator is the only truly required element (marked in comment, enforced at runtime later).

**Sparse Color Overrides:**
ColorOverrides stores only explicit overrides rather than full color objects. This keeps per-instance data minimal - if a knob uses style defaults, colorOverrides is undefined or has few properties.

**Rotation Configuration:**
minAngle and maxAngle are stored in degrees with sensible defaults (-135° to 135° = 270° sweep). This is standard knob UI convention: -135° points to bottom-left, 0° points up, 135° points to bottom-right.

**Undo/Redo Inclusion:**
Unlike viewport state (camera position), knob styles ARE included in undo history. Deleting a style is a significant action users may want to undo, especially if it's referenced by multiple knob elements.

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Phase 17-02 (SVG Layer Detection):**
- ✓ KnobStyle type available for layer mapping utilities
- ✓ Layer names (indicator, track, arc, glow, shadow) defined
- Ready: SVG parsing utilities can populate KnobStyleLayers

**Phase 17-03 (Knob Style Library UI):**
- ✓ KnobStylesSlice provides CRUD operations
- ✓ Store exports getKnobStyle selector
- ✓ Undo/redo support ready
- Ready: UI can display/edit/delete knob styles

**Phase 17-04 (SVG Knob Renderer):**
- ✓ KnobElementConfig has styleId field
- ✓ ColorOverrides type defined
- ✓ Store provides getKnobStyle lookup
- Ready: Renderer can fetch style and apply overrides

**Phase 17-05+ (Knob Interaction):**
- ✓ Rotation config (minAngle/maxAngle) stored in style
- ✓ Value-to-angle conversion can use these fields
- Ready: Interaction handlers can query rotation range

## Performance Considerations

- crypto.randomUUID() is fast (built-in, no dependencies)
- Sparse ColorOverrides keep per-instance data minimal
- getKnobStyle uses array.find - acceptable for style libraries (<100 styles)
- Future optimization: If library grows large, consider Map-based lookup

## Security Notes

- svgContent must be sanitized via DOMPurify before storage (enforced in Phase 17-03)
- Layer mappings are selector strings - no injection risk (used in querySelector)
- ColorOverrides are color strings - validated in UI inputs

## Testing Notes

For future test coverage:
- ✓ TypeScript compilation passes (verified)
- ✓ App starts without errors (verified)
- TODO: Unit tests for slice CRUD operations
- TODO: Integration tests for undo/redo of style deletion
- TODO: Validation that indicator layer is present in KnobStyle

## File Manifest

**Created:**
- src/types/knobStyle.ts (37 lines) - Type definitions
- src/store/knobStylesSlice.ts (56 lines) - Zustand slice

**Modified:**
- src/store/index.ts (+3 lines) - Store integration
- src/types/elements.ts (+8 lines) - KnobElementConfig extension

**Commits:**
- 448a59f: feat(17-01): create KnobStyle type definitions
- 75636a4: feat(17-01): create KnobStylesSlice for state management
- 17ef48b: feat(17-01): integrate KnobStylesSlice into Zustand store
- c4c2124: feat(17-01): extend KnobElementConfig with SVG style fields

---
*Completed: 2026-01-26*
*Duration: ~3 minutes*
*All success criteria met*
