/**
 * Mock audio data generation utilities
 *
 * Generates realistic audio patterns for visualization elements in the designer.
 * Static mock data per CONTEXT.md - frozen snapshots, not animated.
 */

/**
 * Generate pink noise spectrum (-3dB/octave slope)
 * Used for spectrum analyzer mock data
 *
 * @param barCount Number of frequency bars to generate
 * @returns Array of magnitude values (0-1)
 */
export function generatePinkNoiseSpectrum(barCount: number): number[] {
  const spectrum = new Array(barCount)

  for (let i = 0; i < barCount; i++) {
    // Pink noise: -3dB per octave slope
    // Higher frequencies have lower amplitude
    const frequency = i / barCount // 0 to 1
    const pinkSlope = Math.pow(frequency + 0.1, -0.5) // -3dB/octave approximation

    // Add some random variation (±10%)
    const variation = 0.9 + Math.random() * 0.2

    // Normalize to 0-1 range, bias toward 0.6-0.8 for realistic levels
    spectrum[i] = Math.min(1, pinkSlope * 0.7 * variation)
  }

  return spectrum
}

/**
 * Generate realistic waveform data
 * Static snapshot of waveform with harmonics and natural variation
 *
 * @param sampleCount Number of samples to generate
 * @returns Array of amplitude values (-1 to 1)
 */
export function generateWaveformData(sampleCount: number): number[] {
  const waveform = new Array(sampleCount)

  for (let i = 0; i < sampleCount; i++) {
    const t = (i / sampleCount) * Math.PI * 4 // 4 cycles

    // Fundamental frequency
    let value = Math.sin(t)

    // Add harmonics for richer waveform
    value += Math.sin(t * 2) * 0.5  // 2nd harmonic
    value += Math.sin(t * 3) * 0.25 // 3rd harmonic
    value += Math.sin(t * 4) * 0.125 // 4th harmonic

    // Add some noise for natural variation
    value += (Math.random() - 0.5) * 0.05

    // Normalize to -1 to 1 range
    waveform[i] = value / 2
  }

  return waveform
}

/**
 * Generate single frozen spectrogram frame
 * 2D array representing frequency content over a time window
 *
 * @param width Number of time slices
 * @param fftSize FFT size (determines frequency bin count)
 * @returns 2D array [timeIndex][frequencyBin] with magnitude values (0-1)
 */
export function generateSpectrogramFrame(width: number, fftSize: number): number[][] {
  const frequencyBins = fftSize / 2 // Nyquist frequency
  const frame: number[][] = []

  for (let t = 0; t < width; t++) {
    const timeSlice: number[] = []

    for (let f = 0; f < frequencyBins; f++) {
      // Pink noise distribution
      const frequency = f / frequencyBins
      const pinkSlope = Math.pow(frequency + 0.1, -0.5)

      // Add time variation for realistic appearance
      const timeVariation = 0.8 + Math.random() * 0.4
      const frequencyVariation = 0.9 + Math.random() * 0.2

      // Normalize to 0-1 range
      const magnitude = Math.min(1, pinkSlope * 0.6 * timeVariation * frequencyVariation)
      timeSlice.push(magnitude)
    }

    frame.push(timeSlice)
  }

  return frame
}

/**
 * Generate mono signal for goniometer/vectorscope
 * Centered vertical line representing perfect L/R correlation
 *
 * @returns Array of {x, y} points representing L/R correlation
 */
export function generateMonoSignal(): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = []
  const pointCount = 100

  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount

    // Vertical line at x=0 (centered)
    // x varies slightly for natural appearance
    const x = (Math.random() - 0.5) * 0.02

    // y varies from -1 to 1
    const y = (t * 2) - 1

    points.push({ x, y })
  }

  return points
}

/**
 * Map magnitude (0-1) to color based on color map style
 * Used for spectrum analyzer and spectrogram visualization
 *
 * @param magnitude Value from 0 (quiet) to 1 (loud)
 * @param colorMap Color map style
 * @returns CSS color string
 */
export function magnitudeToColor(magnitude: number, colorMap: string): string {
  // Clamp magnitude to 0-1 range
  magnitude = Math.max(0, Math.min(1, magnitude))

  switch (colorMap) {
    case 'fire':
      // Black -> red -> orange -> yellow -> white
      if (magnitude < 0.25) {
        // Black to red
        const r = magnitude * 4 * 255
        return `rgb(${r}, 0, 0)`
      } else if (magnitude < 0.5) {
        // Red to orange
        const g = (magnitude - 0.25) * 4 * 128
        return `rgb(255, ${g}, 0)`
      } else if (magnitude < 0.75) {
        // Orange to yellow
        const g = 128 + (magnitude - 0.5) * 4 * 127
        return `rgb(255, ${g}, 0)`
      } else {
        // Yellow to white
        const b = (magnitude - 0.75) * 4 * 255
        return `rgb(255, 255, ${b})`
      }

    case 'cool':
      // Black -> blue -> cyan -> white
      if (magnitude < 0.33) {
        // Black to blue
        const b = magnitude * 3 * 255
        return `rgb(0, 0, ${b})`
      } else if (magnitude < 0.67) {
        // Blue to cyan
        const g = (magnitude - 0.33) * 3 * 255
        return `rgb(0, ${g}, 255)`
      } else {
        // Cyan to white
        const r = (magnitude - 0.67) * 3 * 255
        return `rgb(${r}, 255, 255)`
      }

    case 'grayscale':
      // Black to white
      const gray = magnitude * 255
      return `rgb(${gray}, ${gray}, ${gray})`

    case 'default':
    default:
      // Blue (240°) to red (0°) via HSL
      const hue = (1 - magnitude) * 240 // 240° to 0°
      const saturation = 100
      const lightness = 30 + magnitude * 40 // Darker = quieter
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }
}
