/**
 * Layer types and constants for the VST3 WebView UI Designer
 * Layers enable user-created organization of elements (Photoshop-style layer groups)
 */

// ============================================================================
// Color Types
// ============================================================================

/**
 * Available layer colors - Photoshop-style color tags
 */
export type LayerColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray'

/**
 * Maps LayerColor to Tailwind hex values for rendering
 */
export const LAYER_COLOR_MAP: Record<LayerColor, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  gray: '#6b7280',
}

/**
 * Ordered list of layer colors for dropdowns and color pickers
 */
export const LAYER_COLORS: LayerColor[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'gray',
]

// ============================================================================
// Layer Interface
// ============================================================================

/**
 * Layer represents a user-created organizational group for elements
 */
export interface Layer {
  /** Unique identifier (UUID, 'default' for default layer) */
  id: string
  /** Display name */
  name: string
  /** Color tag for visual identification */
  color: LayerColor
  /** Whether elements in this layer are visible */
  visible: boolean
  /** Whether elements in this layer are locked (prevent move/resize) */
  locked: boolean
  /** Explicit z-order (0 = bottom, higher = on top) */
  order: number
  /** Creation timestamp */
  createdAt: number
}

// ============================================================================
// Default Layer
// ============================================================================

/**
 * Pre-configured default layer for unassigned elements
 * This layer cannot be deleted and is always at order 0 (bottom)
 */
export const DEFAULT_LAYER: Layer = {
  id: 'default',
  name: 'Default',
  color: 'gray',
  visible: true,
  locked: false,
  order: 0,
  createdAt: 0, // Epoch 0 indicates system-created
}
