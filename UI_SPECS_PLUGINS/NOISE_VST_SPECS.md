# Noise VST3 - Parameter Reference

Total parameters: 40

================================================================================
## Parameter List
================================================================================

### User Parameters (always visible)

  ID          | Type  | Range       | Default | Description
  ------------|-------|-------------|---------|---------------------------
  movement    | float | 0.0 - 1.0   | 0.5     | Engine-specific movement
  randomize   | bool  | false/true  | false   | Momentary trigger

### Developer Parameters (dev mode only)

#### Global Controls

  ID               | Type   | Options/Range                                      | Default
  -----------------|--------|----------------------------------------------------|---------
  dev_sourceAMode  | choice | Modal, Karplus, Granular, Wavetable, Chaos         | Modal (0)
  dev_sourceBMode  | choice | Modal, Karplus, Granular, Wavetable, Chaos         | Karplus (1)
  dev_mixMode      | choice | Ring Mod, Min/Max, Bitwise XOR, AND, OR, Terrain   | Ring Mod (0)
  dev_gainA        | float  | 0.0 - 1.0                                          | 0.5
  dev_gainB        | float  | 0.0 - 1.0                                          | 0.5
  dev_masterGain   | float  | 0.0 - 1.0                                          | 0.6
  dev_modDepth     | float  | 0.0 - 1.0                                          | 0.3
  dev_wetDry       | float  | 0.0 - 1.0                                          | 0.5

#### Modal Resonator Engine - Source A

  ID                  | Range         | Default | Skew | Description
  --------------------|---------------|---------|------|---------------------------
  dev_modalA_freq     | 50 - 800 Hz   | 150     | 0.3  | Fundamental frequency
  dev_modalA_decay    | 0.1 - 10.0    | 1.0     | 0.5  | Q multiplier (ring time)
  dev_modalA_spread   | 0.5 - 2.0     | 1.0     | —    | Inharmonicity multiplier

#### Modal Resonator Engine - Source B

  ID                  | Range         | Default | Skew | Description
  --------------------|---------------|---------|------|---------------------------
  dev_modalB_freq     | 50 - 800 Hz   | 150     | 0.3  | Fundamental frequency
  dev_modalB_decay    | 0.1 - 10.0    | 1.0     | 0.5  | Q multiplier (ring time)
  dev_modalB_spread   | 0.5 - 2.0     | 1.0     | —    | Inharmonicity multiplier

#### Karplus-Strong Engine - Source A

  ID                   | Range           | Default | Skew | Description
  ---------------------|-----------------|---------|------|---------------------------
  dev_karplusA_freq    | 30 - 150 Hz     | 80      | 0.5  | String pitch
  dev_karplusA_decay   | 0.9 - 0.9999    | 0.998   | —    | Loss factor (ring time)
  dev_karplusA_excite  | 0.05 - 2.0 sec  | 0.5     | 0.5  | Time between plucks
  dev_karplusA_damp    | 0.0 - 1.0       | 0.0     | —    | High-freq damping

#### Karplus-Strong Engine - Source B

  ID                   | Range           | Default | Skew | Description
  ---------------------|-----------------|---------|------|---------------------------
  dev_karplusB_freq    | 30 - 150 Hz     | 80      | 0.5  | String pitch
  dev_karplusB_decay   | 0.9 - 0.9999    | 0.998   | —    | Loss factor (ring time)
  dev_karplusB_excite  | 0.05 - 2.0 sec  | 0.5     | 0.5  | Time between plucks
  dev_karplusB_damp    | 0.0 - 1.0       | 0.0     | —    | High-freq damping

#### Granular Engine - Source A

  ID                      | Range          | Default | Skew | Description
  ------------------------|----------------|---------|------|---------------------------
  dev_granularA_density   | 1 - 200 /sec   | 50      | 0.5  | Grains per second
  dev_granularA_duration  | 0.001 - 1.0 s  | 0.03    | 0.3  | Grain length
  dev_granularA_pitch     | 0 - 100 cents  | 50      | —    | Pitch variation
  dev_granularA_position  | 0.0 - 1.0      | 0.2     | —    | Buffer position variation

#### Granular Engine - Source B

  ID                      | Range          | Default | Skew | Description
  ------------------------|----------------|---------|------|---------------------------
  dev_granularB_density   | 1 - 200 /sec   | 50      | 0.5  | Grains per second
  dev_granularB_duration  | 0.001 - 1.0 s  | 0.03    | 0.3  | Grain length
  dev_granularB_pitch     | 0 - 100 cents  | 50      | —    | Pitch variation
  dev_granularB_position  | 0.0 - 1.0      | 0.2     | —    | Buffer position variation

#### Wavetable Engine - Source A

  ID                     | Range      | Default | Skew | Description
  -----------------------|------------|---------|------|---------------------------
  dev_wavetableA_color   | 0.0 - 4.0  | 2.0     | —    | Noise color (W/P/Br/Bl/V)
  dev_wavetableA_morph   | 0.0 - 15.0 | 8.0     | —    | Bandwidth variation
  dev_wavetableA_rate    | 0.1 - 10.0 | 0.5     | 0.5  | Evolution speed

#### Wavetable Engine - Source B

  ID                     | Range      | Default | Skew | Description
  -----------------------|------------|---------|------|---------------------------
  dev_wavetableB_color   | 0.0 - 4.0  | 2.0     | —    | Noise color (W/P/Br/Bl/V)
  dev_wavetableB_morph   | 0.0 - 15.0 | 8.0     | —    | Bandwidth variation
  dev_wavetableB_rate    | 0.1 - 10.0 | 0.5     | 0.5  | Evolution speed

#### Chaotic Engine - Source A

  ID                  | Range       | Default | Skew | Description
  --------------------|-------------|---------|------|---------------------------
  dev_chaoticA_speed  | 0.01 - 10.0 | 1.0     | 0.5  | Chaos evolution rate

#### Chaotic Engine - Source B

  ID                  | Range       | Default | Skew | Description
  --------------------|-------------|---------|------|---------------------------
  dev_chaoticB_speed  | 0.01 - 10.0 | 1.0     | 0.5  | Chaos evolution rate


================================================================================
## Signal Flow Schematic
================================================================================

```
                            USER CONTROLS
    +============================================================+
    |                                                            |
    |     [Movement]              [Randomize]                    |
    |         |                       |                          |
    |         |                       +-- triggers randomization |
    |         |                           of all dev_* params    |
    +=========|==================================================+
              |
              v
                          NOISE GENERATION
    +============================================================+
    |                                                            |
    |   +------------------+          +------------------+       |
    |   |    SOURCE A      |          |    SOURCE B      |       |
    |   | (dev_sourceAMode)|          | (dev_sourceBMode)|       |
    |   |                  |          |                  |       |
    |   |  - Modal         |          |  - Modal         |       |
    |   |  - Karplus       |<--+----->|  - Karplus       |       |
    |   |  - Granular      |   |      |  - Granular      |       |
    |   |  - Wavetable     |   |      |  - Wavetable     |       |
    |   |  - Chaos         |   |      |  - Chaos         |       |
    |   +--------+---------+   |      +--------+---------+       |
    |            |             |               |                 |
    |            v          Movement           v                 |
    |     [x dev_gainA]                 [x dev_gainB]            |
    |            |                             |                 |
    +============|=============================|=================+
                 |                             |
                 v                             v
                        INTERACTION MATRIX
    +============================================================+
    |                       (dev_mixMode)                        |
    |                                                            |
    |   Source A ---+---> Ring Mod (A x B)                       |
    |               |---> Min/Max (soft-knee)                    |
    |               |---> Bitwise XOR (mantissa)    ---> WET     |
    |   Source B ---+---> Bitwise AND (mantissa)                 |
    |               |---> Bitwise OR (mantissa)                  |
    |               +---> Wave Terrain (2D lookup)               |
    |                                                            |
    |   DRY = (A + B) / 2                                        |
    |                                                            |
    |   Output = DRY x (1 - dev_wetDry) + WET x dev_wetDry       |
    |                                                            |
    +============================+===============================+
                                 |
                                 v
                          MODULATION (fBm)
    +============================================================+
    |                                                            |
    |   dev_modDepth ---> Simplex Noise ---> fBm (5 octaves)     |
    |                           |                                |
    |                           +---> Modulates: dev_gainA       |
    |                           +---> Modulates: dev_gainB       |
    |                           +---> Modulates: dev_wetDry      |
    |                                                            |
    +============================+===============================+
                                 |
                                 v
                           OUTPUT STAGE
    +============================================================+
    |                                                            |
    |   Signal ---> [x dev_masterGain] ---> Limiter ---> OUT     |
    |                                       (-0.1 dB)            |
    |                                                            |
    +============================================================+
```


================================================================================
## Noise Engine Modes
================================================================================

  Index | Mode      | Movement Effect         | Character
  ------|-----------|-------------------------|----------------------------------
  0     | Modal     | Frequency (50-800 Hz)   | Metallic, bell-like textures
  1     | Karplus   | Pitch (30-150 Hz)       | String/tube resonance, bass
  2     | Granular  | Density & duration      | Textured, evolving clouds
  3     | Wavetable | Color sweep (W->V)      | Smooth spectral morphing
  4     | Chaos     | Chaos speed             | Organic, unpredictable

### Modal Resonator Bank
- 8 bandpass filters with inharmonic ratios
- Movement controls fundamental frequency (50-800 Hz)

### Karplus-Strong
- Delay line with averaging filter
- Movement controls pitch (30-150 Hz)

### Granular
- 64-voice grain pool
- Movement controls density (10-100 grains/sec) and duration

### Wavetable Spectral
- Pre-computed colored noise tables (white->pink->brown->blue->violet)
- Movement sweeps through color spectrum

### Chaotic (Lorenz)
- Lorenz attractor differential equations
- Movement controls chaos speed


================================================================================
## Interaction Matrix Modes
================================================================================

  Index | Mode         | Algorithm              | Character
  ------|--------------|------------------------|--------------------------------
  0     | Ring Mod     | A x B                  | Metallic, frequency-doubled
  1     | Min/Max      | Soft-knee comparison   | Waveshaping, dynamic
  2     | Bitwise XOR  | Mantissa XOR           | Harsh, digital bit-crushing
  3     | Bitwise AND  | Mantissa AND           | Gating effect, quieter
  4     | Bitwise OR   | Mantissa OR            | Saturation-like
  5     | Wave Terrain | 2D table lookup        | Complex, evolving timbres


================================================================================
## Randomize Ranges
================================================================================

When Randomize button is pressed, dev params are set to these ranges:

  Parameter             | Range
  ----------------------|-------------
  dev_sourceAMode       | 0-4 (any mode)
  dev_sourceBMode       | 0-4 (any mode)
  dev_mixMode           | 0-5 (any mode)
  dev_gainA             | 0.3 - 0.8
  dev_gainB             | 0.3 - 0.8
  dev_masterGain        | 0.4 - 0.7
  dev_modDepth          | 0.0 - 0.5
  dev_wetDry            | 0.3 - 0.7
  All engine params     | Full range

Wave terrain seed and modulation seeds are also randomized on each press.


================================================================================
## Skew Factor Reference
================================================================================

Skew values < 1.0 give more resolution at lower values (logarithmic feel).
Skew values > 1.0 give more resolution at higher values.
Skew = 1.0 (or —) is linear.

  Skew | Effect
  -----|--------------------------------------------------
  0.3  | Strong low-end bias (frequencies)
  0.5  | Moderate low-end bias (decay, rate, density)
  1.0  | Linear (most parameters)


================================================================================
## UI Modes
================================================================================

### User Mode (default)
- Shows only: Movement knob + Randomize button
- Clean, minimal interface
- All complexity hidden

### Developer Mode (compile-time toggle)
- Shows all 40 parameters listed above
- For debugging and sound design exploration
- Not accessible in release builds


================================================================================
## Technical Notes
================================================================================

### Crossfade System
- Mode switching uses 11ms equal-power crossfade
- Prevents clicks when changing source modes
- Dual-engine rendering during transition

### Real-time Safety
- All parameters use SmoothedValue (20ms ramp)
- No allocations in processBlock
- Atomic parameter reads via cached pointers

### Output Protection
- Hard limiter at -0.1 dB (0.9886) prevents clipping
- DC blocker after ring modulation
- Bitwise operations sanitized (NaN/infinity check)
