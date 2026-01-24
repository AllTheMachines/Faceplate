/**
 * Pre-export validation for code generation
 * Catches common errors before generating broken code
 */

import type { ElementConfig } from '../../types/elements'

// ============================================================================
// Export Validation Types
// ============================================================================

export interface ExportError {
  elementId: string
  elementName: string
  field: string
  message: string
}

export type ExportValidationResult =
  | { valid: true }
  | { valid: false; errors: ExportError[] }

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
 *
 * @param elements - Array of element configurations to validate
 * @returns Validation result with errors if validation fails
 *
 * @example
 * const result = validateForExport(elements)
 * if (!result.valid) {
 *   console.error("Export validation failed:", result.errors)
 * }
 */
export function validateForExport(elements: ElementConfig[]): ExportValidationResult {
  const errors: ExportError[] = []
  const seenNames = new Set<string>()

  for (const element of elements) {
    // Rule 1: Name is required for ID generation
    if (!element.name || element.name.trim() === '') {
      errors.push({
        elementId: element.id,
        elementName: element.name || '(unnamed)',
        field: 'name',
        message: 'Element name is required for ID generation',
      })
      continue // Skip further checks for this element
    }

    // Rule 2: No duplicate names (would create duplicate IDs)
    const normalizedName = element.name.trim()
    if (seenNames.has(normalizedName)) {
      errors.push({
        elementId: element.id,
        elementName: element.name,
        field: 'name',
        message: `Duplicate element name '${element.name}' - IDs must be unique`,
      })
    } else {
      seenNames.add(normalizedName)
    }

    // Rule 3: Interactive elements should have parameterId (warning only, not blocking)
    // We don't add errors here - missing parameterId generates TODO comment in C++ output
    // This is handled in the code generation phase, not validation
  }

  // Return validation result
  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}
