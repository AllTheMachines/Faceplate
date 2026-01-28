/**
 * Generic SVG Layer Detection Service
 *
 * Detects layers in imported SVGs by matching against naming conventions.
 * Supports all element types (knobs, sliders, buttons, meters, etc.)
 */

import { LAYER_CONVENTIONS } from './export/svgElementExport'

export interface LayerDetectionResult {
  /** Layers that matched expected conventions */
  matched: { [layerName: string]: string }
  /** Layer IDs/classes found but not matching any convention */
  unmapped: string[]
  /** Expected layers that weren't found */
  missing: string[]
  /** All layer identifiers found in the SVG */
  allLayers: string[]
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Escape CSS selector for safe querying
 */
function escapeCSSSelector(str: string): string {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(str)
  }
  return str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
}

/**
 * Extract all identifiable layers from an SVG
 */
export function extractAllLayers(svgContent: string): string[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid SVG file')
  }

  const layers: Set<string> = new Set()
  const allElements = doc.querySelectorAll('*')

  allElements.forEach((el) => {
    const tagName = el.tagName.toLowerCase()
    // Skip non-visual/structural elements
    if (['svg', 'defs', 'clippath', 'mask', 'lineargradient', 'radialgradient', 'pattern', 'filter', 'style'].includes(tagName)) {
      return
    }

    const id = el.getAttribute('id')
    if (id) layers.add(id)

    const classList = el.getAttribute('class')?.split(/\s+/) || []
    classList.forEach(cls => {
      if (cls) layers.add(cls)
    })
  })

  return Array.from(layers)
}

/**
 * Detect layers in an SVG for a specific element type.
 * Matches found layer IDs/classes against expected naming conventions.
 */
export function detectLayersForType(svgContent: string, elementType: string): LayerDetectionResult {
  const allLayers = extractAllLayers(svgContent)
  const expectedLayers = getExpectedLayersForType(elementType)

  const matched: { [layerName: string]: string } = {}
  const unmapped: string[] = []
  const missing: string[] = []

  // Try to match each found layer against expected conventions
  allLayers.forEach(layerId => {
    const layerLower = layerId.toLowerCase()
    let wasMatched = false

    for (const expectedLayer of expectedLayers) {
      // Extract the key part (e.g., "body" from "knob-body")
      const layerKey = expectedLayer.split('-').pop() || expectedLayer

      // Check if this layer matches the expected pattern
      if (layerLower.includes(layerKey) || layerLower === expectedLayer) {
        if (!matched[expectedLayer]) {
          matched[expectedLayer] = layerId
          wasMatched = true
          break
        }
      }
    }

    if (!wasMatched) {
      unmapped.push(layerId)
    }
  })

  // Find missing expected layers
  expectedLayers.forEach(expected => {
    if (!matched[expected]) {
      missing.push(expected)
    }
  })

  return {
    matched,
    unmapped,
    missing,
    allLayers
  }
}

/**
 * Get expected layer names for an element type
 */
export function getExpectedLayersForType(elementType: string): string[] {
  const normalizedType = elementType.toLowerCase()

  if (normalizedType.includes('knob')) return [...LAYER_CONVENTIONS.knob]
  if (normalizedType.includes('slider')) return [...LAYER_CONVENTIONS.slider]
  if (normalizedType.includes('button')) return [...LAYER_CONVENTIONS.button]
  if (normalizedType.includes('meter')) return [...LAYER_CONVENTIONS.meter]
  if (normalizedType.includes('display')) return [...LAYER_CONVENTIONS.display]
  if (normalizedType.includes('led')) return [...LAYER_CONVENTIONS.led]
  if (normalizedType.includes('switch')) return [...LAYER_CONVENTIONS.switch]

  // Generic fallback
  return [`${normalizedType}-body`, `${normalizedType}-label`]
}

/**
 * Validate an imported SVG against element type requirements
 */
export function validateSVGForElement(svgContent: string, elementType: string): ValidationResult {
  const detection = detectLayersForType(svgContent, elementType)
  const errors: string[] = []
  const warnings: string[] = []

  // Required layers (first layer in convention is typically the body/required)
  const expectedLayers = getExpectedLayersForType(elementType)
  const requiredLayers = expectedLayers.slice(0, 2) // body and main functional layer

  // Check for required layers
  requiredLayers.forEach(layer => {
    if (!detection.matched[layer]) {
      errors.push(`Missing required layer: "${layer}"`)
    }
  })

  // Warn about unmapped layers
  if (detection.unmapped.length > 0) {
    warnings.push(`Found ${detection.unmapped.length} unmapped layer(s): ${detection.unmapped.join(', ')}`)
  }

  // Warn about missing optional layers
  const optionalMissing = detection.missing.filter(m => !requiredLayers.includes(m))
  if (optionalMissing.length > 0) {
    warnings.push(`Optional layers not found: ${optionalMissing.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Auto-map SVG layers to element style.
 * Returns a mapping of expected layer names to actual SVG layer IDs.
 */
export function autoMapLayers(svgContent: string, elementType: string): { [expectedLayer: string]: string | undefined } {
  const detection = detectLayersForType(svgContent, elementType)
  return detection.matched
}

/**
 * Generate a summary of detected layers for UI display
 */
export function getDetectionSummary(svgContent: string, elementType: string): string {
  const detection = detectLayersForType(svgContent, elementType)
  const validation = validateSVGForElement(svgContent, elementType)

  const lines: string[] = []

  if (validation.isValid) {
    lines.push(`✓ Valid SVG for ${elementType}`)
  } else {
    lines.push(`✗ Invalid SVG for ${elementType}`)
  }

  lines.push(``)
  lines.push(`Matched layers:`)
  Object.entries(detection.matched).forEach(([expected, actual]) => {
    lines.push(`  ${expected} → "${actual}"`)
  })

  if (detection.missing.length > 0) {
    lines.push(``)
    lines.push(`Missing layers:`)
    detection.missing.forEach(layer => {
      lines.push(`  - ${layer}`)
    })
  }

  if (detection.unmapped.length > 0) {
    lines.push(``)
    lines.push(`Unmapped layers:`)
    detection.unmapped.forEach(layer => {
      lines.push(`  - ${layer}`)
    })
  }

  return lines.join('\n')
}
