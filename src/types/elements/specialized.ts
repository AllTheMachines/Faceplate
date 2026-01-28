/**
 * Specialized Audio Element Types
 * MIDI input, sequencing, synthesis editors, and routing visualizations
 */

import { BaseElementConfig } from './base'

// ============================================================================
// Piano Keyboard
// ============================================================================

export interface PianoKeyboardElementConfig extends BaseElementConfig {
  type: 'pianokeyboard'

  // Range
  startNote: number // MIDI note number (0-127), default 36 (C2)
  endNote: number // MIDI note number, default 84 (C6)

  // Display
  showNoteLabels: boolean
  labelOctavesOnly: boolean // Only show C1, C2, etc.

  // Colors
  whiteKeyColor: string
  blackKeyColor: string
  activeKeyColor: string
  labelColor: string

  // Dimensions
  whiteKeyWidth: number
  blackKeyWidthRatio: number // 0.6 = 60% of white key width

  // Font
  fontSize: number
  fontFamily: string
  fontWeight: string

  // State (for preview)
  activeNotes: number[] // Currently pressed MIDI notes
}

// ============================================================================
// Drum Pad
// ============================================================================

export interface DrumPadElementConfig extends BaseElementConfig {
  type: 'drumpad'

  // Identity
  label: string
  midiNote: number // MIDI note this pad triggers

  // State
  isPressed: boolean
  velocity: number // 0-127, for visual feedback intensity

  // Colors
  backgroundColor: string
  pressedColor: string
  labelColor: string
  borderColor: string

  // Border
  borderRadius: number
  borderWidth: number

  // Font
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Velocity sensitivity visualization
  showVelocity: boolean
}

// ============================================================================
// Pad Grid
// ============================================================================

export interface PadGridElementConfig extends BaseElementConfig {
  type: 'padgrid'

  // Grid dimensions
  rows: number // 4 or 8
  columns: number // 4 or 8

  // Pad configuration
  padLabels: string[] // Labels for each pad (row-major order)
  startNote: number // First MIDI note in grid

  // State
  activePads: number[] // Indices of currently pressed pads

  // Colors
  padColor: string
  activePadColor: string
  labelColor: string
  borderColor: string
  gridGap: number

  // Font
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Border
  padBorderRadius: number
}

// ============================================================================
// Step Sequencer
// ============================================================================

export interface SequencerStep {
  active: boolean
  velocity: number // 0-1
  note?: number // Optional MIDI note override
}

export interface StepSequencerElementConfig extends BaseElementConfig {
  type: 'stepsequencer'

  // Grid configuration
  stepCount: number // 8, 16, 24, or 32
  rowCount: number // Number of rows (1 for single pattern, or 4-8 for multi-track)

  // Steps data (row-major: [row0-step0, row0-step1, ..., row1-step0, ...])
  steps: SequencerStep[]

  // Playback position (for preview)
  currentStep: number // -1 = stopped

  // Colors
  stepOffColor: string
  stepOnColor: string
  stepActiveColor: string // Currently playing step
  gridLineColor: string
  backgroundColor: string

  // Beat divisions
  beatsPerMeasure: number // 4 for 4/4 time
  highlightDownbeats: boolean
  downbeatColor: string

  // Velocity display
  showVelocity: boolean
  velocityHeight: number // Height of velocity bars in px

  // Font (for row labels if multi-track)
  fontSize: number
  fontFamily: string
  fontWeight: string
  labelColor: string
}

// ============================================================================
// XY Pad
// ============================================================================

export interface XYPadElementConfig extends BaseElementConfig {
  type: 'xypad'

  // Values (0-1 normalized)
  xValue: number
  yValue: number

  // Labels
  xLabel: string
  yLabel: string
  showLabels: boolean

  // Grid
  showGrid: boolean
  gridDivisions: number // Number of grid lines per axis
  gridColor: string

  // Crosshair/cursor
  cursorSize: number
  cursorColor: string
  showCrosshair: boolean
  crosshairColor: string

  // Colors
  backgroundColor: string
  borderColor: string

  // Font
  fontSize: number
  fontFamily: string
  fontWeight: string
  labelColor: string
}

// ============================================================================
// Wavetable Display
// ============================================================================

export interface WavetableDisplayElementConfig extends BaseElementConfig {
  type: 'wavetabledisplay'

  // Display configuration
  frameCount: number // Number of waveform frames to show (8-64)
  currentFrame: number // Currently selected frame (0 to frameCount-1)

  // 3D perspective
  perspectiveAngle: number // Tilt angle in degrees (0-45)
  frameSpacing: number // Spacing between frames

  // Colors
  waveformColor: string
  currentFrameColor: string
  backgroundColor: string
  gridColor: string

  // Display options
  showGrid: boolean
  showFrameLabels: boolean
  fillWaveform: boolean

  // Font
  fontSize: number
  fontFamily: string
  fontWeight: string
  labelColor: string
}

// ============================================================================
// Harmonic Editor
// ============================================================================

export interface HarmonicEditorElementConfig extends BaseElementConfig {
  type: 'harmoniceditor'

  // Harmonics configuration
  harmonicCount: number // Number of partials (8-64)
  harmonicValues: number[] // Amplitude of each harmonic (0-1)

  // Display
  showFundamental: boolean // Show fundamental frequency marker
  showHarmonicNumbers: boolean

  // Colors
  barColor: string
  selectedBarColor: string
  backgroundColor: string
  gridColor: string
  labelColor: string

  // Bar styling
  barGap: number
  barBorderRadius: number

  // Font
  fontSize: number
  fontFamily: string
  fontWeight: string

  // State
  selectedHarmonic: number // -1 = none selected
}

// ============================================================================
// Loop Points
// ============================================================================

export interface LoopPointsElementConfig extends BaseElementConfig {
  type: 'looppoints'

  // Sample length (normalized 0-1 for display)
  sampleLength: number // Total length in samples (for display scaling)

  // Loop points (normalized 0-1)
  loopStart: number
  loopEnd: number

  // Crossfade
  crossfadeLength: number // 0-1 normalized

  // Display
  showWaveform: boolean
  showCrossfade: boolean
  showTimeRuler: boolean

  // Colors
  waveformColor: string
  loopRegionColor: string
  startMarkerColor: string
  endMarkerColor: string
  crossfadeColor: string
  backgroundColor: string
  rulerColor: string

  // Marker styling
  markerWidth: number
  markerHandleSize: number

  // Font
  fontSize: number
  fontFamily: string
  fontWeight: string
  labelColor: string
}

// ============================================================================
// Specialized Element Union
// ============================================================================

export type SpecializedElement =
  | PianoKeyboardElementConfig
  | DrumPadElementConfig
  | PadGridElementConfig
  | StepSequencerElementConfig
  | XYPadElementConfig
  | WavetableDisplayElementConfig
  | HarmonicEditorElementConfig
  | LoopPointsElementConfig
  | EnvelopeEditorElementConfig
  | SampleDisplayElementConfig
  | PatchBayElementConfig
  | SignalFlowElementConfig

// ============================================================================
// Type Guards
// ============================================================================

export function isPianoKeyboard(element: { type: string }): element is PianoKeyboardElementConfig {
  return element.type === 'pianokeyboard'
}

export function isDrumPad(element: { type: string }): element is DrumPadElementConfig {
  return element.type === 'drumpad'
}

export function isPadGrid(element: { type: string }): element is PadGridElementConfig {
  return element.type === 'padgrid'
}

export function isStepSequencer(element: { type: string }): element is StepSequencerElementConfig {
  return element.type === 'stepsequencer'
}

export function isXYPad(element: { type: string }): element is XYPadElementConfig {
  return element.type === 'xypad'
}

export function isWavetableDisplay(element: { type: string }): element is WavetableDisplayElementConfig {
  return element.type === 'wavetabledisplay'
}

export function isHarmonicEditor(element: { type: string }): element is HarmonicEditorElementConfig {
  return element.type === 'harmoniceditor'
}

export function isLoopPoints(element: { type: string }): element is LoopPointsElementConfig {
  return element.type === 'looppoints'
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createPianoKeyboard(overrides?: Partial<PianoKeyboardElementConfig>): PianoKeyboardElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'pianokeyboard',
    name: 'Piano Keyboard',
    x: 0,
    y: 0,
    width: 400,
    height: 120,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    startNote: 36, // C2
    endNote: 84, // C6
    showNoteLabels: true,
    labelOctavesOnly: true,
    whiteKeyColor: '#ffffff',
    blackKeyColor: '#1a1a1a',
    activeKeyColor: '#3b82f6',
    labelColor: '#666666',
    whiteKeyWidth: 24,
    blackKeyWidthRatio: 0.6,
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '400',
    activeNotes: [],
    ...overrides,
  }
}

export function createDrumPad(overrides?: Partial<DrumPadElementConfig>): DrumPadElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'drumpad',
    name: 'Drum Pad',
    x: 0,
    y: 0,
    width: 80,
    height: 80,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    label: 'PAD',
    midiNote: 36, // C2 (kick drum)
    isPressed: false,
    velocity: 100,
    backgroundColor: '#374151',
    pressedColor: '#3b82f6',
    labelColor: '#ffffff',
    borderColor: '#6b7280',
    borderRadius: 0,
    borderWidth: 2,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
    showVelocity: true,
    ...overrides,
  }
}

export function createPadGrid(overrides?: Partial<PadGridElementConfig>): PadGridElementConfig {
  const rows = overrides?.rows ?? 4
  const columns = overrides?.columns ?? 4
  const padCount = rows * columns
  const defaultLabels = Array.from({ length: padCount }, (_, i) => `${i + 1}`)

  return {
    id: crypto.randomUUID(),
    type: 'padgrid',
    name: 'Pad Grid',
    x: 0,
    y: 0,
    width: 320,
    height: 320,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    rows,
    columns,
    padLabels: overrides?.padLabels ?? defaultLabels,
    startNote: 36,
    activePads: [],
    padColor: '#374151',
    activePadColor: '#3b82f6',
    labelColor: '#ffffff',
    borderColor: '#1f2937',
    gridGap: 4,
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
    padBorderRadius: 0,
    ...overrides,
  }
}

export function createStepSequencer(overrides?: Partial<StepSequencerElementConfig>): StepSequencerElementConfig {
  const stepCount = overrides?.stepCount ?? 16
  const rowCount = overrides?.rowCount ?? 1
  const defaultSteps: SequencerStep[] = Array.from({ length: stepCount * rowCount }, () => ({
    active: false,
    velocity: 0.75,
  }))

  return {
    id: crypto.randomUUID(),
    type: 'stepsequencer',
    name: 'Step Sequencer',
    x: 0,
    y: 0,
    width: 400,
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    stepCount,
    rowCount,
    steps: overrides?.steps ?? defaultSteps,
    currentStep: -1,
    stepOffColor: '#374151',
    stepOnColor: '#3b82f6',
    stepActiveColor: '#22c55e',
    gridLineColor: '#4b5563',
    backgroundColor: '#1f2937',
    beatsPerMeasure: 4,
    highlightDownbeats: true,
    downbeatColor: '#4b5563',
    showVelocity: true,
    velocityHeight: 20,
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '400',
    labelColor: '#9ca3af',
    ...overrides,
  }
}

export function createXYPad(overrides?: Partial<XYPadElementConfig>): XYPadElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'xypad',
    name: 'XY Pad',
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    xValue: 0.5,
    yValue: 0.5,
    xLabel: 'X',
    yLabel: 'Y',
    showLabels: true,
    showGrid: true,
    gridDivisions: 4,
    gridColor: '#374151',
    cursorSize: 16,
    cursorColor: '#3b82f6',
    showCrosshair: true,
    crosshairColor: 'rgba(59, 130, 246, 0.3)',
    backgroundColor: '#1f2937',
    borderColor: '#4b5563',
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '400',
    labelColor: '#9ca3af',
    ...overrides,
  }
}

export function createWavetableDisplay(overrides?: Partial<WavetableDisplayElementConfig>): WavetableDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'wavetabledisplay',
    name: 'Wavetable Display',
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    frameCount: 16,
    currentFrame: 0,
    perspectiveAngle: 25,
    frameSpacing: 8,
    waveformColor: '#3b82f6',
    currentFrameColor: '#22c55e',
    backgroundColor: '#1f2937',
    gridColor: '#374151',
    showGrid: true,
    showFrameLabels: false,
    fillWaveform: false,
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '400',
    labelColor: '#9ca3af',
    ...overrides,
  }
}

export function createHarmonicEditor(overrides?: Partial<HarmonicEditorElementConfig>): HarmonicEditorElementConfig {
  const harmonicCount = overrides?.harmonicCount ?? 16
  // Default harmonic series with decreasing amplitudes
  const defaultValues = Array.from({ length: harmonicCount }, (_, i) => 1 / (i + 1))

  return {
    id: crypto.randomUUID(),
    type: 'harmoniceditor',
    name: 'Harmonic Editor',
    x: 0,
    y: 0,
    width: 320,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    harmonicCount,
    harmonicValues: overrides?.harmonicValues ?? defaultValues,
    showFundamental: true,
    showHarmonicNumbers: true,
    barColor: '#3b82f6',
    selectedBarColor: '#22c55e',
    backgroundColor: '#1f2937',
    gridColor: '#374151',
    labelColor: '#9ca3af',
    barGap: 2,
    barBorderRadius: 0,
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: '400',
    selectedHarmonic: -1,
    ...overrides,
  }
}

export function createLoopPoints(overrides?: Partial<LoopPointsElementConfig>): LoopPointsElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'looppoints',
    name: 'Loop Points',
    x: 0,
    y: 0,
    width: 400,
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    sampleLength: 44100, // 1 second at 44.1kHz
    loopStart: 0.25,
    loopEnd: 0.75,
    crossfadeLength: 0.05,
    showWaveform: true,
    showCrossfade: true,
    showTimeRuler: true,
    waveformColor: '#6b7280',
    loopRegionColor: 'rgba(59, 130, 246, 0.2)',
    startMarkerColor: '#22c55e',
    endMarkerColor: '#ef4444',
    crossfadeColor: 'rgba(251, 191, 36, 0.3)',
    backgroundColor: '#1f2937',
    rulerColor: '#4b5563',
    markerWidth: 2,
    markerHandleSize: 10,
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '400',
    labelColor: '#9ca3af',
    ...overrides,
  }
}

// ============================================================================
// Envelope Editor
// ============================================================================

export type EnvelopeCurveType = 'linear' | 'exponential' | 'logarithmic'

export interface EnvelopeEditorElementConfig extends BaseElementConfig {
  type: 'envelopeeditor'

  // ADSR values (normalized 0-1)
  attack: number
  decay: number
  sustain: number // Level (0-1)
  release: number

  // Curve types for each segment
  attackCurve: EnvelopeCurveType
  decayCurve: EnvelopeCurveType
  releaseCurve: EnvelopeCurveType

  // Display options
  showGrid: boolean
  showLabels: boolean
  showValues: boolean

  // Colors
  lineColor: string
  fillColor: string
  pointColor: string
  activePointColor: string
  gridColor: string
  backgroundColor: string
  labelColor: string

  // Point styling
  pointSize: number

  // Font
  fontSize: number
  fontFamily: string
  fontWeight: string

  // State
  selectedPoint: 'attack' | 'decay' | 'sustain' | 'release' | null
}

// ============================================================================
// Sample Display
// ============================================================================

export interface SampleDisplayElementConfig extends BaseElementConfig {
  type: 'sampledisplay'

  // Display range (normalized 0-1)
  viewStart: number
  viewEnd: number

  // Zoom level (1 = full sample, higher = more zoomed in)
  zoomLevel: number

  // Selection
  selectionStart: number
  selectionEnd: number
  showSelection: boolean

  // Display options
  showZeroLine: boolean
  showTimeRuler: boolean
  showPeaks: boolean

  // Colors
  waveformColor: string
  peakColor: string
  zeroLineColor: string
  selectionColor: string
  backgroundColor: string
  rulerColor: string
  labelColor: string

  // Font
  fontSize: number
  fontFamily: string
  fontWeight: string
}

// ============================================================================
// Patch Bay
// ============================================================================

export interface PatchPoint {
  id: string
  label: string
  x: number // Relative position (0-1)
  y: number // Relative position (0-1)
  type: 'input' | 'output'
}

export interface PatchCable {
  id: string
  fromPointId: string
  toPointId: string
  color: string
}

export interface PatchBayElementConfig extends BaseElementConfig {
  type: 'patchbay'

  // Configuration
  rows: number
  columns: number

  // Points and cables
  points: PatchPoint[]
  cables: PatchCable[]

  // Display options
  showLabels: boolean
  showGrid: boolean

  // Colors
  inputColor: string
  outputColor: string
  cableColors: string[] // Available cable colors
  backgroundColor: string
  gridColor: string
  labelColor: string

  // Point styling
  pointSize: number
  cableWidth: number

  // Font
  fontSize: number
  fontFamily: string
  fontWeight: string

  // State
  selectedCable: string | null
  draggingFrom: string | null
}

// ============================================================================
// Signal Flow
// ============================================================================

export interface SignalFlowBlock {
  id: string
  label: string
  x: number // Position in grid units
  y: number
  width: number // Size in grid units
  height: number
  type: 'input' | 'output' | 'process' | 'mixer' | 'splitter'
  color?: string
}

export interface SignalFlowConnection {
  id: string
  fromBlockId: string
  toBlockId: string
  fromPort: 'left' | 'right' | 'top' | 'bottom'
  toPort: 'left' | 'right' | 'top' | 'bottom'
}

export interface SignalFlowElementConfig extends BaseElementConfig {
  type: 'signalflow'

  // Grid configuration
  gridCellSize: number
  gridRows: number
  gridColumns: number

  // Blocks and connections
  blocks: SignalFlowBlock[]
  connections: SignalFlowConnection[]

  // Display options
  showGrid: boolean
  showLabels: boolean
  animateSignal: boolean

  // Colors
  inputBlockColor: string
  outputBlockColor: string
  processBlockColor: string
  mixerBlockColor: string
  splitterBlockColor: string
  connectionColor: string
  signalColor: string
  backgroundColor: string
  gridColor: string
  labelColor: string

  // Styling
  blockBorderWidth: number
  connectionWidth: number

  // Font
  fontSize: number
  fontFamily: string
  fontWeight: string

  // State
  selectedBlock: string | null
}

// ============================================================================
// Type Guards (additions)
// ============================================================================

export function isEnvelopeEditor(element: { type: string }): element is EnvelopeEditorElementConfig {
  return element.type === 'envelopeeditor'
}

export function isSampleDisplay(element: { type: string }): element is SampleDisplayElementConfig {
  return element.type === 'sampledisplay'
}

export function isPatchBay(element: { type: string }): element is PatchBayElementConfig {
  return element.type === 'patchbay'
}

export function isSignalFlow(element: { type: string }): element is SignalFlowElementConfig {
  return element.type === 'signalflow'
}

// ============================================================================
// Factory Functions (additions)
// ============================================================================

export function createEnvelopeEditor(overrides?: Partial<EnvelopeEditorElementConfig>): EnvelopeEditorElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'envelopeeditor',
    name: 'Envelope Editor',
    x: 0,
    y: 0,
    width: 300,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    attack: 0.1,
    decay: 0.2,
    sustain: 0.7,
    release: 0.3,
    attackCurve: 'exponential',
    decayCurve: 'exponential',
    releaseCurve: 'exponential',
    showGrid: true,
    showLabels: true,
    showValues: true,
    lineColor: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.2)',
    pointColor: '#ffffff',
    activePointColor: '#22c55e',
    gridColor: '#374151',
    backgroundColor: '#1f2937',
    labelColor: '#9ca3af',
    pointSize: 8,
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '400',
    selectedPoint: null,
    ...overrides,
  }
}

export function createSampleDisplay(overrides?: Partial<SampleDisplayElementConfig>): SampleDisplayElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'sampledisplay',
    name: 'Sample Display',
    x: 0,
    y: 0,
    width: 400,
    height: 120,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    viewStart: 0,
    viewEnd: 1,
    zoomLevel: 1,
    selectionStart: 0.25,
    selectionEnd: 0.5,
    showSelection: true,
    showZeroLine: true,
    showTimeRuler: true,
    showPeaks: true,
    waveformColor: '#3b82f6',
    peakColor: '#ef4444',
    zeroLineColor: '#4b5563',
    selectionColor: 'rgba(59, 130, 246, 0.3)',
    backgroundColor: '#1f2937',
    rulerColor: '#4b5563',
    labelColor: '#9ca3af',
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '400',
    ...overrides,
  }
}

export function createPatchBay(overrides?: Partial<PatchBayElementConfig>): PatchBayElementConfig {
  // Default 4x4 patch bay layout
  const defaultPoints: PatchPoint[] = []
  for (let row = 0; row < 4; row++) {
    // Outputs on left
    defaultPoints.push({
      id: `out-${row}`,
      label: `Out ${row + 1}`,
      x: 0.1,
      y: (row + 0.5) / 4,
      type: 'output',
    })
    // Inputs on right
    defaultPoints.push({
      id: `in-${row}`,
      label: `In ${row + 1}`,
      x: 0.9,
      y: (row + 0.5) / 4,
      type: 'input',
    })
  }

  return {
    id: crypto.randomUUID(),
    type: 'patchbay',
    name: 'Patch Bay',
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    rows: 4,
    columns: 2,
    points: overrides?.points ?? defaultPoints,
    cables: overrides?.cables ?? [],
    showLabels: true,
    showGrid: true,
    inputColor: '#22c55e',
    outputColor: '#ef4444',
    cableColors: ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'],
    backgroundColor: '#1f2937',
    gridColor: '#374151',
    labelColor: '#9ca3af',
    pointSize: 12,
    cableWidth: 3,
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '400',
    selectedCable: null,
    draggingFrom: null,
    ...overrides,
  }
}

export function createSignalFlow(overrides?: Partial<SignalFlowElementConfig>): SignalFlowElementConfig {
  // Default signal flow with input -> process -> output
  const defaultBlocks: SignalFlowBlock[] = [
    { id: 'input-1', label: 'Input', x: 0, y: 1, width: 2, height: 1, type: 'input' },
    { id: 'process-1', label: 'Filter', x: 3, y: 1, width: 2, height: 1, type: 'process' },
    { id: 'output-1', label: 'Output', x: 6, y: 1, width: 2, height: 1, type: 'output' },
  ]

  const defaultConnections: SignalFlowConnection[] = [
    { id: 'conn-1', fromBlockId: 'input-1', toBlockId: 'process-1', fromPort: 'right', toPort: 'left' },
    { id: 'conn-2', fromBlockId: 'process-1', toBlockId: 'output-1', fromPort: 'right', toPort: 'left' },
  ]

  return {
    id: crypto.randomUUID(),
    type: 'signalflow',
    name: 'Signal Flow',
    x: 0,
    y: 0,
    width: 400,
    height: 150,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    gridCellSize: 40,
    gridRows: 3,
    gridColumns: 10,
    blocks: overrides?.blocks ?? defaultBlocks,
    connections: overrides?.connections ?? defaultConnections,
    showGrid: true,
    showLabels: true,
    animateSignal: false,
    inputBlockColor: '#22c55e',
    outputBlockColor: '#ef4444',
    processBlockColor: '#3b82f6',
    mixerBlockColor: '#f59e0b',
    splitterBlockColor: '#8b5cf6',
    connectionColor: '#6b7280',
    signalColor: '#22c55e',
    backgroundColor: '#1f2937',
    gridColor: '#374151',
    labelColor: '#ffffff',
    blockBorderWidth: 2,
    connectionWidth: 2,
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '500',
    selectedBlock: null,
    ...overrides,
  }
}
