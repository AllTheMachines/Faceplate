/**
 * SVG layer types for Design Mode
 */

export type SVGLayerType =
  | 'indicator'  // Rotates with value (knobs)
  | 'track'      // Static background
  | 'thumb'      // Moves with value (sliders)
  | 'fill'       // Grows/shrinks with value
  | 'glow'       // Reactive highlight
  | 'background' // Static backdrop
  | 'unknown'    // Unassigned layer

export interface SVGLayer {
  id: string
  name: string
  svgContent: string
  suggestedType: SVGLayerType
  assignedType?: SVGLayerType
  bounds?: { x: number; y: number; width: number; height: number }
}

export interface SVGDesignResult {
  elementType: 'knob' | 'slider' | 'button' | 'custom'
  layers: Record<SVGLayerType, string | undefined> // layerType -> svgContent
  originalSvg: string
  width: number
  height: number
}
