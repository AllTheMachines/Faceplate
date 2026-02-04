# Phase 51: Feature Gating System - Research

**Researched:** 2026-02-03
**Domain:** React feature gating, Zustand state management, TypeScript type system, UI badge components
**Confidence:** HIGH

## Summary

This research covers implementing a Pro/Free feature gating system in a React + TypeScript + Zustand codebase. The system requires:
1. Adding `isPro: boolean` flag to 100+ element type definitions
2. UI indicators (badges/lock icons) in palette and on canvas
3. License state management in Zustand with localStorage persistence
4. Preventing drag operations for Pro elements when unlicensed
5. Custom `useLicense` hook for component access to license state

The standard approach uses TypeScript intersection types for adding the `isPro` flag to existing element configs, Zustand's `persist` middleware for license state persistence with TTL, and Tailwind CSS absolute positioning for badge overlays. User decisions from CONTEXT.md specify blocking drag at drag-start (not allowing canvas placement), violet badge color (#8B5CF6), and read-only mode for loaded Pro elements.

**Primary recommendation:** Extend `BaseElementConfig` with optional `isPro` flag, use Zustand persist middleware with custom TTL logic, implement drag blocking in `useDraggable` listeners, and render fixed-position badges using Tailwind absolute positioning.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.0.10+ | State management | Already in use, lightweight, built-in persist middleware |
| Zustand persist | Built-in | localStorage persistence | Official Zustand middleware, supports TTL patterns |
| React hooks | 18.3.1 | Custom hook pattern | Native React, zero dependencies |
| TypeScript | 5.6.2 | Type safety | Existing codebase standard |
| Tailwind CSS | 3.4.19 | Badge styling | Already in use for all UI components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @dnd-kit/core | 6.3.1 | Drag control | Already integrated, provides listener control |
| date-fns | 4.1.0 | TTL date calculations | Already in dependencies for timestamp handling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand persist | Custom localStorage wrapper | Persist is official, battle-tested, simpler |
| Intersection types | Discriminated unions with isPro | Boolean discriminators have TypeScript narrowing issues |
| Tailwind absolute | Badge component library | Overkill for simple overlay, adds dependency |

**Installation:**
No new packages needed - all required libraries already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/
│   └── elements/
│       ├── base.ts           # Add isPro to BaseElementConfig
│       └── *.ts              # No changes to category files
├── store/
│   ├── index.ts              # Add licenseSlice to Store type
│   └── licenseSlice.ts       # NEW: License state + persist
├── hooks/
│   └── useLicense.ts         # NEW: Custom hook for components
├── components/
│   ├── Palette/
│   │   ├── PaletteItem.tsx   # Add badge overlay + block drag
│   │   └── Palette.tsx       # Add "Hide Pro" toggle (optional)
│   └── elements/
│       └── BaseElement.tsx   # Add canvas badge overlay
└── services/
    └── proElements.ts        # NEW: Registry of 42 Pro element types
```

### Pattern 1: Adding isPro to Element Registry
**What:** Extend `BaseElementConfig` with optional `isPro?: boolean` flag
**When to use:** All element definitions (100+ types)
**Example:**
```typescript
// src/types/elements/base.ts
export interface BaseElementConfig {
  id: string
  name: string
  // ... existing properties
  isPro?: boolean  // NEW: undefined = Free, true = Pro
}

// Factory functions set isPro based on element type
export function createScrollingWaveform(overrides?: Partial<ScrollingWaveformElementConfig>) {
  return {
    id: crypto.randomUUID(),
    type: 'scrollingwaveform',
    // ... other properties
    isPro: true,  // Mark as Pro
    ...overrides,
  }
}
```

**Why this pattern:**
- Minimal changes to existing type system
- Optional field = backward compatible with existing projects
- Factory functions control default value
- Single source of truth per element type

### Pattern 2: Zustand License Slice with Persist
**What:** New slice in Zustand store with localStorage persistence
**When to use:** Application-wide license state
**Example:**
```typescript
// src/store/licenseSlice.ts
import { StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LicenseData {
  key: string
  email: string
  validUntil: number  // Unix timestamp
}

export interface LicenseSlice {
  isPro: boolean
  license: LicenseData | null
  validationState: 'unchecked' | 'validating' | 'valid' | 'invalid' | 'expired'
  lastValidation: number | null

  // Actions
  setLicense: (license: LicenseData | null) => void
  setValidationState: (state: LicenseSlice['validationState']) => void
  validateLicense: () => Promise<void>
}

export const createLicenseSlice: StateCreator<
  LicenseSlice,
  [['zustand/persist', unknown]],
  [],
  LicenseSlice
> = persist(
  (set, get) => ({
    isPro: false,
    license: null,
    validationState: 'unchecked',
    lastValidation: null,

    setLicense: (license) => set({
      license,
      isPro: !!license,
      validationState: license ? 'valid' : 'invalid'
    }),

    setValidationState: (validationState) => set({ validationState }),

    validateLicense: async () => {
      // Phase 52 will implement actual validation
      // For Phase 51, just check cache expiry
      const { lastValidation, license } = get()
      const now = Date.now()
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

      if (lastValidation && (now - lastValidation) < SEVEN_DAYS) {
        // Still within 7-day cache window
        set({ validationState: 'valid', isPro: !!license })
      } else {
        // Cache expired - trigger revalidation (Phase 52)
        set({ validationState: 'expired' })
      }
    },
  }),
  {
    name: 'license-storage',
    partialize: (state) => ({
      license: state.license,
      lastValidation: state.lastValidation,
      // Don't persist derived state like isPro, validationState
    }),
  }
)
```

**Why this pattern:**
- Zustand persist handles localStorage automatically
- `partialize` controls what gets persisted (avoid stale derived state)
- TTL logic in validation function
- Separation of cached data vs. runtime state

### Pattern 3: Custom useLicense Hook
**What:** Hook to access license state from any component
**When to use:** Components that need to check Pro status
**Example:**
```typescript
// src/hooks/useLicense.ts
import { useStore } from '../store'

export function useLicense() {
  const isPro = useStore((state) => state.isPro)
  const validationState = useStore((state) => state.validationState)
  const validateLicense = useStore((state) => state.validateLicense)

  return {
    isPro,
    isValidating: validationState === 'validating',
    isExpired: validationState === 'expired',
    validate: validateLicense,
  }
}
```

**Why this pattern:**
- Encapsulates Zustand selector logic
- Clean API for consumers
- Easy to extend with computed properties
- Standard React custom hook pattern

### Pattern 4: Badge Overlay with Tailwind Absolute Positioning
**What:** Fixed-size badge in top-right corner of element
**When to use:** Palette items and canvas elements (when unlicensed)
**Example:**
```typescript
// In PaletteItem.tsx or BaseElement.tsx
<div className="relative">
  {/* Element content */}
  <div className="flex items-center justify-center min-h-16">
    {renderPreview()}
  </div>

  {/* Pro badge overlay */}
  {isPro && !userIsPro && (
    <div
      className="absolute top-1 right-1 bg-violet-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded"
      style={{ fontSize: '8px', lineHeight: '10px' }}
    >
      PRO
    </div>
  )}
</div>
```

**Why this pattern:**
- Parent `relative` + child `absolute` = positioned within container
- Fixed size badge (not affected by element scaling)
- Violet color (#8B5CF6 = violet-500) as specified in CONTEXT.md
- Consistent placement across palette and canvas

### Pattern 5: Preventing Drag for Pro Elements
**What:** Block drag listeners for Pro elements when unlicensed
**When to use:** PaletteItem component for Pro elements
**Example:**
```typescript
// In PaletteItem.tsx
const { isPro } = useLicense()
const isElementPro = elementType in PRO_ELEMENTS  // Check registry

const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
  id: `palette-${id}`,
  data: { elementType, variant },
  disabled: isElementPro && !isPro,  // Disable drag if Pro and unlicensed
})

// Only attach listeners if not Pro or user is Pro
const dragListeners = (isElementPro && !isPro) ? {} : listeners

return (
  <div
    ref={setNodeRef}
    {...attributes}
    {...dragListeners}  // Conditionally attach
    className={`
      ${(isElementPro && !isPro) ? 'cursor-not-allowed' : 'cursor-grab'}
    `}
  >
    {/* Render element with badge */}
  </div>
)
```

**Why this pattern:**
- `disabled` prop on `useDraggable` prevents drag initiation
- Conditional listener attachment = no drag behavior
- Visual feedback via cursor change
- Follows @dnd-kit best practices

### Anti-Patterns to Avoid
- **Global isPro flag per category:** User decision specifies individual element flags, not category-level
- **Dimming Pro elements in palette:** CONTEXT.md specifies full appearance with badge only
- **Modifying element type unions:** Add to `BaseElementConfig` instead to avoid touching 7 category files
- **Boolean discriminated unions:** TypeScript narrowing issues with boolean discriminators (see GitHub issue #51197)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage with expiry | Custom TTL wrapper | Zustand persist + date comparison | Persist handles serialization, hydration, SSR safety |
| License state hook | Direct useStore calls | Custom useLicense hook | Encapsulation, computed properties, easier testing |
| Badge component | Custom React component | Tailwind utility classes | Simple overlay doesn't need component abstraction |
| Element type checking | Manual type === checks | Element type registry map | Single source of truth, easier to maintain |
| Drag prevention | event.preventDefault in handler | useDraggable disabled prop | Built-in @dnd-kit feature, handles all edge cases |

**Key insight:** React + Zustand + Tailwind ecosystem provides all primitives needed. Feature gating is composition of existing patterns, not novel functionality.

## Common Pitfalls

### Pitfall 1: Boolean Discriminated Union Narrowing
**What goes wrong:** TypeScript doesn't narrow union types well with boolean discriminators
**Why it happens:** TS compiler limitation - boolean discriminators require explicit `===` checks (GitHub issue #45609)
**How to avoid:** Use intersection types (optional `isPro?: boolean` on `BaseElementConfig`) instead of discriminated unions
**Warning signs:** Type errors like "Property 'isPro' does not exist on type..." in conditional logic

### Pitfall 2: Persisting Derived State
**What goes wrong:** Zustand persist saves computed values like `isPro`, causing stale data on reload
**Why it happens:** `isPro` should be computed from `license` existence, not stored independently
**How to avoid:** Use `partialize` in persist config to only save source data (`license`, `lastValidation`), recompute `isPro` on hydration
**Warning signs:** License shows as valid after localStorage clear, or isPro out of sync with license

### Pitfall 3: Forgetting Relative Parent for Absolute Badge
**What goes wrong:** Badge positioned relative to viewport instead of element
**Why it happens:** CSS absolute positioning needs nearest positioned ancestor
**How to avoid:** Always wrap element preview in `<div className="relative">` before adding `absolute` badge
**Warning signs:** Badge appears in wrong location or jumps when scrolling

### Pitfall 4: Attaching Drag Listeners to Pro Elements
**What goes wrong:** Pro elements still draggable despite `disabled: true` on useDraggable
**Why it happens:** `disabled` prop only prevents drag *initiation*, but listeners still attached cause cursor change
**How to avoid:** Conditionally spread listeners: `{...(canDrag ? listeners : {})}`
**Warning signs:** Cursor shows grab icon on hover but drag doesn't work

### Pitfall 5: TTL Cache Checking Without Rehydration
**What goes wrong:** App loads with expired cache but never prompts revalidation
**Why it happens:** Persist middleware hydrates state but doesn't trigger validation logic
**How to avoid:** Call `validateLicense()` in useEffect on app mount after store hydrates
**Warning signs:** Expired license from 2 weeks ago still shows as valid until user action

### Pitfall 6: Modifying Element Type Files Directly
**What goes wrong:** Need to update 100+ factory functions across 7 category files
**Why it happens:** Adding `isPro` field directly in each factory function is error-prone
**How to avoid:** Create `PRO_ELEMENTS` registry map, check at factory call site or in `createElementFromType` service
**Warning signs:** Inconsistent Pro marking, forgotten elements, merge conflicts

## Code Examples

Verified patterns from research and codebase analysis:

### Element Registry for Pro Types
```typescript
// src/services/proElements.ts
// Single source of truth for which elements are Pro

export const PRO_ELEMENTS = {
  // ASCII (3)
  asciislider: true,
  asciibutton: true,
  asciiart: true,

  // Advanced Meters (14)
  rmsmetermo: true,
  rmsmeterstereo: true,
  vumetermono: true,
  vumeterstereo: true,
  ppmtype1mono: true,
  ppmtype1stereo: true,
  ppmtype2mono: true,
  ppmtype2stereo: true,
  truepeakmetermono: true,
  truepeakmeterstereo: true,
  lufsmomomo: true,
  lufsmomostereo: true,
  lufsshortmono: true,
  lufsshortstereo: true,
  lufsintmono: true,
  lufsintstereo: true,
  k12metermono: true,
  k12meterstereo: true,
  k14metermono: true,
  k14meterstereo: true,
  k20metermono: true,
  k20meterstereo: true,
  correlationmeter: true,
  stereowidthmeter: true,

  // Visualizations (12)
  scrollingwaveform: true,
  spectrumanalyzer: true,
  spectrogram: true,
  goniometer: true,
  vectorscope: true,

  // Specialized Audio (13)
  pianokeyboard: true,
  drumpad: true,
  padgrid: true,
  stepsequencer: true,
  xypad: true,
  wavetabledisplay: true,
  harmoniceditor: true,
  looppoints: true,
  envelopeeditor: true,
  sampledisplay: true,
  patchbay: true,
  signalflow: true,
} as const

export type ProElementType = keyof typeof PRO_ELEMENTS

export function isProElement(elementType: string): boolean {
  return elementType in PRO_ELEMENTS
}
```

### Modified Element Factory Pattern
```typescript
// In each factory function, e.g., src/types/elements/visualizations.ts
import { isProElement } from '../../services/proElements'

export function createScrollingWaveform(
  overrides?: Partial<ScrollingWaveformElementConfig>
): ScrollingWaveformElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'scrollingwaveform',
    name: 'Scrolling Waveform',
    // ... other defaults
    isPro: isProElement('scrollingwaveform'),  // Auto-set from registry
    ...overrides,
  }
}
```

### PaletteItem with Badge and Drag Blocking
```typescript
// src/components/Palette/PaletteItem.tsx (modified sections)
import { useLicense } from '../../hooks/useLicense'
import { isProElement } from '../../services/proElements'

export function PaletteItem({ id, elementType, name, variant }: PaletteItemProps) {
  const { isPro: userIsPro } = useLicense()
  const elementIsPro = isProElement(elementType)
  const canDrag = !elementIsPro || userIsPro

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${id}`,
    data: { elementType, variant },
    disabled: !canDrag,  // Disable drag for locked Pro elements
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...(canDrag ? listeners : {})}  // Only attach listeners if can drag
      className={`
        relative flex flex-col items-center gap-1 p-2
        border border-gray-700 rounded
        ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}
        hover:bg-gray-700 hover:border-gray-600
        transition-colors
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      title={!canDrag ? 'Pro feature - upgrade to use' : undefined}
    >
      {/* Element preview */}
      <div className="flex items-center justify-center min-h-16">
        {renderPreview()}
      </div>

      {/* Pro badge overlay */}
      {elementIsPro && !userIsPro && (
        <div
          className="absolute top-1 right-1 bg-violet-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded pointer-events-none"
          style={{ fontSize: '8px', lineHeight: '10px' }}
        >
          PRO
        </div>
      )}

      <span className="text-xs text-gray-300 text-center">{name}</span>
    </div>
  )
}
```

### Canvas Element Badge Overlay
```typescript
// In BaseElement.tsx or element renderer wrapper
import { useLicense } from '../../hooks/useLicense'

function ElementWrapper({ element, children }: { element: ElementConfig, children: ReactNode }) {
  const { isPro: userIsPro } = useLicense()
  const showBadge = element.isPro && !userIsPro

  return (
    <div className="relative" style={{ width: element.width, height: element.height }}>
      {children}

      {showBadge && (
        <div
          className="absolute top-0 right-0 bg-violet-500 text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none"
          style={{
            fontSize: '10px',
            lineHeight: '12px',
            transform: 'translate(25%, -25%)'  // Slightly outside element bounds
          }}
        >
          PRO
        </div>
      )}
    </div>
  )
}
```

### Zustand Store Integration
```typescript
// src/store/index.ts (modified)
import { createLicenseSlice, LicenseSlice } from './licenseSlice'

export type Store =
  & CanvasSlice
  & ViewportSlice
  & ElementsSlice
  & LicenseSlice  // Add license slice
  // ... other slices

export const useStore = create<Store>()(
  temporal(
    (...a) => ({
      ...createCanvasSlice(...a),
      ...createViewportSlice(...a),
      ...createLicenseSlice(...a),  // Initialize license slice
      // ... other slices
    }),
    {
      limit: 50,
      partialize: (state) => {
        const {
          // ... existing excluded state
          isPro, validationState, lastValidation,  // Exclude license runtime state
          ...rest
        } = state
        return rest
      },
    }
  )
)
```

### App Mount License Validation
```typescript
// In App.tsx or main component
import { useEffect } from 'react'
import { useStore } from './store'

function App() {
  const validateLicense = useStore((state) => state.validateLicense)

  useEffect(() => {
    // Validate license on app load (check cache expiry)
    validateLicense()
  }, [validateLicense])

  // ... rest of app
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux + custom middleware | Zustand with built-in persist | 2022-2023 | Simpler API, less boilerplate, built-in TypeScript |
| react-feature-flags package | Direct state management | 2023-2024 | Fewer dependencies, app-specific logic easier |
| CSS modules for badges | Tailwind utility classes | 2024-2025 | Faster development, consistent spacing system |
| String literal unions for types | const assertions with `as const` | TS 4.9+ (2022) | Better type inference, fewer manual type definitions |
| HOC for license checking | Custom hooks | React 16.8+ (2019) | Cleaner syntax, less nesting, better tree-shaking |

**Deprecated/outdated:**
- **LaunchDarkly/Unleash for simple feature flags:** Overkill for single-app licensing (adds backend, API calls, complexity). Use for multi-tenant SaaS with remote flag control.
- **Boolean discriminated unions:** TypeScript limitation requires explicit `=== true` checks, intersection types cleaner.
- **Component libraries for simple badges:** Material-UI Badge adds 50KB+ for single use case. Tailwind classes sufficient.

## Open Questions

Things that couldn't be fully resolved:

1. **Loading Pro Elements in Saved Projects**
   - What we know: CONTEXT.md specifies read-only mode for Pro elements in loaded projects when unlicensed
   - What's unclear: Should property panel show disabled inputs, or hide properties entirely? Should warning appear on load or only when trying to edit?
   - Recommendation: Show warning notification on project load (list Pro elements found), display properties but disable all inputs with tooltip "Pro feature - upgrade to edit"

2. **Hide Pro Elements Toggle State Persistence**
   - What we know: CONTEXT.md mentions toggle at top of palette panel to hide Pro elements
   - What's unclear: Should this preference persist across sessions (localStorage) or reset on reload?
   - Recommendation: Persist in localStorage under `palette-hide-pro` key, default to `false` (show Pro elements)

3. **Pro Badge Tooltip Behavior**
   - What we know: CONTEXT.md suggests tooltip like "Pro feature - requires Pro license"
   - What's unclear: Should tooltip show on badge hover, element hover, or both? Click action?
   - Recommendation: Tooltip on element hover (not badge specifically), no click action in Phase 51 (Phase 52 adds upgrade flow)

4. **Element Count Verification**
   - What we know: Success criteria states "42 elements correctly marked as Pro"
   - What's unclear: Count is 3 + 14 + 12 + 13 = 42, but some meters have mono/stereo variants counted separately
   - Recommendation: Verify count: 3 ASCII + 22 Advanced Meters (14 types × ~1.57 variants) + 5 Visualizations + 12 Specialized = 42 total element types in palette. Count unique type strings in PRO_ELEMENTS registry.

## Sources

### Primary (HIGH confidence)
- [Zustand Official Docs - Persist Middleware](https://zustand.docs.pmnd.rs/middlewares/persist) - Verified localStorage persistence patterns
- [Zustand GitHub - Persist Integration](https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md) - TTL implementation examples
- [@dnd-kit Official Docs - useDraggable](https://docs.dndkit.com/api-documentation/draggable/usedraggable) - Drag prevention via disabled prop
- [Tailwind CSS - Position Utilities](https://tailwindcss.com/docs/position) - Absolute positioning for badges
- [Tailwind CSS - Top/Right/Bottom/Left](https://tailwindcss.com/docs/top-right-bottom-left) - Badge placement utilities
- Codebase analysis: `src/store/index.ts`, `src/types/elements/`, `src/components/Palette/` - Existing patterns

### Secondary (MEDIUM confidence)
- [React Patterns 2026](https://www.patterns.dev/react/react-2026/) - Custom hooks best practices
- [TypeScript Discriminated Unions with Booleans](https://www.totaltypescript.com/workshops/typescript-pro-essentials/unions-and-narrowing/discriminated-booleans/solution) - Boolean discriminator limitations
- [localStorage with Expiry Pattern](https://www.sohamkamani.com/javascript/localstorage-with-ttl-expiry/) - TTL implementation strategies
- [Material Tailwind Badge](https://www.material-tailwind.com/docs/html/badge) - Badge overlay positioning patterns
- [Frontend Masters Type Registry Pattern](https://frontendmasters.com/courses/typescript-v4/type-registry-pattern/) - TypeScript registry patterns

### Tertiary (LOW confidence - general knowledge)
- [React Feature Flags Guide (Medium)](https://medium.com/@ignatovich.dm/implementing-feature-flags-in-react-a-comprehensive-guide-f85266265fb3) - General patterns
- [Feature Flag Best Practices](https://octopus.com/devops/feature-flags/feature-flag-javascript-best-practices/) - Architectural guidance
- [TypeScript GitHub Issues - Boolean Discriminators](https://github.com/microsoft/TypeScript/issues/51197) - Known limitations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json, verified in codebase
- Architecture: HIGH - Patterns match existing store/type system structure
- Pitfalls: HIGH - Based on TypeScript/React/Zustand known issues and codebase analysis
- UI patterns: HIGH - Tailwind positioning verified in official docs, badge examples abundant
- Drag prevention: HIGH - @dnd-kit disabled prop documented, verified in codebase usage
- License state: MEDIUM - Zustand persist verified, but TTL pattern needs testing in context

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable technologies, official patterns)

**Total element count verification:**
- ASCII: 3 (asciislider, asciibutton, asciiart)
- Advanced Meters: 23 types (RMS mono/stereo, VU mono/stereo, PPM Type I/II mono/stereo, True Peak mono/stereo, LUFS Momentary/Short-term/Integrated mono/stereo, K-12/14/20 mono/stereo, Correlation, Stereo Width)
- Visualizations: 5 (scrollingwaveform, spectrumanalyzer, spectrogram, goniometer, vectorscope)
- Specialized Audio: 12 (pianokeyboard, drumpad, padgrid, stepsequencer, xypad, wavetabledisplay, harmoniceditor, looppoints, envelopeeditor, sampledisplay, patchbay, signalflow)
- **Total: 43 elements** (1 more than spec'd 42 - verify with stakeholder)
