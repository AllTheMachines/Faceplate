/**
 * Control element types
 * Interactive controls: Knob, Slider, Button, RangeSlider, Dropdown, Checkbox, RadioGroup, TextField
 */

import { BaseElementConfig } from './base'
import { ColorOverrides } from '../knobStyle'

// ============================================================================
// Control Element Configurations
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

  // SVG Knob Style (optional - if undefined, render default CSS knob)
  styleId?: string

  // Per-instance color overrides (only used when styleId is set)
  colorOverrides?: ColorOverrides
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

export interface SteppedKnobElementConfig extends BaseElementConfig {
  type: 'steppedknob'

  // Dimensions
  diameter: number

  // Value
  value: number
  min: number
  max: number

  // Arc Geometry
  startAngle: number
  endAngle: number

  // Stepped behavior
  stepCount: number // 12, 24, 36, 48, or 64
  showStepIndicators: boolean // Show tick marks at each step

  // Visual Style
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
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueColor: string
}

export interface CenterDetentKnobElementConfig extends BaseElementConfig {
  type: 'centerdetentknob'

  // Dimensions
  diameter: number

  // Value
  value: number
  min: number
  max: number

  // Arc Geometry
  startAngle: number
  endAngle: number

  // Center detent behavior
  snapThreshold: number // 0.05 = 5% of range, snaps when |value - 0.5| < threshold
  showCenterMark: boolean // Show visual indicator at center

  // Visual Style
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
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueColor: string
}

export interface DotIndicatorKnobElementConfig extends BaseElementConfig {
  type: 'dotindicatorknob'

  // Dimensions
  diameter: number

  // Value
  value: number
  min: number
  max: number

  // Arc Geometry
  startAngle: number
  endAngle: number

  // Dot indicator style
  dotRadius: number // Radius of indicator dot

  // Visual Style
  trackColor: string
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
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueColor: string
}

export interface BipolarSliderElementConfig extends BaseElementConfig {
  type: 'bipolarslider'

  // Orientation
  orientation: 'vertical' | 'horizontal'

  // Value
  value: number
  min: number
  max: number

  // Center position (0.5 = center, normalized 0-1)
  centerValue: number
  centerLineColor: string

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
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueColor: string
}

export interface CrossfadeSliderElementConfig extends BaseElementConfig {
  type: 'crossfadeslider'

  // Value
  value: number
  min: number
  max: number

  // A/B Labels
  labelA: string
  labelB: string
  labelColor: string
  labelFontSize: number

  // Track
  trackColor: string
  trackFillColor: string

  // Thumb
  thumbColor: string
  thumbWidth: number
  thumbHeight: number
}

export interface MultiSliderElementConfig extends BaseElementConfig {
  type: 'multislider'

  // Band configuration
  bandCount: number // Number of parallel sliders (default 7)
  bandValues: number[] // Array of values 0-1, one per band
  min: number // Minimum value (default 0)
  max: number // Maximum value (default 1)

  // Labels
  labelStyle: 'frequency' | 'index' | 'hidden'
  customLabels: string[] | null // If provided, overrides labelStyle
  labelColor: string
  labelFontSize: number

  // Link behavior (runtime hint)
  linkMode: 'always-linked' | 'modifier-linked' | 'independent'

  // Colors
  trackColor: string
  fillColor: string
  thumbColor: string

  // Layout
  bandGap: number // Pixel gap between bands (default 2)
}

export interface NotchedSliderElementConfig extends BaseElementConfig {
  type: 'notchedslider'

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

  // Notch Settings
  notchCount: number // Number of evenly spaced notches including endpoints (default 5)
  notchPositions: number[] | null // Custom positions 0-1, overrides notchCount if provided
  showNotchLabels: boolean // Show value at each notch position
  notchColor: string // Color of notch indicators

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
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueColor: string
}

export interface ArcSliderElementConfig extends BaseElementConfig {
  type: 'arcslider'

  // Dimensions
  diameter: number

  // Value
  value: number
  min: number
  max: number

  // Arc Geometry
  startAngle: number // Default 135 (bottom-left)
  endAngle: number // Default 45 (bottom-right, 270 degree sweep)
  trackWidth: number

  // Track Colors
  trackColor: string
  fillColor: string

  // Thumb
  thumbRadius: number // Circular thumb that moves along arc
  thumbColor: string

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
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueColor: string
}

// ============================================================================
// Control Element Union
// ============================================================================

export type ControlElement =
  | KnobElementConfig
  | SliderElementConfig
  | ButtonElementConfig
  | RangeSliderElementConfig
  | DropdownElementConfig
  | CheckboxElementConfig
  | RadioGroupElementConfig
  | TextFieldElementConfig
  | SteppedKnobElementConfig
  | CenterDetentKnobElementConfig
  | DotIndicatorKnobElementConfig
  | BipolarSliderElementConfig
  | CrossfadeSliderElementConfig
  | MultiSliderElementConfig
  | NotchedSliderElementConfig
  | ArcSliderElementConfig

// ============================================================================
// Type Guards
// ============================================================================

export function isKnob(element: { type: string }): element is KnobElementConfig {
  return element.type === 'knob'
}

export function isSlider(element: { type: string }): element is SliderElementConfig {
  return element.type === 'slider'
}

export function isButton(element: { type: string }): element is ButtonElementConfig {
  return element.type === 'button'
}

export function isRangeSlider(element: { type: string }): element is RangeSliderElementConfig {
  return element.type === 'rangeslider'
}

export function isDropdown(element: { type: string }): element is DropdownElementConfig {
  return element.type === 'dropdown'
}

export function isCheckbox(element: { type: string }): element is CheckboxElementConfig {
  return element.type === 'checkbox'
}

export function isRadioGroup(element: { type: string }): element is RadioGroupElementConfig {
  return element.type === 'radiogroup'
}

export function isTextField(element: { type: string }): element is TextFieldElementConfig {
  return element.type === 'textfield'
}

export function isMultiSlider(element: { type: string }): element is MultiSliderElementConfig {
  return element.type === 'multislider'
}

export function isSteppedKnob(element: { type: string }): element is SteppedKnobElementConfig {
  return element.type === 'steppedknob'
}

export function isCenterDetentKnob(element: { type: string }): element is CenterDetentKnobElementConfig {
  return element.type === 'centerdetentknob'
}

export function isDotIndicatorKnob(element: { type: string }): element is DotIndicatorKnobElementConfig {
  return element.type === 'dotindicatorknob'
}

export function isBipolarSlider(element: { type: string }): element is BipolarSliderElementConfig {
  return element.type === 'bipolarslider'
}

export function isCrossfadeSlider(element: { type: string }): element is CrossfadeSliderElementConfig {
  return element.type === 'crossfadeslider'
}

export function isNotchedSlider(element: { type: string }): element is NotchedSliderElementConfig {
  return element.type === 'notchedslider'
}

export function isArcSlider(element: { type: string }): element is ArcSliderElementConfig {
  return element.type === 'arcslider'
}

// ============================================================================
// Factory Functions
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
    fillColor: '#949494',
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
    trackFillColor: '#949494',
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
    backgroundColor: '#949494',
    textColor: '#ffffff',
    borderColor: '#6b7280',
    borderRadius: 0,
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
    fillColor: '#949494',
    thumbColor: '#ffffff',
    thumbWidth: 20,
    thumbHeight: 20,
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
    borderRadius: 0,
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
    checkColor: '#949494',
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
    radioColor: '#949494',
    borderColor: '#374151',
    backgroundColor: 'transparent',
    textColor: '#ffffff',
    spacing: 8,
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
    borderRadius: 0,
    ...overrides,
  }
}

export function createMultiSlider(overrides?: Partial<MultiSliderElementConfig>): MultiSliderElementConfig {
  const bandCount = overrides?.bandCount ?? 7
  const bandValues = overrides?.bandValues ?? Array(bandCount).fill(0.5)

  const defaults: MultiSliderElementConfig = {
    id: crypto.randomUUID(),
    type: 'multislider',
    name: 'Multi-Slider',
    x: 0,
    y: 0,
    width: 200,
    height: 120,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    bandCount,
    bandValues,
    min: 0,
    max: 1,
    labelStyle: 'index',
    customLabels: null,
    labelColor: '#888888',
    labelFontSize: 10,
    linkMode: 'independent',
    trackColor: '#374151',
    fillColor: '#949494',
    thumbColor: '#ffffff',
    bandGap: 2,
  }

  return {
    ...defaults,
    ...overrides,
    // Always use computed bandCount and bandValues
    bandCount,
    bandValues,
  }
}

export function createSteppedKnob(overrides?: Partial<SteppedKnobElementConfig>): SteppedKnobElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'steppedknob',
    name: 'Stepped Knob',
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
    stepCount: 12,
    showStepIndicators: true,
    trackColor: '#374151',
    fillColor: '#949494',
    indicatorColor: '#ffffff',
    trackWidth: 4,
    showLabel: false,
    labelText: 'Stepped',
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

export function createCenterDetentKnob(overrides?: Partial<CenterDetentKnobElementConfig>): CenterDetentKnobElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'centerdetentknob',
    name: 'Center Detent',
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
    snapThreshold: 0.05,
    showCenterMark: true,
    trackColor: '#374151',
    fillColor: '#949494',
    indicatorColor: '#ffffff',
    trackWidth: 4,
    showLabel: false,
    labelText: 'Pan',
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

export function createDotIndicatorKnob(overrides?: Partial<DotIndicatorKnobElementConfig>): DotIndicatorKnobElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'dotindicatorknob',
    name: 'Dot Indicator',
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
    dotRadius: 4,
    trackColor: '#374151',
    indicatorColor: '#ffffff',
    trackWidth: 4,
    showLabel: false,
    labelText: 'Dot',
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

export function createBipolarSlider(overrides?: Partial<BipolarSliderElementConfig>): BipolarSliderElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'bipolarslider',
    name: 'Bipolar Slider',
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
    centerValue: 0.5,
    centerLineColor: 'rgba(255, 255, 255, 0.5)',
    trackColor: '#374151',
    trackFillColor: '#949494',
    thumbColor: '#ffffff',
    thumbWidth: 20,
    thumbHeight: 20,
    showLabel: false,
    labelText: 'Pan',
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

export function createCrossfadeSlider(overrides?: Partial<CrossfadeSliderElementConfig>): CrossfadeSliderElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'crossfadeslider',
    name: 'Crossfade',
    x: 0,
    y: 0,
    width: 200,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.5,
    min: 0,
    max: 1,
    labelA: 'A',
    labelB: 'B',
    labelColor: '#888888',
    labelFontSize: 12,
    trackColor: '#374151',
    trackFillColor: '#949494',
    thumbColor: '#ffffff',
    thumbWidth: 20,
    thumbHeight: 20,
    ...overrides,
  }
}
