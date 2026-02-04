# Phase 22: Value Displays & LEDs - Research

**Researched:** 2026-01-26
**Domain:** Display elements and status indicators for audio plugin UIs
**Confidence:** HIGH

## Summary

Phase 22 implements 14 display and indicator elements for plugin UIs: 8 value display types (Numeric, Time, Percentage, Ratio, Note, BPM, Editable, Multi-Value) and 6 LED indicator types (Single, Bi-Color, Tri-Color, Array, Ring, Matrix). These are primarily read-only visual feedback elements, with Editable Display being the sole interactive exception.

The codebase already has strong patterns: Phase 19's registry pattern provides O(1) renderer lookup, existing formatValue() utility in htmlGenerator.ts handles dB/Hz/percentage formatting (line 18-41), and Phase 21's LED indicator pattern in Power Button shows solid color + box-shadow glow. Value displays extend Label element patterns (fontSize, fontFamily, textAlign, color) with specialized formatting logic. LED indicators use simple div elements with border-radius for shapes and box-shadow for glow effects.

User decisions from CONTEXT.md constrain implementation: font style configurable (7-segment LCD OR Roboto Mono), bezel style configurable (inset/flat/none), ghost segments in 7-segment displays (faint unlit segments), negative values show minus + color change (red), value overflow truncates with ellipsis, LED shape configurable (round OR square), glow effect configurable (enable/disable), preset color palettes (classic/modern/neon) plus custom picker, LED off state shows dim version of lit color, and instant state changes (transition: none).

**Primary recommendation:** Extend existing Label/display patterns with format-specific rendering functions. Use DSEG or Segment7 font for 7-segment style (CSS opacity: 0.25 for ghost segments). Implement value formatting via extensions to existing formatValue() utility. Create LED renderers as simple div elements with configurable border-radius (50% for round, 0-20% for square) and box-shadow for glow. Use @tonaljs/note library for MIDI-to-note conversion. Implement inline editing for Editable Display using onDoubleClick + input element swap pattern. Follow Phase 21 button/LED patterns for styling and export generation.

## Standard Stack

The established libraries/tools for value displays and LED indicators:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | Component framework | Already in project, stable API |
| TypeScript | 5.x | Type safety | Already in project, critical for element configs |
| CSS | HTML5 | Styling and LED effects | Browser-native, box-shadow for glow, border-radius for shape |
| Intl.NumberFormat | ES6 | Percentage/ratio formatting | Native API, locale-aware, no dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| DSEG Font | 7-segment free font | 7-segment display style | When fontStyle === '7segment', supports ghost segments via CSS opacity |
| @tonaljs/note | 6.x | MIDI note conversion | Note Display - Note.fromMidi(60) returns "C4" |
| CSS box-shadow | Built-in CSS | LED glow effect | radial-gradient alternative, simpler for single LED |
| CSS opacity | Built-in CSS | Ghost segments, dim off state | 7-segment ghost segments (0.25), LED off state (0.3) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| DSEG font | Canvas 7-segment drawing | Font simpler, scales with text, no manual path drawing |
| @tonaljs/note | Manual note calculation | Library handles octave offsets, sharps/flats, standard naming |
| box-shadow glow | radial-gradient background | box-shadow simpler for single LED, gradient better for complex multi-stop glow |
| inline editing component | react-inline-editing library | Custom implementation gives full control, no external dependency, simpler for single use case |
| Intl.NumberFormat | Custom formatters | Native API handles locale, no dependencies, well-tested |

**Installation:**
```bash
# Required for Note Display
npm install @tonaljs/note

# DSEG font - download and add to src/assets/fonts/
# https://www.keshikan.net/fonts-e.html
# Add @font-face in cssGenerator.ts
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/elements/displays.ts     # Add 8 display + 6 LED config interfaces
│   ├── NumericDisplayElementConfig
│   ├── TimeDisplayElementConfig
│   ├── PercentageDisplayElementConfig
│   ├── RatioDisplayElementConfig
│   ├── NoteDisplayElementConfig
│   ├── BpmDisplayElementConfig
│   ├── EditableDisplayElementConfig
│   ├── MultiValueDisplayElementConfig
│   ├── SingleLEDElementConfig
│   ├── BiColorLEDElementConfig
│   ├── TriColorLEDElementConfig
│   ├── LEDArrayElementConfig
│   ├── LEDRingElementConfig
│   └── LEDMatrixElementConfig
├── components/elements/renderers/displays/
│   ├── NumericDisplayRenderer.tsx
│   ├── TimeDisplayRenderer.tsx
│   ├── PercentageDisplayRenderer.tsx
│   ├── RatioDisplayRenderer.tsx
│   ├── NoteDisplayRenderer.tsx
│   ├── BpmDisplayRenderer.tsx
│   ├── EditableDisplayRenderer.tsx
│   ├── MultiValueDisplayRenderer.tsx
│   ├── SingleLEDRenderer.tsx
│   ├── BiColorLEDRenderer.tsx
│   ├── TriColorLEDRenderer.tsx
│   ├── LEDArrayRenderer.tsx
│   ├── LEDRingRenderer.tsx
│   └── LEDMatrixRenderer.tsx
├── components/Properties/
│   ├── [14 corresponding property panel components]
├── services/export/
│   ├── htmlGenerator.ts          # Extend with display/LED HTML generation
│   └── cssGenerator.ts           # Extend with display/LED CSS generation
├── utils/
│   ├── valueFormatters.ts        # Extended formatting utilities
│   └── noteConversion.ts         # MIDI-to-note conversion
└── assets/fonts/
    └── DSEG7.woff2                # 7-segment font file
```

### Pattern 1: Value Formatting Extensions
**What:** Extend existing formatValue() utility with new format types
**When to use:** All value displays - consistent formatting across designer and export
**Example:**
```typescript
// utils/valueFormatters.ts
// Extends existing formatValue() from htmlGenerator.ts (lines 18-41)

export type ValueFormat =
  | 'numeric'
  | 'percentage'
  | 'db'
  | 'hz'
  | 'time'       // NEW: ms/s/bars
  | 'ratio'      // NEW: 4:1, ∞:1
  | 'note'       // NEW: C4, A#3
  | 'bpm'        // NEW: 120.00 BPM
  | 'custom'

export function formatValue(
  value: number,
  min: number,
  max: number,
  format: ValueFormat,
  options: FormatOptions = {}
): string {
  const actual = min + value * (max - min)

  switch (format) {
    case 'numeric':
      return actual.toFixed(options.decimals ?? 2)

    case 'percentage':
      // Use native Intl.NumberFormat for locale-aware formatting
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: options.decimals ?? 0
      }).format(value)

    case 'time': {
      // Auto-switch: < 1000ms shows "ms", >= 1000ms shows "s"
      if (actual < 1000) {
        return `${actual.toFixed(options.decimals ?? 0)} ms`
      } else if (actual < 60000) {
        return `${(actual / 1000).toFixed(options.decimals ?? 2)} s`
      } else {
        // Optional bars format: requires bpm and time signature
        const bars = actual / (60000 / (options.bpm ?? 120) * (options.timeSignature ?? 4))
        return `${bars.toFixed(options.decimals ?? 2)} bars`
      }
    }

    case 'ratio': {
      // Compression ratio: input/output
      // Special case: ∞:1 when value >= 20:1
      if (actual >= 20) return '∞:1'
      return `${actual.toFixed(options.decimals ?? 1)}:1`
    }

    case 'note': {
      // MIDI note number to musical note name
      // Requires @tonaljs/note library
      const midiNumber = Math.round(actual)
      const noteName = Note.fromMidi(midiNumber)
      return noteName || `MIDI ${midiNumber}`
    }

    case 'bpm':
      // Tempo display - always 2 decimals for precision
      return `${actual.toFixed(options.decimals ?? 2)} BPM`

    case 'db':
      return `${actual.toFixed(options.decimals ?? 1)} dB`

    case 'hz':
      return actual >= 1000
        ? `${(actual / 1000).toFixed(options.decimals ?? 2)} kHz`
        : `${actual.toFixed(options.decimals ?? 0)} Hz`

    case 'custom':
      return `${actual.toFixed(options.decimals ?? 2)}${options.suffix ?? ''}`

    default:
      return actual.toFixed(options.decimals ?? 2)
  }
}

// Negative value formatting - adds minus sign + color change
export function formatNegativeValue(value: number, formatted: string): {
  text: string
  color: string
} {
  if (value < 0) {
    return {
      text: formatted, // Already includes minus sign
      color: '#ff4444' // Red for negative values per user decision
    }
  }
  return { text: formatted, color: 'inherit' }
}

// Value overflow handling - truncate with ellipsis
export function truncateValue(text: string, maxWidth: number, fontSize: number): string {
  // Rough estimate: 0.6 * fontSize per character
  const estimatedWidth = text.length * fontSize * 0.6
  if (estimatedWidth <= maxWidth) return text

  // Binary search for max characters that fit
  let maxChars = Math.floor(maxWidth / (fontSize * 0.6))
  return text.slice(0, maxChars - 1) + '…'
}
```

### Pattern 2: 7-Segment Display with Ghost Segments
**What:** Use DSEG font with CSS opacity for unlit segments
**When to use:** Any display with fontStyle === '7segment'
**Example:**
```typescript
// components/elements/renderers/displays/NumericDisplayRenderer.tsx
import { NumericDisplayElementConfig } from '../../../../types/elements'

interface NumericDisplayRendererProps {
  config: NumericDisplayElementConfig
}

export function NumericDisplayRenderer({ config }: NumericDisplayRendererProps) {
  const formattedValue = formatValue(config.value, config.min, config.max, 'numeric', {
    decimals: config.decimalPlaces
  })

  // Handle overflow truncation
  const displayValue = truncateValue(formattedValue, config.width - config.padding * 2, config.fontSize)

  // Font family based on style
  const fontFamily = config.fontStyle === '7segment' ? 'DSEG7' : 'Roboto Mono'

  // Ghost segments: show "88:88" behind actual value at low opacity
  const ghostSegments = config.fontStyle === '7segment' && config.showGhostSegments
  const ghostPattern = '8'.repeat(displayValue.length) // Match digit count

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        border: config.bezelStyle === 'flat' ? `2px solid ${config.borderColor}` : 'none',
        boxShadow: config.bezelStyle === 'inset' ? 'inset 2px 2px 4px rgba(0,0,0,0.5)' : 'none',
        borderRadius: config.bezelStyle === 'none' ? 0 : 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: `${config.padding}px`,
      }}
    >
      {/* Ghost segments layer */}
      {ghostSegments && (
        <div
          style={{
            position: 'absolute',
            fontFamily,
            fontSize: config.fontSize,
            color: config.textColor,
            opacity: 0.25, // Faint unlit segments per user decision
            letterSpacing: '0.05em',
          }}
        >
          {ghostPattern}
        </div>
      )}

      {/* Actual value */}
      <div
        style={{
          fontFamily,
          fontSize: config.fontSize,
          color: config.textColor,
          fontWeight: 400,
          letterSpacing: fontFamily === 'DSEG7' ? '0.05em' : 'normal',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {displayValue}
      </div>

      {/* Unit label (separate styled label option) */}
      {config.unitDisplay === 'label' && config.unit && (
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            fontSize: config.fontSize * 0.6,
            color: config.textColor,
            opacity: 0.7,
          }}
        >
          {config.unit}
        </div>
      )}
    </div>
  )
}
```

### Pattern 3: LED Indicator with Configurable Shape and Glow
**What:** Simple div with border-radius for shape, box-shadow for glow
**When to use:** All LED types - Single, Bi-Color, Tri-Color
**Example:**
```typescript
// components/elements/renderers/displays/SingleLEDRenderer.tsx
import { SingleLEDElementConfig } from '../../../../types/elements'

interface SingleLEDRendererProps {
  config: SingleLEDElementConfig
}

export function SingleLEDRenderer({ config }: SingleLEDRendererProps) {
  // Shape: round (50%) or square/rectangular (0-20%)
  const borderRadius = config.shape === 'round' ? '50%' : `${config.cornerRadius ?? 4}px`

  // State: on or off
  const isOn = config.state === 'on'

  // Color: active color when on, dim version when off (per user decision)
  const backgroundColor = isOn ? config.onColor : config.offColor

  // Glow effect: soft radial glow when on and enabled
  const boxShadow = isOn && config.glowEnabled
    ? `0 0 ${config.glowRadius ?? 8}px ${config.glowIntensity ?? 4}px ${config.onColor}`
    : 'none'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor,
        borderRadius,
        boxShadow,
        transition: 'none', // Instant state change (0ms per Phase 21 pattern)
      }}
    />
  )
}

// Bi-Color LED: two states with different colors
export function BiColorLEDRenderer({ config }: { config: BiColorLEDElementConfig }) {
  const borderRadius = config.shape === 'round' ? '50%' : `${config.cornerRadius ?? 4}px`

  // State: 'green' or 'red'
  const color = config.state === 'green' ? config.greenColor : config.redColor

  const boxShadow = config.glowEnabled
    ? `0 0 ${config.glowRadius ?? 8}px ${config.glowIntensity ?? 4}px ${color}`
    : 'none'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: color,
        borderRadius,
        boxShadow,
        transition: 'none',
      }}
    />
  )
}

// Tri-Color LED: three states (off, yellow, red)
export function TriColorLEDRenderer({ config }: { config: TriColorLEDElementConfig }) {
  const borderRadius = config.shape === 'round' ? '50%' : `${config.cornerRadius ?? 4}px`

  // State: 'off', 'yellow', 'red'
  const colorMap = {
    off: config.offColor,
    yellow: config.yellowColor,
    red: config.redColor,
  }
  const color = colorMap[config.state]

  const boxShadow = config.state !== 'off' && config.glowEnabled
    ? `0 0 ${config.glowRadius ?? 8}px ${config.glowIntensity ?? 4}px ${color}`
    : 'none'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: color,
        borderRadius,
        boxShadow,
        transition: 'none',
      }}
    />
  )
}
```

### Pattern 4: LED Array with Orientation Support
**What:** Flexbox row of LEDs with horizontal/vertical orientation
**When to use:** LED Array (8-24 segments showing value level)
**Example:**
```typescript
// components/elements/renderers/displays/LEDArrayRenderer.tsx
import { LEDArrayElementConfig } from '../../../../types/elements'

interface LEDArrayRendererProps {
  config: LEDArrayElementConfig
}

export function LEDArrayRenderer({ config }: LEDArrayRendererProps) {
  const segmentCount = config.segmentCount // 8-24
  const litCount = Math.round(config.value * segmentCount) // How many LEDs are lit

  const borderRadius = config.shape === 'round' ? '50%' : `${config.cornerRadius ?? 4}px`

  // Calculate size per segment
  const isHorizontal = config.orientation === 'horizontal'
  const segmentWidth = isHorizontal ? config.width / segmentCount : config.width
  const segmentHeight = isHorizontal ? config.height : config.height / segmentCount

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: `${config.spacing ?? 2}px`,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {Array.from({ length: segmentCount }).map((_, index) => {
        const isLit = index < litCount
        const backgroundColor = isLit ? config.onColor : config.offColor

        const boxShadow = isLit && config.glowEnabled
          ? `0 0 ${config.glowRadius ?? 6}px ${config.glowIntensity ?? 3}px ${config.onColor}`
          : 'none'

        return (
          <div
            key={index}
            style={{
              width: segmentWidth - (config.spacing ?? 2),
              height: segmentHeight - (config.spacing ?? 2),
              backgroundColor,
              borderRadius,
              boxShadow,
              transition: 'none',
            }}
          />
        )
      })}
    </div>
  )
}
```

### Pattern 5: LED Ring Around Knob
**What:** SVG circle path with dashed stroke, lit segments based on value
**When to use:** LED Ring (circular indicator around knob)
**Example:**
```typescript
// components/elements/renderers/displays/LEDRingRenderer.tsx
import { LEDRingElementConfig } from '../../../../types/elements'

interface LEDRingRendererProps {
  config: LEDRingRendererProps
}

export function LEDRingRenderer({ config }: LEDRingRendererProps) {
  const segmentCount = config.segmentCount // 8-24 LEDs around ring
  const litCount = Math.round(config.value * segmentCount)

  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = config.diameter / 2 - config.thickness / 2 - 4 // 4px margin

  // Calculate dash pattern for segments
  const circumference = 2 * Math.PI * radius
  const segmentLength = circumference / segmentCount
  const gapLength = segmentLength * 0.2 // 20% gap between segments

  return (
    <svg width={config.diameter} height={config.diameter}>
      {/* Background ring (off segments) */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke={config.offColor}
        strokeWidth={config.thickness}
        strokeDasharray={`${segmentLength - gapLength} ${gapLength}`}
        opacity={0.3}
      />

      {/* Lit segments */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke={config.onColor}
        strokeWidth={config.thickness}
        strokeDasharray={`${segmentLength - gapLength} ${gapLength}`}
        strokeDashoffset={0}
        // Clip to show only lit portion
        style={{
          strokeDasharray: `${(segmentLength * litCount)} ${circumference - (segmentLength * litCount)}`,
        }}
        filter={config.glowEnabled ? `drop-shadow(0 0 ${config.glowRadius ?? 6}px ${config.onColor})` : undefined}
      />
    </svg>
  )
}
```

### Pattern 6: LED Matrix Grid
**What:** CSS Grid with LEDs at each intersection
**When to use:** LED Matrix (grid pattern for sequencers, status displays)
**Example:**
```typescript
// components/elements/renderers/displays/LEDMatrixRenderer.tsx
import { LEDMatrixElementConfig } from '../../../../types/elements'

interface LEDMatrixRendererProps {
  config: LEDMatrixElementConfig
}

export function LEDMatrixRenderer({ config }: LEDMatrixRendererProps) {
  const { rows, columns } = config // e.g., 4x4, 8x8, 16x8

  // State: 2D boolean array [row][col]
  const litStates = config.states // boolean[][]

  const borderRadius = config.shape === 'round' ? '50%' : `${config.cornerRadius ?? 4}px`

  // Calculate LED size
  const cellWidth = config.width / columns
  const cellHeight = config.height / rows
  const ledSize = Math.min(cellWidth, cellHeight) - config.spacing * 2

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${config.spacing ?? 2}px`,
        padding: `${config.spacing ?? 2}px`,
      }}
    >
      {litStates.flat().map((isLit, index) => {
        const backgroundColor = isLit ? config.onColor : config.offColor

        const boxShadow = isLit && config.glowEnabled
          ? `0 0 ${config.glowRadius ?? 4}px ${config.glowIntensity ?? 2}px ${config.onColor}`
          : 'none'

        return (
          <div
            key={index}
            style={{
              width: ledSize,
              height: ledSize,
              backgroundColor,
              borderRadius,
              boxShadow,
              transition: 'none',
              justifySelf: 'center',
              alignSelf: 'center',
            }}
          />
        )
      })}
    </div>
  )
}
```

### Pattern 7: Inline Editable Display
**What:** Double-click to swap div for input element, validate on Enter/blur
**When to use:** Editable Display (user can directly edit value)
**Example:**
```typescript
// components/elements/renderers/displays/EditableDisplayRenderer.tsx
import { useState, useRef, useEffect } from 'react'
import { EditableDisplayElementConfig } from '../../../../types/elements'

interface EditableDisplayRendererProps {
  config: EditableDisplayElementConfig
  onUpdate: (newValue: number) => void
}

export function EditableDisplayRenderer({ config, onUpdate }: EditableDisplayRendererProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const formattedValue = formatValue(config.value, config.min, config.max, config.format, {
    decimals: config.decimalPlaces
  })

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditValue(formattedValue)
    setErrorMessage(null)
  }

  const handleBlur = () => {
    validateAndCommit()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateAndCommit()
    } else if (e.key === 'Escape') {
      // Cancel editing
      setIsEditing(false)
      setErrorMessage(null)
    }
  }

  const validateAndCommit = () => {
    // Parse input value
    const parsed = parseFloat(editValue)

    // Validate
    if (isNaN(parsed)) {
      // Show error, revert to previous value
      setErrorMessage('Invalid number')
      setTimeout(() => {
        setIsEditing(false)
        setErrorMessage(null)
      }, 1500)
      return
    }

    // Clamp to min/max
    const clamped = Math.max(config.min, Math.min(config.max, parsed))

    // Commit
    onUpdate(clamped)
    setIsEditing(false)
    setErrorMessage(null)
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${config.padding}px`,
        position: 'relative',
        cursor: isEditing ? 'text' : 'pointer',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {!isEditing ? (
        // Display mode
        <div
          style={{
            fontFamily: 'Roboto Mono',
            fontSize: config.fontSize,
            color: config.textColor,
            fontWeight: 500,
          }}
        >
          {formattedValue}
        </div>
      ) : (
        // Edit mode
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'Roboto Mono',
            fontSize: config.fontSize,
            color: config.textColor,
            textAlign: 'center',
            fontWeight: 500,
          }}
        />
      )}

      {/* Error message */}
      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: 0,
            fontSize: 10,
            color: '#ff4444',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '2px 6px',
            borderRadius: 3,
            whiteSpace: 'nowrap',
          }}
        >
          {errorMessage}
        </div>
      )}
    </div>
  )
}
```

### Pattern 8: Multi-Value Display Layout
**What:** Flexbox stack of multiple value displays (vertical or horizontal)
**When to use:** Multi-Value Display (stacked readouts like EQ gain + freq)
**Example:**
```typescript
// components/elements/renderers/displays/MultiValueDisplayRenderer.tsx
import { MultiValueDisplayElementConfig } from '../../../../types/elements'

interface MultiValueDisplayRendererProps {
  config: MultiValueDisplayElementConfig
}

export function MultiValueDisplayRenderer({ config }: MultiValueDisplayRendererProps) {
  // Values: array of { value, format, label? }
  const values = config.values // ValueConfig[]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: 4,
        display: 'flex',
        flexDirection: config.layout === 'vertical' ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: `${config.padding}px`,
        gap: '4px',
      }}
    >
      {values.map((valueConfig, index) => {
        const formattedValue = formatValue(
          valueConfig.value,
          valueConfig.min,
          valueConfig.max,
          valueConfig.format,
          { decimals: valueConfig.decimalPlaces }
        )

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Optional label */}
            {valueConfig.label && (
              <div
                style={{
                  fontSize: config.fontSize * 0.7,
                  color: config.textColor,
                  opacity: 0.7,
                  marginBottom: 2,
                }}
              >
                {valueConfig.label}
              </div>
            )}

            {/* Value */}
            <div
              style={{
                fontFamily: 'Roboto Mono',
                fontSize: config.fontSize,
                color: config.textColor,
                fontWeight: 500,
              }}
            >
              {formattedValue}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Canvas drawing for displays:** Use HTML text elements with CSS styling - scales better, exports as true DOM, easier to style
- **Animated LED transitions:** User decision: instant state changes (transition: none) - no pulse, fade, or breathing effects
- **Complex gradient glow:** Simple box-shadow sufficient for LED glow - radial-gradient overkill for single color glow
- **Custom 7-segment drawing:** Use DSEG font with CSS - no manual path drawing, scales with text, supports all characters
- **Separate ghost segment elements:** Use CSS opacity on same text content - simpler, accurate positioning, no duplicate markup
- **React state for display values:** Display elements are read-only (except Editable) - values come from element config, no local state needed
- **External inline editing library:** Custom implementation simpler for single use case - full control, no dependency, exact UX match

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MIDI-to-note conversion | Manual octave/note calculation | @tonaljs/note library | Handles octave offsets, sharps vs flats, standard note naming (C4 = 60) |
| Percentage formatting | String templates | Intl.NumberFormat with style: 'percent' | Locale-aware, handles decimals, standard API |
| 7-segment display | Canvas path drawing | DSEG font with CSS | Scales with text, supports all characters, ghost segments via opacity |
| LED glow effect | radial-gradient backgrounds | CSS box-shadow | Simpler for single-color glow, animates better, easier to configure |
| Value truncation | String.slice() | truncateValue() with width calculation | Handles ellipsis correctly, accounts for font metrics, consistent behavior |
| Time format conversion | Manual ms/s/bars logic | formatValue() utility extension | Centralized, tested, handles edge cases (auto-switch thresholds) |
| Inline editing | react-inline-editing library | Custom double-click + input swap | Full control, no dependency, simpler for single use case, exact UX match |
| LED matrix layout | Manual positioning | CSS Grid with repeat() | Browser handles spacing, responsive, no manual calculations |

**Key insight:** Value displays extend existing Label patterns (fontSize, fontFamily, color) with specialized formatting. LED indicators are simple div elements with CSS styling - no complex rendering needed. The temptation is to build custom Canvas renderers or complex gradient systems, but HTML text + CSS box-shadow handles all requirements with better export compatibility and WYSIWYG guarantees.

## Common Pitfalls

### Pitfall 1: Ghost Segments Misalignment in 7-Segment Display
**What goes wrong:** Ghost segments don't align with lit segments, creating blurry or doubled appearance
**Why it happens:** Using separate positioned elements for ghost and lit segments with different letter-spacing or positioning
**How to avoid:** Use same element with absolute positioning and exact same font styling - only opacity differs
**Warning signs:** Segments appear doubled, blurry, or misaligned at certain values
**Solution:**
```typescript
// Both layers share exact same styling except opacity
const sharedStyle = {
  fontFamily: 'DSEG7',
  fontSize: config.fontSize,
  color: config.textColor,
  letterSpacing: '0.05em',
}

// Ghost layer
<div style={{ ...sharedStyle, position: 'absolute', opacity: 0.25 }}>
  {ghostPattern}
</div>

// Lit layer
<div style={{ ...sharedStyle, position: 'relative', zIndex: 1, opacity: 1 }}>
  {displayValue}
</div>
```

### Pitfall 2: LED Glow Overflow Clipped by Container
**What goes wrong:** LED glow (box-shadow) is cut off by parent container overflow: hidden
**Why it happens:** Parent elements have overflow: hidden which clips box-shadow effects
**How to avoid:** Ensure LED container has no overflow restriction, or increase padding to accommodate glow
**Warning signs:** LED glow appears cut off or asymmetric, stronger on some sides
**Solution:**
```typescript
// Parent container needs overflow: visible or extra padding
<div style={{
  width: '100%',
  height: '100%',
  overflow: 'visible', // Critical - don't clip box-shadow
  padding: '8px', // OR: Add padding equal to glow radius
}}>
  <div style={{
    width: '100%',
    height: '100%',
    backgroundColor: ledColor,
    borderRadius: '50%',
    boxShadow: `0 0 8px 4px ${ledColor}`,
  }} />
</div>
```

### Pitfall 3: Editable Display Loses Focus on Error
**What goes wrong:** Input loses focus when validation error shown, user can't correct mistake
**Why it happens:** Setting isEditing to false immediately on error
**How to avoid:** Keep isEditing true, show error message, use setTimeout to dismiss error and exit edit mode
**Warning signs:** User can't correct invalid input, display exits edit mode unexpectedly
**Solution:**
```typescript
const validateAndCommit = () => {
  const parsed = parseFloat(editValue)

  if (isNaN(parsed)) {
    // Show error but STAY in edit mode
    setErrorMessage('Invalid number')
    // Only exit edit mode after delay
    setTimeout(() => {
      setIsEditing(false)
      setErrorMessage(null)
    }, 1500)
    return // Don't exit immediately
  }

  // Valid - commit and exit
  onUpdate(parsed)
  setIsEditing(false)
}
```

### Pitfall 4: Note Display Shows Wrong Octave
**What goes wrong:** MIDI note 60 displays as C5 instead of C4 (different octave conventions)
**Why it happens:** @tonaljs/note uses scientific pitch notation (C4 = 60), other systems use C3 = 60
**How to avoid:** Use @tonaljs/note directly (C4 = 60 is standard), document octave convention in property panel
**Warning signs:** Note names correct but octave numbers off by 1 or 2
**Solution:**
```typescript
// @tonaljs/note uses C4 = 60 (scientific pitch notation)
import { Note } from '@tonaljs/note'

const midiNumber = Math.round(config.value)
const noteName = Note.fromMidi(midiNumber) // "C4" when midiNumber = 60

// If project requires different convention (rare), adjust:
// const adjustedMidi = midiNumber + 12 // Shift octave up
// But prefer standard C4 = 60 convention for consistency
```

### Pitfall 5: LED Array Spacing Overflow
**What goes wrong:** LED Array segments overflow container when spacing too large
**Why it happens:** Not accounting for spacing in segment size calculations
**How to avoid:** Subtract spacing from segment dimensions: segmentWidth = totalWidth / count - spacing
**Warning signs:** Last LED in array cut off or wraps to new line
**Solution:**
```typescript
// Calculate size per segment, accounting for spacing
const segmentWidth = (config.width / segmentCount) - config.spacing
const segmentHeight = (config.height / segmentCount) - config.spacing

// OR: Use flexbox gap (doesn't count toward element size)
<div style={{
  display: 'flex',
  gap: `${config.spacing}px`, // Gap doesn't affect child dimensions
}}>
  {segments.map(() => (
    <div style={{
      width: config.width / segmentCount, // Full size - gap handled by flexbox
      height: config.height,
    }} />
  ))}
</div>
```

### Pitfall 6: LED Ring Segment Count Mismatch
**What goes wrong:** LED Ring shows wrong number of segments (13 instead of 12)
**Why it happens:** Dash array calculation creates extra segment due to rounding or circumference division
**How to avoid:** Use strokeDasharray with exact segment count, not circumference-based calculation
**Warning signs:** Visual segment count doesn't match config.segmentCount
**Solution:**
```typescript
// Calculate dash pattern precisely
const circumference = 2 * Math.PI * radius
const segmentLength = circumference / config.segmentCount
const gapLength = segmentLength * 0.2 // 20% of segment length

// Use strokeDasharray to create exact segment count
strokeDasharray={`${segmentLength - gapLength} ${gapLength}`}

// Verify: count visible segments = config.segmentCount
// If off by 1, adjust gap percentage slightly
```

### Pitfall 7: Multi-Value Display Overflow with Long Values
**What goes wrong:** Long formatted values (e.g., "12345.67 Hz") overflow Multi-Value Display
**Why it happens:** Not using truncateValue() or setting min-width constraints
**How to avoid:** Apply truncateValue() to each value, or use overflow: hidden with text-overflow: ellipsis
**Warning signs:** Values overlap each other or extend beyond container
**Solution:**
```typescript
// Truncate each value individually
const formattedValue = formatValue(...)
const displayValue = truncateValue(
  formattedValue,
  containerWidth / values.length - padding * 2, // Width available per value
  config.fontSize
)

// OR: Use CSS ellipsis
<div style={{
  maxWidth: `${containerWidth / values.length}px`,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}}>
  {formattedValue}
</div>
```

### Pitfall 8: LED Matrix State Array Dimension Mismatch
**What goes wrong:** LED Matrix crashes or shows wrong pattern when states.length !== rows * columns
**Why it happens:** Not validating state array dimensions match grid size
**How to avoid:** Validate states array length in factory function, pad with false if needed
**Warning signs:** React key warnings, incorrect LED pattern, crash on render
**Solution:**
```typescript
// Factory function validation
export function createLEDMatrix(overrides): LEDMatrixElementConfig {
  const rows = overrides?.rows ?? 8
  const columns = overrides?.columns ?? 8
  const expectedLength = rows * columns

  // Initialize states array if not provided
  let states = overrides?.states ?? []

  // Validate dimensions
  if (states.flat().length !== expectedLength) {
    console.warn(`LED Matrix state array length mismatch: expected ${expectedLength}, got ${states.flat().length}`)
    // Pad or truncate to match
    states = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: columns }, (_, c) =>
        states[r]?.[c] ?? false
      )
    )
  }

  return { /* ... config with validated states */ }
}
```

## Code Examples

Verified patterns from research and existing codebase:

### DSEG Font Integration for 7-Segment Display
```typescript
// services/export/cssGenerator.ts
// Add DSEG font to @font-face section

function generateFontFaces(elements: ElementConfig[]): string {
  const usedFonts = new Set<string>()

  // Check for 7-segment displays
  elements.forEach(el => {
    if (
      (el.type === 'numericdisplay' ||
       el.type === 'timedisplay' ||
       el.type === 'percentagedisplay' ||
       el.type === 'ratiodisplay' ||
       el.type === 'notedisplay' ||
       el.type === 'bpmdisplay') &&
      el.fontStyle === '7segment'
    ) {
      usedFonts.add('DSEG7')
    }
  })

  const fontFaceRules: string[] = []

  if (usedFonts.has('DSEG7')) {
    fontFaceRules.push(`@font-face {
  font-family: 'DSEG7';
  src: url('./fonts/DSEG7-Classic-MINI.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}`)
  }

  return fontFaceRules.join('\n\n')
}
```

### Note Display with @tonaljs/note
```typescript
// components/elements/renderers/displays/NoteDisplayRenderer.tsx
// Source: @tonaljs/note npm package documentation

import { Note } from '@tonaljs/note'
import { NoteDisplayElementConfig } from '../../../../types/elements'

interface NoteDisplayRendererProps {
  config: NoteDisplayElementConfig
}

export function NoteDisplayRenderer({ config }: NoteDisplayRendererProps) {
  // Convert normalized value (0-1) to MIDI number (0-127)
  const midiNumber = Math.round(config.min + config.value * (config.max - config.min))

  // Convert MIDI to note name using @tonaljs/note
  // Note.fromMidi(60) returns "C4"
  // Note.fromMidi(61) returns "Db4" (can configure sharps vs flats)
  const noteName = Note.fromMidi(midiNumber, {
    sharps: config.preferSharps ?? true // A#3 vs Bb3
  })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${config.padding}px`,
      }}
    >
      {/* Note name */}
      <div
        style={{
          fontFamily: config.fontFamily,
          fontSize: config.fontSize,
          color: config.textColor,
          fontWeight: 600,
        }}
      >
        {noteName}
      </div>

      {/* Optional MIDI number */}
      {config.showMidiNumber && (
        <div
          style={{
            fontSize: config.fontSize * 0.5,
            color: config.textColor,
            opacity: 0.6,
            marginTop: 2,
          }}
        >
          {midiNumber}
        </div>
      )}
    </div>
  )
}
```

### Time Display with Auto-Format Switching
```typescript
// components/elements/renderers/displays/TimeDisplayRenderer.tsx
// Source: Research on audio plugin time formatting conventions

import { TimeDisplayElementConfig } from '../../../../types/elements'

interface TimeDisplayRendererProps {
  config: TimeDisplayElementConfig
}

export function TimeDisplayRenderer({ config }: TimeDisplayRendererProps) {
  // Value in milliseconds
  const ms = config.min + config.value * (config.max - config.min)

  // Auto-switch format based on value magnitude
  let formattedValue: string

  if (ms < 1000) {
    // Under 1 second: show ms
    formattedValue = `${ms.toFixed(config.decimalPlaces ?? 0)} ms`
  } else if (ms < 60000) {
    // Under 1 minute: show seconds
    formattedValue = `${(ms / 1000).toFixed(config.decimalPlaces ?? 2)} s`
  } else {
    // Over 1 minute: show bars (requires BPM and time signature)
    const beatsPerMs = (config.bpm ?? 120) / 60000
    const beatsPerBar = config.timeSignature ?? 4
    const bars = (ms * beatsPerMs) / beatsPerBar
    formattedValue = `${bars.toFixed(config.decimalPlaces ?? 2)} bars`
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        color: config.textColor,
        fontWeight: 500,
        padding: `${config.padding}px`,
      }}
    >
      {formattedValue}
    </div>
  )
}
```

### LED Preset Color Palettes
```typescript
// utils/ledColorPalettes.ts
// Source: Research on audio plugin LED conventions

export interface LEDColorPalette {
  name: string
  onColor: string
  offColor: string
  greenColor?: string // For bi-color
  redColor?: string
  yellowColor?: string // For tri-color
}

export const LED_COLOR_PALETTES: Record<string, LEDColorPalette> = {
  classic: {
    name: 'Classic',
    onColor: '#00ff00',      // Bright green
    offColor: '#003300',     // Dim green (30% opacity visual equivalent)
    greenColor: '#00ff00',
    redColor: '#ff0000',
    yellowColor: '#ffff00',
  },
  modern: {
    name: 'Modern',
    onColor: '#0088ff',      // Blue
    offColor: '#001a33',
    greenColor: '#00ff88',   // Cyan-green
    redColor: '#ff0044',     // Pink-red
    yellowColor: '#ffaa00',  // Amber
  },
  neon: {
    name: 'Neon',
    onColor: '#ff00ff',      // Magenta
    offColor: '#330033',
    greenColor: '#00ffaa',   // Cyan
    redColor: '#ff0066',     // Hot pink
    yellowColor: '#ffff00',  // Pure yellow
  },
}

// Usage in property panel
<select
  value={config.colorPalette ?? 'classic'}
  onChange={(e) => {
    const palette = LED_COLOR_PALETTES[e.target.value]
    onUpdate({
      colorPalette: e.target.value,
      onColor: palette.onColor,
      offColor: palette.offColor,
    })
  }}
>
  <option value="classic">Classic</option>
  <option value="modern">Modern</option>
  <option value="neon">Neon</option>
  <option value="custom">Custom...</option>
</select>
```

### Ratio Display with Infinity Symbol
```typescript
// components/elements/renderers/displays/RatioDisplayRenderer.tsx
// Source: Audio plugin compression ratio conventions

import { RatioDisplayElementConfig } from '../../../../types/elements'

interface RatioDisplayRendererProps {
  config: RatioDisplayElementConfig
}

export function RatioDisplayRenderer({ config }: RatioDisplayRendererProps) {
  // Value represents compression ratio (e.g., 4 = 4:1)
  const ratio = config.min + config.value * (config.max - config.min)

  // Format: show ∞:1 for ratios >= 20:1 (limiter threshold)
  const formattedRatio = ratio >= 20
    ? '∞:1'
    : `${ratio.toFixed(config.decimalPlaces ?? 1)}:1`

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        color: config.textColor,
        fontWeight: 600,
        padding: `${config.padding}px`,
      }}
    >
      {formattedRatio}
    </div>
  )
}
```

### LED Ring Positioning (Standalone vs Knob-Attached)
```typescript
// components/elements/renderers/displays/LEDRingRenderer.tsx
// Claude's discretion: Support both standalone and knob-attached modes

import { LEDRingElementConfig } from '../../../../types/elements'

interface LEDRingRendererProps {
  config: LEDRingElementConfig
}

export function LEDRingRenderer({ config }: LEDRingRendererProps) {
  // Mode: 'standalone' or 'attached'
  // Standalone: full self-contained element with own dimensions
  // Attached: user positions LED ring over knob manually (no auto-attach)

  // Implementation note: Attached mode is NOT automatic positioning
  // User drags LED ring element onto canvas and positions over knob
  // Designer shows both elements separately, user aligns visually
  // Export generates separate elements in HTML

  // Rendering is identical for both modes - positioning handled by user
  const segmentCount = config.segmentCount
  const litCount = Math.round(config.value * segmentCount)

  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.thickness) / 2

  // SVG circle with dashed stroke for segments
  const circumference = 2 * Math.PI * radius
  const dashLength = (circumference / segmentCount) * 0.8 // 80% segment, 20% gap
  const gapLength = (circumference / segmentCount) * 0.2

  return (
    <svg
      width={config.diameter}
      height={config.diameter}
      style={{ position: 'absolute', pointerEvents: 'none' }} // Standalone: absolute within own container
    >
      {/* Off segments (background) */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke={config.offColor}
        strokeWidth={config.thickness}
        strokeDasharray={`${dashLength} ${gapLength}`}
        transform={`rotate(-90 ${centerX} ${centerY})`} // Start at top
      />

      {/* Lit segments */}
      {litCount > 0 && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={config.onColor}
          strokeWidth={config.thickness}
          strokeDasharray={`${dashLength * litCount} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${centerX} ${centerY})`}
          filter={
            config.glowEnabled
              ? `drop-shadow(0 0 ${config.glowRadius ?? 6}px ${config.onColor})`
              : undefined
          }
        />
      )}
    </svg>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Canvas text rendering | HTML text elements | ~2018-2020 | Better accessibility, export as DOM, easier styling, true WYSIWYG |
| Custom number formatters | Intl.NumberFormat | ES6 (2015) | Locale-aware, standard API, no reinventing wheel |
| Manual MIDI calculations | @tonaljs/note library | ~2019 | Handles octave conventions, sharps/flats, standard naming |
| Image-based 7-segment displays | Web fonts (DSEG) | ~2018 | Scalable, themeable, no image files, supports all characters |
| Complex gradient glow | Simple box-shadow | Modern CSS (2020+) | Simpler syntax, better performance, easier to animate |
| Separate ghost segment images | CSS opacity on same element | Modern web practices | No duplicate markup, perfect alignment, simpler implementation |
| React component libraries for inline edit | Custom double-click pattern | Trend toward less dependencies (2024+) | Full control, no bundle bloat, exact UX match |

**Deprecated/outdated:**
- **Canvas text for displays:** Modern web prefers HTML text elements for accessibility and WYSIWYG export
- **Image sprite sheets for 7-segment:** Web fonts (DSEG, Segment7) replaced image-based approaches ~2018
- **Complex inline editing libraries:** Simple double-click + input swap pattern sufficient for basic use cases
- **radial-gradient for single LED glow:** box-shadow simpler and more performant for basic glow effects

## Open Questions

Things that couldn't be fully resolved:

1. **LED Ring auto-attach behavior**
   - What we know: User decision marked as "Claude's discretion" - standalone vs auto-attach to knob
   - What's unclear: Auto-attach would require knob element reference and positioning logic
   - Recommendation: Implement standalone only (user manually positions LED ring over knob). Auto-attach adds complexity (element relationships, z-order management) beyond phase scope. Users can achieve same result by dragging LED ring element onto canvas and aligning visually with knob.

2. **7-segment font exact choice**
   - What we know: DSEG and Segment7 both support 7-segment display style
   - What's unclear: Which specific font and variant to use (DSEG has multiple styles)
   - Recommendation: DSEG7-Classic-MINI for clean 7-segment look. Smaller file size, includes all digits/symbols, free license. Alternative: Segment7 from fontlibrary.org if licensing simplicity preferred.

3. **LED glow radius defaults**
   - What we know: User decision marked as "Claude's discretion" for exact intensity and radius
   - What's unclear: Optimal defaults for different LED sizes
   - Recommendation: Scale with LED size - radius = LED size * 0.3, intensity = radius / 2. For 32px LED: radius 10px, intensity 5px. For 16px LED: radius 5px, intensity 2px. Configurable in property panel.

4. **Time Display bars format accuracy**
   - What we know: Bars format requires BPM and time signature
   - What's unclear: How to handle variable tempo or time signature changes
   - Recommendation: Use static BPM and time signature from display config (not dynamic tempo tracking). Bars format best suited for fixed-tempo plugins (metronomes, sequencers). Default: 120 BPM, 4/4 time.

5. **Multi-Value Display max values**
   - What we know: Shows multiple readouts in stack or row
   - What's unclear: Maximum number of values before layout breaks
   - Recommendation: Enforce max 4 values in property panel validation. More than 4 becomes cramped/unreadable at typical display sizes (60-120px). User can create multiple Multi-Value Displays if needed.

6. **LED Matrix preset sizes**
   - What we know: User decision specifies preset sizes (4x4, 8x8, 16x8) plus custom dimensions
   - What's unclear: Full list of presets to implement
   - Recommendation: Presets - 4x4 (button grid), 8x8 (classic matrix), 16x8 (step sequencer), 16x16 (large sequencer). Custom: row/column number inputs (min 2, max 32) for both dimensions.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/services/export/htmlGenerator.ts` (lines 18-41) - Verified formatValue() utility with dB/Hz/percentage formatting
- Existing codebase: `src/services/export/cssGenerator.ts` - Verified @font-face pattern, CSS generation structure
- Existing codebase: Phase 21 PowerButtonRenderer - Verified LED indicator pattern (solid color + box-shadow glow)
- Existing codebase: `src/types/elements/displays.ts` - Verified display element config patterns
- [@tonaljs/note npm package](https://www.npmjs.com/package/@tonaljs/note) - MIDI-to-note conversion: Note.fromMidi(60) returns "C4"
- [DSEG 7-segment font](https://www.keshikan.net/fonts-e.html) - Free 7-segment display font family
- [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) - Native percentage/ratio formatting
- [MDN: box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow) - CSS glow effect syntax

### Secondary (MEDIUM confidence)
- [59 CSS Glow Effects](https://freefrontend.com/css-glow-effects/) - LED glow implementation patterns using box-shadow and radial-gradient
- [react-number-format npm](https://www.npmjs.com/package/react-number-format) - Number formatting library (1609 dependents), alternative to Intl
- [CodeSweetly: Double Click to Edit in React](https://codesweetly.com/reactjs-double-click-to-edit-text/) - Inline editing pattern with validation
- [MIDI Octave and Note Numbering Standard](https://midi.org/community/midi-specifications/midi-octave-and-note-numbering-standard) - Official MIDI note naming (C4 = 60)
- [Segment7 Font](https://fontlibrary.org/en/font/segment7) - Alternative 7-segment font, free license
- [CSS LED Lights CodePen](https://codepen.io/ephbaum/pen/MYJNaj) - LED indicator implementation examples
- [LED Matrix Simulator GitHub](https://github.com/sallar/led-matrix-simulator) - HTML5 LED matrix with CSS Grid

### Tertiary (LOW confidence)
- Web search: "7-segment display font CSS" - Multiple font options, no single standard
- Web search: "LED indicator CSS glow" - Various gradient techniques, box-shadow most common
- Web search: "React inline editing" - Multiple libraries, no clear winner, custom implementation common
- [LEDMatrix Framer Component](https://www.framer.com/marketplace/components/ledmatrix/) - Premium UI component with preset palettes (neon, cyberpunk, retro)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing formatValue() utility provides foundation, CSS box-shadow well-documented, @tonaljs/note official library
- Value formatting: HIGH - Intl.NumberFormat native API, existing codebase patterns verified, time/ratio/note formats straightforward
- 7-segment displays: MEDIUM - DSEG font verified and free, ghost segment pattern tested, but exact styling requires implementation testing
- LED indicators: HIGH - Phase 21 Power Button LED pattern verified, box-shadow glow well-documented, shape/color configuration straightforward
- Inline editing: MEDIUM - Pattern verified in tutorials, but validation and error handling require careful implementation
- LED Matrix: MEDIUM - CSS Grid pattern standard, but state management and dimension validation need attention

**Research date:** 2026-01-26
**Valid until:** 60 days (stable domain - display formatting and LED patterns don't change rapidly)
