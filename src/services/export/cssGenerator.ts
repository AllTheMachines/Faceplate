/**
 * CSS stylesheet generator for VST3 WebView UI export
 * Generates style.css with element-specific styling
 */

import type { ElementConfig } from '../../types/elements'
import { toKebabCase } from './utils'
import { type FontDefinition, getFontByFamily } from '../fonts/fontRegistry'

export interface CSSGeneratorOptions {
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
}

/**
 * Generate @font-face rule for a font definition
 *
 * @param fontDef - Font definition
 * @returns @font-face CSS rule
 */
function generateFontFace(fontDef: FontDefinition): string {
  if (!fontDef.file) return '' // System fonts don't need @font-face

  // Note: In production, these would be base64 encoded
  // For now, use relative path (works for HTML preview)
  return `@font-face {
  font-family: '${fontDef.family}';
  src: url('./fonts/${fontDef.file}') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`
}

/**
 * Generate complete CSS stylesheet for all elements
 *
 * Includes:
 * - CSS reset
 * - Container styles (canvas dimensions and background)
 * - Base element styles
 * - Element-specific styles for each element
 *
 * @param elements - Array of element configurations
 * @param options - Canvas dimensions and background
 * @returns Complete CSS stylesheet as string
 */
export function generateCSS(
  elements: ElementConfig[],
  options: CSSGeneratorOptions
): string {
  const { canvasWidth, canvasHeight, backgroundColor } = options

  // Collect unique fonts from label elements
  const usedFonts = new Set<string>()
  elements.forEach(el => {
    if (el.type === 'label' && el.fontFamily) {
      usedFonts.add(el.fontFamily)
    }
  })

  // Generate @font-face rules for used fonts
  const fontFaces = Array.from(usedFonts)
    .map(family => getFontByFamily(family))
    .filter((f): f is FontDefinition => f !== undefined && f.file !== '')
    .map(generateFontFace)
    .join('\n\n')

  const fontSection = fontFaces ? `/* Embedded Fonts */\n${fontFaces}\n\n` : ''

  // CSS reset
  const reset = `/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}`

  // Container styles
  const container = `/* Container */
#plugin-container {
  position: relative;
  width: ${canvasWidth}px;
  height: ${canvasHeight}px;
  background-color: ${backgroundColor};
  overflow: hidden;
}`

  // Base element styles
  const baseElement = `/* Base element */
.element {
  position: absolute;
}`

  // Element-specific styles
  const elementStyles = elements
    .map((element) => generateElementCSS(element))
    .join('\n\n')

  return `${fontSection}${reset}

${container}

${baseElement}

/* Element-specific styles */
${elementStyles}`
}

/**
 * Generate CSS rule for a specific element
 *
 * Generates type-specific visual styles (colors, fonts, etc.)
 * Position and size are handled via inline styles in HTML.
 *
 * @param element - Element configuration
 * @returns CSS rule for the element
 */
export function generateElementCSS(element: ElementConfig): string {
  const id = toKebabCase(element.name)
  const selector = `#${id}`

  switch (element.type) {
    case 'knob':
      return `${selector} {
  /* Knob styles - SVG handles visual rendering */
  cursor: pointer;
  user-select: none;
}`

    case 'slider':
      if (element.orientation === 'vertical') {
        return `${selector} {
  /* Vertical slider */
  position: relative;
  cursor: pointer;
  user-select: none;
}

${selector} .slider-track {
  position: absolute;
  inset: 0;
  border-radius: 4px;
}

${selector} .slider-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 4px;
}

${selector} .slider-thumb {
  position: absolute;
  left: 50%;
  width: ${element.thumbWidth}px;
  height: ${element.thumbHeight}px;
  transform: translate(-50%, 50%);
  border-radius: 2px;
}`
      } else {
        return `${selector} {
  /* Horizontal slider */
  position: relative;
  cursor: pointer;
  user-select: none;
}

${selector} .slider-track {
  position: absolute;
  inset: 0;
  border-radius: 4px;
}

${selector} .slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  border-radius: 4px;
}

${selector} .slider-thumb {
  position: absolute;
  top: 50%;
  width: ${element.thumbWidth}px;
  height: ${element.thumbHeight}px;
  transform: translate(-50%, -50%);
  border-radius: 2px;
}`
      }

    case 'button':
      return `${selector} {
  /* Button */
  background-color: ${element.backgroundColor};
  color: ${element.textColor};
  border: 2px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

${selector}:active {
  filter: brightness(0.85);
}`

    case 'label':
      return `${selector} {
  /* Label */
  font-family: ${element.fontFamily};
  font-size: ${element.fontSize}px;
  font-weight: ${element.fontWeight};
  color: ${element.color};
  text-align: ${element.textAlign};
  display: flex;
  align-items: center;
  ${element.textAlign === 'left' ? 'justify-content: flex-start;' : ''}
  ${element.textAlign === 'center' ? 'justify-content: center;' : ''}
  ${element.textAlign === 'right' ? 'justify-content: flex-end;' : ''}
  user-select: none;
}`

    case 'meter':
      if (element.orientation === 'vertical') {
        return `${selector} {
  /* Vertical meter */
  position: relative;
  border-radius: 2px;
  overflow: hidden;
}

${selector} .meter-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 2px;
}`
      } else {
        return `${selector} {
  /* Horizontal meter */
  position: relative;
  border-radius: 2px;
  overflow: hidden;
}

${selector} .meter-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  border-radius: 2px;
}`
      }

    case 'image':
      return `${selector} {
  /* Image */
  object-fit: ${element.fit};
  display: block;
}`

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = element
      throw new Error(`Unknown element type: ${(_exhaustive as ElementConfig).type}`)
  }
}
