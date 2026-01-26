/**
 * Pre-export validation for code generation
 * Catches common errors before generating broken code
 */

import type { ElementConfig, KnobElementConfig, SvgGraphicElementConfig } from '../../types/elements'
import { useStore } from '../../store'

// ============================================================================
// Export Validation Types
// ============================================================================

export interface ExportError {
  elementId: string
  elementName: string
  field: string
  message: string
  severity: 'error' | 'warning'
}

export type ExportValidationResult =
  | { valid: true }
  | { valid: false; errors: ExportError[]; warnings: ExportError[] }

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if element is interactive (requires JUCE parameter binding)
 *
 * Interactive elements: knob, slider, button
 * Static/output-only elements: label, meter, image
 *
 * @param element - Element configuration to check
 * @returns true if element requires parameter binding
 */
export function isInteractiveElement(element: ElementConfig): boolean {
  return element.type === 'knob' || element.type === 'slider' || element.type === 'button'
}

/**
 * Validate all elements before code generation
 *
 * Validation rules:
 * 1. All elements MUST have non-empty names (required for ID generation)
 * 2. No duplicate names (would create duplicate IDs in generated code)
 * 3. Interactive elements SHOULD have parameterId (warning only, generates TODO comment)
 * 4. SVG Graphics SHOULD have asset assigned (warning only)
 * 5. Knobs with styleId SHOULD have valid style (warning if missing)
 * 6. Large SVG assets SHOULD be reviewed (warning if >100KB)
 *
 * @param elements - Array of element configurations to validate
 * @returns Validation result with errors and warnings
 *
 * @example
 * const result = validateForExport(elements)
 * if (!result.valid) {
 *   console.error("Export validation failed:", result.errors)
 * }
 */
export function validateForExport(elements: ElementConfig[]): ExportValidationResult {
  const errors: ExportError[] = []
  const warnings: ExportError[] = []
  const seenNames = new Set<string>()

  // Get store state for asset/style lookups
  const store = useStore.getState()

  for (const element of elements) {
    // Rule 1: Name is required for ID generation
    if (!element.name || element.name.trim() === '') {
      errors.push({
        elementId: element.id,
        elementName: element.name || '(unnamed)',
        field: 'name',
        message: `Element '${element.type}' is missing a name. Set one in the property panel to generate a valid HTML ID.`,
        severity: 'error',
      })
      continue // Skip further checks for this element
    }

    const elementName = element.name

    // Rule 2: No duplicate names (would create duplicate IDs)
    const normalizedName = element.name.trim()
    if (seenNames.has(normalizedName)) {
      errors.push({
        elementId: element.id,
        elementName: element.name,
        field: 'name',
        message: `Element '${elementName}' has a duplicate name. Each element needs a unique name for HTML ID generation. Rename one of them.`,
        severity: 'error',
      })
    } else {
      seenNames.add(normalizedName)
    }

    // Rule 3: Interactive elements should have parameterId (warning)
    if (isInteractiveElement(element)) {
      if (!element.parameterId || element.parameterId.trim() === '') {
        warnings.push({
          elementId: element.id,
          elementName: elementName,
          field: 'parameterId',
          message: `Element '${elementName}' is missing a parameter ID. Set one in the property panel to enable JUCE binding. Without it, the control won't connect to your plugin parameters.`,
          severity: 'warning',
        })
      }
    }

    // Rule 4: SVG Graphics should have asset assigned (warning)
    if (element.type === 'svggraphic') {
      const svgElement = element as SvgGraphicElementConfig
      if (!svgElement.assetId) {
        warnings.push({
          elementId: element.id,
          elementName: elementName,
          field: 'assetId',
          message: `SVG Graphic '${elementName}' has no asset assigned. Click the element and select an SVG from the property panel.`,
          severity: 'warning',
        })
      } else {
        // Check if asset exists
        const asset = store.assets.find((a) => a.id === svgElement.assetId)
        if (!asset) {
          warnings.push({
            elementId: element.id,
            elementName: elementName,
            field: 'assetId',
            message: `SVG Graphic '${elementName}' references a missing or deleted asset. Re-assign an SVG from the property panel.`,
            severity: 'warning',
          })
        }
      }
    }

    // Rule 5: Knobs with styleId should have valid style (warning)
    if (element.type === 'knob') {
      const knobElement = element as KnobElementConfig
      if (knobElement.styleId) {
        const style = store.knobStyles.find((s) => s.id === knobElement.styleId)
        if (!style) {
          warnings.push({
            elementId: element.id,
            elementName: elementName,
            field: 'styleId',
            message: `Knob '${elementName}' uses a deleted style. Select a different style or create a new one in the property panel.`,
            severity: 'warning',
          })
        }
      }
    }
  }

  // Rule 6: Check for large SVG assets (warning)
  const largeSVGs = store.assets.filter((asset) => {
    if (!asset.svgContent) return false
    const sizeInBytes = new Blob([asset.svgContent]).size
    return sizeInBytes > 100000 // 100KB
  })

  for (const asset of largeSVGs) {
    const sizeInKB = Math.round(new Blob([asset.svgContent!]).size / 1024)
    warnings.push({
      elementId: asset.id,
      elementName: asset.name,
      field: 'svgContent',
      message: `Asset '${asset.name}' is large (${sizeInKB}KB). Consider simplifying the SVG or using SVGO optimization to reduce file size. Large assets may slow down plugin UI loading.`,
      severity: 'warning',
    })
  }

  // Return validation result
  // Only block export on errors, not warnings
  if (errors.length > 0) {
    return { valid: false, errors, warnings }
  }

  if (warnings.length > 0) {
    return { valid: false, errors: [], warnings }
  }

  return { valid: true }
}
