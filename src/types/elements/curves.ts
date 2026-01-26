/**
 * Curve element types
 * Canvas-based interactive curve editors for audio DSP visualization
 */

import { BaseElementConfig } from './base'

// ============================================================================
// Curve Element Configurations
// ============================================================================

export interface EQBand {
  frequency: number // Hz
  gain: number // dB
  Q: number // Quality factor (bandwidth)
}

export interface EQCurveElementConfig extends BaseElementConfig {
  type: 'eqcurve'

  // EQ configuration
  bands: EQBand[]
  bandCount: number // 1-16

  // Range settings
  minDb: number // e.g., -24
  maxDb: number // e.g., +24
  minFreq: number // e.g., 20
  maxFreq: number // e.g., 20000

  // Grid overlay
  showGrid: boolean
  gridColor: string
  showFrequencyLabels: boolean
  showDbLabels: boolean

  // Curve display
  curveColor: string
  lineWidth: number // 1-4
  showFill: boolean
  fillColor: string
  fillOpacity: number

  // Multi-band display mode
  showIndividualBands: boolean // false = composite only, true = individual + composite

  // Handles
  handleColor: string
  handleHoverColor: string

  // Canvas settings
  backgroundColor: string
  canvasScale: number // HiDPI scaling factor, default 1
}

export interface CompressorCurveElementConfig extends BaseElementConfig {
  type: 'compressorcurve'

  // Compressor parameters
  threshold: number // dB
  ratio: number // e.g., 4.0 for 4:1
  knee: number // dB (soft knee width)

  // Range settings
  minDb: number // e.g., -60
  maxDb: number // e.g., 0

  // Display mode
  displayMode: 'transfer' | 'gainreduction'

  // Grid overlay
  showGrid: boolean
  gridColor: string
  showDbLabels: boolean

  // Curve display
  curveColor: string
  lineWidth: number // 1-4
  showFill: boolean
  fillColor: string

  // Handles
  handleColor: string
  handleHoverColor: string

  // Canvas settings
  backgroundColor: string
  canvasScale: number
}

export interface EnvelopeDisplayElementConfig extends BaseElementConfig {
  type: 'envelopedisplay'

  // ADSR parameters (0-1 time proportions, except sustain which is 0-1 level)
  attack: number // 0-1
  decay: number // 0-1
  sustain: number // 0-1 (level)
  release: number // 0-1

  // Curve type
  curveType: 'linear' | 'exponential'

  // Stage coloring
  showStageColors: boolean
  attackColor: string
  decayColor: string
  sustainColor: string
  releaseColor: string

  // Curve display
  curveColor: string // Single color when showStageColors is false
  lineWidth: number // 1-4
  showFill: boolean
  fillColor: string

  // Grid overlay
  showGrid: boolean
  gridColor: string
  showStageMarkers: boolean // Show vertical markers at stage boundaries

  // Handles
  handleColor: string
  handleHoverColor: string

  // Canvas settings
  backgroundColor: string
  canvasScale: number
}

export interface LFODisplayElementConfig extends BaseElementConfig {
  type: 'lfodisplay'

  // LFO configuration
  shape: 'sine' | 'triangle' | 'saw-up' | 'saw-down' | 'square' | 'pulse' | 'sample-hold' | 'smooth-random'
  pulseWidth: number // 0-1, only used for 'pulse' shape

  // Grid overlay
  showGrid: boolean
  gridColor: string

  // Waveform display
  waveformColor: string
  lineWidth: number // 1-4
  showFill: boolean
  fillColor: string

  // Canvas settings
  backgroundColor: string
  canvasScale: number
}

export interface FilterResponseElementConfig extends BaseElementConfig {
  type: 'filterresponse'

  // Filter parameters
  filterType: 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'lowshelf' | 'highshelf' | 'peak'
  cutoffFrequency: number // Hz
  resonance: number // Q factor
  gain: number // dB, for shelf/peak filters

  // Range settings
  minDb: number
  maxDb: number
  minFreq: number
  maxFreq: number

  // Grid overlay
  showGrid: boolean
  gridColor: string
  showFrequencyLabels: boolean
  showDbLabels: boolean

  // Curve display
  curveColor: string
  lineWidth: number // 1-4
  showFill: boolean
  fillColor: string

  // Handles
  handleColor: string
  handleHoverColor: string

  // Canvas settings
  backgroundColor: string
  canvasScale: number
}

// ============================================================================
// Curve Element Union
// ============================================================================

export type CurveElement =
  | EQCurveElementConfig
  | CompressorCurveElementConfig
  | EnvelopeDisplayElementConfig
  | LFODisplayElementConfig
  | FilterResponseElementConfig

// ============================================================================
// Type Guards
// ============================================================================

export function isEQCurve(element: { type: string }): element is EQCurveElementConfig {
  return element.type === 'eqcurve'
}

export function isCompressorCurve(element: { type: string }): element is CompressorCurveElementConfig {
  return element.type === 'compressorcurve'
}

export function isEnvelopeDisplay(element: { type: string }): element is EnvelopeDisplayElementConfig {
  return element.type === 'envelopedisplay'
}

export function isLFODisplay(element: { type: string }): element is LFODisplayElementConfig {
  return element.type === 'lfodisplay'
}

export function isFilterResponse(element: { type: string }): element is FilterResponseElementConfig {
  return element.type === 'filterresponse'
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createEQCurve(overrides?: Partial<EQCurveElementConfig>): EQCurveElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'eqcurve',
    name: 'EQ Curve',
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    bands: [
      { frequency: 250, gain: 0, Q: 1.0 },
      { frequency: 1000, gain: 0, Q: 1.0 },
      { frequency: 4000, gain: 0, Q: 1.0 },
    ],
    bandCount: 3,
    minDb: -24,
    maxDb: 24,
    minFreq: 20,
    maxFreq: 20000,
    showGrid: true,
    gridColor: '#333333',
    showFrequencyLabels: true,
    showDbLabels: true,
    curveColor: '#00ff88',
    lineWidth: 2,
    showFill: false,
    fillColor: 'rgba(0, 255, 136, 0.2)',
    fillOpacity: 0.2,
    showIndividualBands: false,
    handleColor: '#00ff88',
    handleHoverColor: '#00ffff',
    backgroundColor: '#1a1a1a',
    canvasScale: 1,
    ...overrides,
  }
}

export function createCompressorCurve(overrides?: Partial<CompressorCurveElementConfig>): CompressorCurveElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'compressorcurve',
    name: 'Compressor Curve',
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    threshold: -18,
    ratio: 4.0,
    knee: 6,
    minDb: -60,
    maxDb: 0,
    displayMode: 'transfer',
    showGrid: true,
    gridColor: '#333333',
    showDbLabels: true,
    curveColor: '#00ff88',
    lineWidth: 2,
    showFill: false,
    fillColor: 'rgba(0, 255, 136, 0.2)',
    handleColor: '#00ff88',
    handleHoverColor: '#00ffff',
    backgroundColor: '#1a1a1a',
    canvasScale: 1,
    ...overrides,
  }
}

export function createEnvelopeDisplay(overrides?: Partial<EnvelopeDisplayElementConfig>): EnvelopeDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'envelopedisplay',
    name: 'Envelope Display',
    x: 0,
    y: 0,
    width: 250,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    attack: 0.1,
    decay: 0.15,
    sustain: 0.7,
    release: 0.2,
    curveType: 'exponential',
    showStageColors: false,
    attackColor: '#00ff88',
    decayColor: '#00ccff',
    sustainColor: '#ffaa00',
    releaseColor: '#ff4444',
    curveColor: '#00ff88',
    lineWidth: 2,
    showFill: false,
    fillColor: 'rgba(0, 255, 136, 0.2)',
    showGrid: false,
    gridColor: '#333333',
    showStageMarkers: true,
    handleColor: '#00ff88',
    handleHoverColor: '#00ffff',
    backgroundColor: '#1a1a1a',
    canvasScale: 1,
    ...overrides,
  }
}

export function createLFODisplay(overrides?: Partial<LFODisplayElementConfig>): LFODisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'lfodisplay',
    name: 'LFO Display',
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    shape: 'sine',
    pulseWidth: 0.5,
    showGrid: false,
    gridColor: '#333333',
    waveformColor: '#00ff88',
    lineWidth: 2,
    showFill: false,
    fillColor: 'rgba(0, 255, 136, 0.2)',
    backgroundColor: '#1a1a1a',
    canvasScale: 1,
    ...overrides,
  }
}

export function createFilterResponse(overrides?: Partial<FilterResponseElementConfig>): FilterResponseElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'filterresponse',
    name: 'Filter Response',
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    filterType: 'lowpass',
    cutoffFrequency: 1000,
    resonance: 1.0,
    gain: 0,
    minDb: -48,
    maxDb: 12,
    minFreq: 20,
    maxFreq: 20000,
    showGrid: true,
    gridColor: '#333333',
    showFrequencyLabels: true,
    showDbLabels: true,
    curveColor: '#00ff88',
    lineWidth: 2,
    showFill: false,
    fillColor: 'rgba(0, 255, 136, 0.2)',
    handleColor: '#00ff88',
    handleHoverColor: '#00ffff',
    backgroundColor: '#1a1a1a',
    canvasScale: 1,
    ...overrides,
  }
}
