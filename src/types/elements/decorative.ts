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

export interface AsciiArtElementConfig extends BaseElementConfig {
  type: 'asciiart'

  // Content Mode
  contentType: 'static' | 'noise' // Default: 'static'

  // Static mode content
  content: string // Multi-line ASCII art text

  // Noise mode properties
  noiseCharacters: string // Characters to use for noise (default: '.:!*#$@%&')
  noiseIntensity: number // 0-1, density of non-space characters (default: 0.5)
  noiseWidth: number // Characters per line (default: 40)
  noiseHeight: number // Number of lines (default: 20)
  noiseRefreshRate: number // Milliseconds between updates (default: 100)
  noiseParameterId: string // Optional parameter binding for intensity

  // Typography
  fontSize: number // Font size in px (default: 12)
  fontFamily: string // Monospace font (default: 'Courier New, monospace')
  fontWeight: number // 100-900 (default: 400)
  textColor: string // Text color (default: '#00ff00' - classic terminal green)
  lineHeight: number // Line height multiplier (default: 1.0)

  // Container
  backgroundColor: string // Background color (default: 'transparent')
  padding: number // Inner padding (default: 8)
  borderRadius: number // Corner radius (default: 0)
  borderWidth: number // Border width (default: 0)
  borderColor: string // Border color (default: '#374151')

  // Overflow
  overflow: 'visible' | 'hidden' | 'scroll' // Default: 'hidden'

  // Interaction
  selectable: boolean // Allow text selection (default: false)
}

// ============================================================================
// Decorative Element Union
// ============================================================================

export type DecorativeElement =
  | ImageElementConfig
  | SvgGraphicElementConfig
  | RectangleElementConfig
  | LineElementConfig
  | AsciiArtElementConfig

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

export function isAsciiArt(element: { type: string }): element is AsciiArtElementConfig {
  return element.type === 'asciiart'
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

export function createAsciiArt(overrides?: Partial<AsciiArtElementConfig>): AsciiArtElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'asciiart',
    name: 'ASCII Art',
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    contentType: 'static',
    content: '+--------+\n| ASCII  |\n|  ART   |\n+--------+',
    noiseCharacters: '.:!*#$@%&',
    noiseIntensity: 0.5,
    noiseWidth: 40,
    noiseHeight: 20,
    noiseRefreshRate: 100,
    noiseParameterId: '',
    fontSize: 12,
    fontFamily: 'Courier New, Consolas, monospace',
    fontWeight: 400,
    textColor: '#00ff00',
    lineHeight: 1.0,
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#374151',
    overflow: 'hidden',
    selectable: false,
    ...overrides,
  }
}
