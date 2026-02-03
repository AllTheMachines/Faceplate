# HOLO - Faceplate UI Specification v2

**Plugin:** HOLO (Hologram Microcosm Emulation)
**Updated:** 2026-01-31
**Based on:** Microcosm Manual hardware analysis

---

## Design Philosophy

The hardware Microcosm uses 8 knobs with secondary functions accessed via SHIFT button. For a VST plugin, we expose ALL parameters as separate controls for:
- Better DAW automation (every parameter has its own lane)
- Clearer UI (no hidden functions)
- Easier preset management

---

## Canvas Settings

| Property | Value |
|----------|-------|
| Width | 900 |
| Height | 650 |
| Background | #1a1a1a |

---

## Complete Parameter List

### Output Section

| Parameter ID | Name | Type | Range | Default | Display | Hardware Equivalent |
|--------------|------|------|-------|---------|---------|---------------------|
| `volume` | Volume | float | 0.0–1.0 | 0.75 | dB | MIX secondary (EFFECT VOLUME) |
| `mix` | Mix | float | 0.0–1.0 | 0.5 | 0%–100% | MIX knob primary |
| `bypass` | Bypass | bool | — | false | On/Off | BYPASS footswitch |

### Algorithm Selection

| Parameter ID | Name | Type | Range | Default | Display | Hardware Equivalent |
|--------------|------|------|-------|---------|---------|---------------------|
| `algorithm` | Algorithm | int | 0–10 | 0 | Name | Preset Selector (11 algorithms) |
| `variation` | Variation | int | 0–3 | 0 | A/B/C/D | Preset Selector (4 per algorithm) |

**Algorithm Values:**

| Value | Name | Bank |
|-------|------|------|
| 0 | Mosaic | A - Micro Loop |
| 1 | Seq | A - Micro Loop |
| 2 | Glide | A - Micro Loop |
| 3 | Haze | B - Granules |
| 4 | Tunnel | B - Granules |
| 5 | Strum | B - Granules |
| 6 | Blocks | C - Glitch |
| 7 | Interrupt | C - Glitch |
| 8 | Arp | C - Glitch |
| 9 | Pattern | D - Multi Delay |
| 10 | Warp | D - Multi Delay |

### Effect Controls (Main Knobs)

| Parameter ID | Name | Type | Range | Default | Display | Hardware Equivalent |
|--------------|------|------|-------|---------|---------|---------------------|
| `activity` | Activity | float | 0.0–1.0 | 0.5 | 0%–100% | ACTIVITY knob |
| `time` | Time | float | 0.0–1.0 | 0.5 | varies | TIME knob |
| `repeats` | Repeats | float | 0.0–1.0 | 0.3 | 0%–100% | REPEATS knob |

### Envelope/Shape

| Parameter ID | Name | Type | Range | Default | Display | Hardware Equivalent |
|--------------|------|------|-------|---------|---------|---------------------|
| `shape` | Shape | float | 0.0–1.0 | 0.5 | 0%–100% | SHAPE knob |

### Pitch Modulation

| Parameter ID | Name | Type | Range | Default | Display | Hardware Equivalent |
|--------------|------|------|-------|---------|---------|---------------------|
| `modRate` | Mod Rate | float | 0.0–1.0 | 0.0 | 0%–100% | SHAPE secondary (MOD FREQ) |
| `modDepth` | Mod Depth | float | 0.0–1.0 | 0.0 | 0%–100% | REPEATS secondary (MOD DEPTH) |

### Reverb

| Parameter ID | Name | Type | Range | Default | Display | Hardware Equivalent |
|--------------|------|------|-------|---------|---------|---------------------|
| `reverbSpace` | Space | float | 0.0–1.0 | 0.3 | 0%–100% | SPACE knob primary |
| `reverbMode` | Reverb Mode | int | 0–3 | 0 | Name | SPACE secondary (REVERB TIME) |

**Reverb Mode Values:**

| Value | Name | Character |
|-------|------|-----------|
| 0 | Bright Room | Short decay, high density, bright |
| 1 | Dark Medium | Rolled-off highs, moderate decay, warm |
| 2 | Large Hall | Long decay, slower attack, spacious |
| 3 | Ambient | Massive decay, pitch-modulated tail |

### Filter

| Parameter ID | Name | Type | Range | Default | Display | Hardware Equivalent |
|--------------|------|------|-------|---------|---------|---------------------|
| `filterCutoff` | Filter | float | 20–20000 | 20000 | Hz/kHz | FILTER knob |
| `filterResonance` | Resonance | float | 0.0–1.0 | 0.0 | 0%–100% | FILTER secondary (RESONANCE) |

**Note:** Filter fully clockwise (20kHz) = bypassed. Turn left to cut highs.

### Looper (Future - Phase 6)

| Parameter ID | Name | Type | Range | Default | Display | Hardware Equivalent |
|--------------|------|------|-------|---------|---------|---------------------|
| `loopLevel` | Loop Level | float | 0.0–1.0 | 0.75 | 0%–100% | LOOP LEVEL knob |
| `loopFadeTime` | Fade Time | float | 0.0–1.0 | 0.5 | 0%–100% | LOOP LEVEL secondary (FADE TIME) |

### Time Control

| Parameter ID | Name | Type | Range | Default | Display | Hardware Equivalent |
|--------------|------|------|-------|---------|---------|---------------------|
| `timeMode` | Time Mode | int | 0–1 | 0 | Subdiv/Tempo | SELECT button toggle |
| `subdivision` | Subdivision | int | 0–5 | 2 | 1/4,1/2,1x,2x,4x,8x | TIME knob (SUBDIV mode) |

### Performance

| Parameter ID | Name | Type | Range | Default | Display | Hardware Equivalent |
|--------------|------|------|-------|---------|---------|---------------------|
| `reverse` | Reverse | bool | — | false | On/Off | Preset Selector press (FWD/REV) |
| `hold` | Hold | bool | — | false | On/Off | HOLD footswitch |

---

## Suggested Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HOLO                                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ALGORITHM                                                           │   │
│  │  [Dropdown: Mosaic ▼]              [Variation: ① ② ③ ④]             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────┐  ┌───────────────────────────────────┐  │
│  │  EFFECT                       │  │  MODULATION                       │  │
│  │                               │  │                                   │  │
│  │  (Activity)  (Time) (Repeats) │  │  (Shape)   (Mod Rate) (Mod Depth) │  │
│  │     [K]       [K]     [K]     │  │    [K]        [K]        [K]      │  │
│  │                               │  │                                   │  │
│  └───────────────────────────────┘  └───────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────┐  ┌───────────────────────────────────┐  │
│  │  REVERB                       │  │  FILTER                           │  │
│  │                               │  │                                   │  │
│  │  (Space)   [Mode: Room ▼]     │  │  (Cutoff)         (Resonance)     │  │
│  │    [K]                        │  │    [K]               [K]          │  │
│  │                               │  │                                   │  │
│  └───────────────────────────────┘  └───────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  OUTPUT                                                              │   │
│  │                                                                      │   │
│  │  (Mix)        (Volume)        [Reverse]  [Hold]  [Bypass]           │   │
│  │   [K]           [K]              □         □        □               │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Knob Specifications

| Element | Parameter ID | Section | Notes |
|---------|--------------|---------|-------|
| Activity Knob | `activity` | Effect | Main macro control |
| Time Knob | `time` | Effect | Subdivision/tempo |
| Repeats Knob | `repeats` | Effect | Duration/feedback |
| Shape Knob | `shape` | Modulation | Envelope contour |
| Mod Rate Knob | `modRate` | Modulation | Pitch mod speed |
| Mod Depth Knob | `modDepth` | Modulation | Pitch mod amount |
| Space Knob | `reverbSpace` | Reverb | Reverb wet level |
| Filter Cutoff Knob | `filterCutoff` | Filter | Low-pass cutoff (log skew 0.3) |
| Resonance Knob | `filterResonance` | Filter | Filter resonance |
| Mix Knob | `mix` | Output | Dry/wet balance |
| Volume Knob | `volume` | Output | Master volume |

---

## Selector/Button Specifications

| Element | Parameter ID | Type | Options |
|---------|--------------|------|---------|
| Algorithm Selector | `algorithm` | Dropdown | 11 algorithms |
| Variation Selector | `variation` | Segment (4) | A, B, C, D |
| Reverb Mode | `reverbMode` | Dropdown or Segment | Room, Dark, Hall, Ambient |
| Reverse Toggle | `reverse` | Toggle | On/Off |
| Hold Toggle | `hold` | Toggle | On/Off |
| Bypass Toggle | `bypass` | Toggle | On/Off |

---

## Hardware Signal Path (IMPORTANT)

The correct signal path order is:

```
INPUT → EFFECTS → MODULATION → REVERB → FILTER → OUTPUT
```

**NOT** Effects → Filter → Reverb (which we currently have wrong!)

---

## Implementation Status

| Parameter | Param ID | C++ Done | UI Done | Phase |
|-----------|----------|----------|---------|-------|
| Volume | `volume` | ✓ | ✓ | 1 |
| Mix | `mix` | ✓ | ✓ | 1 |
| Algorithm | `algorithm` | ✓ | ✓ | 1 |
| Variation | `variation` | ✓ | ✓ | 1 |
| Filter Cutoff | `filterCutoff` | ✓ | ✓ | 2 |
| Filter Resonance | `filterResonance` | ✓ | ✓ | 2 |
| Reverb Space | `reverbSpace` | ✓ | ✗ | 3 |
| Reverb Mode | `reverbMode` | ✓ | ✗ | 3 |
| Activity | `activity` | ✗ | ✗ | 11 |
| Time | `time` | ✗ | ✗ | 6 |
| Repeats | `repeats` | ✗ | ✗ | 6 |
| Shape | `shape` | ✗ | ✗ | Future |
| Mod Rate | `modRate` | ✗ | ✗ | Future |
| Mod Depth | `modDepth` | ✗ | ✗ | Future |
| Bypass | `bypass` | ✓ | ✗ | 1 |
| Reverse | `reverse` | ✗ | ✗ | Future |
| Hold | `hold` | ✗ | ✗ | Future |
| Loop Level | `loopLevel` | ✗ | ✗ | 6 |

---

## Color Scheme

```css
/* Backgrounds */
--bg-main:        #1a1a1a;
--bg-panel:       #252525;
--bg-control:     #333333;

/* Text */
--text-primary:   #ffffff;
--text-secondary: #888888;
--text-label:     #aaaaaa;

/* Section Accents */
--accent-effect:  #00ccff;  /* Cyan - Effect section */
--accent-mod:     #ff9900;  /* Orange - Modulation */
--accent-reverb:  #00ff88;  /* Green - Reverb */
--accent-filter:  #ff6600;  /* Red-Orange - Filter */
--accent-output:  #ffffff;  /* White - Output */
```

---

## Quick Reference - Parameter IDs (copy-paste)

```
volume
mix
algorithm
variation
activity
time
repeats
shape
modRate
modDepth
reverbSpace
reverbMode
filterCutoff
filterResonance
bypass
reverse
hold
loopLevel
```

---

## Changes from v1

1. **Added SPACE knob** as dedicated `reverbSpace` control (not shift function)
2. **Added Reverb Mode** selector as `reverbMode`
3. **Added Shape knob** as `shape`
4. **Added Pitch Modulation** section with `modRate` and `modDepth`
5. **Reorganized layout** into logical sections matching hardware signal flow
6. **Increased canvas size** to 900x650 for more controls
7. **Documented signal path** (Reverb before Filter!)

---

*Specification v2 - 2026-01-31*
