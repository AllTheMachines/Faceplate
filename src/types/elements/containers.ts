/**
 * Container element types
 * Structural containers: Panel, Frame, GroupBox, Collapsible
 */

import { BaseElementConfig } from './base'

// ============================================================================
// Container Element Configurations
// ============================================================================

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

export interface TooltipElementConfig extends BaseElementConfig {
  type: 'tooltip'

  // Trigger & timing
  hoverDelay: number  // 300-500ms recommended (default: 400ms)

  // Content (rich content support - HTML sanitized with DOMPurify)
  content: string  // HTML string

  // Position
  position: 'top' | 'bottom' | 'left' | 'right'
  showArrow: boolean
  offset: number  // Distance from trigger element (default: 8px)

  // Styling
  backgroundColor: string
  textColor: string
  fontSize: number
  padding: number
  borderRadius: number
  maxWidth: number
}

export interface WindowChromeElementConfig extends BaseElementConfig {
  type: 'windowchrome'

  // Title bar
  titleText: string
  showTitle: boolean
  titleFontSize: number
  titleColor: string

  // Button style
  buttonStyle: 'macos' | 'windows' | 'neutral'

  // Button visibility
  showCloseButton: boolean
  showMinimizeButton: boolean
  showMaximizeButton: boolean

  // Appearance
  backgroundColor: string
  height: number
}

export interface HorizontalSpacerElementConfig extends BaseElementConfig {
  type: 'horizontalspacer'

  // Sizing mode
  sizingMode: 'fixed' | 'flexible'

  // Fixed mode properties
  fixedWidth: number

  // Flexible mode properties
  flexGrow: number
  minWidth: number
  maxWidth: number

  // Visual indicator
  showIndicator: boolean
  indicatorColor: string
}

export interface VerticalSpacerElementConfig extends BaseElementConfig {
  type: 'verticalspacer'

  // Sizing mode
  sizingMode: 'fixed' | 'flexible'

  // Fixed mode properties
  fixedHeight: number

  // Flexible mode properties
  flexGrow: number
  minHeight: number
  maxHeight: number

  // Visual indicator
  showIndicator: boolean
  indicatorColor: string
}

// ============================================================================
// Container Element Union
// ============================================================================

export type ContainerElement =
  | PanelElementConfig
  | FrameElementConfig
  | GroupBoxElementConfig
  | CollapsibleContainerElementConfig
  | TooltipElementConfig
  | WindowChromeElementConfig
  | HorizontalSpacerElementConfig
  | VerticalSpacerElementConfig

// ============================================================================
// Type Guards
// ============================================================================

export function isPanel(element: { type: string }): element is PanelElementConfig {
  return element.type === 'panel'
}

export function isFrame(element: { type: string }): element is FrameElementConfig {
  return element.type === 'frame'
}

export function isGroupBox(element: { type: string }): element is GroupBoxElementConfig {
  return element.type === 'groupbox'
}

export function isCollapsible(element: { type: string }): element is CollapsibleContainerElementConfig {
  return element.type === 'collapsible'
}

export function isTooltip(element: { type: string }): element is TooltipElementConfig {
  return element.type === 'tooltip'
}

export function isWindowChrome(element: { type: string }): element is WindowChromeElementConfig {
  return element.type === 'windowchrome'
}

export function isHorizontalSpacer(element: { type: string }): element is HorizontalSpacerElementConfig {
  return element.type === 'horizontalspacer'
}

export function isVerticalSpacer(element: { type: string }): element is VerticalSpacerElementConfig {
  return element.type === 'verticalspacer'
}

// ============================================================================
// Factory Functions
// ============================================================================

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
    borderRadius: 0,
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
    borderRadius: 0,
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
    borderRadius: 0,
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
    borderRadius: 0,
    ...overrides,
  }
}

export function createTooltip(overrides?: Partial<TooltipElementConfig>): TooltipElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'tooltip',
    name: 'Tooltip',
    x: 0,
    y: 0,
    width: 100,   // Trigger area width
    height: 30,   // Trigger area height
    rotation: 0,
    zIndex: 1000, // High z-index for overlay
    locked: false,
    visible: true,
    hoverDelay: 400,
    content: '<p>Tooltip text</p>',
    position: 'top',
    showArrow: true,
    offset: 8,
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    fontSize: 12,
    padding: 8,
    borderRadius: 4,
    maxWidth: 200,
    ...overrides,
  }
}

export function createWindowChrome(overrides?: Partial<WindowChromeElementConfig>): WindowChromeElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'windowchrome',
    name: 'Window Chrome',
    x: 0,
    y: 0,
    width: 400,
    height: 32,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    titleText: 'Plugin Window',
    showTitle: true,
    titleFontSize: 13,
    titleColor: '#ffffff',
    buttonStyle: 'macos',
    showCloseButton: true,
    showMinimizeButton: true,
    showMaximizeButton: true,
    backgroundColor: '#1f2937',
    ...overrides,
  }
}

export function createHorizontalSpacer(overrides?: Partial<HorizontalSpacerElementConfig>): HorizontalSpacerElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'horizontalspacer',
    name: 'Horizontal Spacer',
    x: 0,
    y: 0,
    width: 40,
    height: 20,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    sizingMode: 'fixed',
    fixedWidth: 40,
    flexGrow: 1,
    minWidth: 0,
    maxWidth: 9999,
    showIndicator: true,
    indicatorColor: '#6b7280',
    ...overrides,
  }
}

export function createVerticalSpacer(overrides?: Partial<VerticalSpacerElementConfig>): VerticalSpacerElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'verticalspacer',
    name: 'Vertical Spacer',
    x: 0,
    y: 0,
    width: 20,
    height: 40,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    sizingMode: 'fixed',
    fixedHeight: 40,
    flexGrow: 1,
    minHeight: 0,
    maxHeight: 9999,
    showIndicator: true,
    indicatorColor: '#6b7280',
    ...overrides,
  }
}
