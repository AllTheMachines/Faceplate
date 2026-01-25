# Phase 13: Extended Elements - Research

**Researched:** 2026-01-25
**Domain:** React UI component library extension with form controls, containers, and audio visualization elements
**Confidence:** HIGH

## Summary

This phase expands the element library to support professional audio plugin UIs by adding container elements (Panel, Frame, Group Box, Collapsible Container), form controls (Dropdown, Checkbox, Radio, Text Field), decorative elements (Rectangle, Line), specialized audio displays (dB, Frequency, Gain Reduction meters), and complex widgets (Waveform, Oscilloscope, Modulation Matrix, Preset Browser).

The research focused on identifying best practices for implementing form controls in React with TypeScript, understanding container element patterns, evaluating dual-thumb slider implementations, and exploring audio visualization approaches. The existing codebase follows a discriminated union pattern with factory functions, renderer components, property panels, and export generators—all patterns that new elements must follow.

Key findings indicate that HTML5 form controls should be used as-is with controlled component patterns, container elements are best implemented with CSS flexbox/grid rather than semantic HTML fieldsets (due to styling difficulties), dual-thumb sliders require custom implementation with two overlapping range inputs, and audio visualizations should use placeholder elements with data-* attributes for future JUCE integration.

**Primary recommendation:** Extend the existing discriminated union type system with 15 new element configs, create renderer components using HTML/CSS (avoiding canvas/SVG complexity for placeholders), implement property panels following the established PropertySection pattern, and ensure all elements export correctly to HTML/CSS/JS using the existing generator architecture.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI rendering framework | Already in use; controlled components for form inputs |
| TypeScript | 5.x | Type-safe element configs | Discriminated unions for element type safety |
| Zustand | 4.x | State management | Current store pattern for elements |
| Tailwind CSS | 3.x | Styling utility classes | Existing styling approach |
| @dnd-kit/core | 6.x | Drag and drop | Already integrated for element positioning |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | - | All functionality achievable with existing stack |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| HTML form controls | React component libraries (MUI, Headless UI) | Native HTML is lighter, exports cleanly to JUCE WebView, no bundle bloat |
| Custom dual-thumb slider | Range slider library (noUiSlider, rc-slider) | Custom implementation gives full control over export format and JUCE integration |
| Canvas/SVG for visualizations | Chart libraries (Chart.js, D3) | Placeholders sufficient for Phase 13; actual visualization requires JUCE data binding |

**Installation:**
No new dependencies required. All elements use existing React, TypeScript, and Tailwind CSS.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/
│   └── elements.ts              # Add 15 new element config interfaces
├── components/
│   ├── elements/
│   │   ├── renderers/           # Add 15 new renderer components
│   │   │   ├── CheckboxRenderer.tsx
│   │   │   ├── DropdownRenderer.tsx
│   │   │   ├── PanelRenderer.tsx
│   │   │   ├── RangeSliderRenderer.tsx
│   │   │   ├── WaveformRenderer.tsx
│   │   │   └── ...
│   │   └── Element.tsx          # Update switch statement
│   └── Properties/              # Add 15 new property panel components
│       ├── CheckboxProperties.tsx
│       ├── PanelProperties.tsx
│       └── ...
├── services/
│   └── export/
│       ├── htmlGenerator.ts     # Add HTML generation for new elements
│       ├── cssGenerator.ts      # Add CSS rules for new elements
│       └── jsGenerator.ts       # Add interaction code for new elements
└── components/
    └── Palette/
        └── Palette.tsx          # Add new categories to palette
```

### Pattern 1: Discriminated Union Extension
**What:** Extend the ElementConfig discriminated union with new element types
**When to use:** Every new element type added to the system
**Example:**
```typescript
// Source: Existing codebase pattern in src/types/elements.ts

// 1. Define element-specific config extending BaseElementConfig
export interface CheckboxElementConfig extends BaseElementConfig {
  type: 'checkbox'

  // Element-specific properties
  checked: boolean
  label: string
  labelPosition: 'left' | 'right'
}

// 2. Add to discriminated union
export type ElementConfig =
  | KnobElementConfig
  | SliderElementConfig
  | CheckboxElementConfig  // Add new type
  // ... other types

// 3. Create type guard
export function isCheckbox(element: ElementConfig): element is CheckboxElementConfig {
  return element.type === 'checkbox'
}

// 4. Create factory function with sensible defaults
export function createCheckbox(overrides?: Partial<CheckboxElementConfig>): CheckboxElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'checkbox',
    name: 'Checkbox',
    x: 0,
    y: 0,
    width: 100,
    height: 24,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    checked: false,
    label: 'Checkbox',
    labelPosition: 'right',
    ...overrides,
  }
}
```

### Pattern 2: Renderer Component Structure
**What:** Create a renderer component that receives config and renders HTML/CSS
**When to use:** For every element type's visual representation
**Example:**
```typescript
// Source: Existing pattern from ButtonRenderer.tsx

interface CheckboxRendererProps {
  config: CheckboxElementConfig
}

export function CheckboxRenderer({ config }: CheckboxRendererProps) {
  return (
    <label
      className="checkbox-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexDirection: config.labelPosition === 'left' ? 'row-reverse' : 'row',
        userSelect: 'none',
      }}
    >
      <input
        type="checkbox"
        checked={config.checked}
        readOnly
        className="pointer-events-none"
        style={{ width: '16px', height: '16px' }}
      />
      <span style={{ fontSize: '14px', color: '#fff' }}>
        {config.label}
      </span>
    </label>
  )
}
```

### Pattern 3: Property Panel Component
**What:** Create a properties component that exposes element configuration controls
**When to use:** For every element type that needs editable properties
**Example:**
```typescript
// Source: Existing pattern from KnobProperties.tsx

interface CheckboxPropertiesProps {
  element: CheckboxElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function CheckboxProperties({ element, onUpdate }: CheckboxPropertiesProps) {
  return (
    <>
      <PropertySection title="Label">
        <TextInput
          label="Label Text"
          value={element.label}
          onChange={(label) => onUpdate({ label })}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Label Position</label>
          <select
            value={element.labelPosition}
            onChange={(e) => onUpdate({ labelPosition: e.target.value as 'left' | 'right' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </PropertySection>

      <PropertySection title="State">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={element.checked}
            onChange={(e) => onUpdate({ checked: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-300">Checked</span>
        </label>
      </PropertySection>
    </>
  )
}
```

### Pattern 4: HTML Export Generation
**What:** Generate static HTML for element export to JUCE WebView
**When to use:** For every element type in htmlGenerator.ts
**Example:**
```typescript
// Source: Existing pattern from htmlGenerator.ts

function generateElementHTML(element: ElementConfig): string {
  const id = toKebabCase(element.name)
  const baseClass = 'element'
  const positionStyle = `position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; transform: rotate(${element.rotation}deg);`

  switch (element.type) {
    case 'checkbox':
      return generateCheckboxHTML(id, baseClass, positionStyle, element)
    // ... other cases
  }
}

function generateCheckboxHTML(id: string, baseClass: string, positionStyle: string, config: CheckboxElementConfig): string {
  return `<label id="${id}" class="${baseClass} checkbox-element" data-type="checkbox" style="${positionStyle}">
      <input type="checkbox" ${config.checked ? 'checked' : ''} />
      <span>${escapeHTML(config.label)}</span>
    </label>`
}
```

### Pattern 5: Container Elements with Children
**What:** Container elements that can hold other elements (Panel, Frame, Group Box)
**When to use:** For Phase 13 container elements (13-02, 13-03)
**Note:** This is a FUTURE pattern—Phase 13 only creates visual containers without parent-child relationships. True nesting requires additional store architecture.
**Example (VISUAL ONLY for Phase 13):**
```typescript
// Phase 13: Visual container only (no actual children)
export interface PanelElementConfig extends BaseElementConfig {
  type: 'panel'
  backgroundColor: string
  borderRadius: number
  padding: number
  // NOTE: No children array in Phase 13—containers are visual boxes only
}

// Future phases: Add parent-child relationship to store
// - Store elements as tree instead of flat array
// - Handle nested transforms
// - Implement group selection/moving
```

### Anti-Patterns to Avoid
- **Heavy React component libraries:** MUI, Ant Design add bundle bloat and complicate export. Use native HTML form controls.
- **Canvas/SVG for placeholders:** Waveform/Oscilloscope don't need actual rendering in Phase 13. Use `<div>` placeholders with data-* attributes for future JUCE binding.
- **Uncontrolled form inputs:** All form controls must use controlled pattern (value/checked + onChange) for proper state management and export.
- **Breaking discriminated union exhaustiveness:** Always update Element.tsx switch statement when adding new types to maintain TypeScript exhaustiveness checking.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form input styling | Custom checkbox/radio components | Native HTML + CSS | Browser-native accessibility, keyboard navigation, screen reader support |
| Dual-thumb slider validation | Manual overlap prevention logic | Two range inputs + shared min/max state | Browser handles thumb positioning, only need to sync values |
| Collapsible panel animation | Custom CSS animation/transition code | CSS `max-height` transition + `overflow: hidden` | Smooth, performant, no JavaScript animation loop |
| Color picker | Canvas-based color selector | HTML `<input type="color">` | Native color picker UI, accessible, cross-platform |
| Dropdown keyboard navigation | Manual arrow key handling | Native `<select>` element | Built-in keyboard navigation, ARIA support, mobile-friendly |

**Key insight:** Native HTML5 form controls provide accessibility, keyboard navigation, and screen reader support for free. Custom implementations require significant effort to match native functionality and rarely export cleanly to JUCE WebView.

## Common Pitfalls

### Pitfall 1: Controlled vs Uncontrolled Input Confusion
**What goes wrong:** Using `value` for checkboxes or forgetting `onChange` handler causes inputs to become read-only or behave unexpectedly.
**Why it happens:** React uses different props for different input types—`value` for text, `checked` for checkbox/radio.
**How to avoid:**
- Text inputs: `<input value={state} onChange={e => setState(e.target.value)} />`
- Checkboxes: `<input type="checkbox" checked={state} onChange={e => setState(e.target.checked)} />`
- Radio: `<input type="radio" checked={selectedValue === 'option1'} onChange={e => setSelectedValue('option1')} />`
**Warning signs:** React console warning "You provided a `value` prop to a form field without an `onChange` handler" or checkbox that won't toggle.

### Pitfall 2: Fieldset/Legend Styling Nightmares
**What goes wrong:** Using semantic `<fieldset>` and `<legend>` for Group Box causes CSS layout issues—flexbox doesn't work properly, positioning is unpredictable, and the legend element is notoriously difficult to style.
**Why it happens:** Browsers apply special rendering rules to fieldset that conflict with modern CSS layout modes.
**How to avoid:** Use a `<div>` with ARIA `role="group"` and `aria-labelledby` instead of fieldset/legend. This gives accessibility without the styling headaches.
**Warning signs:** Container layout breaks when adding `display: flex`, legend refuses to position properly, border-knockout effect appears when not wanted.

### Pitfall 3: Dual-Thumb Slider Overlap
**What goes wrong:** In range sliders, the min thumb can be dragged past the max thumb, causing inverted ranges (min > max).
**Why it happens:** Two independent range inputs don't automatically constrain each other.
**How to avoid:**
```typescript
// Constrain min thumb
const handleMinChange = (value: number) => {
  onUpdate({ min: Math.min(value, config.max) })
}

// Constrain max thumb
const handleMaxChange = (value: number) => {
  onUpdate({ max: Math.max(value, config.min) })
}
```
**Warning signs:** Range display shows negative width/height, min value displays as larger than max value.

### Pitfall 4: Canvas Performance for Visualization Placeholders
**What goes wrong:** Implementing actual waveform/oscilloscope rendering with Canvas API creates performance issues and complicates export when Phase 13 only needs placeholders.
**Why it happens:** Desire to show "realistic" visualization instead of understanding that actual data comes from JUCE at runtime.
**How to avoid:** Create simple `<div>` placeholders with background color and data-* attributes. Actual visualization rendering happens in JUCE WebView with real audio data.
**Warning signs:** Canvas rendering in tight loops, requestAnimationFrame usage, bundle size increase, complex export logic.

### Pitfall 5: Breaking TypeScript Exhaustiveness Checking
**What goes wrong:** Adding new element type to discriminated union but forgetting to update Element.tsx switch statement. TypeScript should error, but if exhaustiveness check is missing, new elements silently don't render.
**Why it happens:** The pattern relies on TypeScript's exhaustiveness checking with `never` type.
**How to avoid:** Maintain the exhaustiveness check pattern:
```typescript
switch (element.type) {
  case 'knob': return <KnobRenderer config={element} />
  // ... all cases ...
  default:
    const exhaustive: never = element
    void exhaustive
    return null
}
```
**Warning signs:** TypeScript error "Type 'CheckboxElementConfig' is not assignable to type 'never'" when you add a new type—this is GOOD, it means the check is working.

### Pitfall 6: Audio Plugin UI Clutter
**What goes wrong:** Adding too many element types to palette categories creates overwhelming UI that confuses users trying to find the right control.
**Why it happens:** Phase 13 adds 15+ new element types—without organization, palette becomes cluttered.
**How to avoid:** Group elements into logical categories (Control Enhancements, Containers, Form Controls, Decorative, Audio Displays, Complex Widgets) and keep only 2-3 default categories expanded.
**Warning signs:** Palette scroll height exceeds viewport, user testing reveals difficulty finding elements, too many similar-looking items.

## Code Examples

Verified patterns from official sources and existing codebase:

### React Controlled Checkbox (Official React Docs)
```typescript
// Source: https://react.dev/reference/react-dom/components/input
import { useState } from 'react';

function Checkbox({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);

  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => setChecked(e.target.checked)}  // Note: .checked, not .value
      />
      {label}
    </label>
  );
}
```

### Dual-Thumb Range Slider Pattern
```typescript
// Source: Community pattern from dual-thumb slider implementations
interface RangeSliderRendererProps {
  config: RangeSliderElementConfig
}

export function RangeSliderRenderer({ config }: RangeSliderRendererProps) {
  const normalizedMin = (config.minValue - config.min) / (config.max - config.min)
  const normalizedMax = (config.maxValue - config.min) / (config.max - config.min)

  return (
    <div className="range-slider" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track background */}
      <div className="track" style={{
        position: 'absolute',
        width: '100%',
        height: '4px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: config.trackColor,
        borderRadius: '2px'
      }} />

      {/* Selected range fill */}
      <div className="range-fill" style={{
        position: 'absolute',
        left: `${normalizedMin * 100}%`,
        width: `${(normalizedMax - normalizedMin) * 100}%`,
        height: '4px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: config.fillColor,
        borderRadius: '2px'
      }} />

      {/* Invisible range inputs (overlapping) */}
      <input
        type="range"
        min={config.min}
        max={config.max}
        value={config.minValue}
        readOnly
        style={{
          position: 'absolute',
          width: '100%',
          pointerEvents: 'none',
          opacity: 0
        }}
      />
      <input
        type="range"
        min={config.min}
        max={config.max}
        value={config.maxValue}
        readOnly
        style={{
          position: 'absolute',
          width: '100%',
          pointerEvents: 'none',
          opacity: 0
        }}
      />
    </div>
  )
}
```

### Group Box with ARIA (Modern Alternative to Fieldset)
```typescript
// Source: Adrian Roselli accessibility best practices
function GroupBoxRenderer({ config }: { config: GroupBoxElementConfig }) {
  const headerId = `${config.id}-header`

  return (
    <div
      role="group"
      aria-labelledby={headerId}
      style={{
        width: '100%',
        height: '100%',
        border: `2px solid ${config.borderColor}`,
        borderRadius: `${config.borderRadius}px`,
        padding: `${config.padding}px`,
        position: 'relative'
      }}
    >
      <div
        id={headerId}
        style={{
          position: 'absolute',
          top: '-12px',
          left: '12px',
          background: config.backgroundColor,
          padding: '0 8px',
          fontSize: '14px',
          fontWeight: 600,
          color: config.headerColor
        }}
      >
        {config.headerText}
      </div>
      {/* Children would go here in future phase */}
    </div>
  )
}
```

### Collapsible Panel with CSS Transition
```typescript
// Source: React accordion best practices
interface CollapsibleRendererProps {
  config: CollapsibleContainerElementConfig
}

export function CollapsibleRenderer({ config }: CollapsibleRendererProps) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        className="collapsible-header"
        style={{
          padding: '8px 12px',
          background: config.headerBackground,
          borderBottom: `1px solid ${config.borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 600 }}>{config.label}</span>
        <span style={{ transform: config.collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </div>

      {/* Content (with max-height transition for smooth collapse) */}
      <div
        className="collapsible-content"
        style={{
          flex: 1,
          overflow: config.collapsed ? 'hidden' : config.scrollBehavior,
          maxHeight: config.collapsed ? '0' : config.maxHeight ? `${config.maxHeight}px` : 'none',
          transition: 'max-height 0.3s ease-out',
          background: config.backgroundColor
        }}
      >
        {/* Children would go here in future phase */}
      </div>
    </div>
  )
}
```

### Placeholder Element for Audio Visualization
```typescript
// Source: Research on Canvas vs SVG for audio plugins
interface WaveformRendererProps {
  config: WaveformElementConfig
}

export function WaveformRenderer({ config }: WaveformRendererProps) {
  // Phase 13: Placeholder only—actual waveform rendering happens in JUCE
  return (
    <div
      className="waveform-display"
      data-type="waveform"
      data-zoom-level={config.zoomLevel}
      style={{
        width: '100%',
        height: '100%',
        background: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#666',
        userSelect: 'none'
      }}
    >
      <span>Waveform Display</span>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Semantic fieldset/legend | div with role="group" + aria-labelledby | 2022-2026 | Easier styling with modern CSS, maintains accessibility |
| Component libraries for forms | Native HTML5 form controls | Ongoing | Lighter bundle, better export compatibility, native a11y |
| Canvas for all visualizations | Hybrid: Canvas for complex + SVG for labels/interactivity | 2025-2026 | Better performance and accessibility balance |
| React.createFactory() | Direct JSX or factory functions returning config objects | React 18+ | createFactory deprecated in favor of JSX |
| Heavy accordion libraries | Native HTML details/summary or simple CSS transitions | 2024-2026 | Simpler code, better performance, no library dependency |

**Deprecated/outdated:**
- **React.createFactory()**: Deprecated in React 18—use JSX or plain factory functions that return config objects
- **Class components for simple UI**: Functional components with hooks are now standard for all React components
- **Fieldset/legend for grouping**: CSS layout conflicts make div + ARIA a better choice for modern UIs

## Open Questions

Things that couldn't be fully resolved:

1. **Parent-child element relationships for containers**
   - What we know: Phase 13 containers are visual only—no actual element nesting
   - What's unclear: Future architecture for true parent-child relationships (tree structure vs flat array with parent IDs)
   - Recommendation: Implement containers as visual boxes in Phase 13; defer nesting architecture to future phase after evaluating export complexity

2. **Modulation Matrix interaction model**
   - What we know: Professional plugins use grid-based routing matrices
   - What's unclear: Best interaction pattern for designer (clickable cells? drag-drop? dropdown per cell?)
   - Recommendation: Start with simple clickable grid cells with state (connected/disconnected); enhance in future phases based on user feedback

3. **Preset Browser data source**
   - What we know: Preset browsers display hierarchical preset lists
   - What's unclear: Whether designer should support mock preset data or just show placeholder UI
   - Recommendation: Phase 13 provides placeholder UI only; actual preset data comes from JUCE at runtime

4. **Label/Value display positioning for controls**
   - What we know: Requirement ELEM-07 specifies top/bottom/left/right positioning
   - What's unclear: Whether label/value are separate draggable elements or integrated into parent control
   - Recommendation: Integrated approach—label/value are properties of Knob/Slider config, not separate elements. Simpler to implement and matches professional plugin UX.

## Sources

### Primary (HIGH confidence)
- React Official Documentation - https://react.dev/reference/react-dom/components/input
- MDN Web Docs - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range
- Existing codebase patterns (src/types/elements.ts, src/components/elements/, src/services/export/)

### Secondary (MEDIUM confidence)
- Adrian Roselli (January 2026) - "Use Legend and Fieldset" - https://adrianroselli.com/2022/07/use-legend-and-fieldset.html
- Voger Design - "Enhance Your Audio Plugin UX: 5 Top Plugins & 5 Common Pitfalls" - https://vogerdesign.com/blog/make-audio-plugin-with-great-ux/
- Developer Way - "Advanced TypeScript for React developers - discriminated unions" - https://www.developerway.com/posts/advanced-typescript-for-react-developers-discriminated-unions
- Andrew Branch - "Expressive React Component APIs with Discriminated Unions" - https://blog.andrewbran.ch/expressive-react-component-apis-with-discriminated-unions/
- Medium (Ulad Ramanovich) - "TypeScript Discriminated Unions for Robust React Components" - https://medium.com/@uramanovich/typescript-discriminated-unions-for-robust-react-components-58bc06f37299

### Tertiary (LOW confidence - verified patterns but not official sources)
- Community articles on dual-thumb slider implementation - https://medium.com/@predragdavidovic10/native-dual-range-slider-html-css-javascript-91e778134816
- SVG vs Canvas performance discussions - https://www.svggenie.com/blog/svg-vs-canvas-vs-webgl-performance-2025
- React accordion best practices - https://mui.com/material-ui/react-accordion/

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project dependencies, no new libraries needed
- Architecture: HIGH - Clear patterns established in existing codebase for element creation
- Pitfalls: HIGH - Verified with official React docs and existing codebase issues

**Research date:** 2026-01-25
**Valid until:** 2026-02-24 (30 days - stable technologies, established patterns)
