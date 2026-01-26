/**
 * LED Color Palettes
 *
 * Preset color palettes for LED indicators with on/off states.
 * Off states are visibly dim versions of lit colors (user can see what color it will be when on).
 */

export interface LEDColorPalette {
  name: string
  onColor: string
  offColor: string
  greenColor?: string
  redColor?: string
  yellowColor?: string
}

/**
 * Preset LED color palettes
 */
export const LED_COLOR_PALETTES: Record<string, LEDColorPalette> = {
  classic: {
    name: 'Classic',
    onColor: '#00ff00',      // Bright green
    offColor: '#003300',     // Dim green (visible off state)
    greenColor: '#00ff00',
    redColor: '#ff0000',
    yellowColor: '#ffff00',
  },
  modern: {
    name: 'Modern',
    onColor: '#0088ff',      // Blue
    offColor: '#001a33',     // Dim blue
    greenColor: '#00ff88',   // Cyan-green
    redColor: '#ff0044',     // Pink-red
    yellowColor: '#ffaa00',  // Amber
  },
  neon: {
    name: 'Neon',
    onColor: '#ff00ff',      // Magenta
    offColor: '#330033',     // Dim magenta
    greenColor: '#00ffaa',   // Cyan
    redColor: '#ff0066',     // Hot pink
    yellowColor: '#ffff00',  // Pure yellow
  },
}

/**
 * Derive a dim off color from a lit color (30% brightness)
 */
export function getDefaultOffColor(onColor: string): string {
  // Parse hex color
  const hex = onColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Reduce to 30% brightness
  const dimR = Math.round(r * 0.3)
  const dimG = Math.round(g * 0.3)
  const dimB = Math.round(b * 0.3)

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(dimR)}${toHex(dimG)}${toHex(dimB)}`
}

/**
 * Get a palette by name, defaulting to classic if not found
 */
export function getPaletteByName(name: string): LEDColorPalette {
  return LED_COLOR_PALETTES[name] ?? LED_COLOR_PALETTES.classic!
}
