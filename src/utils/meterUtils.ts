/**
 * Professional Meter Utilities
 *
 * Utilities for dB calculations, color zones, segment calculations,
 * and tick mark generation for professional audio meters.
 */

// Color zone type
export interface ColorZone {
  startDb: number
  endDb: number
  color: string
}

// Default color zones (green < -18, yellow -18 to -6, red >= -6)
export const defaultColorZones: ColorZone[] = [
  { startDb: -Infinity, endDb: -18, color: '#10b981' }, // green
  { startDb: -18, endDb: -6, color: '#eab308' },        // yellow
  { startDb: -6, endDb: Infinity, color: '#ef4444' },   // red
]

/**
 * Convert dB value to normalized (0-1) range
 */
export function dbToNormalized(db: number, minDb: number, maxDb: number): number {
  return Math.max(0, Math.min(1, (db - minDb) / (maxDb - minDb)))
}

/**
 * Convert normalized (0-1) value to dB
 */
export function normalizedToDb(normalized: number, minDb: number, maxDb: number): number {
  return minDb + normalized * (maxDb - minDb)
}

/**
 * Get segment color based on dB value and color zones
 */
export function getSegmentColor(
  segmentIndex: number,
  segmentCount: number,
  minDb: number,
  maxDb: number,
  colorZones: ColorZone[]
): string {
  const segmentDb = normalizedToDb(segmentIndex / segmentCount, minDb, maxDb)
  const zone = colorZones.find(z => segmentDb >= z.startDb && segmentDb < z.endDb)
  return zone?.color || '#333333'
}

/**
 * Calculate how many segments should be lit based on normalized value
 */
export function calculateLitSegments(value: number, segmentCount: number): number {
  return Math.round(value * segmentCount)
}

/**
 * Generate tick positions for scale marks
 */
export function generateTickPositions(
  minDb: number,
  maxDb: number,
  majorInterval: number = 6,
  minorInterval: number = 3
): { major: number[]; minor: number[] } {
  const major: number[] = []
  const minor: number[] = []

  for (let db = minDb; db <= maxDb; db += minorInterval) {
    const isMajor = (db - minDb) % majorInterval === 0 || db === minDb || db === maxDb
    if (isMajor) {
      major.push(db)
    } else {
      minor.push(db)
    }
  }

  return { major, minor }
}
