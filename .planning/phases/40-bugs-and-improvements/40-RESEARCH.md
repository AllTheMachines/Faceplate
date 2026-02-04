# Phase 40: Bug Fixes & UI Improvements - Research

**Researched:** 2026-01-29
**Domain:** Bug fixing and UX improvements in React/TypeScript application
**Confidence:** HIGH

## Summary

Phase 40 addresses 7 bugs and 8 feature requests in a mature React/TypeScript application (~180K lines) using Zustand state management, @dnd-kit, and browser File System Access API. The phase covers three main technical domains: **state synchronization bugs** (color picker, font preview, duplicate detection), **missing UI capabilities** (border editing, spacing controls, multi-select refinement), and **export workflow improvements** (direct folder export, version tracking).

The standard approach for this work combines: (1) **defensive validation** at state boundaries to catch stale/incorrect data before rendering, (2) **controlled component patterns** to ensure single source of truth for visual state, and (3) **scoped state operations** to prevent cross-window contamination in multi-window architectures.

Key insight from codebase analysis: The application already has strong architectural patterns (Zustand slices, Zod schemas, element registry). Most bugs stem from **incomplete state synchronization** (value updates not triggering re-renders) or **missing property fields** in element schemas rather than architectural flaws.

**Primary recommendation:** Fix bugs by adding missing schema fields and strengthening controlled component contracts; implement features by extending existing patterns (PropertySection components, schema validation, export generators) rather than introducing new architectures.

## Standard Stack

The codebase already uses the established stack for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI framework | Industry standard for component-based UIs |
| TypeScript | ~5.6.2 | Type safety | Catches state shape bugs at compile-time |
| Zustand | 5.0.10 | State management | Lightweight, slice-based, 30%+ YoY growth (2026) |
| Zod | 4.3.6 | Schema validation | Runtime validation for serialization/migration |
| Vitest | 4.0.18 | Testing | 10-20x faster than Jest for Vite projects |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-colorful | 5.6.1 | Color picker | Already in use, controlled component pattern |
| browser-fs-access | 0.38.0 | File/directory access | Polyfill for File System Access API |
| zundo | 2.3.0 | Undo/redo | Temporal middleware for Zustand |
| react-hot-toast | 2.6.0 | User notifications | Error/success feedback |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Redux Toolkit | More boilerplate, no benefit for this use case |
| react-colorful | react-color | 10x larger bundle, more features (not needed) |
| Vitest | Jest | Slower, but already using Vitest |

**Installation:**
```bash
# All dependencies already installed
# No new packages needed for bug fixes or features
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Properties/        # Property panel editors (one per element type)
│   │   ├── shared/        # Reusable property sections (FontSection, ColorInput, etc.)
│   │   └── *Properties.tsx
│   ├── Canvas/            # Main editing surface
│   │   └── hooks/         # Editing behaviors (useCopyPaste, etc.)
│   └── export/            # Export UI components
├── store/
│   ├── index.ts           # Combined store with temporal middleware
│   ├── elementsSlice.ts   # Element CRUD and selection
│   ├── windowsSlice.ts    # Multi-window state
│   └── *Slice.ts          # Domain-specific slices
├── schemas/
│   └── project.ts         # Zod validation schemas (mirrors types)
├── services/
│   ├── export/            # Code generation (HTML, CSS, JS, C++)
│   └── serialization.ts   # Project save/load with migration
└── types/
    └── elements/          # TypeScript element type definitions
```

### Pattern 1: Zustand Slice Pattern
**What:** Each domain gets a slice with state and actions, combined in store/index.ts
**When to use:** All state management in this application
**Example:**
```typescript
// Source: Codebase analysis (src/store/index.ts)
export type Store = CanvasSlice & ViewportSlice & ElementsSlice & WindowsSlice

export const useStore = create<Store>()(
  temporal(
    (...a) => ({
      ...createCanvasSlice(...a),
      ...createElementsSlice(...a),
      ...createWindowsSlice(...a),
    }),
    {
      limit: 50,
      partialize: (state) => {
        // Exclude UI state from undo history
        const { scale, offsetX, offsetY, selectedIds, ...rest } = state
        return rest
      },
    }
  )
)
```

### Pattern 2: Property Panel Components
**What:** Each element type has a dedicated *Properties.tsx component using shared sections
**When to use:** Adding editable properties to element types
**Example:**
```typescript
// Source: Codebase analysis (src/components/Properties/ButtonProperties.tsx)
export function ButtonProperties({ element, onUpdate }: Props) {
  return (
    <>
      <PropertySection title="Appearance">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
      </PropertySection>
      {/* More sections */}
    </>
  )
}
```

### Pattern 3: Controlled Color Picker
**What:** ColorInput wraps react-colorful with controlled state (value + onChange)
**When to use:** All color editing (prevents state desync bugs)
**Example:**
```typescript
// Source: Codebase analysis (src/components/Properties/ColorInput.tsx)
export function ColorInput({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      <button
        style={{ backgroundColor: value }}
        onClick={() => setShowPicker(!showPicker)}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {showPicker && (
        <HexColorPicker color={value} onChange={onChange} />
      )}
    </div>
  )
}
```

### Pattern 4: Multi-Window Scoped Operations
**What:** Operations filter/validate against activeWindowId to prevent cross-window bugs
**When to use:** Copy/paste, duplicate, any multi-element operation
**Example:**
```typescript
// Source: Codebase analysis (src/components/Canvas/hooks/useCopyPaste.ts)
const copyToClipboard = useCallback(() => {
  const elements = selectedIds
    .map((id) => getElement(id))
    .filter((el) => {
      // Only include elements that belong to the active window
      const elementWindow = getWindowForElement(el.id)
      return elementWindow?.id === activeWindowId
    })
  // Store filtered elements
}, [selectedIds, activeWindowId, getWindowForElement])
```

### Pattern 5: Schema-First Element Properties
**What:** Zod schemas in schemas/project.ts mirror TypeScript types, validated on load
**When to use:** Adding new properties to element types
**Example:**
```typescript
// Source: Codebase analysis (src/schemas/project.ts)
const ButtonElementSchema = BaseElementSchema.extend({
  type: z.literal('button'),
  label: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  // Add new properties here with defaults in migration
}).passthrough()
```

### Pattern 6: Export Generator Extension
**What:** Export generators (HTML, CSS, JS) are pure functions that transform element arrays
**When to use:** Adding export options or changing output format
**Example:**
```typescript
// Source: Codebase analysis (src/services/export/codeGenerator.ts)
export interface ExportOptions {
  elements: ElementConfig[]
  canvasWidth: number
  canvasHeight: number
  projectName?: string
  optimizeSVG?: boolean
  enableResponsiveScaling?: boolean
}

export async function exportJUCEBundle(options: ExportOptions): Promise<void> {
  const validation = validateForExport(options)
  if (!validation.valid) throw new Error(validation.errors.join('\n'))

  const html = generateHTML(options)
  const css = generateCSS(options)
  const js = generateBindingsJS(options)

  // Bundle into ZIP
}
```

### Anti-Patterns to Avoid
- **Uncontrolled components:** Always use value + onChange, not defaultValue
- **Direct state mutation:** Always use Zustand actions (set/get), never mutate state.elements directly
- **Cross-window assumptions:** Always validate elementWindow.id === activeWindowId before operations
- **Schema bypass:** Never add properties without updating both TypeScript types AND Zod schemas
- **Export side effects:** Export generators must be pure functions (no store access, no mutations)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color picker | Custom canvas-based picker | react-colorful + controlled wrapper | Accessibility, touch support, formats (hex/rgb/hsl) |
| Undo/redo | Custom history stack | zundo temporal middleware | Handles partial state, action naming, devtools |
| Name uniqueness | Manual array.find checks | Zod schema refinements + store validators | Handles renames, case sensitivity, container scoping |
| File/directory picker | Custom input[type=file] wrapper | browser-fs-access polyfill | Handles permissions, directory recursion, browser compat |
| Deep cloning | JSON.parse(JSON.stringify()) | structuredClone() | Handles dates, maps, sets, circular refs (browser native) |
| ZIP export | Manual binary file construction | JSZip library | Handles compression, async, MIME types, encoding |

**Key insight:** This application already uses best-in-class libraries. Don't replace them; use their APIs correctly (controlled components, validation layers, permission flows).

## Common Pitfalls

### Pitfall 1: Color Picker State Desynchronization
**What goes wrong:** Swatch shows wrong color while hex input shows correct value
**Why it happens:** react-colorful uses controlled component pattern, but state updates may not trigger re-render if value prop doesn't change reference
**How to avoid:**
- Always pass primitive values (strings), not objects, to color prop
- Use key prop on ColorInput if element.id changes to force remount
- Verify onChange handler actually calls Zustand set() action
**Warning signs:**
- Color swatch doesn't update when switching between elements
- Typing in hex field works but clicking swatch shows old color
**Source:** [Medium article on react-colorful state issues](https://medium.com/@ozergklp/why-existing-react-color-pickers-frustrated-me-and-what-i-built-instead-da47a17ea2b0)

### Pitfall 2: Font Weight Generic Names vs. Actual Names
**What goes wrong:** Font dropdown shows "Light (300)" but font family has actual weight names like "Inter Light"
**Why it happens:** Font metadata contains both numeric weight (300) and weight name, but UI only shows generic mapping
**How to avoid:**
- Use opentype.js (already in dependencies) to extract font.names.fontSubfamily
- Map numeric weights to actual font subfamily names from loaded font files
- Fall back to generic names only if font metadata unavailable
**Warning signs:**
- Font preview shows different weight than selected
- Export uses wrong font file (Regular instead of Light)
**Source:** Codebase analysis (opentype.js in package.json, FontsSlice in store)

### Pitfall 3: Multi-Window Duplicate Contamination
**What goes wrong:** Duplicating elements in Window A also duplicates elements in Window B
**Why it happens:** duplicateSelected() doesn't filter by activeWindowId before cloning
**How to avoid:**
- Always filter selectedIds by getWindowForElement(id)?.id === activeWindowId
- Use same pattern as copyToClipboard (already correctly filters)
- Add test case: select in Window A, switch to Window B, duplicate should be no-op
**Warning signs:**
- Element count increases in inactive windows
- Duplicate operations affect all windows instead of just active one
**Source:** Codebase analysis (useCopyPaste.ts has correct pattern in copy, missing in duplicate)

### Pitfall 4: Duplicate Name Detection False Positives
**What goes wrong:** Delete element "Button", create new element "Button", validation says name already exists
**Why it happens:** Validation checks elements array before deletion fully propagates, or checks wrong scope
**How to avoid:**
- Name uniqueness validation must check elements in CURRENT window only
- Exclude element's own ID when validating rename: `elements.filter(el => el.id !== elementId)`
- Use Zod refinements for validation, not inline checks
**Warning signs:**
- Can't reuse names of deleted elements
- Name validation error when no visible duplicate
**Source:** [GitHub DDD-NoDuplicates patterns](https://github.com/ardalis/DDD-NoDuplicates), [Monte Carlo Data uniqueness guide](https://www.montecarlodata.com/blog-data-uniqueness/)

### Pitfall 5: Missing Project Version on Save
**What goes wrong:** Opening old project shows cryptic error instead of "file format migration"
**Why it happens:** serializeProject() sets version in data but deserializeProject() expects it
**How to avoid:**
- Always include version field in serialized JSON (already does: version: '2.0.0')
- deserializeProject() must gracefully handle missing version (treat as v1.0.0)
- Show user-friendly migration message: "Upgrading project from v1.x to v2.0.0"
**Warning signs:**
- Zod validation errors on load instead of migration
- Users report "project won't open" for old files
**Source:** Codebase analysis (serialization.ts has migration logic)

### Pitfall 6: Border Thickness Missing from Schema
**What goes wrong:** Can't edit border thickness even though element visually has a border
**Why it happens:** Property not in TypeScript type OR Zod schema OR Properties component
**How to avoid:**
- Add to type definition (e.g., ButtonElementConfig)
- Add to Zod schema (ButtonElementSchema)
- Add NumberInput in ButtonProperties component
- Add to export generators (cssGenerator.ts)
- Test full round-trip: set → save → load → export
**Warning signs:**
- Property visible in one place but not others
- Property lost on save/load
- Property ignored in export
**Source:** Codebase analysis (schema validation architecture)

### Pitfall 7: File System Access API Permission Persistence
**What goes wrong:** User must re-select export folder every time
**Why it happens:** FileSystemDirectoryHandle can be persisted in IndexedDB but requires permission re-request
**How to avoid:**
- Store handle in IndexedDB (browser-fs-access supports this)
- Call handle.requestPermission({ mode: 'readwrite' }) before reuse
- Fall back to folder picker if permission denied
- Show clear UI: "Last export: /path/to/folder (re-select to change)"
**Warning signs:**
- Folder picker shown every export
- "Permission denied" errors on subsequent exports
**Source:** [Chrome Developers File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access), [MDN File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)

## Code Examples

Verified patterns from codebase analysis:

### Adding Editable Property to Element
```typescript
// 1. Add to TypeScript type (src/types/elements/controls.ts)
export interface ButtonElementConfig extends BaseElement {
  type: 'button'
  label: string
  backgroundColor: string
  borderThickness?: number  // NEW
}

// 2. Add to Zod schema (src/schemas/project.ts)
const ButtonElementSchema = BaseElementSchema.extend({
  type: z.literal('button'),
  label: z.string(),
  backgroundColor: z.string(),
  borderThickness: z.number().optional(),  // NEW
}).passthrough()

// 3. Add to Properties component (src/components/Properties/ButtonProperties.tsx)
<PropertySection title="Appearance">
  <NumberInput
    label="Border Thickness"
    value={element.borderThickness ?? 0}
    onChange={(borderThickness) => onUpdate({ borderThickness })}
    min={0}
    max={10}
  />
</PropertySection>

// 4. Add to CSS generator (src/services/export/cssGenerator.ts)
if (element.type === 'button' && element.borderThickness) {
  styles.push(`border-width: ${element.borderThickness}px;`)
}
```

### Fixing Multi-Window Operation Filtering
```typescript
// Source: src/components/Canvas/hooks/useCopyPaste.ts (copyToClipboard pattern)
const operationOnSelected = useCallback(() => {
  // ALWAYS filter by active window before operating on selectedIds
  const elementsInActiveWindow = selectedIds
    .map((id) => getElement(id))
    .filter((el): el is ElementConfig => {
      if (el === undefined) return false
      const elementWindow = getWindowForElement(el.id)
      return elementWindow?.id === activeWindowId
    })

  // Now operate only on elementsInActiveWindow
  for (const element of elementsInActiveWindow) {
    // Safe to mutate/clone/delete - only affects active window
  }
}, [selectedIds, getElement, getWindowForElement, activeWindowId])
```

### Name Uniqueness Validation (Zod Refinement)
```typescript
// Source: Adapted from schema validation patterns
const ElementNameSchema = z.string()
  .min(1, "Name cannot be empty")
  .refine(
    (name) => {
      const store = useStore.getState()
      const activeWindow = store.windows.find(w => w.id === store.activeWindowId)
      if (!activeWindow) return true

      // Get all elements in active window
      const elementsInWindow = activeWindow.elementIds
        .map(id => store.getElement(id))
        .filter((el): el is ElementConfig => el !== undefined)

      // Check for duplicates (exclude current element if renaming)
      const duplicates = elementsInWindow.filter(el =>
        el.name === name && el.id !== currentElementId
      )

      return duplicates.length === 0
    },
    { message: "Element name must be unique in this window" }
  )
```

### Directory Export with Permission Handling
```typescript
// Source: File System Access API best practices
async function exportToDirectory() {
  let dirHandle: FileSystemDirectoryHandle

  // Try to reuse stored handle
  const storedHandle = await getStoredDirectoryHandle()
  if (storedHandle) {
    const permission = await storedHandle.requestPermission({ mode: 'readwrite' })
    if (permission === 'granted') {
      dirHandle = storedHandle
    }
  }

  // Fall back to picker if no stored handle or permission denied
  if (!dirHandle) {
    dirHandle = await window.showDirectoryPicker()
    await storeDirectoryHandle(dirHandle)
  }

  // Write files
  const fileHandle = await dirHandle.getFileHandle('index.html', { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(htmlContent)
  await writable.close()

  toast.success(`Exported to ${dirHandle.name}/`)
}
```

### Controlled Color Input with Key Prop
```typescript
// Source: React controlled component best practices
<ColorInput
  key={element.id}  // Force remount when element changes
  label="Background Color"
  value={element.backgroundColor}
  onChange={(backgroundColor) => onUpdate({ backgroundColor })}
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for state | Zustand slices | 2023-2024 | 30%+ YoY growth, simpler patterns |
| Jest for testing | Vitest for Vite projects | 2024 | 10-20x faster test runs |
| Custom file pickers | File System Access API | 2023-2024 | Native folder access, permissions |
| Manual color parsing | react-colorful | 2022-2023 | 2.8KB bundle, full format support |
| Custom deep clone | structuredClone() | 2024 | Browser native, handles edge cases |

**Deprecated/outdated:**
- Manual clipboard API: browser-fs-access and native APIs replace custom implementations
- Uncontrolled form inputs: React 18+ strongly prefers controlled components
- any types in TypeScript: Enable strict mode, use unknown or proper types

## Open Questions

1. **BUG-40-01: Font weight selection - exact implementation unclear**
   - What we know: opentype.js can extract font.names.fontSubfamily
   - What's unclear: Whether to show "Inter Light" vs "Light (300)" vs both
   - Recommendation: Show actual font name if available, fall back to generic, let user decide in UX discussion

2. **FEAT-40-04: VST sync bidirectional updates**
   - What we know: Current sync is C++ → UI only (Phase 39 Parameter Sync)
   - What's unclear: Whether UI → C++ sync is needed (slider moves should update APVTS)
   - Recommendation: Mark as LOW priority, requires JUCE C++ changes in INSTvst/EFXvst

3. **FEAT-40-06: Multi-select deselect behavior**
   - What we know: Current implementation is toggle on Ctrl+click
   - What's unclear: Whether Alt should also work (different platforms use different modifiers)
   - Recommendation: Support both Alt and Ctrl for cross-platform consistency

4. **Export folder persistence strategy**
   - What we know: FileSystemDirectoryHandle can be stored in IndexedDB
   - What's unclear: Security/UX tradeoff of auto-reusing vs always asking
   - Recommendation: Store handle, show "Last export: <path>" with button to change

## Sources

### Primary (HIGH confidence)
- Codebase analysis: src/store/index.ts, src/components/Properties/ColorInput.tsx, src/components/Canvas/hooks/useCopyPaste.ts, src/services/serialization.ts
- Package.json: React 18.3.1, TypeScript 5.6.2, Zustand 5.0.10, Vitest 4.0.18, react-colorful 5.6.1
- [MDN File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) - Official web API documentation
- [Chrome Developers File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access) - Implementation guide

### Secondary (MEDIUM confidence)
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - Zustand 30%+ growth, market positioning
- [Zustand DevTools Middleware](https://zustand.docs.pmnd.rs/middlewares/devtools) - Official debugging patterns
- [Testing in 2026: Jest, React Testing Library, and Full Stack Testing Strategies](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies) - Vitest vs Jest performance
- [TypeScript Best Practices in 2025](https://dev.to/mitu_mariam/typescript-best-practices-in-2025-57hb) - Strict mode, discriminated unions
- [Designing a Domain Model to enforce No Duplicate Names](https://github.com/ardalis/DDD-NoDuplicates) - 11 patterns for unique name validation

### Tertiary (LOW confidence)
- [Medium: Why existing React color pickers frustrated me](https://medium.com/@ozergklp/why-existing-react-color-pickers-frustrated-me-and-what-i-built-instead-da47a17ea2b0) - State management issues with react-color
- [Medium: Shallow vs. Deep Copying in React](https://medium.com/@mgarg2121/shallow-vs-deep-copying-in-react-essential-knowledge-for-efficient-state-management-22404614e6a7) - structuredClone usage

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified in package.json and codebase
- Architecture: HIGH - Patterns extracted directly from existing codebase
- Pitfalls: HIGH - Based on codebase analysis and verified web sources
- Features: MEDIUM - File System Access API patterns from official docs, not yet implemented

**Research date:** 2026-01-29
**Valid until:** 2026-02-28 (30 days - stable stack, no breaking changes expected)
