/**
 * Display element types
 * Read-only displays: Label, Meter, dB Display, Frequency Display, Gain Reduction Meter,
 * Preset Browser, Waveform, Oscilloscope, Modulation Matrix
 */

import { BaseElementConfig } from './base'

// ============================================================================
// Display Element Configurations
// ============================================================================

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

export interface PresetBrowserElementConfig extends BaseElementConfig {
  type: 'presetbrowser'

  // Sample presets for placeholder display
  // Format: "Folder/Preset Name" or just "Preset Name"
  presets: string[]

  // Currently selected preset index
  selectedIndex: number

  // Display
  showFolders: boolean  // Show folder hierarchy
  showSearch: boolean  // Show search bar placeholder

  // Styling
  backgroundColor: string
  itemColor: string
  selectedColor: string
  textColor: string
  selectedTextColor: string
  fontSize: number
  itemHeight: number
  borderColor: string
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

export interface NumericDisplayElementConfig extends BaseElementConfig {
  type: 'numericdisplay'

  // Value
  value: number // 0-1 normalized
  min: number
  max: number
  decimalPlaces: number
  unit?: string // Optional unit label

  // Appearance
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  padding: number
  fontStyle: '7segment' | 'modern'
  bezelStyle: 'inset' | 'flat' | 'none'
  showGhostSegments: boolean // Only for 7-segment style
  unitDisplay: 'suffix' | 'label' // suffix inline, label separate
  borderColor: string
}

export interface TimeDisplayElementConfig extends BaseElementConfig {
  type: 'timedisplay'

  // Value (normalized 0-1, mapped to ms range)
  value: number
  min: number // Time range in ms
  max: number // Time range in ms
  decimalPlaces: number

  // Time format settings
  bpm: number // For bars calculation
  timeSignature: number // Beats per bar

  // Appearance
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  padding: number
  fontStyle: '7segment' | 'modern'
  bezelStyle: 'inset' | 'flat' | 'none'
  showGhostSegments: boolean
  borderColor: string
}

export interface PercentageDisplayElementConfig extends BaseElementConfig {
  type: 'percentagedisplay'

  // Value (0-1, displayed as 0-100%)
  value: number
  decimalPlaces: number

  // Appearance
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  padding: number
  fontStyle: '7segment' | 'modern'
  bezelStyle: 'inset' | 'flat' | 'none'
  showGhostSegments: boolean
  borderColor: string
}

export interface RatioDisplayElementConfig extends BaseElementConfig {
  type: 'ratiodisplay'

  // Value
  value: number // 0-1 normalized
  min: number // Ratio range (e.g., 1)
  max: number // Ratio range (e.g., 20)
  decimalPlaces: number
  infinityThreshold: number // Default 20, shows ∞:1 at this ratio

  // Appearance
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  padding: number
  fontStyle: '7segment' | 'modern'
  bezelStyle: 'inset' | 'flat' | 'none'
  showGhostSegments: boolean
  borderColor: string
}

export interface NoteDisplayElementConfig extends BaseElementConfig {
  type: 'notedisplay'

  // Value
  value: number // 0-1 normalized
  min: number // MIDI range (e.g., 0)
  max: number // MIDI range (e.g., 127)
  preferSharps: boolean // A# vs Bb
  showMidiNumber: boolean // Show MIDI number below note name

  // Appearance
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  padding: number
  fontStyle: '7segment' | 'modern'
  bezelStyle: 'inset' | 'flat' | 'none'
  borderColor: string
}

export interface BpmDisplayElementConfig extends BaseElementConfig {
  type: 'bpmdisplay'

  // Value
  value: number // 0-1 normalized
  min: number // BPM range (e.g., 20)
  max: number // BPM range (e.g., 300)
  decimalPlaces: number
  showLabel: boolean // Show "BPM" suffix

  // Appearance
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  padding: number
  fontStyle: '7segment' | 'modern'
  bezelStyle: 'inset' | 'flat' | 'none'
  showGhostSegments: boolean
  borderColor: string
}

export interface EditableDisplayElementConfig extends BaseElementConfig {
  type: 'editabledisplay'

  // Value
  value: number // 0-1 normalized
  min: number
  max: number
  format: 'numeric' | 'percentage' | 'db' // What format to display/edit
  decimalPlaces: number

  // Appearance
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  borderColor: string
  padding: number
}

export interface MultiValueDisplayElementConfig extends BaseElementConfig {
  type: 'multivaluedisplay'

  // Values
  values: Array<{
    value: number
    min: number
    max: number
    format: string
    label?: string
    decimalPlaces?: number
  }>
  layout: 'vertical' | 'horizontal'

  // Appearance
  fontSize: number
  fontFamily: string
  textColor: string
  backgroundColor: string
  borderColor: string
  padding: number
}

// ============================================================================
// Professional Meter Configurations
// ============================================================================

// Base meter properties shared by all professional meters
interface BaseProfessionalMeterConfig extends BaseElementConfig {
  // Value (normalized 0-1, maps to dB range)
  value: number

  // dB range (varies per meter type)
  minDb: number
  maxDb: number

  // Visual
  orientation: 'vertical' | 'horizontal'
  segmentCount: number
  segmentGap: number // Default 1px per CONTEXT.md

  // Scale
  scalePosition: 'outside' | 'inside' | 'none'
  showMajorTicks: boolean
  showMinorTicks: boolean
  showNumericReadout: boolean

  // Color zones
  colorZones: Array<{
    startDb: number
    endDb: number
    color: string
  }>

  // Peak hold
  showPeakHold: boolean
  peakHoldStyle: 'line' | 'bar'
  peakHoldDuration: number // ms, 1000-3000
}

// RMS Meter - 300ms averaging window, -60 to 0 dB range
export interface RMSMeterMonoElementConfig extends BaseProfessionalMeterConfig {
  type: 'rmsmetermo'
  ballisticsType: 'RMS' // 300ms averaging
}

export interface RMSMeterStereoElementConfig extends BaseProfessionalMeterConfig {
  type: 'rmsmeterstereo'
  ballisticsType: 'RMS'
  valueL: number // Left channel (0-1)
  valueR: number // Right channel (0-1)
  showChannelLabels: boolean
}

// VU Meter - ANSI C16.5-1942 standard, -20 to +3 dB range
export interface VUMeterMonoElementConfig extends BaseProfessionalMeterConfig {
  type: 'vumetermono'
  ballisticsType: 'VU' // 300ms rise/fall @ 99%
}

export interface VUMeterStereoElementConfig extends BaseProfessionalMeterConfig {
  type: 'vumeterstereo'
  ballisticsType: 'VU'
  valueL: number
  valueR: number
  showChannelLabels: boolean
}

// PPM Type I (DIN) - IEC 60268-10, -50 to +5 dB, 10ms attack, 1.5s release
export interface PPMType1MonoElementConfig extends BaseProfessionalMeterConfig {
  type: 'ppmtype1mono'
  ballisticsType: 'PPM_TYPE_I' // 10ms attack @ 90%, 20dB/1.5s release
}

export interface PPMType1StereoElementConfig extends BaseProfessionalMeterConfig {
  type: 'ppmtype1stereo'
  ballisticsType: 'PPM_TYPE_I'
  valueL: number
  valueR: number
  showChannelLabels: boolean
}

// PPM Type II (BBC/EBU) - IEC 60268-10, -50 to +5 dB, 10ms attack, 2.8s release
export interface PPMType2MonoElementConfig extends BaseProfessionalMeterConfig {
  type: 'ppmtype2mono'
  ballisticsType: 'PPM_TYPE_II' // 10ms attack @ 80%, 24dB/2.8s release
}

export interface PPMType2StereoElementConfig extends BaseProfessionalMeterConfig {
  type: 'ppmtype2stereo'
  ballisticsType: 'PPM_TYPE_II'
  valueL: number
  valueR: number
  showChannelLabels: boolean
}

// ============================================================================
// LED Indicator Configurations
// ============================================================================

export interface SingleLEDElementConfig extends BaseElementConfig {
  type: 'singleled'

  // State
  state: 'on' | 'off'

  // Colors
  onColor: string
  offColor: string

  // Appearance
  shape: 'round' | 'square'
  cornerRadius: number // Only for square shape, 0-20px
  glowEnabled: boolean
  glowRadius: number // Default: size * 0.3
  glowIntensity: number // Default: glowRadius / 2
  colorPalette: 'classic' | 'modern' | 'neon' | 'custom'
}

export interface BiColorLEDElementConfig extends BaseElementConfig {
  type: 'bicolorled'

  // State
  state: 'green' | 'red'

  // Colors
  greenColor: string
  redColor: string
  offColor: string // Dim when off (shown briefly during state transitions)

  // Appearance
  shape: 'round' | 'square'
  cornerRadius: number
  glowEnabled: boolean
  glowRadius: number
  glowIntensity: number
  colorPalette: 'classic' | 'modern' | 'neon' | 'custom'
}

export interface TriColorLEDElementConfig extends BaseElementConfig {
  type: 'tricolorled'

  // State
  state: 'off' | 'yellow' | 'red'

  // Colors
  offColor: string
  yellowColor: string
  redColor: string

  // Appearance
  shape: 'round' | 'square'
  cornerRadius: number
  glowEnabled: boolean
  glowRadius: number
  glowIntensity: number
  colorPalette: 'classic' | 'modern' | 'neon' | 'custom'
}

export interface LEDArrayElementConfig extends BaseElementConfig {
  type: 'ledarray'

  // Value
  value: number // 0-1, determines how many LEDs lit

  // Configuration
  segmentCount: number // 8-24
  orientation: 'horizontal' | 'vertical'
  spacing: number // Gap between LEDs

  // Colors
  onColor: string
  offColor: string

  // Appearance
  shape: 'round' | 'square'
  cornerRadius: number
  glowEnabled: boolean
  glowRadius: number
  glowIntensity: number
  colorPalette: 'classic' | 'modern' | 'neon' | 'custom'
}

export interface LEDRingElementConfig extends BaseElementConfig {
  type: 'ledring'

  // Value
  value: number // 0-1, determines arc length lit

  // Configuration
  segmentCount: number // 12-36
  diameter: number // Computed from width/height
  thickness: number // LED segment thickness
  startAngle: number // Degrees, default -135
  endAngle: number // Degrees, default 135

  // Colors
  onColor: string
  offColor: string

  // Appearance
  glowEnabled: boolean
  glowRadius: number
  colorPalette: 'classic' | 'modern' | 'neon' | 'custom'
}

export interface LEDMatrixElementConfig extends BaseElementConfig {
  type: 'ledmatrix'

  // Configuration
  rows: number // Preset: 4, 8, 16 or custom 2-32
  columns: number // Preset: 4, 8, 16 or custom 2-32
  states: boolean[][] // 2D array of on/off states
  spacing: number // Gap between LEDs

  // Colors
  onColor: string
  offColor: string

  // Appearance
  shape: 'round' | 'square'
  cornerRadius: number
  glowEnabled: boolean
  glowRadius: number
  glowIntensity: number
  colorPalette: 'classic' | 'modern' | 'neon' | 'custom'
}

// ============================================================================
// Display Element Union
// ============================================================================

export type DisplayElement =
  | LabelElementConfig
  | MeterElementConfig
  | DbDisplayElementConfig
  | FrequencyDisplayElementConfig
  | GainReductionMeterElementConfig
  | PresetBrowserElementConfig
  | WaveformElementConfig
  | OscilloscopeElementConfig
  | ModulationMatrixElementConfig
  | SingleLEDElementConfig
  | BiColorLEDElementConfig
  | TriColorLEDElementConfig
  | LEDArrayElementConfig
  | LEDRingElementConfig
  | LEDMatrixElementConfig
  | NumericDisplayElementConfig
  | TimeDisplayElementConfig
  | PercentageDisplayElementConfig
  | RatioDisplayElementConfig
  | NoteDisplayElementConfig
  | BpmDisplayElementConfig
  | EditableDisplayElementConfig
  | MultiValueDisplayElementConfig
  | RMSMeterMonoElementConfig
  | RMSMeterStereoElementConfig
  | VUMeterMonoElementConfig
  | VUMeterStereoElementConfig
  | PPMType1MonoElementConfig
  | PPMType1StereoElementConfig
  | PPMType2MonoElementConfig
  | PPMType2StereoElementConfig

// ============================================================================
// Type Guards
// ============================================================================

export function isLabel(element: { type: string }): element is LabelElementConfig {
  return element.type === 'label'
}

export function isMeter(element: { type: string }): element is MeterElementConfig {
  return element.type === 'meter'
}

export function isDbDisplay(element: { type: string }): element is DbDisplayElementConfig {
  return element.type === 'dbdisplay'
}

export function isFrequencyDisplay(element: { type: string }): element is FrequencyDisplayElementConfig {
  return element.type === 'frequencydisplay'
}

export function isGainReductionMeter(element: { type: string }): element is GainReductionMeterElementConfig {
  return element.type === 'gainreductionmeter'
}

export function isPresetBrowser(element: { type: string }): element is PresetBrowserElementConfig {
  return element.type === 'presetbrowser'
}

export function isWaveform(element: { type: string }): element is WaveformElementConfig {
  return element.type === 'waveform'
}

export function isOscilloscope(element: { type: string }): element is OscilloscopeElementConfig {
  return element.type === 'oscilloscope'
}

export function isModulationMatrix(element: { type: string }): element is ModulationMatrixElementConfig {
  return element.type === 'modulationmatrix'
}

export function isNumericDisplay(element: { type: string }): element is NumericDisplayElementConfig {
  return element.type === 'numericdisplay'
}

export function isTimeDisplay(element: { type: string }): element is TimeDisplayElementConfig {
  return element.type === 'timedisplay'
}

export function isPercentageDisplay(element: { type: string }): element is PercentageDisplayElementConfig {
  return element.type === 'percentagedisplay'
}

export function isRatioDisplay(element: { type: string }): element is RatioDisplayElementConfig {
  return element.type === 'ratiodisplay'
}

export function isNoteDisplay(element: { type: string }): element is NoteDisplayElementConfig {
  return element.type === 'notedisplay'
}

export function isBpmDisplay(element: { type: string }): element is BpmDisplayElementConfig {
  return element.type === 'bpmdisplay'
}

export function isEditableDisplay(element: { type: string }): element is EditableDisplayElementConfig {
  return element.type === 'editabledisplay'
}

export function isMultiValueDisplay(element: { type: string }): element is MultiValueDisplayElementConfig {
  return element.type === 'multivaluedisplay'
}

export function isSingleLED(element: { type: string }): element is SingleLEDElementConfig {
  return element.type === 'singleled'
}

export function isBiColorLED(element: { type: string }): element is BiColorLEDElementConfig {
  return element.type === 'bicolorled'
}

export function isTriColorLED(element: { type: string }): element is TriColorLEDElementConfig {
  return element.type === 'tricolorled'
}

export function isLEDArray(element: { type: string }): element is LEDArrayElementConfig {
  return element.type === 'ledarray'
}

export function isLEDRing(element: { type: string }): element is LEDRingElementConfig {
  return element.type === 'ledring'
}

export function isLEDMatrix(element: { type: string }): element is LEDMatrixElementConfig {
  return element.type === 'ledmatrix'
}

export function isRMSMeterMono(element: { type: string }): element is RMSMeterMonoElementConfig {
  return element.type === 'rmsmetermo'
}

export function isRMSMeterStereo(element: { type: string }): element is RMSMeterStereoElementConfig {
  return element.type === 'rmsmeterstereo'
}

export function isVUMeterMono(element: { type: string }): element is VUMeterMonoElementConfig {
  return element.type === 'vumetermono'
}

export function isVUMeterStereo(element: { type: string }): element is VUMeterStereoElementConfig {
  return element.type === 'vumeterstereo'
}

export function isPPMType1Mono(element: { type: string }): element is PPMType1MonoElementConfig {
  return element.type === 'ppmtype1mono'
}

export function isPPMType1Stereo(element: { type: string }): element is PPMType1StereoElementConfig {
  return element.type === 'ppmtype1stereo'
}

export function isPPMType2Mono(element: { type: string }): element is PPMType2MonoElementConfig {
  return element.type === 'ppmtype2mono'
}

export function isPPMType2Stereo(element: { type: string }): element is PPMType2StereoElementConfig {
  return element.type === 'ppmtype2stereo'
}

// ============================================================================
// Factory Functions
// ============================================================================

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
    textColor: '#949494',
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

export function createPresetBrowser(overrides?: Partial<PresetBrowserElementConfig>): PresetBrowserElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'presetbrowser',
    name: 'Preset Browser',
    x: 0,
    y: 0,
    width: 200,
    height: 250,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    presets: [
      'Factory/Init',
      'Factory/Bass',
      'Factory/Lead',
      'Factory/Pad',
      'User/My Preset 1',
      'User/My Preset 2',
    ],
    selectedIndex: 0,
    showFolders: true,
    showSearch: true,
    backgroundColor: '#1f2937',
    itemColor: 'transparent',
    selectedColor: '#949494',
    textColor: '#e5e7eb',
    selectedTextColor: '#ffffff',
    fontSize: 13,
    itemHeight: 28,
    borderColor: '#374151',
    borderRadius: 0,
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
    waveformColor: '#949494',
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
    activeColor: '#949494',
    borderColor: '#1f2937',
    headerBackground: '#1f2937',
    headerColor: '#ffffff',
    headerFontSize: 11,
    previewActiveConnections: [[0, 1], [2, 0]], // LFO 1 -> Filter, ENV 1 -> Pitch
    ...overrides,
  }
}

export function createSingleLED(overrides?: Partial<SingleLEDElementConfig>): SingleLEDElementConfig {
  const defaultSize = 20
  return {
    id: crypto.randomUUID(),
    type: 'singleled',
    name: 'Single LED',
    x: 0,
    y: 0,
    width: defaultSize,
    height: defaultSize,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    state: 'on',
    onColor: '#00ff00',
    offColor: '#003300',
    shape: 'round',
    cornerRadius: 4,
    glowEnabled: true,
    glowRadius: defaultSize * 0.3,
    glowIntensity: defaultSize * 0.15,
    colorPalette: 'classic',
    ...overrides,
  }
}

export function createBiColorLED(overrides?: Partial<BiColorLEDElementConfig>): BiColorLEDElementConfig {
  const defaultSize = 20
  return {
    id: crypto.randomUUID(),
    type: 'bicolorled',
    name: 'Bi-Color LED',
    x: 0,
    y: 0,
    width: defaultSize,
    height: defaultSize,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    state: 'green',
    greenColor: '#00ff00',
    redColor: '#ff0000',
    offColor: '#003300',
    shape: 'round',
    cornerRadius: 4,
    glowEnabled: true,
    glowRadius: defaultSize * 0.3,
    glowIntensity: defaultSize * 0.15,
    colorPalette: 'classic',
    ...overrides,
  }
}

export function createTriColorLED(overrides?: Partial<TriColorLEDElementConfig>): TriColorLEDElementConfig {
  const defaultSize = 20
  return {
    id: crypto.randomUUID(),
    type: 'tricolorled',
    name: 'Tri-Color LED',
    x: 0,
    y: 0,
    width: defaultSize,
    height: defaultSize,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    state: 'off',
    offColor: '#003300',
    yellowColor: '#ffff00',
    redColor: '#ff0000',
    shape: 'round',
    cornerRadius: 4,
    glowEnabled: true,
    glowRadius: defaultSize * 0.3,
    glowIntensity: defaultSize * 0.15,
    colorPalette: 'classic',
    ...overrides,
  }
}

export function createLEDArray(overrides?: Partial<LEDArrayElementConfig>): LEDArrayElementConfig {
  const segmentSize = 12
  const segmentCount = 12
  const spacing = 2
  return {
    id: crypto.randomUUID(),
    type: 'ledarray',
    name: 'LED Array',
    x: 0,
    y: 0,
    width: segmentCount * segmentSize + (segmentCount - 1) * spacing,
    height: segmentSize,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.7,
    segmentCount,
    orientation: 'horizontal',
    spacing,
    onColor: '#00ff00',
    offColor: '#003300',
    shape: 'round',
    cornerRadius: 4,
    glowEnabled: true,
    glowRadius: segmentSize * 0.3,
    glowIntensity: segmentSize * 0.15,
    colorPalette: 'classic',
    ...overrides,
  }
}

export function createLEDRing(overrides?: Partial<LEDRingElementConfig>): LEDRingElementConfig {
  const diameter = 80
  return {
    id: crypto.randomUUID(),
    type: 'ledring',
    name: 'LED Ring',
    x: 0,
    y: 0,
    width: diameter,
    height: diameter,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.5,
    segmentCount: 24,
    diameter,
    thickness: 8,
    startAngle: -135,
    endAngle: 135,
    onColor: '#00ff00',
    offColor: '#003300',
    glowEnabled: true,
    glowRadius: 4,
    colorPalette: 'classic',
    ...overrides,
  }
}

export function createLEDMatrix(overrides?: Partial<LEDMatrixElementConfig>): LEDMatrixElementConfig {
  const rows = 8
  const columns = 8
  const ledSize = 8
  const spacing = 2

  // Initialize all LEDs to off
  const states: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => false)
  )

  return {
    id: crypto.randomUUID(),
    type: 'ledmatrix',
    name: 'LED Matrix',
    x: 0,
    y: 0,
    width: columns * ledSize + (columns - 1) * spacing,
    height: rows * ledSize + (rows - 1) * spacing,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    rows,
    columns,
    states,
    spacing,
    onColor: '#00ff00',
    offColor: '#003300',
    shape: 'round',
    cornerRadius: 2,
    glowEnabled: true,
    glowRadius: ledSize * 0.3,
    glowIntensity: ledSize * 0.15,
    colorPalette: 'classic',
    ...overrides,
  }
}

export function createNumericDisplay(overrides?: Partial<NumericDisplayElementConfig>): NumericDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'numericdisplay',
    name: 'Numeric Display',
    x: 0,
    y: 0,
    width: 100,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.5,
    min: 0,
    max: 100,
    decimalPlaces: 2,
    unit: '',
    fontSize: 18,
    fontFamily: 'Roboto Mono, monospace',
    textColor: '#10b981',
    backgroundColor: '#1f2937',
    padding: 8,
    fontStyle: 'modern',
    bezelStyle: 'inset',
    showGhostSegments: false,
    unitDisplay: 'suffix',
    borderColor: '#374151',
    ...overrides,
  }
}

export function createTimeDisplay(overrides?: Partial<TimeDisplayElementConfig>): TimeDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'timedisplay',
    name: 'Time Display',
    x: 0,
    y: 0,
    width: 120,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.5,
    min: 0,
    max: 1000,
    decimalPlaces: 2,
    bpm: 120,
    timeSignature: 4,
    fontSize: 18,
    fontFamily: 'Roboto Mono, monospace',
    textColor: '#10b981',
    backgroundColor: '#1f2937',
    padding: 8,
    fontStyle: 'modern',
    bezelStyle: 'inset',
    showGhostSegments: false,
    borderColor: '#374151',
    ...overrides,
  }
}

export function createPercentageDisplay(overrides?: Partial<PercentageDisplayElementConfig>): PercentageDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'percentagedisplay',
    name: 'Percentage Display',
    x: 0,
    y: 0,
    width: 90,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.5,
    decimalPlaces: 0,
    fontSize: 18,
    fontFamily: 'Roboto Mono, monospace',
    textColor: '#10b981',
    backgroundColor: '#1f2937',
    padding: 8,
    fontStyle: 'modern',
    bezelStyle: 'inset',
    showGhostSegments: false,
    borderColor: '#374151',
    ...overrides,
  }
}

export function createRatioDisplay(overrides?: Partial<RatioDisplayElementConfig>): RatioDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'ratiodisplay',
    name: 'Ratio Display',
    x: 0,
    y: 0,
    width: 100,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.2,
    min: 1,
    max: 20,
    decimalPlaces: 1,
    infinityThreshold: 20,
    fontSize: 18,
    fontFamily: 'Roboto Mono, monospace',
    textColor: '#10b981',
    backgroundColor: '#1f2937',
    padding: 8,
    fontStyle: 'modern',
    bezelStyle: 'inset',
    showGhostSegments: false,
    borderColor: '#374151',
    ...overrides,
  }
}

export function createNoteDisplay(overrides?: Partial<NoteDisplayElementConfig>): NoteDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'notedisplay',
    name: 'Note Display',
    x: 0,
    y: 0,
    width: 80,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.47,
    min: 0,
    max: 127,
    preferSharps: true,
    showMidiNumber: false,
    fontSize: 20,
    fontFamily: 'Roboto Mono, monospace',
    textColor: '#10b981',
    backgroundColor: '#1f2937',
    padding: 8,
    fontStyle: 'modern',
    bezelStyle: 'inset',
    borderColor: '#374151',
    ...overrides,
  }
}

export function createBpmDisplay(overrides?: Partial<BpmDisplayElementConfig>): BpmDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'bpmdisplay',
    name: 'BPM Display',
    x: 0,
    y: 0,
    width: 120,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.5,
    min: 20,
    max: 300,
    decimalPlaces: 2,
    showLabel: true,
    fontSize: 18,
    fontFamily: 'Roboto Mono, monospace',
    textColor: '#10b981',
    backgroundColor: '#1f2937',
    padding: 8,
    fontStyle: 'modern',
    bezelStyle: 'inset',
    showGhostSegments: false,
    borderColor: '#374151',
    ...overrides,
  }
}

export function createEditableDisplay(overrides?: Partial<EditableDisplayElementConfig>): EditableDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'editabledisplay',
    name: 'Editable Display',
    x: 0,
    y: 0,
    width: 100,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.5,
    min: 0,
    max: 100,
    format: 'numeric',
    decimalPlaces: 2,
    fontSize: 18,
    fontFamily: 'Roboto Mono, monospace',
    textColor: '#10b981',
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    padding: 8,
    ...overrides,
  }
}

export function createMultiValueDisplay(overrides?: Partial<MultiValueDisplayElementConfig>): MultiValueDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'multivaluedisplay',
    name: 'Multi-Value Display',
    x: 0,
    y: 0,
    width: 150,
    height: 80,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    values: [
      { value: 0.5, min: 0, max: 100, format: 'numeric', label: 'Value 1', decimalPlaces: 1 },
      { value: 0.75, min: 0, max: 100, format: 'numeric', label: 'Value 2', decimalPlaces: 1 },
    ],
    layout: 'vertical',
    fontSize: 16,
    fontFamily: 'Roboto Mono, monospace',
    textColor: '#10b981',
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    padding: 8,
    ...overrides,
  }
}

// Default color zones per CONTEXT.md: green <-18, yellow <-6, red >=0
const defaultMeterColorZones = [
  { startDb: -Infinity, endDb: -18, color: '#10b981' },
  { startDb: -18, endDb: -6, color: '#eab308' },
  { startDb: -6, endDb: Infinity, color: '#ef4444' },
]

// RMS uses -60 to 0 dB range with 60 segments (1dB each)
export function createRMSMeterMono(overrides?: Partial<RMSMeterMonoElementConfig>): RMSMeterMonoElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'rmsmetermo',
    name: 'RMS Meter',
    x: 0,
    y: 0,
    width: 30,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.8, // -12 dB default per CONTEXT.md
    minDb: -60,
    maxDb: 0,
    orientation: 'vertical',
    segmentCount: 60,
    segmentGap: 1,
    scalePosition: 'outside',
    showMajorTicks: true,
    showMinorTicks: true,
    showNumericReadout: false,
    colorZones: defaultMeterColorZones,
    showPeakHold: true,
    peakHoldStyle: 'line',
    peakHoldDuration: 2000,
    ballisticsType: 'RMS',
    ...overrides,
  }
}

export function createRMSMeterStereo(overrides?: Partial<RMSMeterStereoElementConfig>): RMSMeterStereoElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'rmsmeterstereo',
    name: 'RMS Meter Stereo',
    x: 0,
    y: 0,
    width: 80, // Wider for stereo
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.8,
    valueL: 0.8,  // -12 dB
    valueR: 0.78, // Slight asymmetry per RESEARCH.md
    minDb: -60,
    maxDb: 0,
    orientation: 'vertical',
    segmentCount: 60,
    segmentGap: 1,
    scalePosition: 'outside',
    showMajorTicks: true,
    showMinorTicks: true,
    showNumericReadout: false,
    colorZones: defaultMeterColorZones,
    showPeakHold: true,
    peakHoldStyle: 'line',
    peakHoldDuration: 2000,
    ballisticsType: 'RMS',
    showChannelLabels: true,
    ...overrides,
  }
}

// VU uses -20 to +3 dB range with 23 segments (1dB each)
export function createVUMeterMono(overrides?: Partial<VUMeterMonoElementConfig>): VUMeterMonoElementConfig {
  // VU-specific color zones: green to 0 VU, red above
  const vuColorZones = [
    { startDb: -20, endDb: 0, color: '#10b981' },
    { startDb: 0, endDb: 3, color: '#ef4444' },
  ]

  return {
    id: crypto.randomUUID(),
    type: 'vumetermono',
    name: 'VU Meter',
    x: 0,
    y: 0,
    width: 30,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.35, // -12 dB on VU scale (-20 to +3)
    minDb: -20,
    maxDb: 3,
    orientation: 'vertical',
    segmentCount: 23,
    segmentGap: 1,
    scalePosition: 'outside',
    showMajorTicks: true,
    showMinorTicks: true,
    showNumericReadout: false,
    colorZones: vuColorZones,
    showPeakHold: true,
    peakHoldStyle: 'line',
    peakHoldDuration: 2000,
    ballisticsType: 'VU',
    ...overrides,
  }
}

export function createVUMeterStereo(overrides?: Partial<VUMeterStereoElementConfig>): VUMeterStereoElementConfig {
  const vuColorZones = [
    { startDb: -20, endDb: 0, color: '#10b981' },
    { startDb: 0, endDb: 3, color: '#ef4444' },
  ]

  return {
    id: crypto.randomUUID(),
    type: 'vumeterstereo',
    name: 'VU Meter Stereo',
    x: 0,
    y: 0,
    width: 80,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.35,
    valueL: 0.35,
    valueR: 0.33,
    minDb: -20,
    maxDb: 3,
    orientation: 'vertical',
    segmentCount: 23,
    segmentGap: 1,
    scalePosition: 'outside',
    showMajorTicks: true,
    showMinorTicks: true,
    showNumericReadout: false,
    colorZones: vuColorZones,
    showPeakHold: true,
    peakHoldStyle: 'line',
    peakHoldDuration: 2000,
    ballisticsType: 'VU',
    showChannelLabels: true,
    ...overrides,
  }
}

// PPM uses -50 to +5 dB range with 55 segments
export function createPPMType1Mono(overrides?: Partial<PPMType1MonoElementConfig>): PPMType1MonoElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'ppmtype1mono',
    name: 'PPM Type I',
    x: 0,
    y: 0,
    width: 30,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.69, // -12 dB on PPM scale (-50 to +5)
    minDb: -50,
    maxDb: 5,
    orientation: 'vertical',
    segmentCount: 55,
    segmentGap: 1,
    scalePosition: 'outside',
    showMajorTicks: true,
    showMinorTicks: true,
    showNumericReadout: false,
    colorZones: defaultMeterColorZones,
    showPeakHold: true,
    peakHoldStyle: 'line',
    peakHoldDuration: 2000,
    ballisticsType: 'PPM_TYPE_I',
    ...overrides,
  }
}

export function createPPMType1Stereo(overrides?: Partial<PPMType1StereoElementConfig>): PPMType1StereoElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'ppmtype1stereo',
    name: 'PPM Type I Stereo',
    x: 0,
    y: 0,
    width: 80,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.69,
    valueL: 0.69,
    valueR: 0.67,
    minDb: -50,
    maxDb: 5,
    orientation: 'vertical',
    segmentCount: 55,
    segmentGap: 1,
    scalePosition: 'outside',
    showMajorTicks: true,
    showMinorTicks: true,
    showNumericReadout: false,
    colorZones: defaultMeterColorZones,
    showPeakHold: true,
    peakHoldStyle: 'line',
    peakHoldDuration: 2000,
    ballisticsType: 'PPM_TYPE_I',
    showChannelLabels: true,
    ...overrides,
  }
}

export function createPPMType2Mono(overrides?: Partial<PPMType2MonoElementConfig>): PPMType2MonoElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'ppmtype2mono',
    name: 'PPM Type II',
    x: 0,
    y: 0,
    width: 30,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.69,
    minDb: -50,
    maxDb: 5,
    orientation: 'vertical',
    segmentCount: 55,
    segmentGap: 1,
    scalePosition: 'outside',
    showMajorTicks: true,
    showMinorTicks: true,
    showNumericReadout: false,
    colorZones: defaultMeterColorZones,
    showPeakHold: true,
    peakHoldStyle: 'line',
    peakHoldDuration: 2000,
    ballisticsType: 'PPM_TYPE_II',
    ...overrides,
  }
}

export function createPPMType2Stereo(overrides?: Partial<PPMType2StereoElementConfig>): PPMType2StereoElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'ppmtype2stereo',
    name: 'PPM Type II Stereo',
    x: 0,
    y: 0,
    width: 80,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.69,
    valueL: 0.69,
    valueR: 0.67,
    minDb: -50,
    maxDb: 5,
    orientation: 'vertical',
    segmentCount: 55,
    segmentGap: 1,
    scalePosition: 'outside',
    showMajorTicks: true,
    showMinorTicks: true,
    showNumericReadout: false,
    colorZones: defaultMeterColorZones,
    showPeakHold: true,
    peakHoldStyle: 'line',
    peakHoldDuration: 2000,
    ballisticsType: 'PPM_TYPE_II',
    showChannelLabels: true,
    ...overrides,
  }
}
