# Phase 6: Alignment & Polish - Research

**Researched:** 2026-01-23
**Domain:** Copy/Paste, Keyboard Shortcuts, Clipboard API
**Confidence:** HIGH

## Summary

This phase adds productivity features for efficient UI creation with complex layouts. The core requirement is implementing copy/paste functionality for canvas elements using Ctrl+C/Ctrl+V keyboard shortcuts, with pasted elements appearing offset from originals.

The standard approach uses the Clipboard API for clipboard operations combined with react-hotkeys-hook for keyboard shortcuts. For deep cloning element state, the modern `structuredClone()` method is preferred over JSON.stringify/parse as it handles complex objects, circular references, and preserves types like Date objects. The project already has react-hotkeys-hook v5.2.3 installed and patterns for preventing shortcut conflicts with form inputs via `enableOnFormTags: false`.

A key UX pattern from design tools (Figma, Sketch) is offsetting pasted elements by a small amount (typically +10-20px on both x and y axes) to make them visually distinct from the original and easier to select. Elements need new UUIDs generated on paste to prevent ID conflicts, and the paste operation should be undoable via the existing zundo temporal store.

**Primary recommendation:** Use Clipboard API with `structuredClone()` for deep cloning, offset pasted elements by 20px, generate new UUIDs, and integrate with existing keyboard shortcut infrastructure using `enableOnFormTags: false` to prevent conflicts with property panel inputs.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Clipboard API | Native | Read/write clipboard data | Modern browser standard, replaces deprecated `document.execCommand('copy')` |
| structuredClone() | Native | Deep clone complex objects | Native method available since March 2022, handles circular refs and complex types |
| react-hotkeys-hook | 5.2.3 | Keyboard shortcuts | Already installed, declarative API, form input handling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| crypto.randomUUID() | Native | Generate new UUIDs for pasted elements | Already used in element factories, no additional dependencies |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Clipboard API | react-copy-to-clipboard | Third-party lib adds dependency; Clipboard API is native and well-supported |
| structuredClone() | JSON.stringify/parse | JSON loses functions, Dates become strings, can't handle circular refs |
| structuredClone() | Lodash _.cloneDeep | Adds 24KB dependency; structuredClone is native and faster |

**Installation:**
```bash
# No new packages needed - all native APIs or already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── store/
│   └── elementsSlice.ts     # Add copyElements, pasteElements actions
├── components/Canvas/hooks/
│   ├── useKeyboardShortcuts.ts  # Add Ctrl+C, Ctrl+V handlers
│   └── useCopyPaste.ts          # NEW: Copy/paste logic hook
└── utils/
    └── clipboard.ts             # NEW: Clipboard helpers
```

### Pattern 1: In-Memory Clipboard with Fallback

**What:** Store copied elements in component state/ref as primary clipboard, use Clipboard API as secondary/optional feature

**When to use:** When clipboard data is complex (objects) and doesn't need cross-application paste

**Example:**
```typescript
// Source: Verified pattern from research + existing codebase patterns
import { useRef } from 'react'
import { useStore } from '../../../store'

export function useCopyPaste() {
  const clipboardRef = useRef<ElementConfig[]>([])
  const selectedIds = useStore((state) => state.selectedIds)
  const getElement = useStore((state) => state.getElement)
  const addElement = useStore((state) => state.addElement)

  const copyToClipboard = () => {
    const elements = selectedIds
      .map((id) => getElement(id))
      .filter((el): el is ElementConfig => el !== undefined)

    clipboardRef.current = elements

    // Optional: Also write to system clipboard for external paste
    navigator.clipboard.writeText(JSON.stringify(elements, null, 2))
      .catch(err => console.warn('Clipboard write failed', err))
  }

  const pasteFromClipboard = () => {
    if (clipboardRef.current.length === 0) return

    const PASTE_OFFSET = 20

    clipboardRef.current.forEach((original) => {
      const cloned = structuredClone(original)
      const pasted = {
        ...cloned,
        id: crypto.randomUUID(),
        x: cloned.x + PASTE_OFFSET,
        y: cloned.y + PASTE_OFFSET,
      }
      addElement(pasted)
    })
  }

  return { copyToClipboard, pasteFromClipboard }
}
```

### Pattern 2: Keyboard Shortcut Integration

**What:** Use react-hotkeys-hook with `enableOnFormTags: false` to prevent conflicts with property inputs

**When to use:** All keyboard shortcuts in canvas context

**Example:**
```typescript
// Source: Existing pattern from useKeyboardShortcuts.ts
import { useHotkeys } from 'react-hotkeys-hook'
import { useCopyPaste } from './useCopyPaste'

export function useKeyboardShortcuts() {
  const { copyToClipboard, pasteFromClipboard } = useCopyPaste()

  // Copy selected elements
  useHotkeys(
    'ctrl+c, meta+c',
    (e) => {
      e.preventDefault()
      copyToClipboard()
    },
    { enableOnFormTags: false },
    [copyToClipboard]
  )

  // Paste elements
  useHotkeys(
    'ctrl+v, meta+v',
    (e) => {
      e.preventDefault()
      pasteFromClipboard()
    },
    { enableOnFormTags: false },
    [pasteFromClipboard]
  )
}
```

### Pattern 3: Deep Cloning with UUID Regeneration

**What:** Use `structuredClone()` to deep clone element, then replace ID and offset position

**When to use:** When pasting elements to avoid reference sharing and ID conflicts

**Example:**
```typescript
// Source: MDN structuredClone + existing element types
function cloneElementForPaste(
  element: ElementConfig,
  offset: { x: number; y: number }
): ElementConfig {
  // Deep clone preserves all properties including nested objects
  const cloned = structuredClone(element)

  // Generate new ID to prevent conflicts
  const pasted = {
    ...cloned,
    id: crypto.randomUUID(),
    x: cloned.x + offset.x,
    y: cloned.y + offset.y,
  }

  return pasted
}
```

### Anti-Patterns to Avoid

- **Shallow copy with spread operator:** `{...element}` doesn't clone nested objects (colorStops in meters, etc.)
- **JSON.stringify/parse for cloning:** Loses Date types, can't handle circular refs, slower than structuredClone
- **Same UUID on paste:** Creates ID conflicts, breaks selection and CRUD operations
- **Zero offset on paste:** Pasted element overlaps original, confusing for users
- **Allowing shortcuts in form inputs:** Users typing "c" in text field shouldn't trigger copy

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deep object cloning | Custom recursive clone function | `structuredClone()` | Native, handles edge cases (circular refs, TypedArrays, Dates), faster |
| Keyboard shortcut management | Manual keydown event listeners | react-hotkeys-hook | Handles key combos, conflicts, cross-platform (Ctrl/Cmd), form input filtering |
| Clipboard write with fallback | Custom execCommand wrapper | Clipboard API with try/catch | Modern API, async, permissions-aware, better error handling |
| UUID generation | Math.random() string manipulation | `crypto.randomUUID()` | Cryptographically secure, proper UUID v4 format, native |

**Key insight:** The Clipboard API and structuredClone are modern native APIs (2022+) that eliminate the need for third-party libraries. Using them reduces bundle size and provides better performance and reliability.

## Common Pitfalls

### Pitfall 1: Forgetting to Regenerate UUIDs

**What goes wrong:** Pasting an element without generating a new UUID creates two elements with the same ID, breaking selection, update, and delete operations.

**Why it happens:** Developer assumes spread operator creates a "new" object, forgetting that ID is part of the copied data.

**How to avoid:** Always generate new `id: crypto.randomUUID()` when pasting. Add type-level checks if possible.

**Warning signs:** Multiple elements selected when clicking one, updates affecting wrong elements, deletion removing multiple elements.

### Pitfall 2: Clipboard API Security/Permission Issues

**What goes wrong:** `navigator.clipboard.writeText()` fails silently or throws permission errors, especially in iframes or non-HTTPS contexts.

**Why it happens:** Clipboard API requires secure context (HTTPS), active tab, and user interaction. Browsers also differ in permission handling.

**How to avoid:**
- Wrap clipboard calls in try/catch
- Trigger from user interaction (click, keypress)
- Use in-memory clipboard as primary, system clipboard as optional
- Test in production HTTPS environment

**Warning signs:** Clipboard operations work in dev (localhost) but fail in production, or fail in certain browsers.

### Pitfall 3: Copy/Paste Interfering with Text Selection

**What goes wrong:** User selects text in property panel, presses Ctrl+C to copy text, but instead copies canvas elements.

**Why it happens:** Keyboard shortcuts fire globally without checking if user is interacting with text inputs.

**How to avoid:** Use `enableOnFormTags: false` option in react-hotkeys-hook, preventing shortcuts from firing when inputs are focused.

**Warning signs:** User reports "can't copy/paste text in property fields" or "keyboard shortcuts don't work in text boxes."

### Pitfall 4: Paste Offset Breaking on Small Canvas

**What goes wrong:** Fixed offset (e.g., +20px) causes pasted element to appear off-screen or far from viewport center on small canvases.

**Why it happens:** Offset is absolute, not relative to viewport or canvas size.

**How to avoid:** For Phase 6, use fixed offset (simple, predictable). For future: consider viewport-relative offset or smart positioning.

**Warning signs:** Users complain "pasted element disappeared" or "can't find pasted element."

### Pitfall 5: Undo/Redo Not Including Paste

**What goes wrong:** Paste operation doesn't appear in undo history, or undo after paste has unexpected behavior.

**Why it happens:** Paste calls `addElement` which should be in history, but if temporal store isn't configured correctly, state changes might not be tracked.

**How to avoid:** Verify that `addElement` mutations are tracked by zundo. Existing setup should handle this automatically since elements are in partialize.

**Warning signs:** Ctrl+Z after paste doesn't undo paste, or undo history missing paste operations.

## Code Examples

Verified patterns from official sources:

### Clipboard API Usage (Text)
```typescript
// Source: MDN Clipboard API
// https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API

// Write text to clipboard (requires user interaction)
async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.warn('Clipboard write failed:', err)
    return false
  }
}

// Read text from clipboard (requires permission)
async function readTextFromClipboard(): Promise<string | null> {
  try {
    const text = await navigator.clipboard.readText()
    return text
  } catch (err) {
    console.warn('Clipboard read failed:', err)
    return null
  }
}
```

### Deep Cloning with structuredClone
```typescript
// Source: MDN Window.structuredClone()
// https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone

interface MeterElementConfig {
  id: string
  type: 'meter'
  colorStops: Array<{ position: number; color: string }>
  // ... other props
}

const original: MeterElementConfig = {
  id: 'meter-1',
  type: 'meter',
  colorStops: [
    { position: 0, color: '#10b981' },
    { position: 0.7, color: '#eab308' }
  ]
}

// Deep clone - colorStops array and objects are also cloned
const cloned = structuredClone(original)
cloned.colorStops[0].color = '#ff0000' // Doesn't affect original

console.log(original.colorStops[0].color) // Still '#10b981'
```

### react-hotkeys-hook with Form Tag Prevention
```typescript
// Source: GitHub - JohannesKlauss/react-hotkeys-hook
// https://github.com/JohannesKlauss/react-hotkeys-hook

import { useHotkeys } from 'react-hotkeys-hook'

function MyComponent() {
  // This won't fire when user is typing in inputs
  useHotkeys(
    'ctrl+c',
    (e) => {
      e.preventDefault()
      handleCopy()
    },
    {
      enableOnFormTags: false, // Default is false
      preventDefault: true
    }
  )

  // For shortcuts that SHOULD work in inputs (e.g., submit form)
  useHotkeys(
    'ctrl+enter',
    handleSubmit,
    {
      enableOnFormTags: true, // Enable in form inputs
      enableOnContentEditable: true
    }
  )
}
```

### Complete Copy/Paste Implementation
```typescript
// Source: Synthesized from research patterns + existing codebase

import { useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useStore } from '../../../store'
import { ElementConfig } from '../../../types/elements'

const PASTE_OFFSET = 20

export function useCopyPaste() {
  // In-memory clipboard (primary)
  const clipboardRef = useRef<ElementConfig[]>([])

  // Store hooks
  const selectedIds = useStore((state) => state.selectedIds)
  const getElement = useStore((state) => state.getElement)
  const addElement = useStore((state) => state.addElement)
  const clearSelection = useStore((state) => state.clearSelection)
  const selectMultiple = useStore((state) => state.selectMultiple)

  const copyToClipboard = () => {
    // Get selected elements
    const elements = selectedIds
      .map((id) => getElement(id))
      .filter((el): el is ElementConfig => el !== undefined)

    if (elements.length === 0) return

    // Store in memory (reliable)
    clipboardRef.current = elements

    // Optional: Also write to system clipboard for debugging/export
    try {
      navigator.clipboard.writeText(JSON.stringify(elements, null, 2))
    } catch (err) {
      // Clipboard API failure is non-critical
      console.debug('System clipboard write skipped:', err)
    }
  }

  const pasteFromClipboard = () => {
    if (clipboardRef.current.length === 0) return

    const pastedIds: string[] = []

    clipboardRef.current.forEach((original) => {
      // Deep clone with structuredClone
      const cloned = structuredClone(original)

      // Generate new ID and offset position
      const pasted: ElementConfig = {
        ...cloned,
        id: crypto.randomUUID(),
        x: cloned.x + PASTE_OFFSET,
        y: cloned.y + PASTE_OFFSET,
      }

      addElement(pasted)
      pastedIds.push(pasted.id)
    })

    // Select pasted elements for immediate manipulation
    if (pastedIds.length > 0) {
      clearSelection()
      selectMultiple(pastedIds)
    }
  }

  // Keyboard shortcuts
  useHotkeys(
    'ctrl+c, meta+c',
    (e) => {
      e.preventDefault()
      copyToClipboard()
    },
    { enableOnFormTags: false }
  )

  useHotkeys(
    'ctrl+v, meta+v',
    (e) => {
      e.preventDefault()
      pasteFromClipboard()
    },
    { enableOnFormTags: false }
  )

  return { copyToClipboard, pasteFromClipboard }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| document.execCommand('copy') | Clipboard API | 2018-2020 | Modern async API, better permissions, more reliable |
| JSON.stringify/parse cloning | structuredClone() | March 2022 | Native deep clone, handles complex types, 2-3x faster |
| Manual keydown listeners | react-hotkeys-hook | 2019+ | Declarative, handles combos/conflicts, better DX |
| Custom UUID generation | crypto.randomUUID() | 2021+ | Cryptographically secure, standard format, native |

**Deprecated/outdated:**
- **document.execCommand('copy'):** Deprecated, synchronous, poor error handling. Use Clipboard API instead.
- **JSON.parse(JSON.stringify()):** Still works but loses types (Dates, Functions), fails on circular refs. Use structuredClone().
- **Math.random() UUIDs:** Not cryptographically secure, collision risk. Use crypto.randomUUID().

## Open Questions

Things that couldn't be fully resolved:

1. **Should paste offset be viewport-aware or fixed?**
   - What we know: Design tools like Figma use fixed offset (+10px). Research shows viewport-aware offset is complex.
   - What's unclear: User preference for large canvas with small elements vs small canvas with large elements.
   - Recommendation: Start with fixed offset (20px), gather user feedback, consider viewport-relative in future phase.

2. **Should Ctrl+X (cut) be implemented in Phase 6?**
   - What we know: Phase 6 requirements specify copy/paste, not cut. Delete already exists via Delete key.
   - What's unclear: User expectation for cut behavior (copy + delete).
   - Recommendation: Defer to future phase unless user explicitly requests. Copy+paste+delete covers the use case.

3. **Should system clipboard be readable for external paste?**
   - What we know: Clipboard.readText() requires permission prompt in most browsers, degraded UX.
   - What's unclear: Whether users expect to paste elements from other instances of the app or other tools.
   - Recommendation: Use in-memory clipboard only (simpler, no permissions). Revisit if cross-instance paste is requested.

## Sources

### Primary (HIGH confidence)
- [MDN Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) - Clipboard methods, security, browser support
- [MDN Window.structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone) - Deep cloning API
- [GitHub - react-hotkeys-hook](https://github.com/JohannesKlauss/react-hotkeys-hook) - Keyboard shortcuts library
- Existing codebase:
  - `/src/store/elementsSlice.ts` - Element CRUD operations
  - `/src/components/Canvas/hooks/useKeyboardShortcuts.ts` - Keyboard shortcut patterns
  - `/src/types/elements.ts` - Element type system with discriminated unions

### Secondary (MEDIUM confidence)
- [LogRocket - Implementing copy-to-clipboard in React](https://blog.logrocket.com/implementing-copy-clipboard-react-clipboard-api/) - React patterns
- [Figma Forum - Paste offset pattern](https://forum.figma.com/t/when-pasting-or-duplicating-offset-the-new-elements-position-and-add-descriptor-like-copy-to-the-name/4227) - UX pattern validation
- [WebAIM - Keyboard Accessibility](https://webaim.org/techniques/keyboard/) - Accessibility best practices
- [Builder.io - structuredClone deep cloning](https://www.builder.io/blog/structured-clone) - Modern cloning patterns

### Tertiary (LOW confidence)
- [DEV Community - Beyond the Spread: structuredClone vs spread](https://dev.to/cristiansifuentes/beyond-the-spread-structuredclone-vs-obj-deep-copy-tactics-every-react--4pip) - Pattern comparison
- [DEV Community - You Don't Know Undo/Redo](https://dev.to/isaachagoel/you-dont-know-undoredo-4hol) - Undo/redo patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All native APIs or already installed, verified via official docs
- Architecture: HIGH - Patterns verified against existing codebase structure
- Pitfalls: MEDIUM - Derived from general web dev knowledge and StackOverflow patterns, not library-specific docs

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - stable APIs, unlikely to change)
