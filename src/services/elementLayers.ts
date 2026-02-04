/**
 * Element Layer Detection and Extraction Service
 *
 * Generalized layer detection for all element categories (rotary, linear, arc, button, meter).
 * Detects layers in imported SVGs by matching against category-specific naming conventions.
 * Extracts individual layers while preserving the original SVG's viewBox coordinates.
 */

import type { ElementCategory } from '../types/elementStyle'
import { LAYER_CONVENTIONS } from './export/svgElementExport'

/**
 * Maps our 5 element categories to LAYER_CONVENTIONS keys
 */
const CATEGORY_TO_CONVENTION: Record<ElementCategory, keyof typeof LAYER_CONVENTIONS> = {
  rotary: 'knob',
  linear: 'slider',
  arc: 'slider',  // Arc uses slider conventions (thumb, track, fill)
  button: 'button',
  meter: 'meter',
}

/**
 * Detected layers by role - multiple possible matches per role
 */
export interface DetectedElementLayers {
  [layerRole: string]: string[]  // Multiple possible matches per role
}

/**
 * Escape CSS selector for safe querying
 * Polyfill for CSS.escape which isn't available in Node.js
 */
function escapeCSSSelector(str: string): string {
  // Use native CSS.escape if available (browser environment)
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(str)
  }

  // Fallback for Node.js test environment
  // Based on CSS.escape polyfill: https://drafts.csswg.org/cssom/#serialize-an-identifier
  return str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
}

/**
 * Get expected layer naming conventions for a given element category
 *
 * @param category - Element category (rotary, linear, arc, button, meter)
 * @returns Array of expected layer names (e.g., ['knob-body', 'knob-indicator', ...])
 *
 * @example
 * getLayerConventionsForCategory('rotary')
 * // Returns: ['knob-body', 'knob-track', 'knob-indicator', 'knob-arc', 'knob-glow', 'knob-shadow']
 */
export function getLayerConventionsForCategory(category: ElementCategory): string[] {
  const conventionKey = CATEGORY_TO_CONVENTION[category]
  return [...LAYER_CONVENTIONS[conventionKey]]
}

/**
 * Detect layers in an SVG for a specific element category.
 * Scans SVG content and matches element ids/classes against expected naming conventions.
 *
 * @param svgContent - Raw SVG content as string
 * @param category - Element category to detect layers for
 * @returns Object with arrays of detected identifiers per layer role
 * @throws Error if SVG is invalid
 *
 * @example
 * const detected = detectElementLayers(svgContent, 'linear')
 * // Returns: { thumb: ['slider-thumb'], track: ['slider-track', 'track-bg'], fill: ['slider-fill'] }
 */
export function detectElementLayers(svgContent: string, category: ElementCategory): DetectedElementLayers {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid SVG file')
  }

  // Get expected layer conventions for this category
  const conventions = getLayerConventionsForCategory(category)

  // Initialize empty arrays for each expected layer role
  const detected: DetectedElementLayers = {}
  conventions.forEach(convention => {
    // Extract layer role from convention (e.g., 'indicator' from 'knob-indicator')
    const role = convention.split('-').pop() || convention
    detected[role] = []
  })

  // Scan all SVG elements
  const allElements = doc.querySelectorAll('*')

  allElements.forEach((el) => {
    // Skip non-visual elements
    const tagName = el.tagName.toLowerCase()
    if ([
      'svg',
      'defs',
      'clippath',
      'mask',
      'lineargradient',
      'radialgradient',
      'pattern',
      'filter',
      'style',
    ].includes(tagName)) {
      return
    }

    // Extract identifier (id or first class)
    const id = el.getAttribute('id')
    const classList = el.getAttribute('class')?.split(/\s+/) || []
    const identifier = id || classList[0]

    // Skip elements without id or class
    if (!identifier) return

    // Convert to lowercase for case-insensitive matching
    const identifierLower = identifier.toLowerCase()

    // Match against each convention pattern
    conventions.forEach(convention => {
      // Extract the layer role (e.g., 'indicator' from 'knob-indicator')
      const role = convention.split('-').pop() || convention

      // Match if identifier contains the role key
      // Examples: 'slider-thumb' matches 'thumb', 'Indicator' matches 'indicator'
      if (identifierLower.includes(role.toLowerCase())) {
        detected[role].push(identifier)
      }
    })
  })

  return detected
}

/**
 * Extract a single layer from SVG, wrapped in a new SVG with preserved viewBox.
 * Used for rendering layers independently (e.g., rotary indicator rotates separately).
 *
 * @param svgContent - Raw SVG content as string
 * @param layerIdentifier - Element id or class name to extract
 * @returns New SVG string with only the specified layer, or empty string if not found
 *
 * @example
 * const indicatorSVG = extractElementLayer(svgContent, 'knob-indicator')
 * // Returns: '<svg viewBox="0 0 100 100">...<g id="knob-indicator">...</g></svg>'
 */
export function extractElementLayer(svgContent: string, layerIdentifier: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  // Find layer by id or class
  let layer = doc.querySelector(`#${escapeCSSSelector(layerIdentifier)}`)
  if (!layer) {
    layer = doc.querySelector(`.${escapeCSSSelector(layerIdentifier)}`)
  }

  if (!layer) {
    console.warn(`Layer not found: ${layerIdentifier}`)
    return ''
  }

  // Get original SVG's viewBox for correct coordinate system
  const originalSvg = doc.querySelector('svg')
  const viewBox = originalSvg?.getAttribute('viewBox') || '0 0 100 100'
  const width = originalSvg?.getAttribute('width')
  const height = originalSvg?.getAttribute('height')

  // Create new SVG wrapper with same viewBox
  const newSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
  newSvg.setAttribute('viewBox', viewBox)
  newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  newSvg.setAttribute('width', '100%')
  newSvg.setAttribute('height', '100%')

  // Copy width/height if present (preserves aspect ratio info)
  if (width) newSvg.setAttribute('data-original-width', width)
  if (height) newSvg.setAttribute('data-original-height', height)

  // Clone layer (not move - preserve original structure)
  const clonedLayer = layer.cloneNode(true) as Element
  newSvg.appendChild(clonedLayer)

  // Serialize to string
  const serializer = new XMLSerializer()
  return serializer.serializeToString(newSvg)
}
