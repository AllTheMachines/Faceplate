/**
 * Font exporter utilities for custom font bundling
 * Collects used fonts and generates embedded @font-face rules
 */

import type { ElementConfig } from '../../types/elements'
import { AVAILABLE_FONTS } from '../fonts/fontRegistry'
import { getFont } from '../fonts/fontStorage'

/**
 * Recursively collect font families used in elements
 * Checks all text-rendering properties that use fonts
 *
 * @param elements - Array of element configurations
 * @returns Set of font family names used in the project
 */
export function collectUsedFonts(elements: ElementConfig[]): Set<string> {
  const usedFonts = new Set<string>()

  for (const element of elements) {
    // Label elements have fontFamily property
    if (element.type === 'label' && element.fontFamily) {
      usedFonts.add(element.fontFamily)
    }

    // Display elements may have custom fonts for value display
    // Check for fontFamily in elements that have text display
    if ('fontFamily' in element && typeof element.fontFamily === 'string') {
      usedFonts.add(element.fontFamily)
    }

    // Recursively check container children
    if ('children' in element && Array.isArray(element.children)) {
      // Children are IDs, need to find child elements
      const childElements = element.children
        .map(childId => elements.find(el => el.id === childId))
        .filter((el): el is ElementConfig => el !== undefined)

      const childFonts = collectUsedFonts(childElements)
      childFonts.forEach(font => usedFonts.add(font))
    }
  }

  return usedFonts
}

/**
 * Check if a font family is a custom font (stored in IndexedDB)
 * Built-in fonts are in AVAILABLE_FONTS registry
 *
 * @param family - Font family name
 * @returns true if font is custom (not built-in)
 */
export function isCustomFont(family: string): boolean {
  // Check if font exists in built-in registry
  const builtIn = AVAILABLE_FONTS.find(f =>
    f.family === family ||
    family.includes(f.family) ||
    f.family.includes(family)
  )

  return !builtIn
}

/**
 * Get built-in font definition from registry
 *
 * @param family - Font family name
 * @returns FontDefinition if font is built-in, undefined otherwise
 */
export function getBuiltInFont(family: string) {
  return AVAILABLE_FONTS.find(f =>
    f.family === family ||
    family.includes(f.family) ||
    f.family.includes(family)
  )
}

/**
 * Generate @font-face rules for custom fonts with base64 embedding
 * Only processes custom fonts (not built-in fonts)
 *
 * @param usedFonts - Set of font family names used in project
 * @returns Object with CSS string and warnings array
 */
export async function generateCustomFontFaces(
  usedFonts: Set<string>
): Promise<{ css: string; warnings: string[] }> {
  const fontFaces: string[] = []
  const warnings: string[] = []
  let totalSize = 0

  // Size thresholds for warnings
  const INDIVIDUAL_WARNING_SIZE = 500 * 1024 // 500KB
  const TOTAL_WARNING_SIZE = 2 * 1024 * 1024 // 2MB

  // Convert Set to Array for iteration compatibility
  const usedFontsArray = Array.from(usedFonts)

  for (const family of usedFontsArray) {
    // Skip built-in fonts
    if (!isCustomFont(family)) {
      continue
    }

    try {
      // Retrieve font from IndexedDB storage
      const storedFont = await getFont(family)

      if (!storedFont) {
        warnings.push(`Custom font "${family}" not found in storage`)
        continue
      }

      // Convert ArrayBuffer to base64
      const base64 = arrayBufferToBase64(storedFont.data)
      const fontSize = storedFont.data.byteLength
      totalSize += fontSize

      // Warn if individual font is large
      if (fontSize > INDIVIDUAL_WARNING_SIZE) {
        const sizeKB = (fontSize / 1024).toFixed(1)
        warnings.push(
          `Font "${family}" is large (${sizeKB}KB) - consider subsetting or using web fonts`
        )
      }

      // Determine MIME type from format
      const mimeType = getMimeType(storedFont.metadata.format)

      // Generate @font-face rule with base64 embedded data
      const fontFace = `@font-face {
  font-family: '${family}';
  src: url(data:${mimeType};base64,${base64}) format('${storedFont.metadata.format}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`

      fontFaces.push(fontFace)
    } catch (error) {
      warnings.push(
        `Failed to load custom font "${family}": ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Warn if total embedded font size is large
  if (totalSize > TOTAL_WARNING_SIZE) {
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2)
    warnings.push(
      `Total embedded font size is ${totalMB}MB - this may impact load time`
    )
  }

  // Join all @font-face rules
  const css = fontFaces.join('\n\n')

  return { css, warnings }
}

/**
 * Convert ArrayBuffer to base64 string
 *
 * @param buffer - ArrayBuffer to convert
 * @returns Base64 encoded string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
}

/**
 * Get MIME type for font format
 *
 * @param format - Font format (ttf, otf, woff, woff2)
 * @returns MIME type string
 */
function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    'ttf': 'font/ttf',
    'otf': 'font/otf',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
  }

  return mimeTypes[format] || 'font/ttf'
}
