/**
 * Element type system for VST3 WebView UI Designer
 * Discriminated unions for type-safe element configuration
 */

// ============================================================================
// Base Element Configuration
// ============================================================================

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

// ============================================================================
// Element-Specific Configurations
// ============================================================================

export interface KnobElementConfig extends BaseElementConfig {
  type: 'knob'

  // Dimensions
  diameter: number

  // Value
  value: number
  min: number
  max: number

  // Arc Geometry
  startAngle: number // Default -135 (degrees from top)
  endAngle: number // Default 135

  // Visual Style
  style: 'arc' | 'filled' | 'dot' | 'line'
  trackColor: string
  fillColor: string
  indicatorColor: string
  trackWidth: number
}

export interface SliderElementConfig extends BaseElementConfig {
  type: 'slider'

  // Orientation
  orientation: 'vertical' | 'horizontal'

  // Value
  value: number
  min: number
  max: number

  // Track
  trackColor: string
  trackFillColor: string

  // Thumb
  thumbColor: string
  thumbWidth: number
  thumbHeight: number
}

export interface ButtonElementConfig extends BaseElementConfig {
  type: 'button'

  // Behavior
  mode: 'momentary' | 'toggle'
  label: string
  pressed: boolean

  // Colors
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: number
}

export interface LabelElementConfig extends BaseElementConfig {
  type: 'label'

  // Text
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: number
  color: string
  textAlign: 'left' | 'center' | 'right'
}

export interface MeterElementConfig extends BaseElementConfig {
  type: 'meter'

  // Orientation
  orientation: 'vertical' | 'horizontal'

  // Value
  value: number
  min: number
  max: number

  // Colors (gradient stops)
  colorStops: Array<{
    position: number // 0-1
    color: string
  }>
  backgroundColor: string

  // Peak Hold
  showPeakHold: boolean
}

export interface ImageElementConfig extends BaseElementConfig {
  type: 'image'

  // Source
  src: string // base64 data URL or external URL

  // Fit
  fit: 'contain' | 'cover' | 'fill' | 'none'
}

export interface DropdownElementConfig extends BaseElementConfig {
  type: 'dropdown'

  // Options
  options: string[] // List of dropdown options

  // State
  selectedIndex: number

  // Style
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: number
}

export interface CheckboxElementConfig extends BaseElementConfig {
  type: 'checkbox'

  // State
  checked: boolean
  label: string

  // Layout
  labelPosition: 'left' | 'right'

  // Style
  checkColor: string
  borderColor: string
  backgroundColor: string
  textColor: string
}

export interface RadioGroupElementConfig extends BaseElementConfig {
  type: 'radiogroup'

  // Options
  options: string[] // List of radio options
  selectedIndex: number

  // Layout
  orientation: 'vertical' | 'horizontal'

  // Style
  radioColor: string
  borderColor: string
  backgroundColor: string
  textColor: string
  spacing: number
}

export interface ModulationMatrixElementConfig extends BaseElementConfig {
  type: 'modulationmatrix'

  // Matrix Configuration
  sources: string[] // Row labels (e.g., 'LFO 1', 'ENV 1', 'Velocity')
  destinations: string[] // Column labels (e.g., 'Pitch', 'Filter', 'Volume')

  // Cell Styling
  cellSize: number
  cellColor: string
  activeColor: string
  borderColor: string

  // Header Styling
  headerBackground: string
  headerColor: string
  headerFontSize: number

  // Design Preview (shows active connections for visualization)
  previewActiveConnections: Array<[number, number]> // [sourceIndex, destinationIndex] pairs
}

// ============================================================================
// Discriminated Union Type
// ============================================================================

export type ElementConfig =
  | KnobElementConfig
  | SliderElementConfig
  | ButtonElementConfig
  | LabelElementConfig
  | MeterElementConfig
  | ImageElementConfig
  | DropdownElementConfig
  | CheckboxElementConfig
  | RadioGroupElementConfig
  | ModulationMatrixElementConfig

// ============================================================================
// Type Guards
// ============================================================================

export function isKnob(element: ElementConfig): element is KnobElementConfig {
  return element.type === 'knob'
}

export function isSlider(element: ElementConfig): element is SliderElementConfig {
  return element.type === 'slider'
}

export function isButton(element: ElementConfig): element is ButtonElementConfig {
  return element.type === 'button'
}

export function isLabel(element: ElementConfig): element is LabelElementConfig {
  return element.type === 'label'
}

export function isMeter(element: ElementConfig): element is MeterElementConfig {
  return element.type === 'meter'
}

export function isImage(element: ElementConfig): element is ImageElementConfig {
  return element.type === 'image'
}

export function isDropdown(element: ElementConfig): element is DropdownElementConfig {
  return element.type === 'dropdown'
}

export function isCheckbox(element: ElementConfig): element is CheckboxElementConfig {
  return element.type === 'checkbox'
}

export function isRadioGroup(element: ElementConfig): element is RadioGroupElementConfig {
  return element.type === 'radiogroup'
}

export function isModulationMatrix(element: ElementConfig): element is ModulationMatrixElementConfig {
  return element.type === 'modulationmatrix'
}

// ============================================================================
// Factory Functions (with sensible defaults)
// ============================================================================

export function createKnob(overrides?: Partial<KnobElementConfig>): KnobElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'knob',
    name: 'Knob',
    x: 0,
    y: 0,
    width: 60,
    height: 60,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    diameter: 60,
    value: 0.5,
    min: 0,
    max: 1,
    startAngle: -135,
    endAngle: 135,
    style: 'arc',
    trackColor: '#374151',
    fillColor: '#3b82f6',
    indicatorColor: '#ffffff',
    trackWidth: 4,
    ...overrides,
  }
}

export function createSlider(overrides?: Partial<SliderElementConfig>): SliderElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'slider',
    name: 'Slider',
    x: 0,
    y: 0,
    width: 40,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    orientation: 'vertical',
    value: 0.5,
    min: 0,
    max: 1,
    trackColor: '#374151',
    trackFillColor: '#3b82f6',
    thumbColor: '#ffffff',
    thumbWidth: 20,
    thumbHeight: 20,
    ...overrides,
  }
}

export function createButton(overrides?: Partial<ButtonElementConfig>): ButtonElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'button',
    name: 'Button',
    x: 0,
    y: 0,
    width: 80,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    mode: 'momentary',
    label: 'Button',
    pressed: false,
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    borderColor: '#2563eb',
    borderRadius: 4,
    ...overrides,
  }
}

export function createLabel(overrides?: Partial<LabelElementConfig>): LabelElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'label',
    name: 'Label',
    x: 0,
    y: 0,
    width: 100,
    height: 30,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    text: 'Label',
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 400,
    color: '#ffffff',
    textAlign: 'left',
    ...overrides,
  }
}

export function createMeter(overrides?: Partial<MeterElementConfig>): MeterElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'meter',
    name: 'Meter',
    x: 0,
    y: 0,
    width: 30,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    orientation: 'vertical',
    value: 0.75,
    min: 0,
    max: 1,
    colorStops: [
      { position: 0, color: '#10b981' },
      { position: 0.7, color: '#eab308' },
      { position: 0.9, color: '#ef4444' },
    ],
    backgroundColor: '#1f2937',
    showPeakHold: true,
    ...overrides,
  }
}

export function createImage(overrides?: Partial<ImageElementConfig>): ImageElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'image',
    name: 'Image',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    src: '',
    fit: 'contain',
    ...overrides,
  }
}

export function createDropdown(overrides?: Partial<DropdownElementConfig>): DropdownElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'dropdown',
    name: 'Dropdown',
    x: 0,
    y: 0,
    width: 150,
    height: 32,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    options: ['Option 1', 'Option 2', 'Option 3'],
    selectedIndex: 0,
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    borderColor: '#374151',
    borderRadius: 4,
    ...overrides,
  }
}

export function createCheckbox(overrides?: Partial<CheckboxElementConfig>): CheckboxElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'checkbox',
    name: 'Checkbox',
    x: 0,
    y: 0,
    width: 100,
    height: 24,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    checked: false,
    label: 'Checkbox',
    labelPosition: 'right',
    checkColor: '#3b82f6',
    borderColor: '#374151',
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    ...overrides,
  }
}

export function createRadioGroup(overrides?: Partial<RadioGroupElementConfig>): RadioGroupElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'radiogroup',
    name: 'RadioGroup',
    x: 0,
    y: 0,
    width: 150,
    height: 80,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    options: ['Option 1', 'Option 2', 'Option 3'],
    selectedIndex: 0,
    orientation: 'vertical',
    radioColor: '#3b82f6',
    borderColor: '#374151',
    backgroundColor: 'transparent',
    textColor: '#ffffff',
    spacing: 8,
    ...overrides,
  }
}

export function createModulationMatrix(overrides?: Partial<ModulationMatrixElementConfig>): ModulationMatrixElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'modulationmatrix',
    name: 'ModMatrix',
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    sources: ['LFO 1', 'LFO 2', 'ENV 1', 'Velocity'],
    destinations: ['Pitch', 'Filter', 'Volume', 'Pan'],
    cellSize: 24,
    cellColor: '#374151',
    activeColor: '#3b82f6',
    borderColor: '#1f2937',
    headerBackground: '#1f2937',
    headerColor: '#ffffff',
    headerFontSize: 11,
    previewActiveConnections: [[0, 1], [2, 0]], // LFO 1 -> Filter, ENV 1 -> Pitch
    ...overrides,
  }
}
