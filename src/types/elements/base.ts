/**
 * Base element configuration
 * Shared by all element types in the VST3 WebView UI Designer
 */

export interface BaseElementConfig {
  // Identity
  id: string // UUID
  name: string // User-friendly name (becomes ID in export)

  // Position & Size
  x: number // Canvas coordinates
  y: number
  width: number
  height: number
  rotation: number // Degrees
  zIndex: number

  // State
  locked: boolean
  visible: boolean

  // JUCE Binding (optional)
  parameterId?: string // For JUCE parameter binding
}
