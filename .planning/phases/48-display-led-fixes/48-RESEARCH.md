# Phase 48: Display & LED Fixes - Research

**Researched:** 2026-02-02
**Domain:** React/TypeScript UI element configuration and removal
**Confidence:** HIGH

## Summary

Phase 48 involves two distinct operations:
1. **Note Display font sizing fix**: Add configurable fontSize property (default 14px) and showOctave property to Note Display, matching the patterns established by Numeric Display and other value displays
2. **LED element removal**: Remove all 6 LED element types following the established removal pattern from Phase 47-02 (KickButton removal)

Both operations are straightforward implementations using existing patterns in the codebase. The Note Display changes enhance property configurability, while LED removal simplifies the element taxonomy by removing unused element types.

**Primary recommendation:** Execute as two separate tasks - (1) Note Display property additions, (2) LED element removal. Both follow established codebase patterns with HIGH confidence.

## Standard Stack

### Core Technologies
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI framework | Established codebase standard |
| TypeScript | 5.x | Type safety | All element types strictly typed |
| Tailwind CSS | 3.x | Styling | Used throughout property panels |

### Element Management Pattern
| Component | Purpose | Pattern |
|-----------|---------|---------|
| `src/types/elements/*.ts` | Type definitions | Strict TypeScript interfaces for all element configs |
| `src/components/Properties/*.tsx` | Property panels | Standardized PropertySection components |
| `src/components/elements/renderers/*/` | Visual rendering | Element-specific renderers using config props |
| `src/services/elementFactory.ts` | Element creation | Factory pattern with switch/case by type |
| `src/services/export/*.ts` | Code generation | HTML/CSS/JS export generators |

### Property Panel Shared Components
| Component | Purpose | Used By |
|-----------|---------|---------|
| `PropertySection` | Collapsible section wrapper | All property panels |
| `FontSection` | Font configuration (fontSize, family, weight, padding) | NumericDisplay, NoteDisplay, all displays |
| `ColorsSection` | Color pickers (text, background, border) | Display elements |
| `NumberInput` | Numeric input with validation | All numeric properties |

**Installation:** No new dependencies required - using existing stack.

## Architecture Patterns

### Note Display Property Addition Pattern

The codebase follows a consistent pattern for display element properties:

#### 1. Type Definition (displays.ts)
```typescript
export interface NoteDisplayElementConfig extends BaseElementConfig {
  type: 'notedisplay'

  // Value properties
  value: number
  min: number
  max: number
  preferSharps: boolean
  showMidiNumber: boolean

  // NEW: Display control
  showOctave: boolean // Add this property

  // Appearance properties
  fontSize: number // Already exists, change default from 20 to 14
  fontFamily: string
  fontWeight: number
  // ... other properties
}
```

#### 2. Factory Function (displays.ts)
```typescript
export function createNoteDisplay(overrides?: Partial<NoteDisplayElementConfig>): NoteDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'notedisplay',
    name: 'Note Display',
    // ... position/size
    value: 0.47,
    min: 0,
    max: 127,
    preferSharps: true,
    showMidiNumber: false,
    showOctave: true, // NEW: Default true (show octave)
    fontSize: 14, // CHANGED: Was 20, now 14 to match other displays
    // ... other defaults
  }
}
```

#### 3. Property Panel (NoteDisplayProperties.tsx)
```typescript
// Add checkbox in Display section (after showMidiNumber)
<label
  htmlFor="notedisplay-show-octave"
  className="flex items-center gap-2 cursor-pointer select-none"
>
  <input
    type="checkbox"
    id="notedisplay-show-octave"
    checked={element.showOctave}
    onChange={(e) => onUpdate({ showOctave: e.target.checked })}
    className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
  />
  <span className="text-sm text-gray-300">Show Octave Number</span>
</label>
```

#### 4. Renderer Logic (NoteDisplayRenderer.tsx)
```typescript
// Modify formatDisplayValue call or format inline
const formattedValue = formatDisplayValue(
  config.value,
  config.min,
  config.max,
  'note',
  { preferSharps: config.preferSharps }
)

// THEN conditionally strip octave if showOctave is false
const displayValue = config.showOctave
  ? formattedValue // "C4"
  : formattedValue.replace(/\d+$/, '') // "C" (strip trailing digits)
```

**Key Pattern:** fontSize is controlled by FontSection shared component - no changes needed to property panel for fontSize, already exists. Only showOctave is new.

### LED Element Removal Pattern

Follows established pattern from Phase 47-02 (KickButton removal):

#### Removal Scope (6 element types)
1. **SingleLED** (`singleled`)
2. **BiColorLED** (`bicolorled`)
3. **TriColorLED** (`tricolorled`)
4. **LEDArray** (`ledarray`)
5. **LEDRing** (`ledring`)
6. **LEDMatrix** (`ledmatrix`)

#### Files to Modify (Pattern from 47-02)
```
Types & Factory:
  src/types/elements/displays.ts
    - Remove 6 LED interfaces (SingleLEDElementConfig, etc.)
    - Remove 6 factory functions (createSingleLED, etc.)
    - Remove 6 type guards (isSingleLED, etc.)
    - Remove from DisplayElement union type

  src/services/elementFactory.ts
    - Remove 6 case statements for LED types

Renderers:
  DELETE src/components/elements/renderers/displays/*LEDRenderer.tsx (6 files)
  UPDATE src/components/elements/renderers/displays/index.ts
    - Remove 6 LED exports

Properties:
  DELETE src/components/Properties/*LEDProperties.tsx (6 files)
  UPDATE src/components/Properties/index.ts
    - Remove 6 LED exports

Palette:
  src/components/Palette/Palette.tsx
    - Remove "LED Indicators" category (lines 56-66)

  src/components/Palette/PaletteItem.tsx
    - Remove LED-specific icon/rendering logic

App Integration:
  src/App.tsx
    - Remove LED case handling if present

Export Generators:
  src/services/export/htmlGenerator.ts
  src/services/export/cssGenerator.ts
  src/services/export/jsGenerator.ts
  src/services/export/svgElementExport.ts
    - Remove case 'singleled'/'bicolorled'/etc. from switch statements

Help Content:
  src/content/help/elements.ts
    - Remove LED element help entries
```

#### Silent Removal During Load
Project deserialization (src/services/serialization.ts or similar) should handle gracefully:
- No warnings/toasts when loading projects with LED elements
- Elements simply filtered out during load
- No user-facing error messages

**Pattern verified:** Phase 47-02 completed this exact pattern successfully.

### Anti-Patterns to Avoid

- **Don't add fontSize input separately** - FontSection already provides this via shared component
- **Don't modify valueFormatters.ts for showOctave** - Handle formatting in renderer, not in core formatter
- **Don't leave orphaned imports** - Clean up all LED imports when removing files
- **Don't add migration warnings** - Silent removal is the design decision per CONTEXT.md

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font property controls | Custom font size/family inputs | `FontSection` shared component | Already exists, used by all displays |
| Property panel layout | Custom section containers | `PropertySection` component | Consistent collapsible sections |
| Element removal from union types | Manual string search/replace | Follow 47-02 pattern exactly | Proven pattern, TypeScript validates |
| Checkbox styling | Inline Tailwind classes | Existing checkbox pattern from other properties | Visual consistency |

**Key insight:** Codebase has well-established patterns for property additions and element removal. Phase 47-02 provides exact blueprint for LED removal.

## Common Pitfalls

### Pitfall 1: Font Size Default Inconsistency
**What goes wrong:** Note Display factory creates elements with fontSize: 20, but user decision specifies 14px default.
**Why it happens:** Old default hasn't been updated.
**How to avoid:** Change createNoteDisplay factory default from `fontSize: 20` to `fontSize: 14`.
**Warning signs:** New Note Display elements appear larger than Numeric Display.

### Pitfall 2: Incomplete LED Removal
**What goes wrong:** LED types removed from some files but not others, causing TypeScript errors or runtime failures.
**Why it happens:** LED types referenced in ~15-20 files across codebase.
**How to avoid:**
1. Remove types first (forces TypeScript errors in dependent files)
2. Follow TypeScript errors to find all references
3. Use `grep -ri "singleled\|bicolorled\|tricolorled\|ledarray\|ledring\|ledmatrix" src/` to verify complete removal
**Warning signs:** Build errors, missing exports, palette rendering errors.

### Pitfall 3: showOctave Property Missing from Type
**What goes wrong:** Adding property to renderer/properties without adding to TypeScript interface causes type errors.
**Why it happens:** Forgetting to update NoteDisplayElementConfig interface.
**How to avoid:** Add showOctave to interface FIRST, then factory, then properties, then renderer.
**Warning signs:** TypeScript error: "Property 'showOctave' does not exist on type 'NoteDisplayElementConfig'".

### Pitfall 4: Octave Stripping Regex Issues
**What goes wrong:** Regex to remove octave number might fail on edge cases (negative octaves, multi-digit octaves).
**Why it happens:** MIDI note range is 0-127, octave range is -1 to 9.
**How to avoid:** Use simple regex `/\d+$/` to strip trailing digits, or use `/[-]?\d+$/` for negative octaves.
**Warning signs:** Note names like "C-1" display incorrectly as "C-" instead of "C".

### Pitfall 5: LED Category Left in Palette
**What goes wrong:** "LED Indicators" category remains in palette but is empty.
**Why it happens:** Removing items but not the category container.
**How to avoid:** Remove entire LED Indicators category object from paletteCategories array (lines 56-66 in Palette.tsx).
**Warning signs:** Empty category section in palette UI.

## Code Examples

Verified patterns from codebase:

### Note Display: showOctave Property Addition

#### Type Definition
```typescript
// src/types/elements/displays.ts (around line 296)
export interface NoteDisplayElementConfig extends BaseElementConfig {
  type: 'notedisplay'

  // Value
  value: number // 0-1 normalized
  min: number // MIDI range (e.g., 0)
  max: number // MIDI range (e.g., 127)
  preferSharps: boolean // A# vs Bb
  showMidiNumber: boolean // Show MIDI number below note name
  showOctave: boolean // NEW: Show octave number (C4 vs C)

  // Appearance
  fontSize: number // Changed default: 14 (was 20)
  fontFamily: string
  fontWeight: number
  textColor: string
  backgroundColor: string
  padding: number
  fontStyle: '7segment' | 'modern'
  bezelStyle: 'inset' | 'flat' | 'none'
  borderColor: string
}
```

#### Factory Function Update
```typescript
// src/types/elements/displays.ts (around line 1579)
export function createNoteDisplay(overrides?: Partial<NoteDisplayElementConfig>): NoteDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'notedisplay',
    name: 'Note Display',
    x: 0,
    y: 0,
    width: 80,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.47,
    min: 0,
    max: 127,
    preferSharps: true,
    showMidiNumber: false,
    showOctave: true, // NEW: Default true
    fontSize: 14, // CHANGED: Was 20, now 14
    fontFamily: 'Roboto Mono, monospace',
    fontWeight: 400,
    textColor: '#10b981',
    backgroundColor: '#1f2937',
    padding: 8,
    fontStyle: 'modern',
    bezelStyle: 'inset',
    borderColor: '#374151',
    ...overrides,
  }
}
```

#### Property Panel Update
```typescript
// src/components/Properties/NoteDisplayProperties.tsx
// Add after showMidiNumber checkbox (around line 72)

<label
  htmlFor="notedisplay-show-octave"
  className="flex items-center gap-2 cursor-pointer select-none"
>
  <input
    type="checkbox"
    id="notedisplay-show-octave"
    checked={element.showOctave}
    onChange={(e) => onUpdate({ showOctave: e.target.checked })}
    className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
  />
  <span className="text-sm text-gray-300">Show Octave Number</span>
</label>
```

#### Renderer Update
```typescript
// src/components/elements/renderers/displays/NoteDisplayRenderer.tsx

export function NoteDisplayRenderer({ config }: NoteDisplayRendererProps) {
  const formattedValue = formatDisplayValue(
    config.value,
    config.min,
    config.max,
    'note',
    { preferSharps: config.preferSharps }
  )

  // NEW: Strip octave number if showOctave is false
  const displayValue = config.showOctave
    ? formattedValue // "C4" - full note with octave
    : formattedValue.replace(/[-]?\d+$/, '') // "C" - note letter only

  // ... rest of renderer uses displayValue instead of formattedValue

  return (
    <div className="notedisplay-element" style={{...}}>
      <div>{displayValue}</div> {/* Changed from formattedValue */}
      {config.showMidiNumber && (
        <div style={{...}}>
          {midiNumber}
        </div>
      )}
    </div>
  )
}
```

### LED Element Removal Pattern

Following Phase 47-02 KickButton removal pattern:

#### Step 1: Remove from Types
```typescript
// src/types/elements/displays.ts

// DELETE these interfaces (lines ~640-766):
// - SingleLEDElementConfig
// - BiColorLEDElementConfig
// - TriColorLEDElementConfig
// - LEDArrayElementConfig
// - LEDRingElementConfig
// - LEDMatrixElementConfig

// REMOVE from DisplayElement union type (lines ~772-820):
export type DisplayElement =
  | LabelElementConfig
  | MeterElementConfig
  // ... other types
  | NumericDisplayElementConfig
  // DELETE these 6 lines:
  // | SingleLEDElementConfig
  // | BiColorLEDElementConfig
  // | TriColorLEDElementConfig
  // | LEDArrayElementConfig
  // | LEDRingElementConfig
  // | LEDMatrixElementConfig
  | TimeDisplayElementConfig
  // ... rest

// DELETE type guard functions (lines ~893-915):
// - isSingleLED()
// - isBiColorLED()
// - isTriColorLED()
// - isLEDArray()
// - isLEDRing()
// - isLEDMatrix()

// DELETE factory functions (lines ~1269-1450):
// - createSingleLED()
// - createBiColorLED()
// - createTriColorLED()
// - createLEDArray()
// - createLEDRing()
// - createLEDMatrix()
```

#### Step 2: Remove from Palette
```typescript
// src/components/Palette/Palette.tsx

// DELETE entire LED Indicators category (lines ~56-66):
/*
{
  name: 'LED Indicators',
  items: [
    { id: 'singleled', type: 'singleled', name: 'Single LED' },
    { id: 'bicolorled', type: 'bicolorled', name: 'Bi-Color LED' },
    { id: 'tricolorled', type: 'tricolorled', name: 'Tri-Color LED' },
    { id: 'ledarray', type: 'ledarray', name: 'LED Array' },
    { id: 'ledring', type: 'ledring', name: 'LED Ring' },
    { id: 'ledmatrix', type: 'ledmatrix', name: 'LED Matrix' },
  ],
},
*/
```

#### Step 3: Delete Renderer Files
```bash
# Delete 6 renderer files:
rm src/components/elements/renderers/displays/SingleLEDRenderer.tsx
rm src/components/elements/renderers/displays/BiColorLEDRenderer.tsx
rm src/components/elements/renderers/displays/TriColorLEDRenderer.tsx
rm src/components/elements/renderers/displays/LEDArrayRenderer.tsx
rm src/components/elements/renderers/displays/LEDRingRenderer.tsx
rm src/components/elements/renderers/displays/LEDMatrixRenderer.tsx
```

#### Step 4: Update Renderer Index
```typescript
// src/components/elements/renderers/displays/index.ts

// REMOVE these 6 export lines:
// export { SingleLEDRenderer } from './SingleLEDRenderer'
// export { BiColorLEDRenderer } from './BiColorLEDRenderer'
// export { TriColorLEDRenderer } from './TriColorLEDRenderer'
// export { LEDArrayRenderer } from './LEDArrayRenderer'
// export { LEDRingRenderer } from './LEDRingRenderer'
// export { LEDMatrixRenderer } from './LEDMatrixRenderer'
```

#### Step 5: Delete Property Files
```bash
# Delete 6 property panel files:
rm src/components/Properties/SingleLEDProperties.tsx
rm src/components/Properties/BiColorLEDProperties.tsx
rm src/components/Properties/TriColorLEDProperties.tsx
rm src/components/Properties/LEDArrayProperties.tsx
rm src/components/Properties/LEDRingProperties.tsx
rm src/components/Properties/LEDMatrixProperties.tsx
```

#### Step 6: Update Properties Index
```typescript
// src/components/Properties/index.ts

// REMOVE these 6 export lines:
// export { SingleLEDProperties } from './SingleLEDProperties'
// export { BiColorLEDProperties } from './BiColorLEDProperties'
// export { TriColorLEDProperties } from './TriColorLEDProperties'
// export { LEDArrayProperties } from './LEDArrayProperties'
// export { LEDRingProperties } from './LEDRingProperties'
// export { LEDMatrixProperties } from './LEDMatrixProperties'
```

#### Step 7: Remove from Export Generators
```typescript
// src/services/export/htmlGenerator.ts
// src/services/export/cssGenerator.ts
// src/services/export/jsGenerator.ts

// In each file, REMOVE case statements for LED types:
switch (element.type) {
  // ... other cases

  // DELETE these 6 cases:
  // case 'singleled':
  //   return generateSingleLED(element)
  // case 'bicolorled':
  //   return generateBiColorLED(element)
  // case 'tricolorled':
  //   return generateTriColorLED(element)
  // case 'ledarray':
  //   return generateLEDArray(element)
  // case 'ledring':
  //   return generateLEDRing(element)
  // case 'ledmatrix':
  //   return generateLEDMatrix(element)

  // ... rest
}

// Also delete helper functions like generateSingleLED() etc.
```

#### Step 8: Verify Complete Removal
```bash
# Run grep to ensure no LED references remain:
grep -ri "singleled\|bicolorled\|tricolorled\|ledarray\|ledring\|ledmatrix" src/

# Should return no results (or only comments/documentation)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Note Display with fixed fontSize | Note Display with configurable fontSize via FontSection | This phase | Consistency with other value displays |
| Note Display always shows octave | Note Display with showOctave toggle | This phase | User control over note format (C vs C4) |
| 6 LED element types in palette | No LED elements | This phase | Simplified element taxonomy, breaking change |

**Deprecated/outdated:**
- LED element types: Removed entirely. No replacement - LED functionality deemed unnecessary for VST UI design tool.

## Open Questions

None - all aspects of this phase are well-defined:

1. **Note Display changes**: Clear specification (fontSize default 14, showOctave property)
2. **LED removal scope**: All 6 types identified with exact file locations
3. **Removal pattern**: Proven pattern from Phase 47-02
4. **Silent removal**: Design decision already made in CONTEXT.md

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/types/elements/displays.ts` - Element type definitions and factory functions
- Codebase analysis: `src/components/Properties/NoteDisplayProperties.tsx` - Current property panel implementation
- Codebase analysis: `src/components/Properties/NumericDisplayProperties.tsx` - Reference for display property patterns
- Codebase analysis: `src/components/Properties/shared/FontSection.tsx` - Shared font configuration component
- Codebase analysis: `.planning/phases/47-button-knob-fixes/47-02-PLAN.md` - KickButton removal pattern (proven blueprint)
- User decision: `.planning/phases/48-display-led-fixes/48-CONTEXT.md` - Implementation decisions

### Secondary (MEDIUM confidence)
- N/A - All findings from direct codebase analysis

### Tertiary (LOW confidence)
- N/A - No external sources needed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Direct analysis of package.json and existing code
- Architecture: HIGH - Patterns verified in codebase, Phase 47-02 provides exact blueprint
- Pitfalls: HIGH - Common TypeScript/React pitfalls, verified against actual code structure

**Research date:** 2026-02-02
**Valid until:** 30 days (stable codebase patterns, no fast-moving dependencies)
