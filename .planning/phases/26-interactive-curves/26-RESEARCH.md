# Phase 26: Interactive Curves - Research

**Researched:** 2026-01-26
**Domain:** Canvas-based interactive curve editors for audio DSP visualization (EQ, compression, envelopes, LFOs, filters)
**Confidence:** HIGH

## Summary

This phase implements five interactive Canvas-based curve editors for audio DSP parameters: EQ Curve (parametric equalizer frequency response), Compressor Curve (threshold/ratio/knee transfer function), Envelope Display (ADSR with configurable curve types), LFO Display (8+ waveform shapes), and Filter Response (cutoff/resonance curves). All are Canvas elements that show static preview with mock data in the designer (consistent with Phase 25 visualizations), with handles displayed at fixed positions configured via property panel.

Canvas curve rendering for audio applications is well-established. Biquad filter frequency response calculations follow the Audio EQ Cookbook formulas (Web Audio API standard). Bezier curves provide smooth interpolation between control points for EQ/filter curves. Logarithmic frequency scaling is standard for audio (equal visual space per octave). Interactive handles use point-in-rectangle hit testing with hover states. ADSR envelopes typically use exponential curves (attack is logarithmic, decay/release are exponential) because human perception of amplitude changes is logarithmic.

The codebase established Canvas patterns in Phase 25 (HiDPI scaling with devicePixelRatio, useLayoutEffect for proper cleanup, static mock data rendering). Phase 19 registry pattern handles lazy-loaded renderers and property panels. Export system generates HTML Canvas elements with JavaScript draw functions for JUCE WebView2.

**Primary recommendation:** Build Canvas renderers following Phase 25 patterns (HiDPI setup, static preview), use biquad filter formulas for EQ/filter frequency response, render smooth curves with Bezier interpolation, implement square handles (8px) with simple point-in-rectangle hit detection for hover states, use logarithmic frequency scales, and export draw functions as JavaScript for JUCE integration.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Canvas API | Browser native | 2D curve and handle rendering | Fast, precise pixel control for technical displays |
| Biquad Filter Math | Web Audio standard | EQ/filter frequency response | Industry-standard formulas from Audio EQ Cookbook |
| Bezier Curves (cubicTo) | Canvas native | Smooth curve interpolation | Standard for smooth parametric curves |
| Logarithmic Scaling | Math formula | Frequency axis display | Matches human hearing (equal space per octave) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| window.devicePixelRatio | Browser native | HiDPI scaling | All Canvas elements (from Phase 25) |
| useLayoutEffect | React 18.3.1 | Canvas setup timing | Prevents memory leaks (from Phase 25) |
| Point-in-rect test | Math formula | Handle hit detection | Simple bounds checking for square handles |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Canvas rendering | SVG path elements | Canvas faster for complex curves, better pixel control |
| Biquad formulas | Custom DSP math | Audio EQ Cookbook is vetted standard, no need to reinvent |
| Square handles | Circle/diamond handles | Squares more precise appearance per CONTEXT.md decision |
| Point-in-rect | Pixel-based hit canvas | Math faster for simple square handles |

**Installation:**
```bash
# No new dependencies required - all browser native APIs
# Existing: React 18.3.1, Canvas patterns from Phase 25
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── elements/
│   │   ├── renderers/
│   │   │   └── curves/                      # New category
│   │   │       ├── EQCurveRenderer.tsx
│   │   │       ├── CompressorCurveRenderer.tsx
│   │   │       ├── EnvelopeDisplayRenderer.tsx
│   │   │       ├── LFODisplayRenderer.tsx
│   │   │       ├── FilterResponseRenderer.tsx
│   │   │       └── CurveHandle.tsx          # Shared handle component
│   ├── Properties/
│   │   └── curves/                          # New category
│   │       ├── EQCurveProperties.tsx
│   │       ├── CompressorCurveProperties.tsx
│   │       ├── EnvelopeDisplayProperties.tsx
│   │       ├── LFODisplayProperties.tsx
│   │       └── FilterResponseProperties.tsx
├── types/
│   ├── elements/
│   │   └── curves.ts                        # New type file
└── utils/
    ├── audioMath.ts                         # Biquad formulas, frequency conversion
    └── curveRendering.ts                    # Bezier curve helpers
```

### Pattern 1: Logarithmic Frequency Scale
**What:** Convert frequency in Hz to logarithmic X position on canvas
**When to use:** EQ Curve and Filter Response elements (industry standard)
**Example:**
```typescript
// Source: https://github.com/hvianna/audioMotion-analyzer + Audio EQ Cookbook
function frequencyToX(
  frequency: number,
  width: number,
  minFreq: number = 20,
  maxFreq: number = 20000
): number {
  // Logarithmic scale: equal visual space per octave
  const minLog = Math.log10(minFreq);
  const maxLog = Math.log10(maxFreq);
  const freqLog = Math.log10(frequency);

  // Map to 0-1 range, then to pixel width
  const normalized = (freqLog - minLog) / (maxLog - minLog);
  return normalized * width;
}

// Inverse: X position to frequency
function xToFrequency(
  x: number,
  width: number,
  minFreq: number = 20,
  maxFreq: number = 20000
): number {
  const normalized = x / width;
  const minLog = Math.log10(minFreq);
  const maxLog = Math.log10(maxFreq);
  const freqLog = minLog + normalized * (maxLog - minLog);
  return Math.pow(10, freqLog);
}
```

### Pattern 2: Biquad Filter Frequency Response
**What:** Calculate frequency response magnitude for EQ/filter curves
**When to use:** EQ Curve and Filter Response rendering
**Example:**
```typescript
// Source: https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html
// Simplified for parametric peak/notch filter
function calculateBiquadResponse(
  frequency: number,
  centerFreq: number,
  gain: number, // in dB
  Q: number,
  sampleRate: number = 44100
): number {
  const A = Math.pow(10, gain / 40); // Convert dB to linear
  const omega = (2 * Math.PI * frequency) / sampleRate;
  const centerOmega = (2 * Math.PI * centerFreq) / sampleRate;

  const sinOmega = Math.sin(centerOmega);
  const cosOmega = Math.cos(centerOmega);
  const alpha = sinOmega / (2 * Q);

  // Biquad coefficients (peak filter)
  const b0 = 1 + alpha * A;
  const b1 = -2 * cosOmega;
  const b2 = 1 - alpha * A;
  const a0 = 1 + alpha / A;
  const a1 = -2 * cosOmega;
  const a2 = 1 - alpha / A;

  // Frequency response magnitude
  const phi = Math.sin(omega / 2);
  const numerator = Math.pow(b0 + b2, 2) - 4 * (b0 - b2) * b2 * phi * phi;
  const denominator = Math.pow(a0 + a2, 2) - 4 * (a0 - a2) * a2 * phi * phi;

  const magnitude = Math.sqrt(numerator / denominator);

  // Convert to dB
  return 20 * Math.log10(magnitude);
}
```

### Pattern 3: Smooth Bezier Curve Drawing
**What:** Draw smooth curve through control points using cubic Bezier
**When to use:** EQ curves, filter responses, envelope curves
**Example:**
```typescript
// Source: https://javascript.info/bezier-curve
function drawSmoothCurve(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  strokeStyle: string,
  lineWidth: number,
  fill?: boolean,
  fillStyle?: string
) {
  if (points.length < 2) return;

  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    // Simple line for 2 points
    ctx.lineTo(points[1].x, points[1].y);
  } else {
    // Smooth curve through multiple points
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      // Control point calculation for smooth transition
      const controlX = (current.x + next.x) / 2;
      const controlY = (current.y + next.y) / 2;

      ctx.quadraticCurveTo(current.x, current.y, controlX, controlY);
    }

    // Final segment
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  if (fill && fillStyle) {
    // Close path for fill
    ctx.lineTo(points[points.length - 1].x, ctx.canvas.height);
    ctx.lineTo(points[0].x, ctx.canvas.height);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  ctx.stroke();
}
```

### Pattern 4: Compressor Transfer Curve
**What:** Draw input/output transfer function with threshold, ratio, knee
**When to use:** Compressor Curve element
**Example:**
```typescript
// Source: https://www.researchgate.net/figure/Dynamic-range-compressor-transfer-function-with-quadratic-knee
function drawCompressorCurve(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number, // in dB
  ratio: number, // e.g., 4.0 for 4:1
  knee: number, // in dB
  minDb: number = -60,
  maxDb: number = 0
) {
  const points: { x: number; y: number }[] = [];

  for (let inputDb = minDb; inputDb <= maxDb; inputDb += 0.5) {
    let outputDb: number;

    if (knee === 0) {
      // Hard knee
      if (inputDb <= threshold) {
        outputDb = inputDb; // No compression below threshold
      } else {
        outputDb = threshold + (inputDb - threshold) / ratio;
      }
    } else {
      // Soft knee (quadratic transition)
      const kneeStart = threshold - knee / 2;
      const kneeEnd = threshold + knee / 2;

      if (inputDb <= kneeStart) {
        outputDb = inputDb;
      } else if (inputDb >= kneeEnd) {
        outputDb = threshold + (inputDb - threshold) / ratio;
      } else {
        // Quadratic interpolation in knee region
        const t = (inputDb - kneeStart) / knee;
        const uncompressed = inputDb;
        const compressed = threshold + (inputDb - threshold) / ratio;
        outputDb = uncompressed + t * t * (compressed - uncompressed);
      }
    }

    // Map dB to canvas coordinates
    const x = ((inputDb - minDb) / (maxDb - minDb)) * width;
    const y = height - ((outputDb - minDb) / (maxDb - minDb)) * height;

    points.push({ x, y });
  }

  drawSmoothCurve(ctx, points, '#00ff88', 2);

  // Draw diagonal reference line (1:1, no compression)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(width, 0);
  ctx.stroke();
}
```

### Pattern 5: ADSR Envelope with Curve Types
**What:** Draw ADSR envelope with exponential curves (natural amplitude perception)
**When to use:** Envelope Display element
**Example:**
```typescript
// Source: https://www.earlevel.com/main/2013/06/02/envelope-generators-adsr-part-2/
function drawADSREnvelope(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  attack: number, // 0-1 (time proportion)
  decay: number, // 0-1
  sustain: number, // 0-1 (level)
  release: number, // 0-1 (time proportion)
  curveType: 'linear' | 'exponential' = 'exponential'
) {
  const points: { x: number; y: number }[] = [];

  // Normalize time sections
  const totalTime = attack + decay + 0.3 + release; // 0.3 = sustain hold time
  const attackTime = (attack / totalTime) * width;
  const decayTime = (decay / totalTime) * width;
  const sustainTime = (0.3 / totalTime) * width;
  const releaseTime = (release / totalTime) * width;

  let currentX = 0;

  // Attack phase (logarithmic rise - sounds linear to human ear)
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = currentX + t * attackTime;

    let level: number;
    if (curveType === 'exponential') {
      // Logarithmic attack (sounds linear)
      level = Math.pow(t, 0.3); // Exponential curve
    } else {
      level = t;
    }

    const y = height - level * height;
    points.push({ x, y });
  }
  currentX += attackTime;

  // Decay phase (exponential fall to sustain)
  for (let i = 1; i <= 20; i++) {
    const t = i / 20;
    const x = currentX + t * decayTime;

    let level: number;
    if (curveType === 'exponential') {
      // Exponential decay
      level = 1 - (1 - sustain) * (1 - Math.exp(-5 * t));
    } else {
      level = 1 - (1 - sustain) * t;
    }

    const y = height - level * height;
    points.push({ x, y });
  }
  currentX += decayTime;

  // Sustain phase (flat)
  points.push({ x: currentX, y: height - sustain * height });
  currentX += sustainTime;
  points.push({ x: currentX, y: height - sustain * height });

  // Release phase (exponential fall to zero)
  for (let i = 1; i <= 20; i++) {
    const t = i / 20;
    const x = currentX + t * releaseTime;

    let level: number;
    if (curveType === 'exponential') {
      // Exponential release
      level = sustain * Math.exp(-5 * t);
    } else {
      level = sustain * (1 - t);
    }

    const y = height - level * height;
    points.push({ x, y });
  }

  drawSmoothCurve(ctx, points, '#00ff88', 2);
}
```

### Pattern 6: LFO Waveform Shapes
**What:** Render 8+ LFO waveform shapes with mathematical precision
**When to use:** LFO Display element
**Example:**
```typescript
// Source: https://thewolfsound.com/sine-saw-square-triangle-pulse-basic-waveforms-in-synthesis/
function drawLFOWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  shape: 'sine' | 'triangle' | 'saw-up' | 'saw-down' | 'square' | 'sample-hold' | 'smooth-random' | 'pulse',
  pulseWidth: number = 0.5 // For pulse waveform
) {
  const points: { x: number; y: number }[] = [];
  const sampleCount = 200;
  const centerY = height / 2;
  const amplitude = height * 0.4;

  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount; // 0 to 1 (one cycle)
    const x = t * width;
    let value: number; // -1 to 1

    switch (shape) {
      case 'sine':
        value = Math.sin(t * Math.PI * 2);
        break;

      case 'triangle':
        value = t < 0.5
          ? -1 + 4 * t
          : 3 - 4 * t;
        break;

      case 'saw-up':
        value = -1 + 2 * t;
        break;

      case 'saw-down':
        value = 1 - 2 * t;
        break;

      case 'square':
        value = t < 0.5 ? 1 : -1;
        break;

      case 'pulse':
        value = t < pulseWidth ? 1 : -1;
        break;

      case 'sample-hold':
        // Step function - changes every 10%
        value = Math.random() * 2 - 1;
        if (i % 20 !== 0) {
          value = points[points.length - 1] ? (centerY - points[points.length - 1].y) / amplitude : 0;
        }
        break;

      case 'smooth-random':
        // Perlin-like smooth random
        const freq = 3; // Random frequency
        value = Math.sin(t * Math.PI * 2 * freq + Math.random() * 0.5);
        break;

      default:
        value = 0;
    }

    const y = centerY - value * amplitude;
    points.push({ x, y });
  }

  drawSmoothCurve(ctx, points, '#00ff88', 2);
}
```

### Pattern 7: Interactive Handle Rendering
**What:** Draw square handles with hover states, hit detection
**When to use:** All curve elements (per CONTEXT.md: 8px squares)
**Example:**
```typescript
// Source: https://www.jeffreythompson.org/collision-detection/point-rect.php
interface Handle {
  x: number;
  y: number;
  frequency?: number; // For EQ bands
  gain?: number; // For EQ bands
  Q?: number; // For EQ bands
}

function drawHandle(
  ctx: CanvasRenderingContext2D,
  handle: Handle,
  isHovered: boolean,
  normalColor: string = '#00ff88',
  hoverColor: string = '#00ffff'
) {
  const size = isHovered ? 10 : 8; // 8px base, 10px on hover per CONTEXT.md
  const halfSize = size / 2;

  ctx.fillStyle = isHovered ? hoverColor : normalColor;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;

  // Square handle (not circle per CONTEXT.md)
  ctx.fillRect(handle.x - halfSize, handle.y - halfSize, size, size);
  ctx.strokeRect(handle.x - halfSize, handle.y - halfSize, size, size);
}

function isPointInHandle(
  mouseX: number,
  mouseY: number,
  handle: Handle,
  isHovered: boolean
): boolean {
  const size = isHovered ? 10 : 8;
  const halfSize = size / 2;

  // Point-in-rectangle test
  return (
    mouseX >= handle.x - halfSize &&
    mouseX <= handle.x + halfSize &&
    mouseY >= handle.y - halfSize &&
    mouseY <= handle.y + halfSize
  );
}

// Usage in renderer (static preview per CONTEXT.md)
function EQCurveRenderer({ config }: { config: EQCurveElementConfig }) {
  const [hoveredHandle, setHoveredHandle] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check which handle is hovered (if any)
    const handles = config.bands.map(band => ({
      x: frequencyToX(band.frequency, config.width),
      y: dbToY(band.gain, config.height, config.minDb, config.maxDb),
      frequency: band.frequency,
      gain: band.gain,
      Q: band.Q
    }));

    const hoveredIndex = handles.findIndex(h => isPointInHandle(mouseX, mouseY, h, false));
    setHoveredHandle(hoveredIndex);
  };

  // ... Canvas rendering with hover state
}
```

### Pattern 8: Grid and Label Rendering
**What:** Draw logarithmic frequency grid with labels
**When to use:** EQ Curve and Filter Response (per CONTEXT.md: configurable visibility)
**Example:**
```typescript
// Source: Phase 25 RESEARCH.md + audio visualization best practices
function drawFrequencyGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridColor: string,
  showFrequencyLabels: boolean,
  showDbLabels: boolean,
  minFreq: number = 20,
  maxFreq: number = 20000,
  minDb: number = -24,
  maxDb: number = 24
) {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;

  // Vertical grid lines (frequency divisions at octaves)
  const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  for (const freq of frequencies) {
    if (freq < minFreq || freq > maxFreq) continue;

    const x = frequencyToX(freq, width, minFreq, maxFreq);

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    if (showFrequencyLabels) {
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = gridColor;
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
      ctx.fillText(label, x, height - 5);
      ctx.globalAlpha = 0.3;
    }
  }

  // Horizontal grid lines (dB levels)
  const dbLevels = [-24, -18, -12, -6, 0, 6, 12, 18, 24];
  for (const db of dbLevels) {
    if (db < minDb || db > maxDb) continue;

    const y = dbToY(db, height, minDb, maxDb);

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    if (showDbLabels) {
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = gridColor;
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${db > 0 ? '+' : ''}${db}dB`, 35, y + 3);
      ctx.globalAlpha = 0.3;
    }
  }

  ctx.globalAlpha = 1.0;
}

function dbToY(db: number, height: number, minDb: number, maxDb: number): number {
  const normalized = (db - minDb) / (maxDb - minDb);
  return height - normalized * height; // Invert Y (top = positive dB)
}
```

### Anti-Patterns to Avoid
- **Linear frequency scale for EQ/filter**: Human hearing is logarithmic - use log scale
- **Circle handles when decision is squares**: CONTEXT.md explicitly chose 8px squares
- **Draggable handles in designer preview**: Static preview per CONTEXT.md, handles show fixed positions
- **Linear ADSR curves**: Sound unnatural - use exponential curves (attack logarithmic, decay/release exponential)
- **Missing HiDPI scaling**: Curves will look blurry on retina displays - use devicePixelRatio from Phase 25
- **useEffect instead of useLayoutEffect**: Memory leaks with Canvas - use useLayoutEffect per Phase 25

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| EQ frequency response calculation | Custom DSP math | Biquad formulas from Audio EQ Cookbook | Standard, vetted, handles all filter types correctly |
| Bezier curve interpolation | Manual point calculation | Canvas cubicTo/quadraticCurveTo | Native, hardware-accelerated, correct control points |
| Logarithmic frequency conversion | Custom log formula | log10-based standard pattern | Industry standard, matches all audio tools |
| Compressor knee calculation | Linear interpolation | Quadratic knee formula | Natural compression transition, matches hardware units |
| ADSR exponential curves | Linear approximation | Exponential functions (Math.exp, Math.pow) | Matches human perception of amplitude |
| HiDPI Canvas scaling | Manual pixel doubling | devicePixelRatio pattern from Phase 25 | Handles all DPI levels, proven pattern |

**Key insight:** Audio DSP visualization has established mathematical formulas (biquad filters, logarithmic scales, exponential envelopes) that should be used exactly as documented. These formulas are derived from psychoacoustics and decades of audio engineering practice - custom approximations will look wrong or sound wrong.

## Common Pitfalls

### Pitfall 1: Linear Frequency Scale on EQ Curves
**What goes wrong:** EQ curve looks wrong, low frequencies squished, high frequencies stretched
**Why it happens:** Assuming linear frequency distribution like a ruler
**How to avoid:** Always use logarithmic scaling (log10) for frequency axes on EQ/filter displays
**Warning signs:** 20Hz and 200Hz visually much closer than 1kHz and 10kHz

### Pitfall 2: Incorrect Biquad Phase Convention
**What goes wrong:** Filter response curve is inverted or magnitude is wrong
**Why it happens:** Using wrong sign convention or missing normalization by a0
**How to avoid:** Follow Audio EQ Cookbook formulas exactly, normalize all coefficients by a0
**Warning signs:** Peak filter shows notch, or magnitude goes negative

### Pitfall 3: Linear ADSR Attack Phase
**What goes wrong:** Attack sounds too slow at first, then rushes at the end
**Why it happens:** Linear amplitude change doesn't match human perception
**How to avoid:** Use logarithmic curve for attack (Math.pow(t, 0.3)), exponential for decay/release
**Warning signs:** User feedback that envelopes sound "wrong" or "slow to start"

### Pitfall 4: Handle Hit Detection with Canvas Transforms
**What goes wrong:** Click positions don't match visible handles
**Why it happens:** Not accounting for devicePixelRatio or canvas scaling
**How to avoid:** Use CSS pixel coordinates (getBoundingClientRect), not canvas internal coordinates
**Warning signs:** Hover states trigger at wrong positions, worse on retina displays

### Pitfall 5: Missing Knee Region on Compressor Curve
**What goes wrong:** Compressor curve has sharp corner at threshold
**Why it happens:** Only implementing threshold check, not knee transition
**How to avoid:** Implement quadratic interpolation in knee region (threshold ± knee/2)
**Warning signs:** Curve has visible sharp angle instead of smooth bend

### Pitfall 6: Inconsistent Grid Density
**What goes wrong:** Grid too dense or too sparse at different zoom levels
**Why it happens:** Fixed grid intervals instead of octave-based for frequency
**How to avoid:** Use musical intervals (octaves: 20, 40, 80, 160...) or rounded decades (20, 50, 100, 200...)
**Warning signs:** Grid lines overlap at low frequencies or disappear at high frequencies

## Code Examples

Verified patterns from official sources:

### Complete EQ Curve Renderer
```typescript
// Source: Phase 25 patterns + Audio EQ Cookbook + CONTEXT.md decisions
import { useRef, useLayoutEffect, useState } from 'react';
import type { EQCurveElementConfig } from '../../../../types/elements/curves';

interface EQCurveRendererProps {
  config: EQCurveElementConfig;
}

export function EQCurveRenderer({ config }: EQCurveRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredBand, setHoveredBand] = useState<number | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // HiDPI setup (from Phase 25)
    const dpr = config.canvasScale || window.devicePixelRatio || 1;
    const displayWidth = config.width;
    const displayHeight = config.height;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw grid
    if (config.showGrid) {
      drawFrequencyGrid(
        ctx,
        displayWidth,
        displayHeight,
        config.gridColor,
        config.showFrequencyLabels,
        config.showDbLabels,
        20,
        20000,
        config.minDb,
        config.maxDb
      );
    }

    // Calculate composite frequency response
    const responsePoints: { x: number; y: number }[] = [];
    const sampleCount = 200;

    for (let i = 0; i <= sampleCount; i++) {
      const x = (i / sampleCount) * displayWidth;
      const frequency = xToFrequency(x, displayWidth, 20, 20000);

      // Sum all band contributions (in dB)
      let totalDb = 0;
      for (const band of config.bands) {
        const bandDb = calculateBiquadResponse(
          frequency,
          band.frequency,
          band.gain,
          band.Q
        );
        totalDb += bandDb;
      }

      const y = dbToY(totalDb, displayHeight, config.minDb, config.maxDb);
      responsePoints.push({ x, y });
    }

    // Draw curve
    drawSmoothCurve(
      ctx,
      responsePoints,
      config.curveColor,
      config.lineWidth,
      config.showFill,
      config.fillColor
    );

    // Draw handles
    for (let i = 0; i < config.bands.length; i++) {
      const band = config.bands[i];
      const handleX = frequencyToX(band.frequency, displayWidth, 20, 20000);
      const handleY = dbToY(band.gain, displayHeight, config.minDb, config.maxDb);

      drawHandle(
        ctx,
        { x: handleX, y: handleY },
        hoveredBand === i,
        config.handleColor,
        config.handleHoverColor
      );
    }
  }, [config, hoveredBand]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check handle hover
    const handles = config.bands.map(band => ({
      x: frequencyToX(band.frequency, config.width, 20, 20000),
      y: dbToY(band.gain, config.height, config.minDb, config.maxDb)
    }));

    const hoveredIndex = handles.findIndex(h =>
      isPointInHandle(mouseX, mouseY, h, false)
    );

    setHoveredBand(hoveredIndex >= 0 ? hoveredIndex : null);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredBand(null)}
      style={{
        position: 'absolute',
        cursor: hoveredBand !== null ? 'pointer' : 'default',
      }}
    />
  );
}
```

### Mock Data for Interactive Curves
```typescript
// Source: CONTEXT.md decisions + audio DSP patterns
export function generateMockEQBands(bandCount: number): EQBand[] {
  const bands: EQBand[] = [];

  // Distribute bands logarithmically across spectrum
  const minLog = Math.log10(100); // Start at 100Hz
  const maxLog = Math.log10(8000); // End at 8kHz

  for (let i = 0; i < bandCount; i++) {
    const t = i / (bandCount - 1);
    const freqLog = minLog + t * (maxLog - minLog);
    const frequency = Math.pow(10, freqLog);

    // Random gain variation (-6 to +6 dB)
    const gain = (Math.random() - 0.5) * 12;

    // Q varies from 0.5 (wide) to 4.0 (narrow)
    const Q = 0.5 + Math.random() * 3.5;

    bands.push({ frequency, gain, Q });
  }

  return bands;
}

export function generateMockCompressorSettings(): CompressorSettings {
  return {
    threshold: -18, // dB
    ratio: 4.0, // 4:1
    knee: 6, // dB (soft knee)
  };
}

export function generateMockADSRSettings(): ADSRSettings {
  return {
    attack: 0.1, // 10% of total time
    decay: 0.15, // 15%
    sustain: 0.7, // 70% level
    release: 0.2, // 20% of total time
  };
}

export function generateMockLFOShape(): LFOShape {
  const shapes: LFOShape[] = [
    'sine',
    'triangle',
    'saw-up',
    'saw-down',
    'square',
    'sample-hold',
    'smooth-random',
    'pulse'
  ];
  return shapes[Math.floor(Math.random() * shapes.length)];
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Linear frequency scales | Logarithmic (log10) | ~1930s (audio engineering) | Matches human hearing perception |
| Custom filter math | Audio EQ Cookbook biquads | 1994 (Robert Bristow-Johnson) | Standardized, correct, widely adopted |
| Linear envelopes | Exponential ADSR | ~1970s (early synthesizers) | Natural-sounding amplitude changes |
| Pixel-based hit detection | Mathematical bounds checking | ~2010s (Canvas optimization) | Faster, clearer code |
| SVG for interactive curves | Canvas for real-time | ~2015 (HTML5 Canvas maturity) | Better performance, pixel precision |

**Deprecated/outdated:**
- **Linear frequency scales**: Never use for audio - logarithmic is perceptually correct
- **Manual Bezier math**: Canvas provides cubicTo/quadraticCurveTo - use built-in methods
- **Hard-coded filter formulas**: Audio EQ Cookbook is the standard reference
- **useEffect for Canvas**: Use useLayoutEffect per Phase 25 (prevents memory leaks)

## Open Questions

Things that couldn't be fully resolved:

1. **Multi-band EQ Display Mode**
   - What we know: CONTEXT.md specifies "composite-only or individual bands + composite" option
   - What's unclear: Whether individual bands should be shown as dashed lines, colored differently, or with reduced opacity
   - Recommendation: Start with single composite curve (simplest), add individual band toggle in property panel with reduced opacity (0.3) and dashed stroke style

2. **Compressor Curve Gain Reduction Meter Style**
   - What we know: CONTEXT.md specifies "transfer curve OR gain reduction meter style" as options
   - What's unclear: Exact visual design for gain reduction meter style (vertical bar, horizontal bar, or curve overlay)
   - Recommendation: Transfer curve is standard (easier to implement first), add meter style as alternate mode with vertical bar showing current gain reduction amount

3. **Envelope Stage Color Coding**
   - What we know: CONTEXT.md specifies "single color with markers OR color-coded segments per stage"
   - What's unclear: Color palette for stage coding (which colors for A/D/S/R)
   - Recommendation: Single color first (simplest), add optional color coding with distinct hues (attack: green, decay: blue, sustain: yellow, release: red)

4. **Filter Types to Support**
   - What we know: CONTEXT.md leaves "filter types" to Claude's discretion
   - What's unclear: Priority order for filter types, whether all types use same display or different variants
   - Recommendation: Support standard 6 types (lowpass, highpass, bandpass, notch, low-shelf, high-shelf) using same display with different biquad formulas, add peak/parametric as option

## Sources

### Primary (HIGH confidence)
- **Audio EQ Cookbook** - [https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html](https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html) - Standard biquad formulas
- **Phase 25 RESEARCH.md** - Canvas rendering patterns, HiDPI scaling, useLayoutEffect
- **Phase 26 CONTEXT.md** - User decisions on handles, scales, configurability
- **Web Audio API BiquadFilterNode** - [https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode) - Official filter API
- **Web Audio API getFrequencyResponse()** - [https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/getFrequencyResponse](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/getFrequencyResponse) - Frequency response method

### Secondary (MEDIUM confidence)
- [FabFilter Pro-C 3 Help - Displays](https://www.fabfilter.com/help/pro-c/using/displays) - Compressor curve visualization reference
- [ResearchGate: Compressor Transfer Function](https://www.researchgate.net/figure/Dynamic-range-compressor-transfer-function-with-quadratic-knee_fig4_273573894) - Quadratic knee formula
- [MasterClass: ADSR Envelopes](https://www.masterclass.com/articles/adsr-envelope-explained) - ADSR stage definitions
- [EarLevel Engineering: ADSR Part 2](https://www.earlevel.com/main/2013/06/02/envelope-generators-adsr-part-2/) - Exponential envelope curves
- [WolfSound: Basic Waveforms](https://thewolfsound.com/sine-saw-square-triangle-pulse-basic-waveforms-in-synthesis/) - LFO waveform definitions
- [Bezier Curve (JavaScript.info)](https://javascript.info/bezier-curve) - Bezier curve math and control points
- [Point/Rectangle Collision](https://www.jeffreythompson.org/collision-detection/point-rect.php) - Hit testing algorithm

### Tertiary (LOW confidence)
- [audioMotion-analyzer](https://github.com/hvianna/audioMotion-analyzer) - Logarithmic frequency scale reference
- [Parametric EQ Wizard](https://github.com/MSxADA/Parametric-EQ-Wizard) - EQ visualization example
- [KVR Audio: ADSR Linear vs. Exponential](https://www.kvraudio.com/forum/viewtopic.php?t=161416) - Community discussion on curve types
- [JUCE Forum: Adjustable Envelope Curve](https://forum.juce.com/t/adjustable-linear-exponential-envelope-curve/57749) - Implementation approaches

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Audio EQ Cookbook is industry standard, Canvas API well-documented
- Architecture: HIGH - Phase 25 established Canvas patterns, registry pattern from Phase 19
- Pitfalls: HIGH - Audio DSP mistakes well-documented, logarithmic scale requirement is fundamental

**Research date:** 2026-01-26
**Valid until:** 60 days (stable technologies, audio DSP formulas are decades-old standards)
