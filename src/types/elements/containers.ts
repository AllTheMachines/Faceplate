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

// ============================================================================
// Container Element Union
// ============================================================================

export type ContainerElement =
  | PanelElementConfig
  | FrameElementConfig
  | GroupBoxElementConfig
  | CollapsibleContainerElementConfig

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
