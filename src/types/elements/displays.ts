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
