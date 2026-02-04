# Phase 25: Real-Time Visualizations - Research

**Researched:** 2026-01-26
**Domain:** Canvas-based audio visualizations with requestAnimationFrame rendering
**Confidence:** HIGH

## Summary

This phase implements five Canvas-based audio visualizations (Scrolling Waveform, Spectrum Analyzer, Spectrogram, Goniometer, Vectorscope) with 30 FPS mock data rendering in the designer. The research examined Canvas rendering patterns, animation loop management, HiDPI scaling, audio visualization algorithms, and export to JUCE WebView2.

Canvas rendering at controlled frame rates is well-established using `requestAnimationFrame` with time-based throttling. The standard pattern tracks elapsed time between frames to limit to exactly 30 FPS (1000/30 = 33.33ms per frame). React integration requires `useLayoutEffect` instead of `useEffect` to prevent timing-related memory leaks where `requestAnimationFrame` schedules itself again before cleanup runs.

For audio visualizations, the Web Audio API provides frequency data through `AnalyserNode.getByteFrequencyData()` with FFT sizes from 512-8192 samples. Mock data in the designer uses static representative patterns: pink noise slope (-3dB/octave) for spectrum analyzers, centered mono signal (vertical line) for stereo displays, and single frozen frames for spectrograms. HiDPI display support requires scaling canvas internal dimensions by `window.devicePixelRatio` (typically 1-4x) then scaling back with CSS to avoid blur on retina screens.

The codebase already has Canvas-aware renderers (WaveformRenderer, OscilloscopeRenderer) using SVG placeholders, and Phase 19 established registry patterns for lazy-loaded renderers and property panels. Export to JUCE WebView2 generates JavaScript functions with Canvas drawing code that JUCE can execute in its WebView2 browser component.

**Primary recommendation:** Build Canvas renderers with `useLayoutEffect` + `requestAnimationFrame` at 30 FPS, implement HiDPI scaling with `devicePixelRatio`, generate representative mock data patterns per CONTEXT.md decisions, and export Canvas draw functions as JavaScript code for JUCE integration.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Canvas API | Browser native | 2D rasterized rendering | Native, fast, well-supported for pixel manipulation |
| requestAnimationFrame | Browser native | Smooth animation loop | Browser-optimized, syncs with display refresh rate |
| React useLayoutEffect | 18.3.1 | Synchronous side effects | Prevents rAF timing issues, runs before browser paint |
| window.devicePixelRatio | Browser native | HiDPI scaling detection | Standard way to detect retina/high-DPI displays |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| AnalyserNode (Web Audio API) | Browser native | FFT frequency data | Reference for mock data patterns (not used in designer) |
| OffscreenCanvas | Browser native | Off-screen rendering | For spectrogram waterfall pixel buffer manipulation |
| cancelAnimationFrame | Browser native | Animation cleanup | Always pair with rAF in cleanup function |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Canvas API | SVG for visualizations | SVG slower for high-frequency pixel updates, Canvas better for continuous rendering |
| requestAnimationFrame | setInterval(fn, 33) | rAF battery-efficient, pauses in background tabs, syncs with refresh rate |
| useLayoutEffect | useEffect | useEffect may schedule new rAF before cleanup, causing memory leaks |

**Installation:**
```bash
# No new dependencies required - all browser native APIs
# Existing: React 18.3.1, Zustand for state management
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── elements/
│   │   ├── renderers/
│   │   │   └── visualizations/           # New category
│   │   │       ├── ScrollingWaveformRenderer.tsx
│   │   │       ├── SpectrumAnalyzerRenderer.tsx
│   │   │       ├── SpectrogramRenderer.tsx
│   │   │       ├── GoniometerRenderer.tsx
│   │   │       ├── VectorscopeRenderer.tsx
│   │   │       └── useCanvasAnimation.ts  # Shared hook
│   ├── Properties/
│   │   └── visualizations/               # New category
│   │       ├── ScrollingWaveformProperties.tsx
│   │       ├── SpectrumAnalyzerProperties.tsx
│   │       ├── SpectrogramProperties.tsx
│   │       ├── GoniometerProperties.tsx
│   │       └── VectorscopeProperties.tsx
├── types/
│   ├── elements/
│   │   └── visualizations.ts             # New type file
└── utils/
    └── mockAudioData.ts                  # Mock data generators
```

### Pattern 1: Canvas Animation with useLayoutEffect
**What:** Render loop at controlled frame rate with proper cleanup
**When to use:** All Canvas visualizations requiring continuous rendering
**Example:**
```typescript
// Source: https://blog.jakuba.net/request-animation-frame-and-use-effect-vs-use-layout-effect/
import { useLayoutEffect, useRef } from 'react';

function useCanvasAnimation(fps: number, draw: (ctx: CanvasRenderingContext2D, time: number) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frameMinTime = (1000 / 60) * (60 / fps) - (1000 / 60) * 0.5;

    function animate(time: number) {
      if (time - lastFrameTimeRef.current < frameMinTime) {
        rafIdRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = time;
      draw(ctx, time);
      rafIdRef.current = requestAnimationFrame(animate);
    }

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [fps, draw]);

  return canvasRef;
}
```

### Pattern 2: HiDPI Canvas Scaling
**What:** Scale Canvas internal dimensions for sharp rendering on retina displays
**When to use:** All Canvas elements to prevent blur on high-DPI screens
**Example:**
```typescript
// Source: https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm
function setupHiDPICanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = window.devicePixelRatio || 1;

  // Set canvas internal size (scaled for device pixel ratio)
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // Set canvas display size (CSS pixels)
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Scale all drawing operations
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }

  return ctx;
}
```

### Pattern 3: Spectrum Analyzer Mock Data (Pink Noise Slope)
**What:** Generate realistic frequency spectrum with -3dB/octave slope
**When to use:** Spectrum analyzer mock data to simulate natural audio
**Example:**
```typescript
// Source: Phase 25 CONTEXT.md + https://medium.com/better-programming/visualizing-the-colors-of-noise-93432ad94db8
function generatePinkNoiseSpectrum(barCount: number): number[] {
  const spectrum = new Array(barCount);

  for (let i = 0; i < barCount; i++) {
    // Pink noise: -3dB per octave slope
    // Higher frequencies have lower amplitude
    const frequency = (i / barCount); // 0 to 1
    const pinkSlope = Math.pow(frequency + 0.1, -0.5); // -3dB/octave approximation

    // Add some random variation (±10%)
    const variation = 0.9 + Math.random() * 0.2;

    // Normalize to 0-1 range, bias toward 0.6-0.8 for realistic levels
    spectrum[i] = Math.min(1, pinkSlope * 0.7 * variation);
  }

  return spectrum;
}
```

### Pattern 4: Goniometer/Vectorscope (Lissajous Display)
**What:** Plot L channel vs R channel to show stereo phase correlation
**When to use:** Goniometer and Vectorscope elements
**Example:**
```typescript
// Source: https://github.com/DrSnuggles/jsGoniometer + Phase 25 CONTEXT.md
function drawGoniometer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  showGrid: boolean
) {
  const centerX = width / 2;
  const centerY = height / 2;

  // Draw background and grid
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  if (showGrid) {
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 1;

    // L/R axis lines
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Circular grid
    const radius = Math.min(width, height) * 0.4;
    for (let r = radius * 0.25; r <= radius; r += radius * 0.25) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Mock data: centered mono signal (vertical line per CONTEXT.md)
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 40);
  ctx.lineTo(centerX, centerY + 40);
  ctx.stroke();
}
```

### Pattern 5: Spectrogram Waterfall Display
**What:** Time-frequency color map with scrolling waterfall effect
**When to use:** Spectrogram element showing frequency content over time
**Example:**
```typescript
// Source: https://github.com/jledet/waterfall + https://dev.to/hexshift/real-time-audio-spectrograms-in-the-browser-using-web-audio-api-and-canvas-4b2d
function drawSpectrogram(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spectrum: number[]
) {
  // Shift existing image down by 1 pixel
  const imageData = ctx.getImageData(0, 0, width, height - 1);
  ctx.putImageData(imageData, 0, 1);

  // Draw new spectrum line at top
  for (let x = 0; x < width; x++) {
    const binIndex = Math.floor((x / width) * spectrum.length);
    const magnitude = spectrum[binIndex];

    // Map magnitude to color (blue -> cyan -> green -> yellow -> red)
    const color = magnitudeToColor(magnitude);
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, 1, 1);
  }
}

function magnitudeToColor(magnitude: number): string {
  // Map 0-1 to heatmap colors
  const hue = (1 - magnitude) * 240; // 240° (blue) to 0° (red)
  const saturation = 100;
  const lightness = 30 + magnitude * 40; // Darker = quieter
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
```

### Pattern 6: Registry Integration for Visualizations
**What:** Register Canvas renderers and properties with Phase 19 registry pattern
**When to use:** All new visualization elements to maintain consistency
**Example:**
```typescript
// Source: Phase 19 established patterns
// src/components/elements/renderers/visualizations/index.ts
import { lazy } from 'react';

export const visualizationRenderers = new Map([
  ['scrollingwaveform', lazy(() => import('./ScrollingWaveformRenderer'))],
  ['spectrumanalyzer', lazy(() => import('./SpectrumAnalyzerRenderer'))],
  ['spectrogram', lazy(() => import('./SpectrogramRenderer'))],
  ['goniometer', lazy(() => import('./GoniometerRenderer'))],
  ['vectorscope', lazy(() => import('./VectorscopeRenderer'))],
]);

// src/components/Properties/visualizations/index.ts
export const visualizationProperties = new Map([
  ['scrollingwaveform', lazy(() => import('./ScrollingWaveformProperties'))],
  ['spectrumanalyzer', lazy(() => import('./SpectrumAnalyzerProperties'))],
  ['spectrogram', lazy(() => import('./SpectrogramProperties'))],
  ['goniometer', lazy(() => import('./GoniometerProperties'))],
  ['vectorscope', lazy(() => import('./VectorscopeProperties'))],
]);
```

### Anti-Patterns to Avoid
- **Using useEffect for rAF**: Timing issues cause memory leaks - always use `useLayoutEffect`
- **Hardcoding devicePixelRatio**: Value changes with browser zoom - always read from `window.devicePixelRatio`
- **Animating in designer without throttling**: Battery drain, performance issues - limit to 30 FPS
- **Missing cancelAnimationFrame**: Memory leaks when component unmounts - always cleanup
- **Static mock data**: Looks lifeless - use "frozen snapshot" of realistic patterns per CONTEXT.md

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FFT frequency binning | Custom FFT calculation | Pre-computed bin arrays | FFT math complex, bins constant for given size |
| Color gradients for heatmaps | Manual RGB interpolation | HSL color space | HSL handles hue rotation naturally for gradients |
| HiDPI detection | Browser sniffing | `window.devicePixelRatio` | Standard API, works across all devices |
| Frame rate limiting | Custom timer logic | Time-based rAF pattern | Proven pattern, handles variable refresh rates |
| Canvas blur prevention | Trial and error sizing | DPR scaling pattern | Well-documented, prevents common blur issues |

**Key insight:** Canvas rendering patterns are mature and well-documented. The tricky parts (HiDPI scaling, rAF cleanup, frame limiting) have standard solutions that should be used verbatim to avoid subtle bugs.

## Common Pitfalls

### Pitfall 1: Memory Leaks from Uncancelled Animation Frames
**What goes wrong:** Component unmounts but animation continues, accessing stale state
**Why it happens:** `useEffect` cleanup runs after browser paint, new frame scheduled before cleanup
**How to avoid:** Use `useLayoutEffect` which runs synchronously before paint
**Warning signs:** React warnings about setting state on unmounted component, performance degradation

### Pitfall 2: Blurry Canvas on Retina Displays
**What goes wrong:** Canvas looks fuzzy/pixelated on high-DPI screens
**Why it happens:** Canvas internal dimensions don't match physical pixel density
**How to avoid:** Always scale canvas by `window.devicePixelRatio` and scale context back
**Warning signs:** Crisp on 1x displays, blurry on 2x/3x retina displays

### Pitfall 3: Unrealistic Mock Data
**What goes wrong:** Visualizations look fake or unprofessional in designer preview
**Why it happens:** Using uniform noise or sine waves instead of representative patterns
**How to avoid:** Generate pink noise slope for spectrum, mono signal for stereo displays (per CONTEXT.md)
**Warning signs:** User feedback that preview doesn't look like real audio tools

### Pitfall 4: Battery Drain from Uncapped Frame Rate
**What goes wrong:** Laptop fans spin up, battery drains quickly when designer is open
**Why it happens:** requestAnimationFrame runs at display refresh rate (60+ FPS) without throttling
**How to avoid:** Time-based throttling to exactly 30 FPS per CONTEXT.md decision
**Warning signs:** High CPU usage in DevTools profiler, hot laptop, excessive rAF calls

### Pitfall 5: Canvas Export without JavaScript Functions
**What goes wrong:** Exported Canvas elements are static images, not live visualizations
**Why it happens:** Exporting Canvas data URL instead of JavaScript draw code
**How to avoid:** Export Canvas draw functions as JavaScript that JUCE WebView2 can execute
**Warning signs:** JUCE integration shows static snapshot instead of updating visualization

### Pitfall 6: Missing Context Check Before Drawing
**What goes wrong:** TypeError: Cannot read property 'fillRect' of null
**Why it happens:** Canvas ref not mounted yet or context creation failed
**How to avoid:** Always check `canvas` and `ctx` exist before drawing in useLayoutEffect
**Warning signs:** Console errors on initial render or during hot module reload

## Code Examples

Verified patterns from official sources:

### Complete Spectrum Analyzer Renderer
```typescript
// Source: Phase 25 CONTEXT.md + https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
import { useRef, useLayoutEffect } from 'react';
import type { SpectrumAnalyzerElementConfig } from '../../../../types/elements/visualizations';

interface SpectrumAnalyzerRendererProps {
  config: SpectrumAnalyzerElementConfig;
}

export function SpectrumAnalyzerRenderer({ config }: SpectrumAnalyzerRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number>();

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // HiDPI setup
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

    // Generate mock data (static per CONTEXT.md)
    const barCount = 64;
    const spectrum = generatePinkNoiseSpectrum(barCount);

    function draw() {
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Draw frequency grid (if enabled)
      if (config.showGrid) {
        drawFrequencyGrid(ctx, displayWidth, displayHeight, config.gridColor);
      }

      // Draw spectrum bars
      const barWidth = displayWidth / barCount;
      const gapWidth = config.barGap;

      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth;
        const barHeight = spectrum[i] * displayHeight * 0.9; // Leave 10% margin
        const y = displayHeight - barHeight;

        // Apply color gradient
        const color = getSpectrumColor(spectrum[i], config.colorGradient);
        ctx.fillStyle = color;
        ctx.fillRect(
          x + gapWidth / 2,
          y,
          barWidth - gapWidth,
          barHeight
        );
      }

      // Draw frequency labels (if enabled)
      if (config.showFrequencyLabels) {
        drawFrequencyLabels(ctx, displayWidth, displayHeight, barCount, config.fftSize);
      }

      // Draw dB scale (if enabled)
      if (config.showDbScale) {
        drawDbScale(ctx, displayHeight, config.textColor);
      }
    }

    // Static rendering (no animation per CONTEXT.md)
    draw();

    // No cleanup needed - static render
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
      }}
    />
  );
}

function generatePinkNoiseSpectrum(barCount: number): number[] {
  const spectrum = new Array(barCount);
  for (let i = 0; i < barCount; i++) {
    const frequency = i / barCount;
    const pinkSlope = Math.pow(frequency + 0.1, -0.5);
    const variation = 0.9 + Math.random() * 0.2;
    spectrum[i] = Math.min(1, pinkSlope * 0.7 * variation);
  }
  return spectrum;
}

function getSpectrumColor(magnitude: number, gradient: string): string {
  // Default: blue -> cyan -> green -> yellow -> red
  if (gradient === 'default') {
    const hue = (1 - magnitude) * 240; // 240° to 0°
    return `hsl(${hue}, 100%, ${40 + magnitude * 20}%)`;
  }
  // Other gradient styles...
  return '#00ff88';
}

function drawFrequencyGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;

  // Vertical grid lines (frequency divisions)
  for (let i = 0; i <= 8; i++) {
    const x = (i / 8) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal grid lines (dB levels)
  for (let i = 0; i <= 4; i++) {
    const y = (i / 4) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;
}

function drawFrequencyLabels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  barCount: number,
  fftSize: number
) {
  const sampleRate = 44100; // Typical sample rate
  const nyquist = sampleRate / 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';

  // Label key frequencies (20Hz, 100Hz, 1kHz, 10kHz, 20kHz)
  const keyFrequencies = [20, 100, 1000, 10000, 20000];

  for (const freq of keyFrequencies) {
    if (freq > nyquist) continue;

    const normalizedFreq = freq / nyquist;
    const x = normalizedFreq * width;

    const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
    ctx.fillText(label, x, height - 5);
  }
}

function drawDbScale(
  ctx: CanvasRenderingContext2D,
  height: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';

  // Draw dB markers: 0, -6, -12, -18, -24, -30...
  const dbLevels = [0, -6, -12, -18, -24, -30, -40, -50, -60];

  for (const db of dbLevels) {
    const normalized = (60 + db) / 60; // Map -60dB to 0dB → 0 to 1
    const y = height - (normalized * height);

    ctx.fillText(`${db}`, 30, y + 3);
  }
}
```

### Export Canvas Visualization to JUCE WebView2
```typescript
// Source: Phase 19 export patterns + SPECIFICATION.md
function exportSpectrumAnalyzer(config: SpectrumAnalyzerElementConfig): string {
  return `
// Spectrum Analyzer: ${config.name}
const canvas_${config.id} = document.getElementById('${config.id}');
const ctx_${config.id} = canvas_${config.id}.getContext('2d');

// HiDPI setup
const dpr_${config.id} = window.devicePixelRatio || 1;
canvas_${config.id}.width = ${config.width} * dpr_${config.id};
canvas_${config.id}.height = ${config.height} * dpr_${config.id};
canvas_${config.id}.style.width = '${config.width}px';
canvas_${config.id}.style.height = '${config.height}px';
ctx_${config.id}.scale(dpr_${config.id}, dpr_${config.id});

// Render function (called by JUCE with FFT data)
function updateSpectrum_${config.id}(frequencyData) {
  const barCount = frequencyData.length;
  const barWidth = ${config.width} / barCount;

  // Clear
  ctx_${config.id}.fillStyle = '${config.backgroundColor}';
  ctx_${config.id}.fillRect(0, 0, ${config.width}, ${config.height});

  // Draw bars
  for (let i = 0; i < barCount; i++) {
    const magnitude = frequencyData[i]; // 0-1 from JUCE
    const barHeight = magnitude * ${config.height} * 0.9;
    const x = i * barWidth;
    const y = ${config.height} - barHeight;

    const hue = (1 - magnitude) * 240;
    ctx_${config.id}.fillStyle = \`hsl(\${hue}, 100%, \${40 + magnitude * 20}%)\`;
    ctx_${config.id}.fillRect(x + ${config.barGap / 2}, y, barWidth - ${config.barGap}, barHeight);
  }
}

// Register with JUCE backend
if (window.__JUCE__) {
  window.__JUCE__.backend.addEventListener('fftData_${config.id}', (event) => {
    updateSpectrum_${config.id}(event.data);
  });
}
  `.trim();
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| setInterval for animation | requestAnimationFrame | ~2013 | Battery-efficient, syncs with refresh rate |
| useEffect for rAF cleanup | useLayoutEffect | React 16.8+ (2019) | Prevents timing-related memory leaks |
| Fixed canvas dimensions | devicePixelRatio scaling | ~2012 (retina displays) | Sharp rendering on all displays |
| Web Audio API AnalyserNode | Same, but with typed arrays | Ongoing refinement | Better performance with TypedArrays |
| SVG for real-time viz | Canvas for high-frequency updates | Established practice | Canvas faster for pixel manipulation |

**Deprecated/outdated:**
- **setInterval for animations**: Replaced by requestAnimationFrame (battery drain, not vsync'd)
- **hardcoded pixel ratio (2x)**: Replaced by dynamic devicePixelRatio (handles 3x, 4x displays)
- **useEffect with rAF**: Replaced by useLayoutEffect (prevents race conditions)
- **AudioContext without suspended state**: Modern browsers require user gesture to start AudioContext

## Open Questions

Things that couldn't be fully resolved:

1. **FFT Size Performance in Browser Context**
   - What we know: Web Audio API supports 512-8192 samples FFT, Phase 25 CONTEXT.md requires user-selectable FFT size
   - What's unclear: Whether browser FFT performance differs significantly from JUCE's native FFT for export
   - Recommendation: Designer uses fixed bin count (64) for mock data, export includes user's FFT size preference for JUCE to handle natively

2. **Spectrogram Memory Usage with Large Canvases**
   - What we know: Waterfall display shifts entire ImageData buffer each frame
   - What's unclear: Memory footprint for large spectrograms (e.g., 2048x512) updating at 30 FPS
   - Recommendation: Start with moderate size (800x400), monitor performance, add size warnings if needed

3. **Canvas Rendering in Background Tabs**
   - What we know: requestAnimationFrame pauses when tab not visible
   - What's unclear: Whether visualization elements should resume immediately when tab visible, or require user action
   - Recommendation: Use static mock data in designer (no animation), so background behavior is non-issue. JUCE WebView2 runs foreground always.

4. **Color Gradient Accessibility**
   - What we know: Default blue→red heatmaps can be difficult for colorblind users
   - What's unclear: Whether to provide colorblind-safe palettes by default or as option
   - Recommendation: Default to standard blue→red per CONTEXT.md (Claude's discretion), add palette options in future phase if requested

## Sources

### Primary (HIGH confidence)
- **Phase 19 RESEARCH.md** - Established registry patterns, code splitting, lazy loading
- **Phase 25 CONTEXT.md** - User decisions on static mock data, 30 FPS, toggleable overlays
- **Codebase analysis** - Existing WaveformRenderer, OscilloscopeRenderer, store patterns
- **docs/SPECIFICATION.md** - JUCE WebView2 integration patterns, export format

### Secondary (MEDIUM confidence)
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) - Official browser API docs
- [MDN: Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API) - AnalyserNode frequency data patterns
- [MDN: devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) - HiDPI scaling standard
- [Kirupa: Canvas HiDPI](https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm) - DPR scaling pattern verified
- [Jakub Arnold: rAF + useLayoutEffect](https://blog.jakuba.net/request-animation-frame-and-use-effect-vs-use-layout-effect/) - Memory leak prevention pattern
- [LogRocket: useEffect cleanup](https://blog.logrocket.com/understanding-react-useeffect-cleanup-function/) - Cleanup function best practices

### Tertiary (LOW confidence)
- [audioMotion-analyzer](https://github.com/hvianna/audioMotion-analyzer) - Reference implementation (MIT license, verified patterns)
- [jsGoniometer](https://github.com/DrSnuggles/jsGoniometer) - Lissajous pattern example
- [jledet/waterfall](https://github.com/jledet/waterfall) - Spectrogram waterfall pattern
- [Chris Courses: rAF frame limiting](https://chriscourses.com/blog/standardize-your-javascript-games-framerate-for-different-monitors) - 30fps throttling technique
- [Dev.to: Real-time spectrograms](https://dev.to/hexshift/real-time-audio-spectrograms-in-the-browser-using-web-audio-api-and-canvas-4b2d) - Waterfall implementation approach

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All browser native APIs, well-documented React patterns
- Architecture: HIGH - Existing patterns from Phase 19, established Canvas practices
- Pitfalls: HIGH - Common issues well-documented in React + Canvas community

**Research date:** 2026-01-26
**Valid until:** 60 days (stable technologies, no major breaking changes expected)
