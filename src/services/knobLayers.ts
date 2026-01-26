/**
 * Knob SVG Layer Detection and Manipulation Utilities
 *
 * Parses SVG files to detect layers by naming conventions,
 * extracts individual layers for independent rendering,
 * and applies per-instance color overrides.
 */

import { KnobStyleLayers, ColorOverrides } from '../types/knobStyle'

/**
 * Escape CSS selector (polyfill for CSS.escape which isn't available in Node.js)
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

// Result of auto-detection - lists all potential matches
export interface DetectedLayers {
  indicator: string[]  // Elements matching indicator/pointer/needle naming
  track: string[]      // Elements matching track/background/base naming
  arc: string[]        // Elements matching arc/progress/fill/value naming
  glow: string[]       // Elements matching glow/shine/highlight naming
  shadow: string[]     // Elements matching shadow/depth naming
  unmapped: string[]   // Elements with id/class that don't match conventions
}

/**
 * Detect layers in an SVG by naming conventions.
 * Returns arrays of potential matches for each layer role.
 * User confirms/adjusts mappings in the layer mapping dialog.
 */
export function detectKnobLayers(svgContent: string): DetectedLayers {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid SVG file')
  }

  const detected: DetectedLayers = {
    indicator: [],
    track: [],
    arc: [],
    glow: [],
    shadow: [],
    unmapped: [],
  }

  // Query all elements (not just those with id/class - we want to find identifiable layers)
  const allElements = doc.querySelectorAll('*')

  allElements.forEach((el) => {
    // Skip SVG root, defs, and other non-visual elements
    const tagName = el.tagName.toLowerCase()
    if (['svg', 'defs', 'clippath', 'mask', 'lineargradient', 'radialgradient', 'pattern', 'filter'].includes(tagName)) {
      return
    }

    const id = el.getAttribute('id') || ''
    const classList = el.getAttribute('class')?.split(/\s+/) || []
    const identifier = id || classList[0]

    // Skip elements without id or class
    if (!identifier) return

    const searchText = [id, ...classList].join(' ').toLowerCase()

    // Match naming conventions with synonyms (case-insensitive)
    if (/indicator|pointer|needle|hand|knob-indicator/.test(searchText)) {
      detected.indicator.push(identifier)
    } else if (/track|background|bg|base|knob-track/.test(searchText)) {
      detected.track.push(identifier)
    } else if (/arc|progress|fill|value|knob-arc/.test(searchText)) {
      detected.arc.push(identifier)
    } else if (/glow|shine|highlight|knob-glow/.test(searchText)) {
      detected.glow.push(identifier)
    } else if (/shadow|depth|knob-shadow/.test(searchText)) {
      detected.shadow.push(identifier)
    } else {
      // Has identifier but doesn't match conventions
      detected.unmapped.push(identifier)
    }
  })

  return detected
}

/**
 * Extract a single layer from SVG, wrapped in new SVG with same viewBox.
 * Used for rendering layers independently (e.g., indicator rotates separately).
 */
export function extractLayer(svgContent: string, layerIdentifier: string): string {
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

/**
 * Apply color override to a specific layer in SVG content.
 * Replaces fill and stroke attributes (preserves 'none' values).
 */
export function applyColorOverride(
  svgContent: string,
  layerIdentifier: string,
  color: string
): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  // Find layer by id or class
  let layer = doc.querySelector(`#${escapeCSSSelector(layerIdentifier)}`)
  if (!layer) {
    layer = doc.querySelector(`.${escapeCSSSelector(layerIdentifier)}`)
  }

  if (!layer) {
    console.warn(`Layer not found for color override: ${layerIdentifier}`)
    return svgContent
  }

  // Helper to apply color to an element
  const applyToElement = (el: Element) => {
    // Replace fill if present and not 'none'
    if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
      el.setAttribute('fill', color)
    }
    // Replace stroke if present and not 'none'
    if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
      el.setAttribute('stroke', color)
    }

    // Also check style attribute for inline styles
    const style = el.getAttribute('style')
    if (style) {
      const newStyle = style
        .replace(/fill:\s*(?!none)[^;]+/g, `fill: ${color}`)
        .replace(/stroke:\s*(?!none)[^;]+/g, `stroke: ${color}`)
      el.setAttribute('style', newStyle)
    }
  }

  // Apply to layer itself
  applyToElement(layer)

  // Apply to all children
  const children = layer.querySelectorAll('*')
  children.forEach((child) => applyToElement(child))

  // Serialize back to string
  const serializer = new XMLSerializer()
  return serializer.serializeToString(doc)
}

/**
 * Apply all color overrides to SVG content.
 * Convenience wrapper that applies multiple overrides sequentially.
 */
export function applyAllColorOverrides(
  svgContent: string,
  layers: KnobStyleLayers,
  overrides: ColorOverrides | undefined
): string {
  if (!overrides) return svgContent

  let result = svgContent

  if (overrides.indicator && layers.indicator) {
    result = applyColorOverride(result, layers.indicator, overrides.indicator)
  }
  if (overrides.track && layers.track) {
    result = applyColorOverride(result, layers.track, overrides.track)
  }
  if (overrides.arc && layers.arc) {
    result = applyColorOverride(result, layers.arc, overrides.arc)
  }
  if (overrides.glow && layers.glow) {
    result = applyColorOverride(result, layers.glow, overrides.glow)
  }
  if (overrides.shadow && layers.shadow) {
    result = applyColorOverride(result, layers.shadow, overrides.shadow)
  }

  return result
}

/**
 * Check if SVG has any detectable layers.
 * Used to determine if SVG is suitable for knob style import.
 */
export function hasDetectableLayers(svgContent: string): boolean {
  const detected = detectKnobLayers(svgContent)
  return (
    detected.indicator.length > 0 ||
    detected.track.length > 0 ||
    detected.arc.length > 0 ||
    detected.glow.length > 0 ||
    detected.shadow.length > 0
  )
}

/**
 * Get the first auto-detected layer for each role.
 * Returns suggested KnobStyleLayers for the confirmation dialog.
 */
export function getSuggestedLayers(detected: DetectedLayers): KnobStyleLayers {
  return {
    indicator: detected.indicator[0],  // May be undefined if no indicator detected
    track: detected.track[0],
    arc: detected.arc[0],
    glow: detected.glow[0],
    shadow: detected.shadow[0],
  }
}
