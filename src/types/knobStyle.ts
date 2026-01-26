/**
 * Knob Style type system for custom SVG knob designs
 */

// Layer mappings - which SVG elements map to which functional roles
export interface KnobStyleLayers {
  indicator?: string  // Element id/class that rotates with value (REQUIRED)
  track?: string      // Static background arc
  arc?: string        // Value fill arc (opacity animates)
  glow?: string       // Glow effect (intensity by value)
  shadow?: string     // Shadow effect
}

// Per-instance color overrides (sparse - only store explicit overrides)
export interface ColorOverrides {
  indicator?: string
  track?: string
  arc?: string
  glow?: string
  shadow?: string
}

// Main KnobStyle interface
export interface KnobStyle {
  id: string              // crypto.randomUUID()
  name: string            // User-editable name
  svgContent: string      // Sanitized original SVG

  // Layer Mappings
  layers: KnobStyleLayers

  // Rotation Configuration (degrees from top, clockwise positive)
  minAngle: number        // Default -135
  maxAngle: number        // Default 135 (270° total range)

  createdAt: number       // Date.now() timestamp
}
