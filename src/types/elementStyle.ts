/**
 * Element Style type system for custom SVG element designs
 *
 * Extends the KnobStyle pattern to support all visual control categories:
 * - Rotary: knobs and rotary controls
 * - Linear: sliders and faders
 * - Arc: arc sliders with curved paths
 * - Button: buttons, switches, and toggles
 * - Meter: level meters and displays
 */

// Element categories (5 visual control categories)
export type ElementCategory = 'rotary' | 'linear' | 'arc' | 'button' | 'meter'

// Layer mappings per category - which SVG elements map to which functional roles

/**
 * Rotary control layers (knobs, rotary switches)
 * Same as KnobStyleLayers for backward compatibility
 */
export interface RotaryLayers {
  indicator?: string  // Element id/class that rotates with value (REQUIRED)
  track?: string      // Static background arc
  arc?: string        // Value fill arc (opacity animates)
  glow?: string       // Glow effect (intensity by value)
  shadow?: string     // Shadow effect
}

/**
 * Linear control layers (sliders, faders)
 */
export interface LinearLayers {
  thumb?: string      // Moving indicator/handle
  track?: string      // Background track
  fill?: string       // Value fill region
}

/**
 * Arc control layers (arc sliders with curved paths)
 */
export interface ArcLayers {
  thumb?: string      // Moving indicator on arc path
  track?: string      // Background arc
  fill?: string       // Value fill arc
  arc?: string        // Path definition element
}

/**
 * Button control layers (buttons, switches, toggles)
 */
export interface ButtonLayers {
  body?: string       // Main button body
  label?: string      // Text label
  icon?: string       // Icon element
  pressed?: string    // Pressed state layer
  normal?: string     // Normal state layer
}

/**
 * Meter control layers (level meters, VU meters)
 */
export interface MeterLayers {
  body?: string       // Meter background/container
  fill?: string       // Level fill region
  scale?: string      // Scale markings
  peak?: string       // Peak hold indicator
  segments?: string   // Segmented meter elements
}

/**
 * Per-instance color overrides (sparse - only store explicit overrides)
 * Generic to support any layer role from any category
 */
export interface ColorOverrides {
  [layerRole: string]: string
}

// Base interface for all element styles
interface BaseElementStyle {
  id: string              // crypto.randomUUID()
  name: string            // User-editable name
  svgContent: string      // Sanitized original SVG
  createdAt: number       // Date.now() timestamp
}

// Category-specific element style variants
interface RotaryElementStyle extends BaseElementStyle {
  category: 'rotary'
  layers: RotaryLayers
  minAngle: number        // Default -135
  maxAngle: number        // Default 135 (270° total range)
}

interface LinearElementStyle extends BaseElementStyle {
  category: 'linear'
  layers: LinearLayers
}

interface ArcElementStyle extends BaseElementStyle {
  category: 'arc'
  layers: ArcLayers
  minAngle: number        // Start angle for arc
  maxAngle: number        // End angle for arc
  arcRadius: number       // Radius of the arc path
}

interface ButtonElementStyle extends BaseElementStyle {
  category: 'button'
  layers: ButtonLayers
}

interface MeterElementStyle extends BaseElementStyle {
  category: 'meter'
  layers: MeterLayers
}

/**
 * ElementStyle discriminated union
 * Use category to narrow type in switch statements
 */
export type ElementStyle =
  | RotaryElementStyle
  | LinearElementStyle
  | ArcElementStyle
  | ButtonElementStyle
  | MeterElementStyle

/**
 * Map element types to categories
 * Used to determine which ElementStyle category applies to each element type
 */
export const ELEMENT_TYPE_TO_CATEGORY = {
  // Rotary controls
  knob: 'rotary',
  steppedknob: 'rotary',
  centerdetentknob: 'rotary',
  dotindicatorknob: 'rotary',

  // Linear controls
  slider: 'linear',
  rangeslider: 'linear',
  multislider: 'linear',
  bipolarslider: 'linear',
  crossfadeslider: 'linear',
  notchedslider: 'linear',

  // Arc controls
  arcslider: 'arc',

  // Button controls
  button: 'button',
  iconbutton: 'button',
  toggleswitch: 'button',
  powerbutton: 'button',
  rockerswitch: 'button',
  rotaryswitch: 'button',
  segmentbutton: 'button',

  // Meter controls
  meter: 'meter',
  vumeter: 'meter',
  ppmeter: 'meter',
  levelladder: 'meter',
  goniometer: 'meter',
  correlationmeter: 'meter',
  spectralanalyzer: 'meter',
  phasescope: 'meter',
  rgbmeter: 'meter',
} as const

/**
 * Get category for a given element type
 */
export function getCategoryForType(elementType: string): ElementCategory | undefined {
  const normalizedType = elementType.toLowerCase().replace(/\s+/g, '')
  return ELEMENT_TYPE_TO_CATEGORY[normalizedType as keyof typeof ELEMENT_TYPE_TO_CATEGORY] as ElementCategory | undefined
}
