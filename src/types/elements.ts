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

  // Label Display
  showLabel: boolean
  labelText: string
  labelPosition: 'top' | 'bottom' | 'left' | 'right'
  labelFontSize: number
  labelColor: string

  // Value Display
  showValue: boolean
  valuePosition: 'top' | 'bottom' | 'left' | 'right'
  valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'
  valueSuffix: string  // For custom format
  valueDecimalPlaces: number
  valueFontSize: number
  valueColor: string
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

  // Label Display
  showLabel: boolean
  labelText: string
  labelPosition: 'top' | 'bottom' | 'left' | 'right'
  labelFontSize: number
  labelColor: string

  // Value Display
  showValue: boolean
  valuePosition: 'top' | 'bottom' | 'left' | 'right'
  valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'
  valueSuffix: string  // For custom format
  valueDecimalPlaces: number
  valueFontSize: number
  valueColor: string
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


export interface RangeSliderElementConfig extends BaseElementConfig {
  type: 'rangeslider'

  // Orientation
  orientation: 'vertical' | 'horizontal'

  // Value Range
  min: number // Absolute minimum bound
  max: number // Absolute maximum bound
  minValue: number // Current minimum selection
  maxValue: number // Current maximum selection

  // Track
  trackColor: string
  fillColor: string // Fill between min and max thumbs

  // Thumbs
  thumbColor: string
  thumbWidth: number
  thumbHeight: number
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

export interface RectangleElementConfig extends BaseElementConfig {
  type: 'rectangle'

  // Fill
  fillColor: string
  fillOpacity: number // 0-1

  // Border
  borderWidth: number
  borderColor: string
  borderStyle: 'solid' | 'dashed' | 'dotted'
  borderRadius: number
}

export interface PanelElementConfig extends BaseElementConfig {
  type: 'panel'
  backgroundColor: string
  borderRadius: number
  borderWidth: number
  borderColor: string
  padding: number
}

export interface FrameElementConfig extends BaseElementConfig {
  type: 'frame'
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge'
  borderWidth: number
  borderColor: string
  borderRadius: number
  padding: number
}

export interface GroupBoxElementConfig extends BaseElementConfig {
  type: 'groupbox'
  headerText: string
  headerFontSize: number
  headerColor: string
  headerBackground: string  // Background behind header text
  borderWidth: number
  borderColor: string
  borderRadius: number
  padding: number
}

export interface CollapsibleContainerElementConfig extends BaseElementConfig {
  type: 'collapsible'

  // Header
  headerText: string
  headerFontSize: number
  headerColor: string
  headerBackground: string
  headerHeight: number

  // Content
  contentBackground: string
  maxContentHeight: number
  scrollBehavior: 'auto' | 'hidden' | 'scroll'

  // State
  collapsed: boolean

  // Border
  borderWidth: number
  borderColor: string
  borderRadius: number
}

export interface LineElementConfig extends BaseElementConfig {
  type: 'line'

  // Stroke
  strokeWidth: number
  strokeColor: string
  strokeStyle: 'solid' | 'dashed' | 'dotted'
  // Note: orientation determined by width/height aspect ratio
  // horizontal: width > height, vertical: height > width

}
export interface DbDisplayElementConfig extends BaseElementConfig {
  type: 'dbdisplay'

  // Value
  value: number // Actual dB value (can be negative)
  minDb: number // Display range minimum (e.g., -60)
  maxDb: number // Display range maximum (e.g., 0)

  // Display
  decimalPlaces: number
  showUnit: boolean // Show "dB" suffix

  // Appearance
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  padding: number
}

export interface FrequencyDisplayElementConfig extends BaseElementConfig {
  type: 'frequencydisplay'

  // Value (always stored as Hz)
  value: number // Frequency in Hz

  // Display
  decimalPlaces: number
  autoSwitchKHz: boolean // Auto-switch to kHz at >= 1000Hz
  showUnit: boolean

  // Appearance
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  padding: number
}

export interface GainReductionMeterElementConfig extends BaseElementConfig {
  type: 'gainreductionmeter'

  // Orientation (typically vertical for GR meters)
  orientation: 'vertical' | 'horizontal'

  // Value (0-1 normalized, but displayed inverted - grows from top/right)
  value: number
  maxReduction: number // Maximum dB reduction to display (e.g., -24)

  // Colors
  meterColor: string
  backgroundColor: string

  // Display
  showValue: boolean
  fontSize: number
  textColor: string
}

export interface TextFieldElementConfig extends BaseElementConfig {
  type: 'textfield'

  // Content
  value: string
  placeholder: string
  maxLength: number // 0 = unlimited

  // Text
  fontSize: number
  fontFamily: string
  textColor: string
  textAlign: 'left' | 'center' | 'right'

  // Appearance
  backgroundColor: string
  padding: number

  // Border
  borderColor: string
  borderWidth: number
  borderRadius: number
}

export interface WaveformElementConfig extends BaseElementConfig {
  type: 'waveform'

  // Visual
  backgroundColor: string
  waveformColor: string
  borderColor: string
  borderWidth: number

  // Grid (optional visual guide)
  showGrid: boolean
  gridColor: string

  // JUCE integration hints
  zoomLevel: number  // 1 = default, 2 = 2x zoom, etc.
}

export interface OscilloscopeElementConfig extends BaseElementConfig {
  type: 'oscilloscope'

  // Visual
  backgroundColor: string
  traceColor: string
  borderColor: string
  borderWidth: number

  // Grid
  showGrid: boolean
  gridColor: string
  gridDivisions: number  // Number of horizontal/vertical divisions

  // Scope settings (hints for JUCE)
  timeDiv: number  // Time per division in ms
  amplitudeScale: number  // 0-1 normalized
  triggerLevel: number  // 0-1 normalized
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
  | RangeSliderElementConfig
  | ModulationMatrixElementConfig
  | RectangleElementConfig
  | LineElementConfig
  | DbDisplayElementConfig
  | FrequencyDisplayElementConfig
  | GainReductionMeterElementConfig
  | TextFieldElementConfig
  | WaveformElementConfig
  | OscilloscopeElementConfig
  | PanelElementConfig
  | FrameElementConfig
  | GroupBoxElementConfig
  | CollapsibleContainerElementConfig

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

export function isRangeSlider(element: ElementConfig): element is RangeSliderElementConfig {
  return element.type === 'rangeslider'
}

export function isModulationMatrix(element: ElementConfig): element is ModulationMatrixElementConfig {
  return element.type === 'modulationmatrix'
}

export function isRectangle(element: ElementConfig): element is RectangleElementConfig {
  return element.type === 'rectangle'
}

export function isLine(element: ElementConfig): element is LineElementConfig {
  return element.type === 'line'
}

export function isDbDisplay(element: ElementConfig): element is DbDisplayElementConfig {
  return element.type === 'dbdisplay'
}

export function isFrequencyDisplay(element: ElementConfig): element is FrequencyDisplayElementConfig {
  return element.type === 'frequencydisplay'
}

export function isGainReductionMeter(element: ElementConfig): element is GainReductionMeterElementConfig {
  return element.type === 'gainreductionmeter'
}

export function isPanel(element: ElementConfig): element is PanelElementConfig {
  return element.type === 'panel'
}

export function isFrame(element: ElementConfig): element is FrameElementConfig {
  return element.type === 'frame'
}

export function isGroupBox(element: ElementConfig): element is GroupBoxElementConfig {
  return element.type === 'groupbox'
}

export function isCollapsible(element: ElementConfig): element is CollapsibleContainerElementConfig {
  return element.type === 'collapsible'
}

export function isTextField(element: ElementConfig): element is TextFieldElementConfig {
  return element.type === 'textfield'
}

export function isWaveform(element: ElementConfig): element is WaveformElementConfig {
  return element.type === 'waveform'
}

export function isOscilloscope(element: ElementConfig): element is OscilloscopeElementConfig {
  return element.type === 'oscilloscope'
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
    showLabel: false,
    labelText: 'Knob',
    labelPosition: 'bottom',
    labelFontSize: 12,
    labelColor: '#ffffff',
    showValue: false,
    valuePosition: 'top',
    valueFormat: 'numeric',
    valueSuffix: '',
    valueDecimalPlaces: 2,
    valueFontSize: 12,
    valueColor: '#a0a0a0',
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
    showLabel: false,
    labelText: 'Slider',
    labelPosition: 'bottom',
    labelFontSize: 12,
    labelColor: '#ffffff',
    showValue: false,
    valuePosition: 'top',
    valueFormat: 'numeric',
    valueSuffix: '',
    valueDecimalPlaces: 2,
    valueFontSize: 12,
    valueColor: '#a0a0a0',
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

export function createRangeSlider(overrides?: Partial<RangeSliderElementConfig>): RangeSliderElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'rangeslider',
    name: 'RangeSlider',
    x: 0,
    y: 0,
    width: 200,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    orientation: 'horizontal',
    min: 0,
    max: 1,
    minValue: 0.25,
    maxValue: 0.75,
    trackColor: '#374151',
    fillColor: '#3b82f6',
    thumbColor: '#ffffff',
    thumbWidth: 20,
    thumbHeight: 20,
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

export function createRectangle(overrides?: Partial<RectangleElementConfig>): RectangleElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'rectangle',
    name: 'Rectangle',
    x: 0,
    y: 0,
    width: 150,
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    fillColor: '#374151',
    fillOpacity: 1,
    borderWidth: 2,
    borderColor: '#1f2937',
    borderStyle: 'solid',
    borderRadius: 4,
    ...overrides,
  }
}

export function createLine(overrides?: Partial<LineElementConfig>): LineElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'line',
    name: 'Line',
    x: 0,
    y: 0,
    width: 200,
    height: 2,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    strokeWidth: 2,
    strokeColor: '#374151',
    strokeStyle: 'solid',
    ...overrides,
  }
}

export function createPanel(overrides?: Partial<PanelElementConfig>): PanelElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'panel',
    name: 'Panel',
    x: 0,
    y: 0,
    width: 200,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    borderWidth: 0,
    borderColor: '#374151',
    padding: 12,
    ...overrides,
  }
}

export function createFrame(overrides?: Partial<FrameElementConfig>): FrameElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'frame',
    name: 'Frame',
    x: 0,
    y: 0,
    width: 200,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 4,
    padding: 12,
    ...overrides,
  }
}

export function createGroupBox(overrides?: Partial<GroupBoxElementConfig>): GroupBoxElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'groupbox',
    name: 'GroupBox',
    x: 0,
    y: 0,
    width: 200,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    headerText: 'Group',
    headerFontSize: 12,
    headerColor: '#ffffff',
    headerBackground: '#111827',
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 4,
    padding: 12,
    ...overrides,
  }
}

export function createCollapsible(overrides?: Partial<CollapsibleContainerElementConfig>): CollapsibleContainerElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'collapsible',
    name: 'Collapsible',
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    headerText: 'Collapsible',
    headerFontSize: 12,
    headerColor: '#ffffff',
    headerBackground: '#1f2937',
    headerHeight: 32,
    contentBackground: 'transparent',
    maxContentHeight: 150,
    scrollBehavior: 'auto',
    collapsed: false,
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 4,
    ...overrides,
  }
}

export function createDbDisplay(overrides?: Partial<DbDisplayElementConfig>): DbDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'dbdisplay',
    name: 'dB Display',
    x: 0,
    y: 0,
    width: 80,
    height: 30,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: -12,
    minDb: -60,
    maxDb: 0,
    decimalPlaces: 1,
    showUnit: true,
    fontSize: 16,
    fontFamily: 'Roboto Mono, monospace',
    textColor: '#10b981',
    backgroundColor: '#1f2937',
    padding: 8,
    ...overrides,
  }
}

export function createFrequencyDisplay(overrides?: Partial<FrequencyDisplayElementConfig>): FrequencyDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'frequencydisplay',
    name: 'Frequency Display',
    x: 0,
    y: 0,
    width: 100,
    height: 30,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 1000,
    decimalPlaces: 1,
    autoSwitchKHz: true,
    showUnit: true,
    fontSize: 16,
    fontFamily: 'Roboto Mono, monospace',
    textColor: '#3b82f6',
    backgroundColor: '#1f2937',
    padding: 8,
    ...overrides,
  }
}

export function createGainReductionMeter(overrides?: Partial<GainReductionMeterElementConfig>): GainReductionMeterElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'gainreductionmeter',
    name: 'GR Meter',
    x: 0,
    y: 0,
    width: 30,
    height: 120,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    orientation: 'vertical',
    value: 0.25,
    maxReduction: -24,
    meterColor: '#f59e0b',
    backgroundColor: '#1f2937',
    showValue: true,
    fontSize: 10,
    textColor: '#9ca3af',
    ...overrides,
  }
}

export function createTextField(overrides?: Partial<TextFieldElementConfig>): TextFieldElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'textfield',
    name: 'TextField',
    x: 0,
    y: 0,
    width: 150,
    height: 32,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: '',
    placeholder: 'Enter text...',
    maxLength: 0,
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    textColor: '#ffffff',
    textAlign: 'left',
    backgroundColor: '#1f2937',
    padding: 8,
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 4,
    ...overrides,
  }
}

export function createWaveform(overrides?: Partial<WaveformElementConfig>): WaveformElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'waveform',
    name: 'Waveform',
    x: 0,
    y: 0,
    width: 200,
    height: 80,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    backgroundColor: '#1f2937',
    waveformColor: '#3b82f6',
    borderColor: '#374151',
    borderWidth: 1,
    showGrid: false,
    gridColor: '#374151',
    zoomLevel: 1,
    ...overrides,
  }
}

export function createOscilloscope(overrides?: Partial<OscilloscopeElementConfig>): OscilloscopeElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'oscilloscope',
    name: 'Oscilloscope',
    x: 0,
    y: 0,
    width: 200,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    backgroundColor: '#0f172a',
    traceColor: '#22c55e',
    borderColor: '#374151',
    borderWidth: 1,
    showGrid: true,
    gridColor: '#1e3a5f',
    gridDivisions: 8,
    timeDiv: 10,
    amplitudeScale: 1,
    triggerLevel: 0.5,
    ...overrides,
  }
}
