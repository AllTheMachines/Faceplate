# Phase 27: Containers & Polish - Research

**Researched:** 2026-01-26
**Domain:** React/Konva UI components - tooltips, spacers, window chrome
**Confidence:** MEDIUM

## Summary

This phase adds three container/utility elements to enhance UI structure and polish: Tooltip (hover information), Spacer (invisible layout element), and Window Chrome (title bar with controls). Research focused on identifying implementation patterns for these specialized UI components within the existing React/Konva architecture established in Phase 19.

The standard approach for tooltips in canvas-based applications uses DOM overlay positioning rather than canvas-native elements, with hover delays of 300-500ms to avoid accidental triggers. Tooltip positioning (top/bottom/left/right) with optional arrow pointers is standard across React UI libraries. Rich content support (text + icons, formatted text) requires careful accessibility consideration with ARIA attributes.

Spacer elements follow flexbox patterns using `flex-grow: 1` for flexible spacers that expand to fill remaining space, or fixed pixel widths for rigid spacing. Design tools universally struggle with invisible element visibility - the solution is showing them in the designer with visual indicators (dashed outlines, shaded areas) while allowing users to toggle visibility.

Window chrome components typically use separate macOS (traffic light buttons on left) versus Windows (minimize/maximize/close icons on right) styling modes. Title bars in designers are static (non-draggable), while export targets like JUCE receive draggable title bar code. Resize handles are typically visual-only in designers, with actual resize behavior controlled by the canvas selection system.

**Primary recommendation:** Implement tooltips as DOM overlays positioned above Konva canvas, use separate HorizontalSpacer and VerticalSpacer element types with flex-grow support, and create WindowChrome as a visual-only element with configurable button style property (macOS/Windows/neutral).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-konva | 18.2.14 | Canvas rendering | Already in use, supports hover events |
| React | 18.3.1 | Component framework | Already in use, portal support for overlays |
| CSS Flexbox | Native | Spacer layout behavior | Native browser support, no dependencies |
| Konva Events | 9.3.22 | Mouse hover detection | Already in use, onMouseEnter/onMouseLeave |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Portal | 18.3.1 | Render tooltip outside canvas | DOM overlay tooltips above Konva |
| CSS Custom Properties | Native | Theme-aware chrome buttons | Configurable macOS/Windows styles |
| Tailwind CSS | 3.4.19 | Utility classes for tooltips | Already in use for styling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| DOM overlay tooltips | Konva Text elements | Canvas tooltips perform poorly with rich content, accessibility issues |
| Separate H/V spacers | Single spacer with orientation property | Two distinct types clearer for user intent, simpler properties |
| Configurable button style | Separate macOS/Windows elements | Property allows switching style without recreating element |

**Installation:**
```bash
# No new dependencies required - all features use existing libraries
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/
│   └── elements/
│       └── containers.ts          # Add Tooltip, Spacer, WindowChrome configs
├── components/
│   ├── elements/
│   │   └── renderers/
│   │       └── containers/
│   │           ├── TooltipRenderer.tsx      # DOM overlay positioned above canvas
│   │           ├── HorizontalSpacerRenderer.tsx   # Flex-grow spacer (horizontal)
│   │           ├── VerticalSpacerRenderer.tsx     # Flex-grow spacer (vertical)
│   │           └── WindowChromeRenderer.tsx # Visual title bar with controls
│   └── Properties/
│       ├── TooltipProperties.tsx
│       ├── SpacerProperties.tsx     # Shared by H/V spacers
│       └── WindowChromeProperties.tsx
```

### Pattern 1: DOM Overlay Tooltips in Konva
**What:** Render tooltip as React Portal positioned absolutely above canvas, triggered by Konva hover events
**When to use:** When tooltips need rich content, accessibility, or complex styling
**Example:**
```typescript
// Source: https://konvajs.org/docs/sandbox/Shape_Tooltips.html + React Portal pattern
// TooltipRenderer.tsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Rect } from 'react-konva';

export function TooltipRenderer({ config }: { config: TooltipElementConfig }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) {
      // Delay tooltip display (300-500ms)
      setTimeout(() => {
        setTooltipPos(pos);
        setShowTooltip(true);
      }, config.hoverDelay || 400);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      {/* Invisible trigger area on canvas */}
      <Rect
        width={config.width}
        height={config.height}
        fill="transparent"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* DOM overlay tooltip */}
      {showTooltip && createPortal(
        <div
          className="absolute z-50 bg-gray-900 text-white px-3 py-2 rounded shadow-lg"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: getTransformForPosition(config.position),
          }}
        >
          {config.showArrow && <div className="arrow" data-position={config.position} />}
          <div dangerouslySetInnerHTML={{ __html: config.content }} />
        </div>,
        document.body
      )}
    </>
  );
}

function getTransformForPosition(position: 'top' | 'bottom' | 'left' | 'right') {
  // Offset tooltip based on position
  switch (position) {
    case 'top': return 'translate(-50%, -100%) translateY(-8px)';
    case 'bottom': return 'translate(-50%, 0) translateY(8px)';
    case 'left': return 'translate(-100%, -50%) translateX(-8px)';
    case 'right': return 'translate(0, -50%) translateX(8px)';
  }
}
```

### Pattern 2: Flex-Grow Spacers
**What:** Use CSS flex-grow property to create spacers that expand/contract with container
**When to use:** Responsive layouts where spacer size adjusts to available space
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Flexible_box_layout/Controlling_flex_item_ratios
// HorizontalSpacerRenderer.tsx
export function HorizontalSpacerRenderer({ config }: { config: HorizontalSpacerElementConfig }) {
  const isFlexible = config.mode === 'flexible';

  const style: React.CSSProperties = {
    width: isFlexible ? 'auto' : `${config.width}px`,
    height: '100%',
    flexGrow: isFlexible ? (config.flexGrow || 1) : 0,
    flexShrink: isFlexible ? 1 : 0,
    // Designer visibility - show dashed outline
    border: '1px dashed rgba(100, 116, 139, 0.5)',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  };

  return <div style={style} />;
}
```

### Pattern 3: Fixed vs Flexible Spacer Sizing
**What:** Support both fixed pixel sizing and flexible flex-grow behavior
**When to use:** Fixed for precise spacing, flexible for responsive layouts
**Example:**
```typescript
// Source: Research on spacer patterns + flexbox best practices
// types/elements/containers.ts
export interface HorizontalSpacerElementConfig extends BaseElementConfig {
  type: 'horizontalspacer'
  mode: 'fixed' | 'flexible'

  // Fixed mode
  fixedWidth?: number  // Used when mode === 'fixed'

  // Flexible mode
  flexGrow?: number    // Used when mode === 'flexible' (default: 1)
  minWidth?: number    // Minimum width constraint
  maxWidth?: number    // Maximum width constraint
}

// Factory function
export function createHorizontalSpacer(overrides?: Partial<HorizontalSpacerElementConfig>): HorizontalSpacerElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'horizontalspacer',
    name: 'Horizontal Spacer',
    x: 0,
    y: 0,
    width: 40,
    height: 20,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    mode: 'flexible',
    flexGrow: 1,
    minWidth: 0,
    maxWidth: 9999,
    ...overrides,
  };
}
```

### Pattern 4: Window Chrome Button Styles
**What:** Configurable property switches between macOS, Windows, and neutral button styles
**When to use:** When UI needs to match different OS aesthetics
**Example:**
```typescript
// Source: https://codepen.io/atdrago/pen/yezrBR + research on traffic light buttons
// WindowChromeRenderer.tsx
export function WindowChromeRenderer({ config }: { config: WindowChromeElementConfig }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
      }}
    >
      {/* Buttons on left for macOS, right for Windows */}
      {config.buttonStyle === 'macos' && <MacOSButtons />}

      <div style={{ flex: 1, textAlign: 'center' }}>
        {config.showTitle && <span>{config.titleText}</span>}
      </div>

      {config.buttonStyle === 'windows' && <WindowsButtons />}
      {config.buttonStyle === 'neutral' && <NeutralButtons />}
    </div>
  );
}

function MacOSButtons() {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <div className="w-3 h-3 rounded-full bg-red-500" title="Close" />
      <div className="w-3 h-3 rounded-full bg-yellow-500" title="Minimize" />
      <div className="w-3 h-3 rounded-full bg-green-500" title="Maximize" />
    </div>
  );
}

function WindowsButtons() {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      <button className="w-6 h-6 hover:bg-gray-200">−</button> {/* Minimize */}
      <button className="w-6 h-6 hover:bg-gray-200">□</button> {/* Maximize */}
      <button className="w-6 h-6 hover:bg-red-600">×</button> {/* Close */}
    </div>
  );
}
```

### Pattern 5: Designer Visibility for Invisible Elements
**What:** Show invisible elements (spacers) with visual indicators in designer, hide in export
**When to use:** All invisible/structural elements that users need to see and manipulate
**Example:**
```typescript
// Source: Research on Figma/Sketch patterns + design tool best practices
// SpacerRenderer.tsx
export function SpacerRenderer({ config, designMode }: RendererProps) {
  if (!designMode) {
    // In export/preview mode, render without visual indicators
    return <div style={{ width: config.width, height: config.height }} />;
  }

  // In designer mode, show visual indicators
  const style: React.CSSProperties = {
    width: config.width,
    height: config.height,
    border: '1px dashed rgba(100, 116, 139, 0.5)',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    position: 'relative',
  };

  return (
    <div style={style}>
      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 pointer-events-none">
        {config.mode === 'flexible' ? `flex: ${config.flexGrow}` : `${config.width}px`}
      </div>
    </div>
  );
}
```

### Pattern 6: Tooltip Arrow Positioning
**What:** CSS pseudo-elements create arrow pointers that adjust rotation based on tooltip position
**When to use:** When arrow property is enabled on tooltip
**Example:**
```css
/* Source: https://react-tooltip.com/docs/examples/styling + CSS tooltip patterns */
.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.tooltip-arrow[data-position="top"] {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0 6px;
  border-color: #1f2937 transparent transparent transparent;
}

.tooltip-arrow[data-position="bottom"] {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent #1f2937 transparent;
}

.tooltip-arrow[data-position="left"] {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 6px 0 6px 6px;
  border-color: transparent transparent transparent #1f2937;
}

.tooltip-arrow[data-position="right"] {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 6px 6px 6px 0;
  border-color: transparent #1f2937 transparent transparent;
}
```

### Anti-Patterns to Avoid
- **Canvas-native tooltips with rich content:** Konva Text elements don't support HTML formatting, icons, or accessibility features. Use DOM overlays instead.
- **Single spacer element with orientation property:** Separate HorizontalSpacer and VerticalSpacer types communicate intent more clearly and simplify property panels.
- **Always-visible invisible elements:** Users need ability to toggle spacer/guide visibility when working on complex layouts.
- **Instant tooltips (0ms delay):** Causes flickering as cursor moves across UI. Use 300-500ms delay.
- **Tooltip stays attached during drag:** Tooltip should disappear when parent element is being moved/edited to avoid interference.
- **Draggable title bar in designer:** Static title bar in designer, export includes drag handler code for JUCE.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tooltip positioning calculation | Custom offset math | CSS transform with position-based functions | Handles edge cases, RTL, viewport boundaries |
| Hover delay timer management | setTimeout/clearTimeout manually | State + useEffect with cleanup | Prevents memory leaks, handles rapid hover events |
| Tooltip arrow rotation | Inline rotation calculations | CSS data attributes + pseudo-elements | Declarative, easier to maintain, supports all positions |
| Flex-grow spacer behavior | JavaScript width calculations | CSS flex-grow property | Native browser optimization, responsive by default |
| Rich tooltip content sanitization | Custom HTML filter | isomorphic-dompurify (already in use) | Prevents XSS attacks, comprehensive sanitization |
| macOS/Windows button styles | Inline style objects | CSS classes with theme variants | Reusable, easier to maintain, supports hover states |

**Key insight:** Tooltips, spacers, and window chrome are solved problems in web development. Using established patterns (DOM overlays, flexbox, CSS custom properties) provides better accessibility, performance, and maintainability than custom canvas-based solutions.

## Common Pitfalls

### Pitfall 1: Canvas Tooltips with Rich Content
**What goes wrong:** Using Konva Text for tooltips limits formatting, breaks accessibility, and performs poorly
**Why it happens:** Assuming canvas-based UI requires all elements to be canvas-native
**How to avoid:** Use React Portals to render DOM tooltips positioned above canvas
**Warning signs:**
- Tooltip content can't include icons, bold text, or links
- Screen readers can't access tooltip content
- Performance degrades with complex tooltip content

### Pitfall 2: No Hover Delay on Tooltips
**What goes wrong:** Tooltips flicker and distract as cursor moves across UI
**Why it happens:** Setting delay to 0ms for "responsive" feel
**How to avoid:** Use 300-500ms enter delay (Radix UI default: 700ms, Material UI default: 300ms)
**Warning signs:**
- Users complain about "flashy" or "distracting" tooltips
- Tooltips appear when cursor briefly passes over elements
- Tooltips interfere with clicking nearby elements

### Pitfall 3: Tooltip Remains Visible During Element Drag
**What goes wrong:** Tooltip blocks view of element being positioned, confuses users
**Why it happens:** Not hiding tooltip on drag start
**How to avoid:** Listen for drag start events and hide tooltip
**Warning signs:**
- Tooltip follows element during drag operation
- Users can't see element clearly while dragging
- Tooltip appears in wrong position after drag

### Pitfall 4: Fixed-Width Spacers in Responsive Layouts
**What goes wrong:** UI doesn't adapt to different canvas sizes, elements overflow or have gaps
**Why it happens:** Using fixed pixel widths when flexible spacing is needed
**How to avoid:** Default spacers to flexible mode with flex-grow: 1, allow fixed mode for precise spacing
**Warning signs:**
- Elements don't distribute evenly across available space
- UI looks good at one size but breaks at others
- Users manually calculate spacer widths for different layouts

### Pitfall 5: Invisible Elements with No Visual Feedback
**What goes wrong:** Users can't find, select, or edit spacer elements
**Why it happens:** Making spacers truly invisible in designer
**How to avoid:** Show dashed outline and shaded background in designer, hide in export
**Warning signs:**
- Users ask "where did my spacer go?"
- Accidental selection of spacers when clicking empty space
- Users create multiple spacers in same location

### Pitfall 6: Window Chrome Without Button Style Property
**What goes wrong:** Need to create separate elements for macOS vs Windows style, duplicates layout work
**Why it happens:** Hardcoding button style instead of making it configurable
**How to avoid:** Add buttonStyle property with 'macos' | 'windows' | 'neutral' options
**Warning signs:**
- Palette has "macOS Window Chrome" and "Windows Window Chrome" as separate items
- Users need to recreate entire layout when changing OS target
- Property panel doesn't show button style option

### Pitfall 7: Tooltip Positioning Without Edge Detection
**What goes wrong:** Tooltips render outside viewport when trigger is near edge
**Why it happens:** Simple offset calculation doesn't check viewport boundaries
**How to avoid:** Check if tooltip would overflow viewport, adjust position accordingly
**Warning signs:**
- Tooltips cut off at edge of screen
- Can't read tooltip content for elements near canvas edge
- Tooltip arrow points wrong direction near edges

### Pitfall 8: Spacer Min/Max Constraints Not Enforced
**What goes wrong:** Flexible spacers collapse to 0px or expand infinitely
**Why it happens:** flex-grow without min/max-width constraints
**How to avoid:** Set reasonable minWidth (0-10px) and maxWidth (9999px or specific limit)
**Warning signs:**
- Spacers disappear completely in tight layouts
- Spacers push other elements out of view
- Layout looks correct in designer but broken in different sizes

## Code Examples

Verified patterns from official sources:

### Tooltip Configuration Type
```typescript
// Source: Research on tooltip libraries + CONTEXT.md decisions
// types/elements/containers.ts
export interface TooltipElementConfig extends BaseElementConfig {
  type: 'tooltip'

  // Trigger & timing
  hoverDelay: number  // 300-500ms recommended (default: 400ms)

  // Content (rich content support)
  content: string  // HTML string (sanitized with DOMPurify)

  // Position
  position: 'top' | 'bottom' | 'left' | 'right'
  showArrow: boolean
  offset: number  // Distance from trigger element (default: 8px)

  // Styling
  backgroundColor: string
  textColor: string
  fontSize: number
  padding: number
  borderRadius: number
  maxWidth: number
}

export function createTooltip(overrides?: Partial<TooltipElementConfig>): TooltipElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'tooltip',
    name: 'Tooltip',
    x: 0,
    y: 0,
    width: 200,
    height: 60,
    rotation: 0,
    zIndex: 1000,  // High z-index for overlay
    locked: false,
    visible: true,
    hoverDelay: 400,
    content: '<p>Tooltip text</p>',
    position: 'top',
    showArrow: true,
    offset: 8,
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    fontSize: 12,
    padding: 8,
    borderRadius: 4,
    maxWidth: 200,
    ...overrides,
  };
}
```

### Horizontal vs Vertical Spacer Types
```typescript
// Source: CONTEXT.md decisions + flexbox patterns
// types/elements/containers.ts
export interface HorizontalSpacerElementConfig extends BaseElementConfig {
  type: 'horizontalspacer'
  mode: 'fixed' | 'flexible'
  fixedWidth?: number
  flexGrow?: number
  minWidth?: number
  maxWidth?: number
}

export interface VerticalSpacerElementConfig extends BaseElementConfig {
  type: 'verticalspacer'
  mode: 'fixed' | 'flexible'
  fixedHeight?: number
  flexGrow?: number
  minHeight?: number
  maxHeight?: number
}

export function createHorizontalSpacer(): HorizontalSpacerElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'horizontalspacer',
    name: 'Horizontal Spacer',
    x: 0, y: 0,
    width: 40,
    height: 20,
    rotation: 0, zIndex: 0,
    locked: false, visible: true,
    mode: 'flexible',
    flexGrow: 1,
    minWidth: 0,
    maxWidth: 9999,
  };
}

export function createVerticalSpacer(): VerticalSpacerElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'verticalspacer',
    name: 'Vertical Spacer',
    x: 0, y: 0,
    width: 20,
    height: 40,
    rotation: 0, zIndex: 0,
    locked: false, visible: true,
    mode: 'flexible',
    flexGrow: 1,
    minHeight: 0,
    maxHeight: 9999,
  };
}
```

### Window Chrome Configuration
```typescript
// Source: CONTEXT.md decisions + research on title bar components
// types/elements/containers.ts
export interface WindowChromeElementConfig extends BaseElementConfig {
  type: 'windowchrome'

  // Button style
  buttonStyle: 'macos' | 'windows' | 'neutral'

  // Title bar
  showTitle: boolean
  titleText: string
  titleFontSize: number
  titleColor: string

  // Appearance
  backgroundColor: string
  height: number  // Title bar height (typically 32-44px)

  // Buttons visibility
  showCloseButton: boolean
  showMinimizeButton: boolean
  showMaximizeButton: boolean
}

export function createWindowChrome(overrides?: Partial<WindowChromeElementConfig>): WindowChromeElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'windowchrome',
    name: 'Window Chrome',
    x: 0,
    y: 0,
    width: 400,
    height: 36,
    rotation: 0,
    zIndex: 100,
    locked: false,
    visible: true,
    buttonStyle: 'neutral',
    showTitle: true,
    titleText: 'Window Title',
    titleFontSize: 13,
    titleColor: '#000000',
    backgroundColor: '#e5e7eb',
    showCloseButton: true,
    showMinimizeButton: true,
    showMaximizeButton: true,
    ...overrides,
  };
}
```

### Spacer Property Panel (Shared by H/V)
```typescript
// Source: Existing property panel patterns
// components/Properties/SpacerProperties.tsx
import { HorizontalSpacerElementConfig, VerticalSpacerElementConfig } from '../../types/elements';

type SpacerConfig = HorizontalSpacerElementConfig | VerticalSpacerElementConfig;

export function SpacerProperties({ element, onUpdate }: PropertyComponentProps<SpacerConfig>) {
  const isHorizontal = element.type === 'horizontalspacer';
  const dimensionLabel = isHorizontal ? 'Width' : 'Height';
  const dimension = isHorizontal ? element.width : element.height;

  return (
    <>
      <PropertySection title="Sizing">
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={element.mode === 'fixed'}
              onChange={() => onUpdate({ mode: 'fixed' })}
            />
            Fixed {dimensionLabel}
          </label>

          {element.mode === 'fixed' && (
            <NumberInput
              label={`${dimensionLabel} (px)`}
              value={isHorizontal ? element.fixedWidth : element.fixedHeight}
              onChange={(value) => onUpdate({
                [isHorizontal ? 'fixedWidth' : 'fixedHeight']: value
              })}
              min={0}
              max={1000}
            />
          )}

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={element.mode === 'flexible'}
              onChange={() => onUpdate({ mode: 'flexible' })}
            />
            Flexible (flex-grow)
          </label>

          {element.mode === 'flexible' && (
            <>
              <NumberInput
                label="Flex Grow"
                value={element.flexGrow || 1}
                onChange={(flexGrow) => onUpdate({ flexGrow })}
                min={0}
                max={10}
                step={0.5}
              />
              <NumberInput
                label={`Min ${dimensionLabel}`}
                value={isHorizontal ? element.minWidth : element.minHeight}
                onChange={(value) => onUpdate({
                  [isHorizontal ? 'minWidth' : 'minHeight']: value
                })}
                min={0}
                max={500}
              />
              <NumberInput
                label={`Max ${dimensionLabel}`}
                value={isHorizontal ? element.maxWidth : element.maxHeight}
                onChange={(value) => onUpdate({
                  [isHorizontal ? 'maxWidth' : 'maxHeight']: value
                })}
                min={0}
                max={9999}
              />
            </>
          )}
        </div>
      </PropertySection>

      <PropertySection title="Designer">
        <p className="text-sm text-gray-600">
          Spacers are shown with dashed outline in designer.
          They will be invisible in exported UI.
        </p>
      </PropertySection>
    </>
  );
}
```

### Tooltip with Rich Content Support
```typescript
// Source: Research + isomorphic-dompurify (already in package.json)
// components/elements/renderers/containers/TooltipRenderer.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DOMPurify from 'isomorphic-dompurify';
import { Rect } from 'react-konva';

export function TooltipRenderer({ config }: { config: TooltipElementConfig }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [delayTimer, setDelayTimer] = useState<number | null>(null);

  const handleMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    // Clear any existing timer
    if (delayTimer) clearTimeout(delayTimer);

    // Start delay timer
    const timer = window.setTimeout(() => {
      setTooltipPos(pos);
      setShowTooltip(true);
    }, config.hoverDelay);

    setDelayTimer(timer);
  };

  const handleMouseLeave = () => {
    if (delayTimer) {
      clearTimeout(delayTimer);
      setDelayTimer(null);
    }
    setShowTooltip(false);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [delayTimer]);

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(config.content);

  return (
    <>
      {/* Invisible trigger area */}
      <Rect
        x={0}
        y={0}
        width={config.width}
        height={config.height}
        fill="transparent"
        stroke="rgba(59, 130, 246, 0.5)"
        strokeWidth={1}
        dash={[4, 4]}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* DOM overlay tooltip */}
      {showTooltip && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: getTransformForPosition(config.position, config.offset),
            maxWidth: config.maxWidth,
            backgroundColor: config.backgroundColor,
            color: config.textColor,
            fontSize: config.fontSize,
            padding: config.padding,
            borderRadius: config.borderRadius,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          role="tooltip"
          aria-live="polite"
        >
          {config.showArrow && (
            <div
              className="absolute"
              style={getArrowStyle(config.position, config.backgroundColor)}
            />
          )}
          <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </div>,
        document.body
      )}
    </>
  );
}

function getTransformForPosition(position: string, offset: number): string {
  switch (position) {
    case 'top': return `translate(-50%, -100%) translateY(-${offset}px)`;
    case 'bottom': return `translate(-50%, 0) translateY(${offset}px)`;
    case 'left': return `translate(-100%, -50%) translateX(-${offset}px)`;
    case 'right': return `translate(0, -50%) translateX(${offset}px)`;
    default: return 'translate(-50%, -100%)';
  }
}

function getArrowStyle(position: string, bgColor: string): React.CSSProperties {
  const base = {
    width: 0,
    height: 0,
    borderStyle: 'solid' as const,
  };

  switch (position) {
    case 'top':
      return {
        ...base,
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: '6px 6px 0 6px',
        borderColor: `${bgColor} transparent transparent transparent`,
      };
    case 'bottom':
      return {
        ...base,
        top: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: '0 6px 6px 6px',
        borderColor: `transparent transparent ${bgColor} transparent`,
      };
    case 'left':
      return {
        ...base,
        right: '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: '6px 0 6px 6px',
        borderColor: `transparent transparent transparent ${bgColor}`,
      };
    case 'right':
      return {
        ...base,
        left: '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: '6px 6px 6px 0',
        borderColor: `transparent ${bgColor} transparent transparent`,
      };
    default:
      return base;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Canvas-native tooltips | DOM overlay tooltips with React Portal | React 16.0 (2017) | Better accessibility, rich content support, easier styling |
| Fixed-width spacers only | flex-grow with min/max constraints | CSS Flexbox mainstream (2015+) | Responsive layouts, automatic space distribution |
| Separate macOS/Windows elements | Configurable buttonStyle property | Modern component design | Reduces palette clutter, easier to switch styles |
| Instant tooltips | 300-500ms hover delay | UX research (2020+) | Reduces flicker, improves usability |
| visibility: hidden for spacers | Dashed outline + shaded background | Figma/Sketch patterns (2018+) | Easier to find and manipulate invisible elements |

**Deprecated/outdated:**
- HTML `<spacer>` tag: Removed from HTML spec, use CSS flexbox or margin instead
- Canvas-only tooltip implementations: Poor accessibility, limited formatting
- Hard-coded OS-specific window chrome: Use configurable property instead
- Always-invisible spacers: Design tools universally show visual indicators

## Open Questions

Things that couldn't be fully resolved:

1. **Tooltip target element binding**
   - What we know: Tooltip needs to be associated with a target element for hover detection
   - What's unclear: Should tooltip be a standalone element that references a target, or a property of existing elements?
   - Recommendation: Make Tooltip a standalone element with visual trigger area in designer. User places tooltip where they want hover detection. Alternative: Add "tooltip" property to all elements, but this complicates every property panel.

2. **Spacer visibility toggle location**
   - What we know: Users need ability to show/hide invisible elements
   - What's unclear: Global toggle (affects all spacers) or per-element property?
   - Recommendation: Start with global toggle in view menu (like "Show Guides" in design tools), consider per-element later if needed.

3. **Window Chrome resize handle behavior**
   - What we know: Title bar should be static in designer, export includes drag handler
   - What's unclear: Should resize handles be visual-only or functional in designer?
   - Recommendation: Visual-only in designer (actual resize controlled by canvas selection). JUCE export includes functional resize handle code. Document this in export templates.

4. **Tooltip positioning edge detection**
   - What we know: Tooltips should flip to avoid viewport edges
   - What's unclear: Auto-flip contradicts CONTEXT.md decision "no auto-flip"
   - Recommendation: Respect user's position choice (no auto-flip), but clamp tooltip to viewport boundaries so it's never completely off-screen.

5. **Rich tooltip content editing**
   - What we know: Content property is HTML string
   - What's unclear: Text input vs rich text editor in property panel?
   - Recommendation: Start with textarea for HTML input (power users), consider rich text editor later if users struggle with HTML. Include examples in help text.

## Sources

### Primary (HIGH confidence)
- Konva Shape Tooltips - https://konvajs.org/docs/sandbox/Shape_Tooltips.html
- MDN Flexible Box Layout - https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Flexible_box_layout/Controlling_flex_item_ratios
- Radix UI Tooltip - https://www.radix-ui.com/primitives/docs/components/tooltip
- React Portal API - https://react.dev/reference/react-dom/createPortal

### Secondary (MEDIUM confidence)
- [Material UI Tooltip](https://mui.com/material-ui/react-tooltip/) - Tooltip component patterns
- [PatternFly Tooltip Guidelines](https://www.patternfly.org/components/tooltip/design-guidelines/) - 300ms delay recommendation
- [Baymard: Hover Delay 300-500ms](https://baymard.com/blog/dropdown-menu-flickering-issue) - Usability research on delays
- [React Tooltip Library](https://react-tooltip.com/docs/examples/delay) - Delay implementation patterns
- [CSS-Tricks Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) - flex-grow patterns
- [Mac OS X Traffic Lights CodePen](https://codepen.io/atdrago/pen/yezrBR) - macOS button styling
- [React Desktop TitleBar](https://reactdesktop.js.org/docs/windows/title-bar/) - Windows/macOS title bar components
- [CSS Resize Property](https://css-tricks.com/almanac/properties/r/resize/) - Resize handle patterns

### Tertiary (LOW confidence)
- [Figma Layer Visibility](https://help.figma.com/hc/en-us/articles/360041112614-Toggle-visibility-to-hide-layers) - Designer visibility patterns
- [Webflow HTML Spacer](https://webflow.com/blog/html-spacer) - Spacer element history and patterns
- [UX Planet Tooltip Design](https://uxplanet.org/tooltip-a-small-design-element-with-a-big-ux-impact-e12f4ecec419) - Tooltip best practices
- [Syncfusion React Tooltip](https://www.syncfusion.com/react-components/react-tooltip) - Rich content support

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All solutions use existing libraries in package.json or native browser features
- Tooltip patterns: MEDIUM - DOM overlay approach well-established, but Konva-specific implementation requires testing
- Spacer patterns: HIGH - Flexbox flex-grow is standard, well-documented pattern
- Window Chrome: MEDIUM - Styling patterns clear, but JUCE export integration needs validation
- Pitfalls: MEDIUM - Based on research and existing patterns, but Konva-specific edge cases need testing

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable web APIs, React patterns mature)

**Notes:**
- CONTEXT.md decisions constrain research: hover-only tooltips, no auto-flip, separate H/V spacers, configurable button styles
- Existing architecture (Phase 19) provides registry pattern, renderer/properties structure
- isomorphic-dompurify already in package.json for rich content sanitization
- All three elements require special consideration: Tooltip (overlay), Spacer (invisible), WindowChrome (visual-only)
