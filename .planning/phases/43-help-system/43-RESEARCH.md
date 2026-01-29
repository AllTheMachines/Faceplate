# Phase 43: Help System - Research

**Researched:** 2026-01-29
**Domain:** Contextual help, documentation rendering, keyboard shortcuts
**Confidence:** HIGH

## Summary

The Help System phase adds contextual help buttons to Properties Panel sections, element-type documentation, and F1 keyboard shortcut support. Research focused on UX patterns for contextual help, HTML documentation rendering in popup windows, keyboard event handling in React, and browser popup blocker constraints.

**Key findings:**
- The project already has `react-hotkeys-hook` installed (v5.2.3) which provides robust F1 key handling with preventDefault support
- Help buttons should use the `?` icon (not `i`) for answering "why?" questions users might have about properties
- `window.open()` must be called directly in user event handlers to avoid popup blockers
- Documentation content should be lightweight HTML with dark theme styling matching the app's existing Tailwind design system
- Contextual help should be brief, relevant, and non-intrusive

**Primary recommendation:** Use `window.open()` with inline HTML content for help windows (no external files needed), implement F1 keyboard shortcut with `react-hotkeys-hook`, and organize help content as TypeScript objects mapped by section/element type for maintainability.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hotkeys-hook | 5.2.3 | Keyboard shortcuts | Already installed, supports F1 keys with preventDefault |
| window.open() | Browser API | Help window rendering | Standard browser API, avoids modal complexity, works with popup blockers when called in user events |
| Tailwind CSS | 3.4.19 | Dark theme styling | Already used throughout app, ensures visual consistency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Prism.js | 1.29.x | Syntax highlighting | If code examples need syntax highlighting (optional) |
| DOMPurify | Already installed (isomorphic-dompurify 2.35.0) | HTML sanitization | If accepting any dynamic/user-generated help content |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| window.open() | Modal/Dialog | Modals block main UI, don't allow copy-paste while working, harder to resize |
| window.open() | React Portal + floating div | More complex implementation, doesn't give users browser window controls |
| Inline HTML | External .html files | External files require bundling/serving, harder to maintain, can't reference TypeScript types |
| react-hotkeys-hook | Custom useEffect listener | Already installed, handles edge cases (focus, scoping, conflicts) |

**Installation:**
```bash
# No new packages needed - everything is already installed
# Optional if syntax highlighting is needed:
npm install prismjs @types/prismjs
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/
│   └── helpService.ts          # Help window management, content rendering
├── components/
│   ├── Properties/
│   │   └── PropertySection.tsx # Add HelpButton to header
│   └── common/
│       └── HelpButton.tsx      # Reusable (?) button component
├── content/
│   └── help/
│       ├── sections.ts         # Help content for property sections
│       ├── elements.ts         # Help content for element types
│       └── styles.ts           # CSS template for help windows
└── hooks/
    └── useHelpShortcut.ts      # F1 keyboard shortcut hook
```

### Pattern 1: Help Content as TypeScript Objects

**What:** Store help content as typed objects with HTML strings, not external files
**When to use:** Always - provides type safety, easier maintenance, no bundling complexity
**Example:**
```typescript
// src/content/help/sections.ts
export interface HelpContent {
  title: string
  description: string
  examples?: Array<{
    label: string
    code?: string
    explanation: string
  }>
  relatedTopics?: string[]
}

export const sectionHelp: Record<string, HelpContent> = {
  'position-size': {
    title: 'Position & Size',
    description: 'Control the element\'s position and dimensions on the canvas.',
    examples: [
      {
        label: 'Positioning',
        explanation: 'X and Y coordinates are relative to the top-left corner of the canvas (0,0).'
      },
      {
        label: 'Sizing',
        explanation: 'Width and Height define the element\'s bounding box. Minimum size is 20x20 to ensure visibility.'
      }
    ]
  },
  // ... more sections
}
```

### Pattern 2: Help Window with Inline HTML

**What:** Use `window.open()` with a data URL containing styled HTML
**When to use:** For all help windows - avoids external files and bundling complexity
**Example:**
```typescript
// src/services/helpService.ts
export function openHelpWindow(content: HelpContent): void {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${content.title} - Help</title>
        <style>
          body {
            background: #1a1a1a;
            color: #e5e5e5;
            font-family: system-ui, -apple-system, sans-serif;
            padding: 24px;
            margin: 0;
            line-height: 1.6;
          }
          h1 { color: #fff; font-size: 24px; margin: 0 0 16px 0; }
          code {
            background: #2d2d2d;
            padding: 2px 6px;
            border-radius: 3px;
            color: #60a5fa;
          }
          pre {
            background: #2d2d2d;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <h1>${content.title}</h1>
        <p>${content.description}</p>
        ${content.examples?.map(ex => `
          <h3>${ex.label}</h3>
          <p>${ex.explanation}</p>
        `).join('') || ''}
      </body>
    </html>
  `

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const helpWindow = window.open(url, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes')

  // Clean up the blob URL after window opens
  if (helpWindow) {
    helpWindow.addEventListener('load', () => URL.revokeObjectURL(url))
  }
}
```

### Pattern 3: F1 Keyboard Shortcut with react-hotkeys-hook

**What:** Use `useHotkeys` hook to capture F1 key and prevent browser's default help
**When to use:** At the root component level to provide global F1 support
**Example:**
```typescript
// src/hooks/useHelpShortcut.ts
import { useHotkeys } from 'react-hotkeys-hook'
import { useStore } from '../store'
import { openHelpWindow } from '../services/helpService'
import { getHelpForElement } from '../content/help/elements'

export function useHelpShortcut() {
  const selectedIds = useStore(state => state.selectedIds)
  const elements = useStore(state => state.elements)

  useHotkeys('f1', (event) => {
    event.preventDefault() // Prevent browser's default help

    // Get help for selected element
    if (selectedIds.length === 1) {
      const element = elements.find(el => el.id === selectedIds[0])
      if (element) {
        const helpContent = getHelpForElement(element.type)
        openHelpWindow(helpContent)
        return
      }
    }

    // Fallback to general help
    openHelpWindow(getGeneralHelp())
  }, [selectedIds, elements])
}
```

### Pattern 4: HelpButton Component

**What:** Reusable (?) button that opens help for a specific topic
**When to use:** In PropertySection headers and anywhere contextual help is needed
**Example:**
```typescript
// src/components/common/HelpButton.tsx
import { openHelpWindow } from '../../services/helpService'
import type { HelpContent } from '../../content/help/sections'

interface HelpButtonProps {
  content: HelpContent
  className?: string
}

export function HelpButton({ content, className = '' }: HelpButtonProps) {
  return (
    <button
      onClick={() => openHelpWindow(content)}
      className={`text-gray-400 hover:text-gray-200 transition-colors ${className}`}
      title="Show help"
      aria-label={`Help for ${content.title}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
  )
}
```

### Pattern 5: Updated PropertySection with Help Button

**What:** Enhance PropertySection component to accept optional help content
**When to use:** For all property sections that benefit from documentation
**Example:**
```typescript
// src/components/Properties/PropertySection.tsx
import { HelpButton } from '../common/HelpButton'
import type { HelpContent } from '../../content/help/sections'

interface PropertySectionProps {
  title: string
  children: React.ReactNode
  helpContent?: HelpContent
}

export function PropertySection({ title, children, helpContent }: PropertySectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        {helpContent && <HelpButton content={helpContent} />}
      </div>
      <div>{children}</div>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Opening help windows on hover:** Triggers popup blockers, considered intrusive UX
- **Using alert() or confirm() for help:** Not themeable, blocks all interaction, poor UX
- **External .html help files:** Harder to maintain, requires bundling configuration, can't reference TypeScript types
- **Calling window.open() asynchronously:** Will be blocked by popup blockers - must be in direct user event handler
- **Using deprecated keyCode:** Use `event.key === 'F1'` instead of `event.keyCode === 112`
- **Forgetting to clean up blob URLs:** Memory leak - always revoke after window loads
- **Modal dialogs for help:** Blocks main UI, prevents users from referencing help while working

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard shortcuts | Custom keydown listeners with key codes | react-hotkeys-hook | Already installed, handles modifier keys, conflicts, scoping, focus management, provides preventDefault option |
| HTML sanitization | Custom regex/replacement | DOMPurify (already installed) | Prevents XSS attacks, handles edge cases, battle-tested |
| Syntax highlighting | Manual <span> wrapping | Prism.js or highlight.js (if needed) | Handles language detection, proper tokenization, multiple themes |
| Dark theme detection | Manual media query listeners | Tailwind's dark: classes | Already configured, reactive, handles system preferences |
| Popup window positioning | Manual screen calculations | window.open() features string | Browser handles multi-monitor, screen edges, OS constraints |

**Key insight:** Keyboard event handling has many edge cases (modifier keys, focus context, concurrent handlers, browser shortcuts). Use a proven library like react-hotkeys-hook rather than building custom solutions.

## Common Pitfalls

### Pitfall 1: Popup Blocker Issues

**What goes wrong:** Help windows get blocked by browser popup blockers
**Why it happens:** Calling `window.open()` asynchronously (after fetch, setTimeout, Promise) breaks the direct user interaction chain
**How to avoid:**
- Always call `window.open()` directly in the event handler (onClick, onKeyDown)
- If async content loading is needed, open window first with placeholder content, then update it
- Never call `window.open()` from useEffect without user interaction
**Warning signs:**
- Help button click doesn't open window in Chrome/Firefox
- Console warning: "Popup blocked"
- `window.open()` returns `null`

### Pitfall 2: F1 Key Opens Browser Help

**What goes wrong:** F1 key opens browser's default help instead of app help
**Why it happens:** Not calling `event.preventDefault()` on the keyboard event
**How to avoid:**
- Use `preventDefault: true` option in react-hotkeys-hook, OR
- Call `event.preventDefault()` in the callback
- Test in multiple browsers (Chrome, Firefox, Edge) as behavior varies
**Warning signs:**
- New browser tab/window opens to browser help documentation
- Multiple windows open (both browser help and app help)

### Pitfall 3: Help Content Out of Sync

**What goes wrong:** Help documentation describes properties that no longer exist or have changed
**Why it happens:** Help content is maintained separately from component code
**How to avoid:**
- Keep help content in same directory structure as components
- Review help content in PR review when changing properties
- Consider adding JSDoc comments that reference help content keys
- Use TypeScript types to ensure help content matches element types
**Warning signs:**
- User reports help is incorrect/outdated
- Help mentions features not in current version
- Properties changed but help wasn't updated

### Pitfall 4: Memory Leaks from Blob URLs

**What goes wrong:** Creating blob URLs for help windows without revoking them causes memory leaks
**Why it happens:** `URL.createObjectURL()` creates a reference that persists until explicitly revoked
**How to avoid:**
- Always call `URL.revokeObjectURL(url)` after the window loads
- Use window's `load` event listener to trigger cleanup
- Consider storing window reference to prevent creating duplicate windows
**Warning signs:**
- Increasing memory usage when opening help repeatedly
- Browser performance degrades over time
- Dev tools show increasing blob URL count

### Pitfall 5: Inaccessible Help Buttons

**What goes wrong:** Help buttons don't work with keyboard navigation or screen readers
**Why it happens:** Missing accessibility attributes and keyboard event handlers
**How to avoid:**
- Use semantic `<button>` element (not `<div>` or `<span>`)
- Include `aria-label` with descriptive text
- Ensure button is keyboard focusable (default for `<button>`)
- Provide visual focus indicator with CSS
- Test with keyboard navigation (Tab, Enter)
**Warning signs:**
- Can't reach help button with Tab key
- Screen reader doesn't announce button purpose
- Enter key doesn't activate button

### Pitfall 6: Help Windows Don't Match App Theme

**What goes wrong:** Help windows have light theme or inconsistent styling
**Why it happens:** Forgot to include CSS in the HTML template or used default browser styles
**How to avoid:**
- Include complete CSS in `<style>` tag in help window HTML
- Extract colors from Tailwind config to reuse exact values
- Test help window appearance in isolation
- Consider creating a shared CSS template constant
**Warning signs:**
- Help window has white background while app is dark
- Fonts don't match app typography
- Colors/spacing looks inconsistent

## Code Examples

Verified patterns from research and existing codebase:

### Complete Help Service Implementation
```typescript
// src/services/helpService.ts
import type { HelpContent } from '../content/help/sections'

// Dark theme CSS matching Tailwind design system
const HELP_WINDOW_STYLES = `
  body {
    background: #1a1a1a;
    color: #e5e5e5;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 32px;
    margin: 0;
    line-height: 1.6;
    font-size: 14px;
  }

  h1 {
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  h2 {
    color: #e5e5e5;
    font-size: 18px;
    font-weight: 600;
    margin: 24px 0 12px 0;
  }

  h3 {
    color: #d4d4d4;
    font-size: 16px;
    font-weight: 500;
    margin: 16px 0 8px 0;
  }

  p {
    margin: 0 0 12px 0;
    color: #d4d4d4;
  }

  ul, ol {
    margin: 0 0 12px 0;
    padding-left: 24px;
  }

  li {
    margin: 4px 0;
    color: #d4d4d4;
  }

  code {
    background: #2d2d2d;
    color: #60a5fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 13px;
  }

  pre {
    background: #2d2d2d;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 12px 0;
  }

  pre code {
    background: none;
    padding: 0;
  }

  .example {
    background: #262626;
    border-left: 3px solid #3b82f6;
    padding: 12px 16px;
    margin: 12px 0;
    border-radius: 4px;
  }

  .example-label {
    color: #3b82f6;
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 8px;
  }

  .related-topics {
    background: #262626;
    padding: 16px;
    border-radius: 6px;
    margin-top: 24px;
  }

  .related-topics h3 {
    margin-top: 0;
  }

  a {
    color: #60a5fa;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`

function generateHelpHTML(content: HelpContent): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.title} - Help</title>
        <style>${HELP_WINDOW_STYLES}</style>
      </head>
      <body>
        <h1>${content.title}</h1>
        <p>${content.description}</p>

        ${content.examples?.length ? `
          <h2>Examples</h2>
          ${content.examples.map(ex => `
            <div class="example">
              <div class="example-label">${ex.label}</div>
              ${ex.code ? `<pre><code>${escapeHtml(ex.code)}</code></pre>` : ''}
              <p>${ex.explanation}</p>
            </div>
          `).join('')}
        ` : ''}

        ${content.relatedTopics?.length ? `
          <div class="related-topics">
            <h3>Related Topics</h3>
            <ul>
              ${content.relatedTopics.map(topic => `<li>${topic}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </body>
    </html>
  `
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Track open help windows to prevent duplicates
const openWindows = new Map<string, Window>()

export function openHelpWindow(content: HelpContent): void {
  const windowKey = `help-${content.title}`

  // Focus existing window if already open
  const existingWindow = openWindows.get(windowKey)
  if (existingWindow && !existingWindow.closed) {
    existingWindow.focus()
    return
  }

  const html = generateHelpHTML(content)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)

  // Open window with specific dimensions and features
  const helpWindow = window.open(
    url,
    windowKey,
    'width=700,height=800,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no'
  )

  if (helpWindow) {
    openWindows.set(windowKey, helpWindow)

    // Clean up blob URL after window loads
    helpWindow.addEventListener('load', () => {
      URL.revokeObjectURL(url)
    })

    // Remove from tracking when window closes
    const checkClosed = setInterval(() => {
      if (helpWindow.closed) {
        openWindows.delete(windowKey)
        clearInterval(checkClosed)
      }
    }, 500)
  } else {
    // Popup was blocked
    URL.revokeObjectURL(url)
    console.warn('Help window was blocked by popup blocker')
    alert('Please allow popups for this site to view help documentation')
  }
}
```

### F1 Keyboard Shortcut Hook
```typescript
// src/hooks/useHelpShortcut.ts
import { useHotkeys } from 'react-hotkeys-hook'
import { useStore } from '../store'
import { openHelpWindow } from '../services/helpService'
import { elementHelp } from '../content/help/elements'
import { generalHelp } from '../content/help/general'

export function useHelpShortcut() {
  const selectedIds = useStore(state => state.selectedIds)
  const elements = useStore(state => state.elements)

  useHotkeys('f1', (event) => {
    event.preventDefault()

    // Get help for currently selected element
    if (selectedIds.length === 1) {
      const element = elements.find(el => el.id === selectedIds[0])
      if (element) {
        const helpContent = elementHelp[element.type]
        if (helpContent) {
          openHelpWindow(helpContent)
          return
        }
      }
    }

    // Fallback to general help if no selection or no specific help available
    openHelpWindow(generalHelp)
  }, {
    preventDefault: true,
    enableOnFormTags: true, // Allow F1 even when inputs are focused
  }, [selectedIds, elements])
}
```

### Updated PropertySection Component
```typescript
// src/components/Properties/PropertySection.tsx (updated)
import { HelpButton } from '../common/HelpButton'
import type { HelpContent } from '../../content/help/sections'

interface PropertySectionProps {
  title: string
  children: React.ReactNode
  helpContent?: HelpContent
}

export function PropertySection({ title, children, helpContent }: PropertySectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        {helpContent && <HelpButton content={helpContent} />}
      </div>
      <div>{children}</div>
    </div>
  )
}
```

### Help Content Definition
```typescript
// src/content/help/sections.ts
export interface HelpContent {
  title: string
  description: string
  examples?: Array<{
    label: string
    code?: string
    explanation: string
  }>
  relatedTopics?: string[]
}

export const sectionHelp: Record<string, HelpContent> = {
  'position-size': {
    title: 'Position & Size',
    description: 'Control the element\'s position and dimensions on the canvas. Coordinates are relative to the top-left corner (0,0).',
    examples: [
      {
        label: 'Setting Position',
        explanation: 'X and Y values are in pixels. X increases to the right, Y increases downward. Values can be negative to position elements off-canvas.'
      },
      {
        label: 'Setting Size',
        explanation: 'Width and Height define the element\'s bounding box. Most elements have a minimum size of 20x20 pixels to ensure visibility and usability.'
      },
      {
        label: 'Live Updates',
        explanation: 'When dragging or resizing elements on the canvas, these values update in real-time to reflect the current position and size.'
      }
    ],
    relatedTopics: [
      'Lock element to prevent accidental moves',
      'Use arrow keys to nudge 1px, Shift+arrow for 10px',
      'Use Layers panel to organize z-order'
    ]
  },

  'identity': {
    title: 'Identity',
    description: 'Set the element\'s name and optional parameter binding for runtime behavior.',
    examples: [
      {
        label: 'Element Name',
        explanation: 'A descriptive name helps identify elements in the Layers panel and generated code. Names don\'t have to be unique.'
      },
      {
        label: 'Parameter ID',
        explanation: 'Optional identifier for binding to JUCE parameters. If set, the element will be controlled by the corresponding VST3 parameter at runtime.'
      }
    ]
  },

  'lock': {
    title: 'Lock',
    description: 'Lock elements to prevent accidental modifications during editing.',
    examples: [
      {
        label: 'When to Lock',
        explanation: 'Lock background elements, guides, or finalized sections to prevent accidental selection and modification while working on other parts.'
      },
      {
        label: 'Locked Behavior',
        explanation: 'Locked elements cannot be moved, resized, or deleted. They can still be selected to view properties. Unlock to make changes.'
      }
    ]
  },

  'svg': {
    title: 'SVG Import/Export',
    description: 'Export elements as SVG with named layers for editing in vector tools, or import edited SVGs back for validation.',
    examples: [
      {
        label: 'Export Workflow',
        explanation: 'Click Export to download an SVG file with specially named layers (e.g., "handle", "track", "fill"). Edit in Illustrator, Inkscape, or Figma, then import back to validate.'
      },
      {
        label: 'Import Validation',
        explanation: 'Click Import to select an edited SVG file. The validator checks for required layers and warns about missing or unexpected elements.'
      },
      {
        label: 'Expected Layers',
        explanation: 'Each element type expects specific layer names. The panel shows the first few expected layers. Export an element to see the complete layer structure.'
      }
    ],
    relatedTopics: [
      'Layer names must match exactly (case-sensitive)',
      'Export, edit in vector tool, import for validation',
      'Check console for detailed validation results'
    ]
  }
}

// src/content/help/elements.ts
import type { HelpContent } from './sections'
import type { ElementConfig } from '../../types/elements'

export const elementHelp: Record<ElementConfig['type'], HelpContent> = {
  'knob': {
    title: 'Knob Element',
    description: 'A rotary control for continuous parameters like gain, frequency, or time values.',
    examples: [
      {
        label: 'Basic Usage',
        explanation: 'Knobs rotate from minimum (bottom-left) to maximum (top-right) position. They typically represent continuous parameters with a defined range.'
      },
      {
        label: 'Appearance',
        explanation: 'Customize colors, size, and style. Use the SVG export/import feature to create custom graphics with vector editing tools.'
      },
      {
        label: 'Parameter Binding',
        explanation: 'Set the Parameter ID to bind this knob to a JUCE AudioParameter. The knob will automatically reflect and control the parameter value at runtime.'
      }
    ],
    relatedTopics: [
      'Use SteppedKnob for discrete values',
      'Use CenterDetentKnob for bipolar parameters',
      'Export SVG to create custom knob graphics'
    ]
  },

  'slider': {
    title: 'Slider Element',
    description: 'A linear control for continuous parameters, can be horizontal or vertical.',
    examples: [
      {
        label: 'Orientation',
        explanation: 'Sliders automatically orient based on dimensions: wider than tall = horizontal, taller than wide = vertical.'
      },
      {
        label: 'Visual Feedback',
        explanation: 'The filled portion of the track shows the current value. Customize colors, handle size, and track appearance in the properties panel.'
      }
    ],
    relatedTopics: [
      'Use BipolarSlider for parameters centered at zero',
      'Use RangeSlider for min/max selection',
      'Set Parameter ID to bind to JUCE parameter'
    ]
  },

  'button': {
    title: 'Button Element',
    description: 'A clickable control for triggering actions or toggling states.',
    examples: [
      {
        label: 'Button Types',
        explanation: 'Buttons can be momentary (trigger on click) or toggle (on/off state). Customize appearance for normal and pressed states.'
      },
      {
        label: 'Labels',
        explanation: 'Add text labels with customizable fonts, colors, and alignment. Labels can be positioned inside or near the button.'
      }
    ],
    relatedTopics: [
      'Use IconButton for buttons with SVG icons',
      'Use ToggleSwitch for clear on/off states',
      'Use PowerButton for standby/bypass functions'
    ]
  },

  'label': {
    title: 'Label Element',
    description: 'Static text for titles, descriptions, and parameter names.',
    examples: [
      {
        label: 'Typography',
        explanation: 'Choose from system fonts or custom fonts loaded in the Fonts panel. Customize size, weight, color, and alignment.'
      },
      {
        label: 'Layout',
        explanation: 'Labels can be single-line or multi-line. Adjust text alignment (left, center, right) and vertical alignment (top, middle, bottom).'
      }
    ]
  },

  // Add more element types as needed...
}

// src/content/help/general.ts
import type { HelpContent } from './sections'

export const generalHelp: HelpContent = {
  title: 'VST3 WebView UI Designer - Help',
  description: 'Design and export VST3 plugin user interfaces with visual tools and code generation.',
  examples: [
    {
      label: 'Getting Started',
      explanation: 'Add elements from the toolbar, position them on the canvas, customize properties in the right panel, and export to C++ code.'
    },
    {
      label: 'Keyboard Shortcuts',
      explanation: 'Use Ctrl/Cmd+C/V for copy/paste, arrow keys to nudge elements, Ctrl/Cmd+Z for undo. Press F1 when an element is selected for specific help.'
    },
    {
      label: 'Workflow',
      explanation: '1. Design UI on canvas, 2. Organize with Layers panel, 3. Customize in Properties panel, 4. Export to C++ for JUCE integration.'
    }
  ],
  relatedTopics: [
    'Select an element and press F1 for element-specific help',
    'Each property section has a (?) button for detailed help',
    'Check the Export panel for code generation options'
  ]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| External .html help files | Inline HTML with blob URLs | ~2020 | Simpler bundling, better type safety, no server required |
| event.keyCode | event.key | 2016 (deprecated in spec) | Better readability, internationalization support |
| Custom keyboard listeners | react-hotkeys-hook library | Library released 2019 | Handles conflicts, scoping, modifier keys automatically |
| Modal dialogs for help | Separate window.open() | Ongoing preference | Users can reference help while working, better multitasking |
| Light theme help | Dark theme matching app | 2020+ dark mode preference | Consistency, reduced eye strain |
| onKeyPress event | onKeyDown event | React 17+ | onKeyPress deprecated, onKeyDown more reliable for special keys |

**Deprecated/outdated:**
- **event.keyCode:** Deprecated, use `event.key === 'F1'` instead of `event.keyCode === 112`
- **onKeyPress:** Deprecated React event, unreliable for function keys, use onKeyDown
- **dangerouslySetInnerHTML for help content:** Security risk, use DOM methods or text content instead

## Open Questions

Things that couldn't be fully resolved:

1. **Syntax Highlighting Decision**
   - What we know: Multiple lightweight options exist (Prism.js, highlight.js), project doesn't currently need code examples with syntax highlighting
   - What's unclear: Whether help content will include TypeScript/C++ code examples that would benefit from syntax highlighting
   - Recommendation: Start without syntax highlighting, add Prism.js later if needed (2KB + ~1KB per language)

2. **Help Content Completeness**
   - What we know: There are 70+ element types in the properties files, each needs documentation
   - What's unclear: How much detail is needed per element type, whether to document every property or just key concepts
   - Recommendation: Start with comprehensive docs for common elements (Knob, Slider, Button, Label), brief summaries for specialized elements, expand based on user feedback

3. **Step-by-Step Instructions Format**
   - What we know: HELP-07 requires "step-by-step instructions where applicable"
   - What's unclear: Which operations need step-by-step guides (all properties? complex workflows? common tasks?)
   - Recommendation: Use numbered lists in HelpContent.examples for multi-step operations (e.g., SVG export workflow), single paragraphs for simple properties

## Sources

### Primary (HIGH confidence)
- [react-hotkeys-hook API Documentation](https://react-hotkeys-hook.vercel.app/docs/api/use-hotkeys) - useHotkeys API, preventDefault, function key support
- [MDN: Window.open()](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) - Official window.open() specification and features
- [MDN: KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) - Keyboard event properties and key values
- [React Event Handling with TypeScript](https://devtrium.com/posts/react-typescript-events) - TypeScript event types for React
- [useEffect Event Listener Cleanup](https://dev.to/marcostreng/how-to-really-remove-eventlisteners-in-react-3och) - Best practices for addEventListener cleanup

### Secondary (MEDIUM confidence)
- [React Spectrum ContextualHelp](https://react-spectrum.adobe.com/react-spectrum/ContextualHelp.html) - Adobe's implementation pattern for contextual help
- [UX Movement: Question Mark vs Info Icon](https://uxmovement.com/forms/question-mark-vs-info-icon-when-to-use-which/) - Icon selection guidance verified by multiple UX sources
- [Contextual Help Best Practices (Userpilot)](https://userpilot.com/blog/contextual-help/) - Content organization patterns
- [Pop-ups vs Inline Content (Candu.ai)](https://www.candu.ai/blog/pop-ups-vs-inline-content) - UX comparison verified by Nielsen Norman Group references
- [Prism.js](https://prismjs.com/) - Lightweight syntax highlighting (if needed)
- [Popup Blocker Workarounds](https://www.mikepalmer.dev/blog/open-a-new-window-without-triggering-pop-up-blockers) - Best practices for window.open() timing

### Tertiary (LOW confidence)
- [React Native Tooltip 2026](https://vocal.media/journal/react-native-tooltip-implementation-tips-and-best-practices-2026) - General tooltip trends, some AI-focused features not applicable
- [F1 Key Functions (Computer Hope)](https://www.computerhope.com/jargon/f/f1.htm) - F1 as help standard, widely known

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed (react-hotkeys-hook), window.open() is standard browser API, patterns verified in MDN and official docs
- Architecture: HIGH - Patterns based on existing codebase structure (services/, components/, hooks/), TypeScript best practices, verified React patterns
- Pitfalls: HIGH - Popup blocker behavior verified in MDN and multiple sources, keyboard event handling verified in React docs, memory management verified in JavaScript best practices

**Research date:** 2026-01-29
**Valid until:** ~60 days (stable domain - browser APIs and React patterns change slowly, but library versions should be rechecked)
