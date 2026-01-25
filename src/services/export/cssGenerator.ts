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

  // Global label/value styles
  const labelValueStyles = `/* Label and Value Display Styles */
.knob-label, .slider-label {
  position: absolute;
  white-space: nowrap;
  user-select: none;
}

.knob-label-top, .slider-label-top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 4px;
}

.knob-label-bottom, .slider-label-bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
}

.knob-label-left, .slider-label-left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 4px;
}

.knob-label-right, .slider-label-right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 4px;
}

.knob-value, .slider-value {
  position: absolute;
  white-space: nowrap;
  user-select: none;
}

.knob-value-top, .slider-value-top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 4px;
}

.knob-value-bottom, .slider-value-bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
}

.knob-value-left, .slider-value-left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 4px;
}

.knob-value-right, .slider-value-right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 4px;
}`

  return `${fontSection}${reset}

${container}

${baseElement}

${labelValueStyles}

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
  top: 0;
  bottom: 0;
  left: 50%;
  width: 6px;
  transform: translateX(-50%);
  border-radius: 3px;
}

${selector} .slider-fill {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 6px;
  transform: translateX(-50%);
  border-radius: 3px;
}

${selector} .slider-thumb {
  position: absolute;
  left: 50%;
  width: ${element.thumbWidth}px;
  height: ${element.thumbHeight}px;
  transform: translate(-50%, 50%);
  border-radius: 4px;
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
  left: 0;
  right: 0;
  top: 50%;
  height: 6px;
  transform: translateY(-50%);
  border-radius: 3px;
}

${selector} .slider-fill {
  position: absolute;
  left: 0;
  top: 50%;
  height: 6px;
  transform: translateY(-50%);
  border-radius: 3px;
}

${selector} .slider-thumb {
  position: absolute;
  top: 50%;
  width: ${element.thumbWidth}px;
  height: ${element.thumbHeight}px;
  transform: translate(-50%, -50%);
  border-radius: 4px;
}`
      }

    case 'rangeslider':
      if (element.orientation === 'vertical') {
        return `${selector} {
  /* Vertical range slider */
  position: relative;
  cursor: pointer;
  user-select: none;
}

${selector} .rangeslider-track {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 6px;
  transform: translateX(-50%);
  border-radius: 3px;
}

${selector} .rangeslider-fill {
  position: absolute;
  left: 50%;
  width: 6px;
  transform: translateX(-50%);
  border-radius: 3px;
}

${selector} .rangeslider-thumb {
  position: absolute;
  left: 50%;
  width: ${element.thumbWidth}px;
  height: ${element.thumbHeight}px;
  transform: translate(-50%, 50%);
  border-radius: 4px;
  cursor: grab;
}

${selector} .rangeslider-thumb:active {
  cursor: grabbing;
}`
      } else {
        return `${selector} {
  /* Horizontal range slider */
  position: relative;
  cursor: pointer;
  user-select: none;
}

${selector} .rangeslider-track {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 6px;
  transform: translateY(-50%);
  border-radius: 3px;
}

${selector} .rangeslider-fill {
  position: absolute;
  top: 50%;
  height: 6px;
  transform: translateY(-50%);
  border-radius: 3px;
}

${selector} .rangeslider-thumb {
  position: absolute;
  top: 50%;
  width: ${element.thumbWidth}px;
  height: ${element.thumbHeight}px;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  cursor: grab;
}

${selector} .rangeslider-thumb:active {
  cursor: grabbing;
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

    case 'modulationmatrix':
      return `${selector} {
  /* Modulation Matrix */
  overflow: hidden;
}

${selector} .modulation-matrix {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

${selector} .matrix-corner {
  background: ${element.headerBackground};
  border: 1px solid ${element.borderColor};
}

${selector} .matrix-header,
${selector} .matrix-row-header {
  background: ${element.headerBackground};
  color: ${element.headerColor};
  font-size: ${element.headerFontSize}px;
  font-weight: 600;
  padding: 2px 4px;
  text-align: center;
  border: 1px solid ${element.borderColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

${selector} .matrix-row-header {
  text-align: right;
}

${selector} .matrix-cell {
  background: ${element.cellColor};
  border: 1px solid ${element.borderColor};
  width: ${element.cellSize}px;
  height: ${element.cellSize}px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

${selector} .matrix-cell[data-active="true"] {
  background: ${element.activeColor};
}`

    case 'rectangle':
      return `${selector} {
  /* Rectangle */
  /* Styling handled via inline styles in HTML */
}`

    case 'line':
      return `${selector} {
  /* Line */
  display: flex;
  align-items: center;
  justify-content: center;
}

${selector} > div {
  /* Line inner element */
}`

    case 'dropdown':
      return `${selector} {
  /* Dropdown */
  background-color: ${element.backgroundColor};
  color: ${element.textColor};
  border: 1px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  padding: 0 32px 0 8px;
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  outline: none;
}`

    case 'checkbox':
      if (element.labelPosition === 'left') {
        return `${selector} {
  /* Checkbox with label on left */
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  justify-content: flex-start;
  cursor: pointer;
}

${selector} input[type="checkbox"] {
  width: 18px;
  height: 18px;
  background-color: ${element.backgroundColor};
  border: 2px solid ${element.borderColor};
  border-radius: 3px;
  cursor: pointer;
  accent-color: ${element.checkColor};
}

${selector} label {
  color: ${element.textColor};
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
  margin-right: 8px;
  user-select: none;
}`
      } else {
        return `${selector} {
  /* Checkbox with label on right */
  display: flex;
  align-items: center;
  cursor: pointer;
}

${selector} input[type="checkbox"] {
  width: 18px;
  height: 18px;
  background-color: ${element.backgroundColor};
  border: 2px solid ${element.borderColor};
  border-radius: 3px;
  cursor: pointer;
  accent-color: ${element.checkColor};
}

${selector} label {
  color: ${element.textColor};
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
  margin-left: 8px;
  user-select: none;
}`
      }

    case 'radiogroup':
      if (element.orientation === 'vertical') {
        return `${selector} {
  /* Radio group - vertical */
  display: flex;
  flex-direction: column;
  gap: ${element.spacing}px;
  background-color: ${element.backgroundColor};
  padding: ${element.backgroundColor !== 'transparent' ? '4px' : '0'};
}

${selector} .radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

${selector} input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${element.radioColor};
}

${selector} label {
  margin-left: 8px;
  color: ${element.textColor};
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
}`
      } else {
        return `${selector} {
  /* Radio group - horizontal */
  display: flex;
  flex-direction: row;
  gap: ${element.spacing}px;
  background-color: ${element.backgroundColor};
  padding: ${element.backgroundColor !== 'transparent' ? '4px' : '0'};
}

${selector} .radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

${selector} input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${element.radioColor};
}

${selector} label {
  margin-left: 8px;
  color: ${element.textColor};
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
}`
      }

    case 'panel':
      return `${selector} {
  /* Panel */
  background-color: ${element.backgroundColor};
  border-radius: ${element.borderRadius}px;
  padding: ${element.padding}px;
${element.borderWidth > 0 ? `  border: ${element.borderWidth}px solid ${element.borderColor};` : ''}
}`

    case 'frame':
      return `${selector} {
  /* Frame */
  border: ${element.borderWidth}px ${element.borderStyle} ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  padding: ${element.padding}px;
}`

    case 'groupbox':
      return `${selector} {
  /* Group Box container */
  position: relative;
  padding: ${element.padding}px;
  padding-top: ${element.padding + element.headerFontSize / 2}px;
}

${selector} .groupbox-border {
  position: absolute;
  top: ${element.headerFontSize / 2}px;
  left: 0;
  right: 0;
  bottom: 0;
  border: ${element.borderWidth}px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  pointer-events: none;
}

${selector} .groupbox-header {
  position: absolute;
  top: 0;
  left: ${element.padding + 4}px;
  font-size: ${element.headerFontSize}px;
  color: ${element.headerColor};
  background-color: ${element.headerBackground};
  padding: 0 4px;
  font-family: Inter, system-ui, sans-serif;
  font-weight: 500;
  user-select: none;
}`


    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = element
      throw new Error(`Unknown element type: ${(_exhaustive as ElementConfig).type}`)
  }
}
