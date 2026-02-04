/**
 * Control element types
 * Interactive controls: Knob, Slider, Button, RangeSlider, Dropdown, Checkbox, RadioGroup, TextField
 */

import { BaseElementConfig } from './base'
import { ColorOverrides } from '../knobStyle'
import { BuiltInIcon } from '../../utils/builtInIcons'
import { ScrollbarConfig } from './containers'

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
  labelDistance: number  // Distance in pixels from element to label
  labelFontSize: number
  labelFontFamily: string
  labelFontWeight: string
  labelColor: string

  // Value Display
  showValue: boolean
  valuePosition: 'top' | 'bottom' | 'left' | 'right'
  valueDistance: number  // Distance in pixels from element to value
  valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'
  valueSuffix: string  // For custom format
  valueDecimalPlaces: number
  valueFontSize: number
  valueFontFamily: string
  valueFontWeight: string
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
  trackWidth: number

  // Thumb
  thumbColor: string
  thumbWidth: number
  thumbHeight: number

  // Label Display
  showLabel: boolean
  labelText: string
  labelPosition: 'top' | 'bottom' | 'left' | 'right'
  labelDistance: number  // Distance in pixels from element to label
  labelFontSize: number
  labelFontFamily: string
  labelFontWeight: string
  labelColor: string

  // Value Display
  showValue: boolean
  valuePosition: 'top' | 'bottom' | 'left' | 'right'
  valueDistance: number  // Distance in pixels from element to value
  valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'
  valueSuffix: string  // For custom format
  valueDecimalPlaces: number
  valueFontSize: number
  valueFontFamily: string
  valueFontWeight: string
  valueColor: string
}

export type ButtonAction = 'none' | 'navigate-window'

export interface ButtonElementConfig extends BaseElementConfig {
  type: 'button'

  // Behavior
  mode: 'momentary' | 'toggle'
  label: string
  pressed: boolean

  // Action (optional - for window navigation, etc.)
  action?: ButtonAction
  targetWindowId?: string  // Window ID to navigate to when action is 'navigate-window'

  // Text
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Colors
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: number
  borderWidth: number
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

  // Text
  fontSize: number
  fontFamily: string
  fontWeight: string

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

  // Text
  fontSize: number
  fontFamily: string
  fontWeight: string

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

  // Text
  fontSize: number
  fontFamily: string
  fontWeight: string

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
  fontWeight: string
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
  showStepIndicators: boolean // Show dots on arc track at each step position
  showStepMarks: boolean // Show tick marks outside knob edge at each step position
  stepIndicatorSize: number // Radius of indicator dots (default: trackWidth / 3)
  stepMarkLength: number // Length of tick marks in pixels (default: 6)
  stepMarkWidth: number // Stroke width of tick marks (default: trackWidth / 4)

  // Visual Style
  trackColor: string
  fillColor: string
  indicatorColor: string
  trackWidth: number

  // Label Display
  showLabel: boolean
  labelText: string
  labelPosition: 'top' | 'bottom' | 'left' | 'right'
  labelDistance: number  // Distance in pixels from element to label
  labelFontSize: number
  labelFontFamily: string
  labelFontWeight: string
  labelColor: string

  // Value Display
  showValue: boolean
  valuePosition: 'top' | 'bottom' | 'left' | 'right'
  valueDistance: number  // Distance in pixels from element to value
  valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueFontFamily: string
  valueFontWeight: string
  valueColor: string

  // SVG Style (optional - if undefined, render default CSS knob)
  styleId?: string

  // Per-instance color overrides (only used when styleId is set)
  colorOverrides?: ColorOverrides
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
  labelDistance: number  // Distance in pixels from element to label
  labelFontSize: number
  labelFontFamily: string
  labelFontWeight: string
  labelColor: string

  // Value Display
  showValue: boolean
  valuePosition: 'top' | 'bottom' | 'left' | 'right'
  valueDistance: number  // Distance in pixels from element to value
  valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueFontFamily: string
  valueFontWeight: string
  valueColor: string

  // SVG Style (optional - if undefined, render default CSS knob)
  styleId?: string

  // Per-instance color overrides (only used when styleId is set)
  colorOverrides?: ColorOverrides
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
  labelDistance: number  // Distance in pixels from element to label
  labelFontSize: number
  labelFontFamily: string
  labelFontWeight: string
  labelColor: string

  // Value Display
  showValue: boolean
  valuePosition: 'top' | 'bottom' | 'left' | 'right'
  valueDistance: number  // Distance in pixels from element to value
  valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueFontFamily: string
  valueFontWeight: string
  valueColor: string

  // SVG Style (optional - if undefined, render default CSS knob)
  styleId?: string

  // Per-instance color overrides (only used when styleId is set)
  // Note: 'indicator' layer contains the dot - use 'indicator' key for dot color override
  colorOverrides?: ColorOverrides
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

  // Center Snap
  centerSnap: boolean  // Enable/disable snap to center
  centerSnapThreshold: number  // Threshold in normalized value (default 0.02 = 2%)

  // Track
  trackColor: string
  trackFillColor: string

  // Zone Colors (replaces single trackFillColor for zones)
  negativeFillColor: string  // Color when value < centerValue
  positiveFillColor: string  // Color when value >= centerValue

  // Thumb
  thumbColor: string
  thumbWidth: number
  thumbHeight: number

  // Label Display
  showLabel: boolean
  labelText: string
  labelPosition: 'top' | 'bottom' | 'left' | 'right'
  labelDistance: number  // Distance in pixels from element to label
  labelFontSize: number
  labelFontFamily: string
  labelFontWeight: string
  labelColor: string

  // Value Display
  showValue: boolean
  valuePosition: 'top' | 'bottom' | 'left' | 'right'
  valueDistance: number  // Distance in pixels from element to value
  valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueFontFamily: string
  valueFontWeight: string
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
  labelFontFamily: string
  labelFontWeight: string

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
  labelFontFamily: string
  labelFontWeight: string

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
  notchLength: number // Length of tick lines extending from track (default 12)
  notchLabelFontSize: number // Font size for notch labels (default 10)

  // Label Display
  showLabel: boolean
  labelText: string
  labelPosition: 'top' | 'bottom' | 'left' | 'right'
  labelDistance: number  // Distance in pixels from element to label
  labelFontSize: number
  labelFontFamily: string
  labelFontWeight: string
  labelColor: string

  // Value Display
  showValue: boolean
  valuePosition: 'top' | 'bottom' | 'left' | 'right'
  valueDistance: number  // Distance in pixels from element to value
  valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueFontFamily: string
  valueFontWeight: string
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
  labelDistance: number  // Distance in pixels from element to label
  labelFontSize: number
  labelFontFamily: string
  labelFontWeight: string
  labelColor: string

  // Value Display
  showValue: boolean
  valuePosition: 'top' | 'bottom' | 'left' | 'right'
  valueDistance: number  // Distance in pixels from element to value
  valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'
  valueSuffix: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueFontFamily: string
  valueFontWeight: string
  valueColor: string
}

// ============================================================================
// Switch Element Configurations
// ============================================================================

export interface RockerSwitchElementConfig extends BaseElementConfig {
  type: 'rockerswitch'

  // Position: 0=down, 1=center, 2=up
  position: 0 | 1 | 2

  // Behavior mode
  mode: 'spring-to-center' | 'latch-all-positions'

  // Labels
  showLabels: boolean
  upLabel: string
  downLabel: string
  labelFontSize: number
  labelFontFamily: string
  labelFontWeight: string

  // Colors
  backgroundColor: string
  switchColor: string
  borderColor: string
  labelColor: string
}

export interface RotarySwitchElementConfig extends BaseElementConfig {
  type: 'rotaryswitch'

  // Position configuration
  positionCount: number // 2-12 positions
  currentPosition: number // 0 to positionCount-1

  // Labels (null = show numbers 1-N)
  positionLabels: string[] | null

  // Geometry
  rotationAngle: number // Total rotation range in degrees (default 270)

  // Label layout
  labelLayout: 'radial' | 'legend' // radial for 2-6 positions, legend for 7-12

  // Colors
  backgroundColor: string
  pointerColor: string
  labelColor: string
  labelFontSize: number
  labelFontFamily: string
  labelFontWeight: string
  borderColor: string
}

/**
 * Configuration for individual segment in SegmentButton
 */
export interface SegmentConfig {
  displayMode: 'icon' | 'text' | 'icon-text'
  iconSource?: 'builtin' | 'asset'
  builtInIcon?: string // Icon name (e.g., 'play', 'pause', 'stop')
  assetId?: string
  text?: string
}

export interface SegmentButtonElementConfig extends BaseElementConfig {
  type: 'segmentbutton'

  // Segment configuration
  segmentCount: number // 2-8 segments
  segments: SegmentConfig[]

  // Selection
  selectionMode: 'single' | 'multi'
  selectedIndices: number[]

  // Layout
  orientation: 'horizontal' | 'vertical'

  // Text
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Colors
  backgroundColor: string
  selectedColor: string
  textColor: string
  selectedTextColor: string
  borderColor: string

  // Icon Style
  iconSize: number // Size of icons in pixels (default 16)
  iconColor: string // Icon color for unselected segments (default '#888888')
  selectedIconColor: string // Icon color for selected segments (default '#ffffff')
}

// ============================================================================
// Button Element Configurations
// ============================================================================

export interface IconButtonElementConfig extends BaseElementConfig {
  type: 'iconbutton'

  // Icon source
  iconSource: 'builtin' | 'asset'
  builtInIcon?: BuiltInIcon // When iconSource === 'builtin'
  assetId?: string // When iconSource === 'asset'

  // Behavior
  mode: 'momentary' | 'toggle'
  pressed: boolean

  // Colors
  backgroundColor: string
  iconColor: string
  borderColor: string
  borderRadius: number
}

export interface ToggleSwitchElementConfig extends BaseElementConfig {
  type: 'toggleswitch'

  // State
  isOn: boolean

  // Track colors
  onColor: string
  offColor: string

  // Thumb
  thumbColor: string
  borderColor: string

  // Labels
  showLabels: boolean
  onLabel: string
  offLabel: string
  labelFontSize: number
  labelFontFamily: string
  labelFontWeight: string
  labelColor: string
}

export interface PowerButtonElementConfig extends BaseElementConfig {
  type: 'powerbutton'

  // State
  isOn: boolean

  // LED indicator
  ledPosition: 'top' | 'bottom' | 'left' | 'right' | 'center'
  ledSize: number
  ledOnColor: string
  ledOffColor: string

  // Label
  label: string
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Colors
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: number
}

// ============================================================================
// Navigation Element Configurations
// ============================================================================

/**
 * MenuItem for MenuButton
 */
export interface MenuItem {
  id: string
  label: string
  disabled?: boolean
  divider?: boolean
}

export interface MultiSelectDropdownElementConfig extends BaseElementConfig, ScrollbarConfig {
  type: 'multiselectdropdown'

  // Options
  options: string[]
  selectedIndices: number[]

  // Selection limit
  maxSelections: number // 0 = unlimited

  // Text
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Visual style
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: number

  // Dropdown
  dropdownMaxHeight: number // Max height of dropdown menu in pixels
}

export interface ComboBoxElementConfig extends BaseElementConfig, ScrollbarConfig {
  type: 'combobox'

  // Options
  options: string[]
  selectedValue: string
  placeholder: string

  // Text
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Visual style
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: number

  // Dropdown
  dropdownMaxHeight: number // Max height of dropdown menu in pixels
}

export interface MenuButtonElementConfig extends BaseElementConfig {
  type: 'menubutton'

  // Button label
  label: string

  // Menu items
  menuItems: MenuItem[]

  // Text
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Visual style
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: number
}

export interface StepperElementConfig extends BaseElementConfig {
  type: 'stepper'

  // Value (for JUCE parameter binding)
  value: number
  min: number
  max: number
  step: number

  // Text
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Visual style
  buttonColor: string
  buttonHoverColor: string
  textColor: string
  backgroundColor: string
  borderColor: string
  borderRadius: number

  // Display
  showValue: boolean
  valueFormat: 'numeric' | 'custom'
  valueSuffix: string
  decimalPlaces: number

  // Layout
  orientation: 'horizontal' | 'vertical'
  buttonSize: number // Size of +/- buttons in px
}

export interface BreadcrumbItem {
  id: string
  label: string
}

export interface BreadcrumbElementConfig extends BaseElementConfig {
  type: 'breadcrumb'

  // Path items
  items: BreadcrumbItem[]

  // Separator
  separator: string // Default '/'

  // Visual style
  linkColor: string
  currentColor: string
  separatorColor: string
  hoverColor: string
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Layout
  maxVisibleItems: number // 0 = show all, >0 = truncate with ellipsis
}

/**
 * Configuration for individual tab in Tab Bar
 */
export interface TabConfig {
  id: string
  label?: string
  icon?: BuiltInIcon
  showLabel: boolean
  showIcon: boolean
}

export interface TabBarElementConfig extends BaseElementConfig {
  type: 'tabbar'

  // Tabs
  tabs: TabConfig[]
  activeTabIndex: number

  // Layout
  orientation: 'horizontal' | 'vertical'
  tabHeight: number

  // Text
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Visual
  indicatorStyle: 'background' | 'underline' | 'accent-bar'
  indicatorColor: string
  backgroundColor: string
  textColor: string
  activeTextColor: string
  borderColor: string
}

/**
 * Tag for Tag Selector
 */
export interface Tag {
  id: string
  label: string
}

export interface TagSelectorElementConfig extends BaseElementConfig, ScrollbarConfig {
  type: 'tagselector'

  // Tags
  availableTags: Tag[]
  selectedTags: Tag[]

  // Input
  showInput: boolean
  inputPlaceholder: string
  inputBackgroundColor: string
  inputTextColor: string
  inputBorderColor: string

  // Text
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Chips
  chipBackgroundColor: string
  chipTextColor: string
  chipRemoveColor: string
  chipBorderRadius: number

  // Dropdown
  dropdownBackgroundColor: string
  dropdownTextColor: string
  dropdownHoverColor: string
}

export interface TreeNode {
  id: string
  name: string
  children?: TreeNode[]
}

export interface TreeViewElementConfig extends BaseElementConfig, ScrollbarConfig {
  type: 'treeview'

  // Tree data (designer defines, JUCE can modify at runtime)
  data: TreeNode[]

  // Selection
  selectedId?: string

  // Expansion state
  expandedIds: string[]

  // Layout
  rowHeight: number
  indent: number // Pixels to indent per level

  // Visual style
  backgroundColor: string
  textColor: string
  selectedBackgroundColor: string
  selectedTextColor: string
  hoverBackgroundColor: string
  fontSize: number
  fontFamily: string
  fontWeight: string

  // Interaction (always true in designer mode)
  disableEdit: boolean
  disableDrag: boolean
}

export interface AsciiSliderElementConfig extends BaseElementConfig {
  type: 'asciislider'

  // Value
  value: number // 0-1 normalized
  min: number
  max: number

  // Bar Characters
  barWidth: number // Number of characters for the bar (default: 20)
  filledChar: string // Character for filled portion (default: '#')
  emptyChar: string // Character for empty portion (default: '-')
  leftBracket: string // Left bracket character (default: '[')
  rightBracket: string // Right bracket character (default: ']')

  // Label
  showLabel: boolean // Show label text
  labelText: string // Label text
  labelPosition: 'left' | 'right' // Position of label relative to slider

  // Value Display
  showMinMax: boolean // Show "0%" and "100%" labels
  showValue: boolean // Show current value
  valuePosition: 'left' | 'right' | 'above' | 'below' | 'inside'
  valueFormat: 'percentage' | 'numeric' | 'custom'
  valueSuffix: string // For custom format
  valueDecimalPlaces: number
  minLabel: string // Custom min label (default: '0%')
  maxLabel: string // Custom max label (default: '100%')

  // Typography
  fontSize: number
  fontFamily: string
  fontWeight: string
  textColor: string
  lineHeight: number

  // Container
  backgroundColor: string
  padding: number
  borderRadius: number
  borderWidth: number
  borderColor: string

  // Alignment
  textAlign: 'left' | 'center' | 'right'

  // Interaction
  selectable: boolean // Allow text selection
  dragSensitivity: number // Pixels per full range (default: 100)
}

export interface AsciiButtonElementConfig extends BaseElementConfig {
  type: 'asciibutton'

  // State
  pressed: boolean
  mode: 'momentary' | 'toggle' // Momentary = only pressed while clicking, toggle = click to toggle

  // ASCII Art for each state (multi-line)
  normalArt: string
  pressedArt: string

  // Typography
  fontSize: number
  fontFamily: string
  fontWeight: string
  textColor: string
  pressedTextColor: string
  lineHeight: number

  // Container
  backgroundColor: string
  pressedBackgroundColor: string
  padding: number
  borderRadius: number
  borderWidth: number
  borderColor: string

  // Alignment
  textAlign: 'left' | 'center' | 'right'

  // Interaction
  selectable: boolean // Allow text selection
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
  | AsciiSliderElementConfig
  | AsciiButtonElementConfig
  | RockerSwitchElementConfig
  | RotarySwitchElementConfig
  | SegmentButtonElementConfig
  | IconButtonElementConfig
  | ToggleSwitchElementConfig
  | PowerButtonElementConfig
  | MultiSelectDropdownElementConfig
  | ComboBoxElementConfig
  | MenuButtonElementConfig
  | StepperElementConfig
  | BreadcrumbElementConfig
  | TabBarElementConfig
  | TagSelectorElementConfig
  | TreeViewElementConfig

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

export function isAsciiSlider(element: { type: string }): element is AsciiSliderElementConfig {
  return element.type === 'asciislider'
}

export function isAsciiButton(element: { type: string }): element is AsciiButtonElementConfig {
  return element.type === 'asciibutton'
}

export function isRockerSwitch(element: { type: string }): element is RockerSwitchElementConfig {
  return element.type === 'rockerswitch'
}

export function isRotarySwitch(element: { type: string }): element is RotarySwitchElementConfig {
  return element.type === 'rotaryswitch'
}

export function isSegmentButton(element: { type: string }): element is SegmentButtonElementConfig {
  return element.type === 'segmentbutton'
}

export function isIconButton(element: { type: string }): element is IconButtonElementConfig {
  return element.type === 'iconbutton'
}

export function isToggleSwitch(element: { type: string }): element is ToggleSwitchElementConfig {
  return element.type === 'toggleswitch'
}

export function isPowerButton(element: { type: string }): element is PowerButtonElementConfig {
  return element.type === 'powerbutton'
}

export function isMultiSelectDropdown(element: { type: string }): element is MultiSelectDropdownElementConfig {
  return element.type === 'multiselectdropdown'
}

export function isComboBox(element: { type: string }): element is ComboBoxElementConfig {
  return element.type === 'combobox'
}

export function isMenuButton(element: { type: string }): element is MenuButtonElementConfig {
  return element.type === 'menubutton'
}

export function isStepper(element: { type: string }): element is StepperElementConfig {
  return element.type === 'stepper'
}

export function isBreadcrumb(element: { type: string }): element is BreadcrumbElementConfig {
  return element.type === 'breadcrumb'
}

export function isTabBar(element: { type: string }): element is TabBarElementConfig {
  return element.type === 'tabbar'
}

export function isTagSelector(element: { type: string }): element is TagSelectorElementConfig {
  return element.type === 'tagselector'
}

export function isTreeView(element: { type: string }): element is TreeViewElementConfig {
  return element.type === 'treeview'
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
    labelDistance: 4,
    labelFontSize: 12,
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    labelColor: '#ffffff',
    showValue: false,
    valuePosition: 'top',
    valueDistance: 4,
    valueFormat: 'numeric',
    valueSuffix: '',
    valueDecimalPlaces: 2,
    valueFontSize: 12,
    valueFontFamily: 'Inter, system-ui, sans-serif',
    valueFontWeight: '400',
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
    trackWidth: 6,
    thumbColor: '#ffffff',
    thumbWidth: 20,
    thumbHeight: 20,
    showLabel: false,
    labelText: 'Slider',
    labelPosition: 'bottom',
    labelDistance: 4,
    labelFontSize: 12,
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    labelColor: '#ffffff',
    showValue: false,
    valuePosition: 'top',
    valueDistance: 4,
    valueFormat: 'numeric',
    valueSuffix: '',
    valueDecimalPlaces: 2,
    valueFontSize: 12,
    valueFontFamily: 'Inter, system-ui, sans-serif',
    valueFontWeight: '400',
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
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '500',
    backgroundColor: '#949494',
    textColor: '#ffffff',
    borderColor: '#6b7280',
    borderRadius: 0,
    borderWidth: 1,
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
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '400',
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
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '400',
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
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '400',
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
    fontWeight: '400',
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
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
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
    showStepMarks: false,
    stepIndicatorSize: 1.3,
    stepMarkLength: 6,
    stepMarkWidth: 1,
    trackColor: '#374151',
    fillColor: '#949494',
    indicatorColor: '#ffffff',
    trackWidth: 4,
    showLabel: false,
    labelText: 'Stepped',
    labelPosition: 'bottom',
    labelDistance: 4,
    labelFontSize: 12,
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    labelColor: '#ffffff',
    showValue: false,
    valuePosition: 'top',
    valueDistance: 4,
    valueFormat: 'numeric',
    valueSuffix: '',
    valueDecimalPlaces: 2,
    valueFontSize: 12,
    valueFontFamily: 'Inter, system-ui, sans-serif',
    valueFontWeight: '400',
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
    labelDistance: 4,
    labelFontSize: 12,
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    labelColor: '#ffffff',
    showValue: false,
    valuePosition: 'top',
    valueDistance: 4,
    valueFormat: 'numeric',
    valueSuffix: '',
    valueDecimalPlaces: 2,
    valueFontSize: 12,
    valueFontFamily: 'Inter, system-ui, sans-serif',
    valueFontWeight: '400',
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
    labelDistance: 4,
    labelFontSize: 12,
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    labelColor: '#ffffff',
    showValue: false,
    valuePosition: 'top',
    valueDistance: 4,
    valueFormat: 'numeric',
    valueSuffix: '',
    valueDecimalPlaces: 2,
    valueFontSize: 12,
    valueFontFamily: 'Inter, system-ui, sans-serif',
    valueFontWeight: '400',
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
    centerSnap: false,
    centerSnapThreshold: 0.02,
    trackColor: '#374151',
    trackFillColor: '#949494',
    negativeFillColor: '#ef4444',  // Red-ish for negative
    positiveFillColor: '#22c55e',  // Green-ish for positive
    thumbColor: '#ffffff',
    thumbWidth: 20,
    thumbHeight: 20,
    showLabel: false,
    labelText: 'Pan',
    labelPosition: 'bottom',
    labelDistance: 4,
    labelFontSize: 12,
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    labelColor: '#ffffff',
    showValue: false,
    valuePosition: 'top',
    valueDistance: 4,
    valueFormat: 'numeric',
    valueSuffix: '',
    valueDecimalPlaces: 2,
    valueFontSize: 12,
    valueFontFamily: 'Inter, system-ui, sans-serif',
    valueFontWeight: '400',
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
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    trackColor: '#374151',
    trackFillColor: '#949494',
    thumbColor: '#ffffff',
    thumbWidth: 20,
    thumbHeight: 20,
    ...overrides,
  }
}

export function createNotchedSlider(overrides?: Partial<NotchedSliderElementConfig>): NotchedSliderElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'notchedslider',
    name: 'Notched Slider',
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
    notchCount: 5,
    notchPositions: null,
    showNotchLabels: false,
    notchColor: 'rgba(255, 255, 255, 0.5)',
    notchLength: 12,
    notchLabelFontSize: 10,
    showLabel: false,
    labelText: 'Notched',
    labelPosition: 'bottom',
    labelDistance: 4,
    labelFontSize: 12,
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    labelColor: '#ffffff',
    showValue: false,
    valuePosition: 'top',
    valueDistance: 4,
    valueFormat: 'numeric',
    valueSuffix: '',
    valueDecimalPlaces: 2,
    valueFontSize: 12,
    valueFontFamily: 'Inter, system-ui, sans-serif',
    valueFontWeight: '400',
    valueColor: '#a0a0a0',
    ...overrides,
  }
}

export function createArcSlider(overrides?: Partial<ArcSliderElementConfig>): ArcSliderElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'arcslider',
    name: 'Arc Slider',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    diameter: 100,
    value: 0.5,
    min: 0,
    max: 1,
    startAngle: 135,
    endAngle: 45,
    trackWidth: 6,
    trackColor: '#374151',
    fillColor: '#949494',
    thumbRadius: 8,
    thumbColor: '#ffffff',
    showLabel: false,
    labelText: 'Arc',
    labelPosition: 'bottom',
    labelDistance: 8,
    labelFontSize: 12,
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    labelColor: '#ffffff',
    showValue: false,
    valuePosition: 'top',
    valueDistance: 8,
    valueFormat: 'numeric',
    valueSuffix: '',
    valueDecimalPlaces: 2,
    valueFontSize: 12,
    valueFontFamily: 'Inter, system-ui, sans-serif',
    valueFontWeight: '400',
    valueColor: '#a0a0a0',
    ...overrides,
  }
}

export function createAsciiSlider(overrides?: Partial<AsciiSliderElementConfig>): AsciiSliderElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'asciislider',
    name: 'ASCII Slider',
    x: 0,
    y: 0,
    width: 280,
    height: 24,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0.5,
    min: 0,
    max: 100,
    barWidth: 20,
    filledChar: '█',
    emptyChar: '░',
    leftBracket: '',
    rightBracket: '',
    showLabel: false,
    labelText: 'Label',
    labelPosition: 'left',
    showMinMax: false,
    showValue: true,
    valuePosition: 'right',
    valueFormat: 'percentage',
    valueSuffix: '',
    valueDecimalPlaces: 0,
    minLabel: '0%',
    maxLabel: '100%',
    fontSize: 14,
    fontFamily: 'Courier New, Consolas, monospace',
    fontWeight: '400',
    textColor: '#00ff00',
    lineHeight: 1.0,
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#374151',
    textAlign: 'left',
    selectable: false,
    dragSensitivity: 100,  // 100px vertical drag = full range
    ...overrides,
  }
}

export function createAsciiButton(overrides?: Partial<AsciiButtonElementConfig>): AsciiButtonElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'asciibutton',
    name: 'ASCII Button',
    x: 0,
    y: 0,
    width: 100,
    height: 60,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    pressed: false,
    mode: 'toggle',
    normalArt: '┌──────┐\n│ PLAY │\n└──────┘',
    pressedArt: '╔══════╗\n║ PLAY ║\n╚══════╝',
    fontSize: 14,
    fontFamily: 'Courier New, Consolas, monospace',
    fontWeight: '400',
    textColor: '#00ff00',
    pressedTextColor: '#00ffff',
    lineHeight: 1.0,
    backgroundColor: 'transparent',
    pressedBackgroundColor: 'transparent',
    padding: 4,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#374151',
    textAlign: 'center',
    selectable: false,
    ...overrides,
  }
}

export function createRockerSwitch(overrides?: Partial<RockerSwitchElementConfig>): RockerSwitchElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'rockerswitch',
    name: 'Rocker Switch',
    x: 0,
    y: 0,
    width: 40,
    height: 80,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    position: 1, // Center position
    mode: 'latch-all-positions',
    showLabels: true,
    upLabel: 'UP',
    downLabel: 'DN',
    labelFontSize: 10,
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    backgroundColor: '#374151',
    switchColor: '#949494',
    borderColor: '#6b7280',
    labelColor: '#888888',
    ...overrides,
  }
}

export function createRotarySwitch(overrides?: Partial<RotarySwitchElementConfig>): RotarySwitchElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'rotaryswitch',
    name: 'Rotary Switch',
    x: 0,
    y: 0,
    width: 80,
    height: 80,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    positionCount: 4,
    currentPosition: 0,
    positionLabels: null, // Shows 1-4
    rotationAngle: 270,
    labelLayout: 'radial',
    backgroundColor: '#374151',
    pointerColor: '#ffffff',
    labelColor: '#888888',
    labelFontSize: 10,
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    borderColor: '#6b7280',
    ...overrides,
  }
}

export function createSegmentButton(overrides?: Partial<SegmentButtonElementConfig>): SegmentButtonElementConfig {
  const segmentCount = overrides?.segmentCount ?? 3
  const segments: SegmentConfig[] = overrides?.segments ?? [
    { displayMode: 'text', text: 'A' },
    { displayMode: 'text', text: 'B' },
    { displayMode: 'text', text: 'C' },
  ]

  return {
    id: crypto.randomUUID(),
    type: 'segmentbutton',
    name: 'Segment Button',
    x: 0,
    y: 0,
    width: 180,
    height: 32,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    segmentCount,
    segments,
    selectionMode: 'single',
    selectedIndices: [0],
    orientation: 'horizontal',
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '500',
    backgroundColor: '#374151',
    selectedColor: '#949494',
    textColor: '#888888',
    selectedTextColor: '#ffffff',
    borderColor: '#6b7280',
    iconSize: 16,
    iconColor: '#888888',
    selectedIconColor: '#ffffff',
    ...overrides,
  }
}

export function createIconButton(overrides?: Partial<IconButtonElementConfig>): IconButtonElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'iconbutton',
    name: 'Icon Button',
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    iconSource: 'builtin',
    builtInIcon: BuiltInIcon.Play,
    mode: 'momentary',
    pressed: false,
    backgroundColor: '#374151',
    iconColor: '#ffffff',
    borderColor: '#6b7280',
    borderRadius: 0,
    ...overrides,
  }
}

export function createToggleSwitch(overrides?: Partial<ToggleSwitchElementConfig>): ToggleSwitchElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'toggleswitch',
    name: 'Toggle Switch',
    x: 0,
    y: 0,
    width: 50,
    height: 26,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    isOn: false,
    onColor: '#22c55e',
    offColor: '#374151',
    thumbColor: '#ffffff',
    borderColor: '#6b7280',
    showLabels: false,
    onLabel: 'ON',
    offLabel: 'OFF',
    labelFontSize: 10,
    labelFontFamily: 'Inter, system-ui, sans-serif',
    labelFontWeight: '400',
    labelColor: '#888888',
    ...overrides,
  }
}

export function createPowerButton(overrides?: Partial<PowerButtonElementConfig>): PowerButtonElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'powerbutton',
    name: 'Power Button',
    x: 0,
    y: 0,
    width: 60,
    height: 60,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    isOn: false,
    ledPosition: 'top',
    ledSize: 6,
    ledOnColor: '#22c55e',
    ledOffColor: '#374151',
    label: 'POWER',
    fontSize: 10,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '600',
    backgroundColor: '#374151',
    textColor: '#ffffff',
    borderColor: '#6b7280',
    borderRadius: 0,
    ...overrides,
  }
}

export function createStepper(overrides?: Partial<StepperElementConfig>): StepperElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'stepper',
    name: 'Stepper',
    x: 0,
    y: 0,
    width: 120,
    height: 32,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    value: 0,
    min: 0,
    max: 100,
    step: 1,
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '400',
    buttonColor: '#374151',
    buttonHoverColor: '#4b5563',
    textColor: '#ffffff',
    backgroundColor: '#1f2937',
    borderColor: '#6b7280',
    borderRadius: 0,
    showValue: true,
    valueFormat: 'numeric',
    valueSuffix: '',
    decimalPlaces: 0,
    orientation: 'horizontal',
    buttonSize: 24,
    ...overrides,
  }
}

export function createBreadcrumb(overrides?: Partial<BreadcrumbElementConfig>): BreadcrumbElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'breadcrumb',
    name: 'Breadcrumb',
    x: 0,
    y: 0,
    width: 200,
    height: 24,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    items: [
      { id: '1', label: 'Root' },
      { id: '2', label: 'Folder' },
      { id: '3', label: 'Current' },
    ],
    separator: '/',
    linkColor: '#3b82f6',
    currentColor: '#ffffff',
    separatorColor: '#6b7280',
    hoverColor: '#60a5fa',
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '400',
    maxVisibleItems: 0,
    ...overrides,
  }
}

export function createTabBar(overrides?: Partial<TabBarElementConfig>): TabBarElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'tabbar',
    name: 'Tab Bar',
    x: 0,
    y: 0,
    width: 300,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    tabs: [
      { id: 'tab1', label: 'Tab 1', showLabel: true, showIcon: false },
      { id: 'tab2', label: 'Tab 2', showLabel: true, showIcon: false },
      { id: 'tab3', label: 'Tab 3', showLabel: true, showIcon: false },
    ],
    activeTabIndex: 0,
    orientation: 'horizontal',
    tabHeight: 40,
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '500',
    indicatorStyle: 'background',
    indicatorColor: '#949494',
    backgroundColor: '#1f2937',
    textColor: '#888888',
    activeTextColor: '#ffffff',
    borderColor: '#374151',
    ...overrides,
  }
}

export function createTagSelector(overrides?: Partial<TagSelectorElementConfig>): TagSelectorElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'tagselector',
    name: 'Tag Selector',
    x: 0,
    y: 0,
    width: 300,
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    availableTags: [
      { id: 'tag1', label: 'Bass' },
      { id: 'tag2', label: 'Lead' },
      { id: 'tag3', label: 'Pad' },
      { id: 'tag4', label: 'Keys' },
      { id: 'tag5', label: 'Drums' },
    ],
    selectedTags: [],
    showInput: true,
    inputPlaceholder: 'Add tag...',
    inputBackgroundColor: '#1f2937',
    inputTextColor: '#ffffff',
    inputBorderColor: '#374151',
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '400',
    chipBackgroundColor: '#374151',
    chipTextColor: '#ffffff',
    chipRemoveColor: '#ef4444',
    chipBorderRadius: 4,
    dropdownBackgroundColor: '#1f2937',
    dropdownTextColor: '#ffffff',
    dropdownHoverColor: '#374151',
    ...overrides,
  }
}
export function createTreeView(overrides?: Partial<TreeViewElementConfig>): TreeViewElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'treeview',
    name: 'Tree View',
    x: 0,
    y: 0,
    width: 250,
    height: 300,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    data: [
      {
        id: 'presets',
        name: 'Presets',
        children: [
          {
            id: 'bass',
            name: 'Bass',
            children: [
              { id: 'bass-1', name: 'Wobble Bass' },
              { id: 'bass-2', name: 'Sub Bass' },
              { id: 'bass-3', name: 'Pluck Bass' },
            ],
          },
          {
            id: 'lead',
            name: 'Lead',
            children: [
              { id: 'lead-1', name: 'Synth Lead' },
              { id: 'lead-2', name: 'Square Lead' },
            ],
          },
          {
            id: 'pad',
            name: 'Pad',
            children: [
              { id: 'pad-1', name: 'Warm Pad' },
              { id: 'pad-2', name: 'Dark Pad' },
            ],
          },
        ],
      },
      {
        id: 'favorites',
        name: 'Favorites',
        children: [],
      },
    ],
    selectedId: undefined,
    expandedIds: ['presets'],
    rowHeight: 28,
    indent: 20,
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    selectedBackgroundColor: '#374151',
    selectedTextColor: '#ffffff',
    hoverBackgroundColor: '#2d3748',
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '400',
    disableEdit: true,
    disableDrag: true,
    ...overrides,
  }
}

export function createMultiSelectDropdown(overrides?: Partial<MultiSelectDropdownElementConfig>): MultiSelectDropdownElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'multiselectdropdown',
    name: 'Multi-Select Dropdown',
    x: 0,
    y: 0,
    width: 180,
    height: 32,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    selectedIndices: [],
    maxSelections: 0,
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '400',
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    borderColor: '#374151',
    borderRadius: 0,
    dropdownMaxHeight: 200,
    ...overrides,
  }
}

export function createComboBox(overrides?: Partial<ComboBoxElementConfig>): ComboBoxElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'combobox',
    name: 'Combo Box',
    x: 0,
    y: 0,
    width: 180,
    height: 32,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    selectedValue: '',
    placeholder: 'Type or select...',
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '400',
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    borderColor: '#374151',
    borderRadius: 0,
    dropdownMaxHeight: 200,
    ...overrides,
  }
}

export function createMenuButton(overrides?: Partial<MenuButtonElementConfig>): MenuButtonElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'menubutton',
    name: 'Menu Button',
    x: 0,
    y: 0,
    width: 100,
    height: 32,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    label: 'Menu',
    menuItems: [
      { id: '1', label: 'Item 1' },
      { id: '2', label: 'Item 2' },
      { id: '3', label: 'Item 3', divider: true },
      { id: '4', label: 'Item 4' },
    ],
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '500',
    backgroundColor: '#374151',
    textColor: '#ffffff',
    borderColor: '#6b7280',
    borderRadius: 0,
    ...overrides,
  }
}
