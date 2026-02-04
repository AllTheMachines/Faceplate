# Phase 23: Professional Meters - Research

**Researched:** 2026-01-26
**Domain:** Audio metering standards and ballistics implementation
**Confidence:** MEDIUM

## Summary

Professional audio meters require standards-compliant ballistics (attack/release times), accurate dB scaling, and proper visual representation. The research covered 13 meter types across multiple international standards: VU (ANSI C16.5-1942), PPM Types I/II (IEC 60268-10), True Peak (ITU-R BS.1770-5), LUFS (EBU R128), K-System (Bob Katz), and phase/width analysis meters.

Key findings: Each meter type has precise integration times, decay rates, and scale ranges that differentiate it from others. VU uses 300ms ballistics for perceived loudness, PPM uses 5-10ms integration for transient peaks, LUFS uses windowed averaging with gating for perceived loudness, and K-System provides calibrated monitoring scales. All meters can be rendered as segmented (LED-style) displays using standard web technologies.

This is a **designer/preview implementation** - meters display static mock levels, not real-time audio analysis. The visual appearance and property configuration must match professional standards, but actual DSP/ballistics calculations are deferred to the VST3 host implementation.

**Primary recommendation:** Build segmented meter renderers with standards-compliant scales and visual appearance, using CSS Grid or SVG for layout. Store meter-specific configuration (dB ranges, ballistics type, color zones) in element properties. No audio processing required in designer.

## Standard Stack

This is a pure UI/rendering implementation - no audio processing libraries needed for the designer.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | Component rendering | Already in project |
| TypeScript | 5.6.2 | Type safety for meter configs | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS Grid | Native | Segment layout | Precise positioning for LED segments |
| SVG | Native | Scale marks, tick rendering | Vector graphics for resolution independence |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Grid | Canvas | Canvas faster for real-time animation, but designer shows static preview |
| CSS Grid | Positioned divs | More verbose, harder to maintain gaps |
| Native SVG | React Konva | Konva adds complexity for simple scale rendering |

**Installation:**
```bash
# No additional packages required - using native web technologies
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/elements/
│   └── displays.ts          # Add meter type configs
├── components/
│   ├── Renderers/
│   │   └── MeterRenderer.tsx    # Segmented meter rendering
│   └── Properties/
│       ├── RMSMeterProperties.tsx
│       ├── VUMeterProperties.tsx
│       ├── PPMType1Properties.tsx
│       ├── PPMType2Properties.tsx
│       ├── TruePeakMeterProperties.tsx
│       ├── LUFSMomentaryProperties.tsx
│       ├── LUFSShorttermProperties.tsx
│       ├── LUFSIntegratedProperties.tsx
│       ├── K12MeterProperties.tsx
│       ├── K14MeterProperties.tsx
│       ├── K20MeterProperties.tsx
│       ├── CorrelationMeterProperties.tsx
│       └── StereoWidthMeterProperties.tsx
```

### Pattern 1: Standards-Based Configuration
**What:** Each meter type has a TypeScript interface encoding its standard specifications
**When to use:** For all 13 meter types
**Example:**
```typescript
// Source: Research findings from IEC 60268-10, EBU R128, etc.
interface VUMeterElementConfig extends BaseElementConfig {
  type: 'vumeter'

  // Ballistics (informational - not implemented in designer)
  ballisticsType: 'VU' // 300ms rise/fall

  // Scale (ANSI C16.5-1942 standard)
  minDb: -20
  maxDb: 3

  // Preview value
  value: number // 0-1 normalized, default 0.25 (-12dB equivalent)

  // Visual
  orientation: 'vertical' | 'horizontal'
  segmentCount: number // LED segments, default 23 (1dB per segment)
  segmentGap: number // px, default 1 (tight like Waves plugins)

  // Scale
  scalePosition: 'outside' | 'inside' | 'none'
  showMajorTicks: boolean
  showMinorTicks: boolean

  // Color zones (configurable within standard guidelines)
  colorZones: Array<{
    startDb: number
    endDb: number
    color: string
  }>

  // Peak hold
  showPeakHold: boolean
  peakHoldStyle: 'line' | 'bar' // Claude's discretion

  // Numeric readout
  showNumericReadout: boolean
}
```

### Pattern 2: Segmented Meter Rendering
**What:** CSS Grid layout with individual segment divs for LED-style appearance
**When to use:** All meter types with segmented display
**Example:**
```typescript
// Source: Research on LED meter rendering patterns
function SegmentedMeter({ segments, value, orientation, gap }: Props) {
  const litSegments = Math.floor(value * segments)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: orientation === 'horizontal' ? `repeat(${segments}, 1fr)` : '1fr',
      gridTemplateRows: orientation === 'vertical' ? `repeat(${segments}, 1fr)` : '1fr',
      gap: `${gap}px`,
      width: '100%',
      height: '100%'
    }}>
      {Array.from({ length: segments }, (_, i) => {
        const isLit = orientation === 'vertical'
          ? i >= segments - litSegments  // Vertical fills from bottom
          : i < litSegments               // Horizontal fills from left

        return (
          <div
            key={i}
            style={{
              backgroundColor: isLit ? getSegmentColor(i, segments) : '#333',
              borderRadius: '1px',
              transition: 'none' // Instant per Phase 21 standard
            }}
          />
        )
      })}
    </div>
  )
}
```

### Pattern 3: Stereo Meter Layout
**What:** Side-by-side L/R channels in single component
**When to use:** Stereo variants of meters (RMS, VU, PPM, LUFS, K-System)
**Example:**
```typescript
// Source: CONTEXT.md decision - traditional mixer layout
function StereoMeter({ config }: Props) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ChannelMeter
        value={config.valueL}
        label={config.showLabels ? 'L' : undefined}
        {...config}
      />
      <ChannelMeter
        value={config.valueR}
        label={config.showLabels ? 'R' : undefined}
        {...config}
      />
    </div>
  )
}
```

### Pattern 4: dB-to-Segment Mapping
**What:** Convert dB value to normalized 0-1 position for rendering
**When to use:** All meters with dB scales
**Example:**
```typescript
// Source: Standard dB scaling math
function dbToNormalized(db: number, minDb: number, maxDb: number): number {
  return Math.max(0, Math.min(1, (db - minDb) / (maxDb - minDb)))
}

function normalizedToDb(normalized: number, minDb: number, maxDb: number): number {
  return minDb + normalized * (maxDb - minDb)
}

// Example: -12dB on VU meter (-20 to +3 range)
const normalized = dbToNormalized(-12, -20, 3) // 0.348 (roughly 1/3 up)
```

### Anti-Patterns to Avoid
- **Implementing real ballistics in designer:** Designer shows static preview, not real-time audio analysis
- **Using continuous gradients:** CONTEXT.md specifies segmented LED-style fill
- **Slow CSS transitions:** Phase 21 standard requires instant visual feedback
- **Single mono/stereo toggle:** CONTEXT.md specifies separate element types

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| True peak measurement with oversampling | Custom interpolation code | Document ITU-R BS.1770-5 spec | 4x oversample + lowpass filter + abs() - complex DSP, defer to host |
| LUFS gating algorithm | Custom threshold logic | Document EBU R128 gating | Dual-gate system (-70 LUFS absolute, -10 LU relative) is subtle |
| K-weighting filter | Custom IIR filter | Document ITU-R BS.1770 spec | Simulates human ear frequency response, requires precise filter coefficients |
| Ballistics filters | Custom time constants | Document standard specs | Attack/release curves are non-trivial (1st order lowpass, exponential decay) |
| Correlation calculation | Simple L-R math | Document phase correlation formula | Requires normalized cross-correlation: Σ(L[n] * R[n]) / sqrt(Σ(L[n]²) * Σ(R[n]²)) |
| Stereo width calculation | Ad-hoc M/S ratio | Document M/S to width formula | M/S balance calculation with proper scaling to 0-200% range |

**Key insight:** This phase is about visual design and configuration, not DSP implementation. All "Don't Hand-Roll" items are documented as specifications for the VST3 host to implement. Designer provides property configuration and standards-compliant visual preview only.

## Common Pitfalls

### Pitfall 1: Incorrect Ballistics Timing
**What goes wrong:** Using wrong integration times causes meters to misrepresent meter type (e.g., VU with 10ms integration looks like PPM)
**Why it happens:** Confusing different meter standards or using approximate values
**How to avoid:** Use exact specifications from standards documentation
**Warning signs:** Preview looks wrong compared to professional plugins (Waves, iZotope, etc.)

**Correct specifications:**
| Meter Type | Integration Time | Decay Time | Source |
|------------|------------------|------------|--------|
| VU | 300ms @ 99% | 300ms | ANSI C16.5-1942, verified via sound-au.com |
| PPM Type I (DIN) | 10ms @ 90% | 20dB / 1.5s | IEC 60268-10, verified via av-info.eu |
| PPM Type II (BBC/EBU) | 10ms @ 80% | 24dB / 2.8s | IEC 60268-10, verified via av-info.eu |
| RMS | 300ms window | 300ms | Common practice per research |
| LUFS Momentary | 400ms window | 400ms | EBU R128 |
| LUFS Short-term | 3s window | 3s | EBU R128 |
| True Peak | 4x oversample | Instant | ITU-R BS.1770-5 |

### Pitfall 2: Wrong dB Scale Ranges
**What goes wrong:** Using generic -60 to 0 dB range for all meters instead of standard-specific ranges
**Why it happens:** Not researching each standard's specified scale
**How to avoid:** Use standard-specific ranges in element config defaults
**Warning signs:** Meter looks wrong compared to reference implementations

**Correct dB ranges:**
| Meter Type | Min dB | Max dB | Source |
|------------|--------|--------|--------|
| VU | -20 | +3 | ANSI C16.5-1942 standard |
| PPM Type I (DIN) | -50 | +5 | IEC 60268-10 |
| PPM Type II (BBC) | Scale 1-7 | (maps to dB) | IEC 60268-10 |
| RMS | -60 | 0 | Common practice |
| LUFS | -60 | 0 | EBU R128 typical range |
| K-20 | -40 | +20 | Bob Katz K-System (20dB headroom) |
| K-14 | -34 | +14 | Bob Katz K-System (14dB headroom) |
| K-12 | -32 | +12 | Bob Katz K-System (12dB headroom) |
| True Peak | -60 | 0 | ITU-R BS.1770-5 typical |
| Correlation | -1 | +1 | Phase correlation range |
| Stereo Width | 0% | 200% | M/S ratio range |

### Pitfall 3: LUFS Gating Confusion
**What goes wrong:** Implementing integrated LUFS without understanding dual-gate system
**Why it happens:** EBU R128 gating is complex (absolute + relative gates)
**How to avoid:** Document gating clearly in properties, but don't implement in designer
**Warning signs:** Confusion about what "integrated" means vs "short-term"

**Correct gating (documentary):**
- **Absolute gate:** -70 LUFS (ignores silence)
- **Relative gate:** -10 LU below ungated measurement (ignores quiet passages)
- **Effect:** Integrated LUFS measures "average loudness of non-silent content"
- **Designer impact:** None - preview shows static level, gating happens in host

### Pitfall 4: Peak Hold Without Duration
**What goes wrong:** Peak hold indicator stays forever or disappears instantly
**Why it happens:** Not specifying hold duration in properties
**How to avoid:** Add `peakHoldDuration` property (e.g., 3000ms standard)
**Warning signs:** User can't control peak hold behavior

### Pitfall 5: Segment Count Mismatch
**What goes wrong:** Using arbitrary segment counts that don't align with dB scale
**Why it happens:** Not calculating segments from dB range
**How to avoid:** Default segment count = (maxDb - minDb) for 1dB-per-segment
**Warning signs:** Color zone boundaries don't align with segment edges

**Examples:**
- VU meter: -20 to +3 = 23 segments (1dB each)
- PPM Type I: -50 to +5 = 55 segments (1dB each)
- K-20: -40 to +20 = 60 segments (1dB each)

### Pitfall 6: Color Zone Placement
**What goes wrong:** Arbitrary color zones that don't match professional standards
**Why it happens:** Not researching standard color zone conventions
**How to avoid:** Provide standard-compliant defaults, allow user customization
**Warning signs:** Colors look wrong compared to reference meters

**Standard color zones (typical):**
- Green: Below -6dB
- Yellow/Orange: -6dB to -3dB (warning)
- Red: Above -3dB (clipping risk)
- VU meters: Green to 0 VU, red above +3 VU
- PPM: Green majority, red only at top

### Pitfall 7: Mono/Stereo Type Confusion
**What goes wrong:** Single element type with mono/stereo toggle
**Why it happens:** Trying to minimize element type count
**How to avoid:** CONTEXT.md decision - separate element types for mono and stereo
**Warning signs:** Property panel gets confusing with channel-specific settings

## Code Examples

Verified patterns from research findings:

### VU Meter Renderer
```typescript
// Source: VU meter specifications from sound-au.com and av-info.eu
interface VUMeterProps {
  config: VUMeterElementConfig
  width: number
  height: number
}

function VUMeterRenderer({ config, width, height }: VUMeterProps) {
  const { orientation, segmentCount, segmentGap, value, colorZones, showPeakHold } = config

  // VU standard: -20 to +3 dB
  const minDb = -20
  const maxDb = 3

  // Convert value (0-1 normalized) to dB for color zone lookup
  const currentDb = minDb + value * (maxDb - minDb)

  // Calculate which segments are lit (bottom-up for vertical, left-right for horizontal)
  const litSegments = Math.floor(value * segmentCount)

  // Color zone helper
  const getSegmentColor = (segmentIndex: number): string => {
    const segmentDb = minDb + (segmentIndex / segmentCount) * (maxDb - minDb)

    // Find matching color zone
    const zone = colorZones.find(z => segmentDb >= z.startDb && segmentDb <= z.endDb)
    return zone?.color || '#333' // Default off color
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: orientation === 'horizontal' ? `repeat(${segmentCount}, 1fr)` : '1fr',
      gridTemplateRows: orientation === 'vertical' ? `repeat(${segmentCount}, 1fr)` : '1fr',
      gap: `${segmentGap}px`,
      width,
      height,
      backgroundColor: '#000'
    }}>
      {Array.from({ length: segmentCount }, (_, i) => {
        // Vertical: fill from bottom (reverse index)
        // Horizontal: fill from left (normal index)
        const segmentIndex = orientation === 'vertical' ? segmentCount - 1 - i : i
        const isLit = orientation === 'vertical'
          ? i >= segmentCount - litSegments
          : i < litSegments

        return (
          <div
            key={i}
            style={{
              backgroundColor: isLit ? getSegmentColor(segmentIndex) : '#333',
              borderRadius: '1px',
              transition: 'none', // Instant per Phase 21 standard
              opacity: isLit ? 1 : 0.3 // Off segments at 30% brightness per Phase 22 decision
            }}
          />
        )
      })}

      {showPeakHold && (
        <PeakHoldIndicator
          position={value}
          orientation={orientation}
          style={config.peakHoldStyle || 'line'}
        />
      )}
    </div>
  )
}
```

### Correlation Meter (Horizontal Bar)
```typescript
// Source: Phase correlation formula from research
interface CorrelationMeterProps {
  config: CorrelationMeterElementConfig
  width: number
  height: number
}

function CorrelationMeterRenderer({ config, width, height }: CorrelationMeterProps) {
  // Correlation range: -1 (completely out of phase) to +1 (completely in phase)
  // 0 = maximum stereo width
  const { value, showScale, scalePosition } = config

  // Normalize -1 to +1 range to 0-1 for rendering
  const normalized = (value + 1) / 2 // -1 -> 0, 0 -> 0.5, +1 -> 1

  // Color zones
  const getColor = (correlation: number): string => {
    if (correlation < 0) return '#ff0000' // Red: out of phase (mono compatibility issue)
    if (correlation < 0.5) return '#ffff00' // Yellow: wide stereo
    return '#00ff00' // Green: more mono/centered
  }

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column' }}>
      {/* Scale */}
      {showScale && scalePosition === 'outside' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
          <span>-1</span>
          <span>0</span>
          <span>+1</span>
        </div>
      )}

      {/* Horizontal bar */}
      <div style={{
        flex: 1,
        backgroundColor: '#333',
        position: 'relative',
        borderRadius: '2px'
      }}>
        {/* Center marker at 0 correlation */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '2px',
          backgroundColor: '#666'
        }} />

        {/* Indicator */}
        <div style={{
          position: 'absolute',
          left: `${normalized * 100}%`,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: getColor(value),
          transform: 'translateX(-50%)',
          transition: 'none'
        }} />
      </div>

      {/* Numeric readout */}
      {config.showNumericReadout && (
        <div style={{ textAlign: 'center', fontSize: '12px' }}>
          {value.toFixed(2)}
        </div>
      )}
    </div>
  )
}
```

### Scale and Tick Marks (SVG)
```typescript
// Source: Professional meter UI conventions from research
interface MeterScaleProps {
  minDb: number
  maxDb: number
  orientation: 'vertical' | 'horizontal'
  position: 'inside' | 'outside'
  showMajorTicks: boolean
  showMinorTicks: boolean
  width: number
  height: number
}

function MeterScale({ minDb, maxDb, orientation, position, showMajorTicks, showMinorTicks, width, height }: MeterScaleProps) {
  // Major ticks every 6dB, minor ticks every 1dB (typical)
  const majorTickInterval = 6
  const minorTickInterval = 1

  const range = maxDb - minDb
  const majorTicks = Math.floor(range / majorTickInterval)
  const minorTicks = Math.floor(range / minorTickInterval)

  return (
    <svg width={width} height={height}>
      {/* Major ticks */}
      {showMajorTicks && Array.from({ length: majorTicks + 1 }, (_, i) => {
        const db = minDb + i * majorTickInterval
        const pos = orientation === 'vertical'
          ? height - (db - minDb) / range * height
          : (db - minDb) / range * width

        return (
          <g key={`major-${i}`}>
            {orientation === 'vertical' ? (
              <>
                <line x1={0} y1={pos} x2={8} y2={pos} stroke="#fff" strokeWidth={2} />
                <text x={12} y={pos + 4} fill="#fff" fontSize={10}>{db}</text>
              </>
            ) : (
              <>
                <line x1={pos} y1={0} x2={pos} y2={8} stroke="#fff" strokeWidth={2} />
                <text x={pos} y={20} fill="#fff" fontSize={10} textAnchor="middle">{db}</text>
              </>
            )}
          </g>
        )
      })}

      {/* Minor ticks */}
      {showMinorTicks && Array.from({ length: minorTicks + 1 }, (_, i) => {
        // Skip major tick positions
        if (i % majorTickInterval === 0) return null

        const db = minDb + i * minorTickInterval
        const pos = orientation === 'vertical'
          ? height - (db - minDb) / range * height
          : (db - minDb) / range * width

        return (
          <line
            key={`minor-${i}`}
            x1={orientation === 'vertical' ? 0 : pos}
            y1={orientation === 'vertical' ? pos : 0}
            x2={orientation === 'vertical' ? 4 : pos}
            y2={orientation === 'vertical' ? pos : 4}
            stroke="#999"
            strokeWidth={1}
          />
        )
      })}
    </svg>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| VU/PPM only | LUFS-based loudness | EBU R128 (2010), ITU-R BS.1770-5 (2023) | Modern mastering targets LUFS, not peak levels |
| Sample peak | True peak (oversampled) | ITU-R BS.1770-4 (2015) | Prevents inter-sample peaks after D/A conversion |
| Fixed -10dBFS headroom | K-System calibrated monitoring | Bob Katz (2000) | Consistent monitoring levels across projects |
| LKFS vs LUFS naming | Unified as LUFS | Post-2011 | LKFS (ATSC) and LUFS (EBU) are identical, LUFS now universal |
| Single-band correlation | Multi-band correlation | Recent plugins | Highlights phase issues in specific frequency bands |

**Deprecated/outdated:**
- **Peak-only metering:** Modern standards require loudness (LUFS) alongside peaks
- **VU as sole meter:** Too slow for transient detection, now paired with peak/LUFS
- **Analog-only PPM:** Digital PPM variants (5ms integration) supplement analog types

## Open Questions

Things that couldn't be fully resolved:

1. **Exact tick mark positions per meter type**
   - What we know: Major ticks every 6dB is common, minor ticks every 1-3dB
   - What's unclear: Standards don't specify tick positions, varies by manufacturer
   - Recommendation: Make tick intervals user-configurable, default to 6dB major / 1dB minor

2. **K-System meter ballistics**
   - What we know: K-System uses RMS measurement with specified 600ms ballistics (per Sonoris)
   - What's unclear: Whether K-meters should use VU-style ballistics or RMS averaging
   - Recommendation: Use RMS with 600ms window per K-System specification, not VU ballistics

3. **Stereo preview level asymmetry**
   - What we know: CONTEXT.md defers stereo preview levels to Claude's discretion
   - What's unclear: Slight L/R difference (more realistic) vs symmetric (simpler)
   - Recommendation: Use slight asymmetry (e.g., L at -12dB, R at -13dB) for visual interest

4. **Multi-band correlation meters**
   - What we know: Commercial plugins offer multi-band correlation analysis
   - What's unclear: Whether this is required for Phase 23 or future enhancement
   - Recommendation: Implement single broadband correlation meter per MTR-12, defer multi-band to future phase

5. **BBC PPM scale conversion**
   - What we know: BBC PPM uses 1-7 scale instead of dB
   - What's unclear: Exact dB equivalents for each PPM number
   - Recommendation: Research BBC engineering specs or use standard IEC 60268-10 Type II dB scale

## Sources

### Primary (HIGH confidence)
- [sound-au.com VU/PPM article](https://www.sound-au.com/project55.htm) - VU and PPM ballistics specifications
- [av-info.eu Audio Level Meters](https://av-info.eu/audio/meters.html) - Detailed meter ballistics table (EBU, DIN, BBC, VU)
- [Sonoris K-System](https://www.sonorissoftware.com/the-k-system/) - K-12, K-14, K-20 specifications and RMS ballistics
- [GitHub: web-audio-peak-meter](https://github.com/esonderegger/web-audio-peak-meter) - Web Audio API meter implementation reference

### Secondary (MEDIUM confidence)
- [Peak Programme Meter - Wikipedia](https://en.wikipedia.org/wiki/Peak_programme_meter) - IEC 60268-10 PPM Type I/II specifications
- [VU Meter - Wikipedia](https://en.wikipedia.org/wiki/VU_meter) - ANSI C16.5-1942 VU meter standard
- [EBU R128 - Wikipedia](https://en.wikipedia.org/wiki/EBU_R_128) - LUFS metering overview
- [Sound on Sound: PPM vs VU](https://www.soundonsound.com/sound-advice/q-whats-difference-between-ppm-and-vu-meters) - Practical comparison of meter types
- [Voxengo Correlometer](https://www.voxengo.com/product/correlometer/) - Multi-band correlation meter implementation
- [Sound on Sound: Phase Correlation](https://www.soundonsound.com/sound-advice/q-what-are-my-phase-correlation-meters-telling-me) - Correlation meter interpretation

### Tertiary (LOW confidence - WebSearch only)
- Various WebSearch results on LUFS gating, true peak implementation, and meter pitfalls - used for context, cross-referenced with higher-confidence sources where possible

### Official standards (noted but not directly accessible)
- ITU-R BS.1770-5 (2023) - True peak and loudness measurement (PDF not readable in binary format)
- EBU R128 - Loudness normalization and permitted maximum level (PDF not readable in binary format)
- IEC 60268-10 - PPM meter specifications (referenced by secondary sources)
- ANSI C16.5-1942 - VU meter standard (historical, referenced by secondary sources)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using native web technologies already in project
- Architecture: HIGH - Segmented rendering patterns well-established, aligned with Phase 22 LED decisions
- Pitfalls: MEDIUM - Standards well-documented, but some implementation details vary between sources
- Don't Hand-Roll: MEDIUM - DSP algorithms documented but not implemented (designer-only phase)

**Research date:** 2026-01-26
**Valid until:** Approximately 30 days (audio metering standards are stable, but verify any library updates)

**Notes:**
- This research focuses on visual design and property configuration, not real-time audio DSP
- All ballistics specifications are documentary - designer shows static preview only
- Standards are mature (oldest: VU 1942, newest: ITU-R BS.1770-5 2023) and unlikely to change
- Web Audio API meter library exists but not needed for static designer preview
