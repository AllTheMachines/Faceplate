// Shared constants for property components

// Full font weights (9 weights) - for display properties
export const FONT_WEIGHTS_FULL = [
  { value: '100', label: 'Thin' },
  { value: '200', label: 'Extra Light' },
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
] as const

// Compact font weights (5 weights) - for slider properties
export const FONT_WEIGHTS_COMPACT = [
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi-Bold (600)' },
  { value: '700', label: 'Bold (700)' },
] as const

// Position options for labels and values
export const POSITION_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
] as const

// Value format options for sliders
export const VALUE_FORMAT_OPTIONS = [
  { value: 'numeric', label: 'Numeric' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'db', label: 'dB' },
  { value: 'hz', label: 'Hz' },
  { value: 'custom', label: 'Custom' },
] as const

// Font style options for displays with 7-segment support
export const FONT_STYLE_OPTIONS = [
  { value: '7segment', label: '7-Segment' },
  { value: 'modern', label: 'Modern' },
] as const

// Bezel style options for display elements
export const BEZEL_STYLE_OPTIONS = [
  { value: 'inset', label: 'Inset' },
  { value: 'flat', label: 'Flat' },
  { value: 'none', label: 'None' },
] as const

// Common select styling class
export const SELECT_CLASSNAME =
  'w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm'

// Checkbox styling class
export const CHECKBOX_CLASSNAME =
  'rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500'

// Label styling class
export const LABEL_CLASSNAME = 'text-sm text-gray-300'

// Input styling class
export const INPUT_CLASSNAME =
  'w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm'
