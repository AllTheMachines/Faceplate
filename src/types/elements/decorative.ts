/**
 * Decorative element types
 * Visual elements: Image, SVG Graphic, Rectangle, Line
 */

import { BaseElementConfig } from './base'

// ============================================================================
// Decorative Element Configurations
// ============================================================================

export interface ImageElementConfig extends BaseElementConfig {
  type: 'image'

  // Source
  src: string // base64 data URL or external URL
  assetId?: string // Reference to Asset in AssetsSlice

  // Fit
  fit: 'contain' | 'cover' | 'fill' | 'none'
}

export interface SvgGraphicElementConfig extends BaseElementConfig {
  type: 'svggraphic'

  // Asset Reference
  assetId?: string // Optional - undefined for placeholder state

  // Transforms
  flipH: boolean // Horizontal flip
  flipV: boolean // Vertical flip
  opacity: number // 0-1 range
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

export interface LineElementConfig extends BaseElementConfig {
  type: 'line'

  // Stroke
  strokeWidth: number
  strokeColor: string
  strokeStyle: 'solid' | 'dashed' | 'dotted'
  // Note: orientation determined by width/height aspect ratio
  // horizontal: width > height, vertical: height > width
}

// ============================================================================
// Decorative Element Union
// ============================================================================

export type DecorativeElement =
  | ImageElementConfig
  | SvgGraphicElementConfig
  | RectangleElementConfig
  | LineElementConfig

// ============================================================================
// Type Guards
// ============================================================================

export function isImage(element: { type: string }): element is ImageElementConfig {
  return element.type === 'image'
}

export function isSvgGraphic(element: { type: string }): element is SvgGraphicElementConfig {
  return element.type === 'svggraphic'
}

export function isRectangle(element: { type: string }): element is RectangleElementConfig {
  return element.type === 'rectangle'
}

export function isLine(element: { type: string }): element is LineElementConfig {
  return element.type === 'line'
}

// ============================================================================
// Factory Functions
// ============================================================================

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
    assetId: undefined,
    fit: 'contain',
    ...overrides,
  }
}

export function createSvgGraphic(overrides?: Partial<SvgGraphicElementConfig>): SvgGraphicElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'svggraphic',
    name: 'SVG Graphic',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    assetId: undefined,
    flipH: false,
    flipV: false,
    opacity: 1,
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
    borderRadius: 0,
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
