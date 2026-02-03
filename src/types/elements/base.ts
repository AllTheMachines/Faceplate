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

  // Container hierarchy (optional)
  parentId?: string // ID of parent container (if this element is a child)

  // Layer assignment (optional)
  layerId?: string // Layer this element belongs to (defaults to 'default' if not set)

  // Pro feature gating (optional)
  isPro?: boolean // true = Pro element, undefined/false = Free element
}

/**
 * Interface for container elements that can have children
 */
export interface ContainerWithChildren {
  children?: string[] // IDs of child elements
}
