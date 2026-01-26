/**
 * Visualization element types
 * Canvas-based real-time audio visualizations
 */

import { BaseElementConfig } from './base'

// ============================================================================
// Visualization Element Configurations
// ============================================================================

export interface ScrollingWaveformElementConfig extends BaseElementConfig {
  type: 'scrollingwaveform'

  // Display settings
  displayMode: 'line' | 'fill'
  waveformColor: string
  backgroundColor: string

  // Grid overlay
  showGrid: boolean
  gridColor: string

  // Canvas settings
  canvasScale: number // HiDPI scaling factor, default 1
}

export interface SpectrumAnalyzerElementConfig extends BaseElementConfig {
  type: 'spectrumanalyzer'

  // FFT configuration
  fftSize: 512 | 1024 | 2048 | 4096 | 8192
  frequencyScale: 'linear' | 'log' | 'mel'

  // Visual settings
  colorGradient: 'default' | 'fire' | 'cool' | 'grayscale'
  barGap: number
  backgroundColor: string

  // Grid and labels
  showGrid: boolean
  gridColor: string
  showFrequencyLabels: boolean
  showDbScale: boolean

  // Canvas settings
  canvasScale: number
}

export interface SpectrogramElementConfig extends BaseElementConfig {
  type: 'spectrogram'

  // FFT configuration
  fftSize: 512 | 1024 | 2048 | 4096 | 8192

  // Visual settings
  colorMap: 'default' | 'fire' | 'cool' | 'grayscale'
  backgroundColor: string

  // Labels
  showFrequencyLabels: boolean
  showTimeLabels: boolean

  // Canvas settings
  canvasScale: number
}

export interface GoniometerElementConfig extends BaseElementConfig {
  type: 'goniometer'

  // Visual settings
  traceColor: string
  backgroundColor: string

  // Grid overlay
  showGrid: boolean
  gridColor: string
  showAxisLines: boolean // L/R and M/S reference lines

  // Canvas settings
  canvasScale: number
}

export interface VectorscopeElementConfig extends BaseElementConfig {
  type: 'vectorscope'

  // Visual settings
  traceColor: string
  backgroundColor: string

  // Grid overlay
  showGrid: boolean
  gridColor: string
  showAxisLines: boolean

  // Canvas settings
  canvasScale: number
}

// ============================================================================
// Visualization Element Union
// ============================================================================

export type VisualizationElement =
  | ScrollingWaveformElementConfig
  | SpectrumAnalyzerElementConfig
  | SpectrogramElementConfig
  | GoniometerElementConfig
  | VectorscopeElementConfig

// ============================================================================
// Type Guards
// ============================================================================

export function isScrollingWaveform(element: { type: string }): element is ScrollingWaveformElementConfig {
  return element.type === 'scrollingwaveform'
}

export function isSpectrumAnalyzer(element: { type: string }): element is SpectrumAnalyzerElementConfig {
  return element.type === 'spectrumanalyzer'
}

export function isSpectrogram(element: { type: string }): element is SpectrogramElementConfig {
  return element.type === 'spectrogram'
}

export function isGoniometer(element: { type: string }): element is GoniometerElementConfig {
  return element.type === 'goniometer'
}

export function isVectorscope(element: { type: string }): element is VectorscopeElementConfig {
  return element.type === 'vectorscope'
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createScrollingWaveform(overrides?: Partial<ScrollingWaveformElementConfig>): ScrollingWaveformElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'scrollingwaveform',
    name: 'Scrolling Waveform',
    x: 0,
    y: 0,
    width: 200,
    height: 80,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    displayMode: 'line',
    waveformColor: '#00ff88',
    backgroundColor: '#1a1a1a',
    showGrid: false,
    gridColor: '#333333',
    canvasScale: 1,
    ...overrides,
  }
}

export function createSpectrumAnalyzer(overrides?: Partial<SpectrumAnalyzerElementConfig>): SpectrumAnalyzerElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'spectrumanalyzer',
    name: 'Spectrum Analyzer',
    x: 0,
    y: 0,
    width: 256,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    fftSize: 2048,
    frequencyScale: 'log',
    colorGradient: 'default',
    barGap: 2,
    backgroundColor: '#1a1a1a',
    showGrid: false,
    gridColor: '#333333',
    showFrequencyLabels: true,
    showDbScale: true,
    canvasScale: 1,
    ...overrides,
  }
}

export function createSpectrogram(overrides?: Partial<SpectrogramElementConfig>): SpectrogramElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'spectrogram',
    name: 'Spectrogram',
    x: 0,
    y: 0,
    width: 256,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    fftSize: 2048,
    colorMap: 'default',
    backgroundColor: '#1a1a1a',
    showFrequencyLabels: true,
    showTimeLabels: true,
    canvasScale: 1,
    ...overrides,
  }
}

export function createGoniometer(overrides?: Partial<GoniometerElementConfig>): GoniometerElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'goniometer',
    name: 'Goniometer',
    x: 0,
    y: 0,
    width: 150,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    traceColor: '#00ff88',
    backgroundColor: '#1a1a1a',
    showGrid: true,
    gridColor: '#333333',
    showAxisLines: true,
    canvasScale: 1,
    ...overrides,
  }
}

export function createVectorscope(overrides?: Partial<VectorscopeElementConfig>): VectorscopeElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'vectorscope',
    name: 'Vectorscope',
    x: 0,
    y: 0,
    width: 150,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    traceColor: '#00ff88',
    backgroundColor: '#1a1a1a',
    showGrid: true,
    gridColor: '#333333',
    showAxisLines: true,
    canvasScale: 1,
    ...overrides,
  }
}
