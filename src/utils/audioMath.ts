/**
 * Audio math utilities
 * Frequency/dB conversions and biquad filter calculations
 * Based on Audio EQ Cookbook: https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html
 */

// ============================================================================
// Frequency Scale Conversions (Logarithmic)
// ============================================================================

/**
 * Convert frequency in Hz to X position on canvas using logarithmic scale
 * Industry standard: equal visual space per octave
 */
export function frequencyToX(
  frequency: number,
  width: number,
  minFreq: number = 20,
  maxFreq: number = 20000
): number {
  const minLog = Math.log10(minFreq)
  const maxLog = Math.log10(maxFreq)
  const freqLog = Math.log10(frequency)

  // Map to 0-1 range, then to pixel width
  const normalized = (freqLog - minLog) / (maxLog - minLog)
  return normalized * width
}

/**
 * Convert X position on canvas to frequency in Hz using logarithmic scale
 */
export function xToFrequency(
  x: number,
  width: number,
  minFreq: number = 20,
  maxFreq: number = 20000
): number {
  const normalized = x / width
  const minLog = Math.log10(minFreq)
  const maxLog = Math.log10(maxFreq)
  const freqLog = minLog + normalized * (maxLog - minLog)
  return Math.pow(10, freqLog)
}

// ============================================================================
// dB Scale Conversions
// ============================================================================

/**
 * Convert dB value to Y position on canvas
 * Note: Y coordinate is inverted (0 = top, positive dB at top)
 */
export function dbToY(
  db: number,
  height: number,
  minDb: number,
  maxDb: number
): number {
  const normalized = (db - minDb) / (maxDb - minDb)
  return height - normalized * height // Invert Y axis
}

/**
 * Convert Y position on canvas to dB value
 */
export function yToDb(
  y: number,
  height: number,
  minDb: number,
  maxDb: number
): number {
  const normalized = (height - y) / height // Invert Y axis
  return minDb + normalized * (maxDb - minDb)
}

// ============================================================================
// Biquad Filter Frequency Response (Audio EQ Cookbook)
// ============================================================================

/**
 * Calculate biquad filter frequency response for parametric peak/notch filter
 * Returns magnitude response in dB
 *
 * Based on Audio EQ Cookbook by Robert Bristow-Johnson
 * https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html
 */
export function calculateBiquadResponse(
  frequency: number,
  centerFreq: number,
  gain: number, // in dB
  Q: number,
  sampleRate: number = 44100
): number {
  const A = Math.pow(10, gain / 40) // Convert dB to linear (peak gain)
  const omega = (2 * Math.PI * frequency) / sampleRate
  const centerOmega = (2 * Math.PI * centerFreq) / sampleRate

  const sinOmega = Math.sin(centerOmega)
  const cosOmega = Math.cos(centerOmega)
  const alpha = sinOmega / (2 * Q)

  // Biquad coefficients (peaking EQ filter)
  const b0 = 1 + alpha * A
  const b1 = -2 * cosOmega
  const b2 = 1 - alpha * A
  const a0 = 1 + alpha / A
  const a1 = -2 * cosOmega
  const a2 = 1 - alpha / A

  // Normalize coefficients by a0
  const b0n = b0 / a0
  const b1n = b1 / a0
  const b2n = b2 / a0
  const a1n = a1 / a0
  const a2n = a2 / a0

  // Calculate frequency response magnitude at target frequency
  const phi = Math.sin(omega / 2)
  const phi2 = phi * phi

  const numerator =
    b0n * b0n +
    b1n * b1n +
    b2n * b2n +
    2 * (b0n * b1n + b1n * b2n) * Math.cos(omega) +
    2 * b0n * b2n * (2 * phi2 - 1)

  const denominator =
    1 +
    a1n * a1n +
    a2n * a2n +
    2 * (a1n + a1n * a2n) * Math.cos(omega) +
    2 * a2n * (2 * phi2 - 1)

  const magnitude = Math.sqrt(numerator / denominator)

  // Convert to dB
  return 20 * Math.log10(magnitude)
}

/**
 * Calculate filter frequency response for various filter types
 * Returns magnitude response in dB
 *
 * Based on Audio EQ Cookbook formulas
 */
export function calculateFilterResponse(
  frequency: number,
  filterType: 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'lowshelf' | 'highshelf' | 'peak',
  cutoffFreq: number,
  Q: number,
  gain: number, // dB, for shelf/peak filters
  sampleRate: number = 44100
): number {
  const omega = (2 * Math.PI * frequency) / sampleRate
  const cutoffOmega = (2 * Math.PI * cutoffFreq) / sampleRate

  const sinOmega = Math.sin(cutoffOmega)
  const cosOmega = Math.cos(cutoffOmega)
  const alpha = sinOmega / (2 * Q)

  let b0: number, b1: number, b2: number
  let a0: number, a1: number, a2: number

  switch (filterType) {
    case 'lowpass':
      b0 = (1 - cosOmega) / 2
      b1 = 1 - cosOmega
      b2 = (1 - cosOmega) / 2
      a0 = 1 + alpha
      a1 = -2 * cosOmega
      a2 = 1 - alpha
      break

    case 'highpass':
      b0 = (1 + cosOmega) / 2
      b1 = -(1 + cosOmega)
      b2 = (1 + cosOmega) / 2
      a0 = 1 + alpha
      a1 = -2 * cosOmega
      a2 = 1 - alpha
      break

    case 'bandpass':
      b0 = alpha
      b1 = 0
      b2 = -alpha
      a0 = 1 + alpha
      a1 = -2 * cosOmega
      a2 = 1 - alpha
      break

    case 'notch':
      b0 = 1
      b1 = -2 * cosOmega
      b2 = 1
      a0 = 1 + alpha
      a1 = -2 * cosOmega
      a2 = 1 - alpha
      break

    case 'lowshelf': {
      const A = Math.pow(10, gain / 40)
      const sqrtA = Math.sqrt(A)
      b0 = A * ((A + 1) - (A - 1) * cosOmega + 2 * sqrtA * alpha)
      b1 = 2 * A * ((A - 1) - (A + 1) * cosOmega)
      b2 = A * ((A + 1) - (A - 1) * cosOmega - 2 * sqrtA * alpha)
      a0 = (A + 1) + (A - 1) * cosOmega + 2 * sqrtA * alpha
      a1 = -2 * ((A - 1) + (A + 1) * cosOmega)
      a2 = (A + 1) + (A - 1) * cosOmega - 2 * sqrtA * alpha
      break
    }

    case 'highshelf': {
      const A = Math.pow(10, gain / 40)
      const sqrtA = Math.sqrt(A)
      b0 = A * ((A + 1) + (A - 1) * cosOmega + 2 * sqrtA * alpha)
      b1 = -2 * A * ((A - 1) + (A + 1) * cosOmega)
      b2 = A * ((A + 1) + (A - 1) * cosOmega - 2 * sqrtA * alpha)
      a0 = (A + 1) - (A - 1) * cosOmega + 2 * sqrtA * alpha
      a1 = 2 * ((A - 1) - (A + 1) * cosOmega)
      a2 = (A + 1) - (A - 1) * cosOmega - 2 * sqrtA * alpha
      break
    }

    case 'peak': {
      const A = Math.pow(10, gain / 40)
      b0 = 1 + alpha * A
      b1 = -2 * cosOmega
      b2 = 1 - alpha * A
      a0 = 1 + alpha / A
      a1 = -2 * cosOmega
      a2 = 1 - alpha / A
      break
    }

    default:
      return 0
  }

  // Normalize coefficients by a0
  const b0n = b0 / a0
  const b1n = b1 / a0
  const b2n = b2 / a0
  const a1n = a1 / a0
  const a2n = a2 / a0

  // Calculate frequency response magnitude at target frequency
  const phi = Math.sin(omega / 2)
  const phi2 = phi * phi

  const numerator =
    b0n * b0n +
    b1n * b1n +
    b2n * b2n +
    2 * (b0n * b1n + b1n * b2n) * Math.cos(omega) +
    2 * b0n * b2n * (2 * phi2 - 1)

  const denominator =
    1 +
    a1n * a1n +
    a2n * a2n +
    2 * (a1n + a1n * a2n) * Math.cos(omega) +
    2 * a2n * (2 * phi2 - 1)

  const magnitude = Math.sqrt(numerator / denominator)

  // Convert to dB
  return 20 * Math.log10(magnitude)
}

// ============================================================================
// Compressor Transfer Function
// ============================================================================

/**
 * Calculate compressor output level given input level
 * Returns output in dB
 *
 * Based on standard compressor transfer function with soft knee
 */
export function calculateCompressorOutput(
  inputDb: number,
  threshold: number,
  ratio: number,
  knee: number
): number {
  if (knee === 0) {
    // Hard knee
    if (inputDb <= threshold) {
      return inputDb // No compression below threshold
    } else {
      return threshold + (inputDb - threshold) / ratio
    }
  } else {
    // Soft knee (quadratic transition)
    const kneeStart = threshold - knee / 2
    const kneeEnd = threshold + knee / 2

    if (inputDb <= kneeStart) {
      // Below knee region - no compression
      return inputDb
    } else if (inputDb >= kneeEnd) {
      // Above knee region - full compression
      return threshold + (inputDb - threshold) / ratio
    } else {
      // Inside knee region - quadratic interpolation
      const t = (inputDb - kneeStart) / knee // 0 to 1 through knee
      const uncompressed = inputDb
      const compressed = threshold + (inputDb - threshold) / ratio
      return uncompressed + t * t * (compressed - uncompressed)
    }
  }
}
