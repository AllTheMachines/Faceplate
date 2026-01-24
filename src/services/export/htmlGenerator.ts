/**
 * HTML code generator for VST3 WebView UI export
 * Generates index.html with properly positioned and styled elements
 */

import type { ElementConfig } from '../../types/elements'
import { toKebabCase, escapeHTML } from './utils'

export interface HTMLGeneratorOptions {
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  isPreviewMode: boolean // true = mock JUCE, false = real JUCE
}

/**
 * Generate complete HTML document with all elements
 *
 * Elements are sorted by array index (earlier = lower z-order) to ensure
 * DOM order matches visual stacking order.
 *
 * @param elements - Array of element configurations
 * @param options - Canvas dimensions and settings
 * @returns Complete HTML5 document as string
 */
export function generateHTML(
  elements: ElementConfig[],
  _options: HTMLGeneratorOptions
): string {
  // Sort elements by array index to preserve z-order (earlier = lower in z)
  const sortedElements = [...elements]

  // Generate HTML for each element
  const elementsHTML = sortedElements
    .map((element) => generateElementHTML(element))
    .join('\n    ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JUCE WebView UI</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="plugin-container">
    ${elementsHTML}
  </div>
  <script src="components.js"></script>
  <script src="bindings.js"></script>
</body>
</html>`
}

/**
 * Generate HTML markup for a single element
 *
 * Position, size, and rotation are applied via inline styles.
 * Type-specific visual styling is handled in CSS.
 *
 * @param element - Element configuration
 * @returns HTML string for the element
 */
export function generateElementHTML(element: ElementConfig): string {
  const id = toKebabCase(element.name)
  const baseClass = 'element'

  // Inline styles for positioning (applied to all elements)
  const positionStyle = `position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; transform: rotate(${element.rotation}deg);`

  // Type-specific HTML generation
  switch (element.type) {
    case 'knob':
      return `<div id="${id}" class="${baseClass} knob-element" data-type="knob" style="${positionStyle}"></div>`

    case 'slider':
      return `<div id="${id}" class="${baseClass} slider-element" data-type="slider" data-orientation="${element.orientation}" style="${positionStyle}"></div>`

    case 'button':
      return `<button id="${id}" class="${baseClass} button-element" data-type="button" data-mode="${element.mode}" style="${positionStyle}">${escapeHTML(element.label)}</button>`

    case 'label':
      return `<span id="${id}" class="${baseClass} label-element" data-type="label" style="${positionStyle}">${escapeHTML(element.text)}</span>`

    case 'meter':
      return `<div id="${id}" class="${baseClass} meter-element" data-type="meter" data-orientation="${element.orientation}" style="${positionStyle}"></div>`

    case 'image':
      return `<img id="${id}" class="${baseClass} image-element" data-type="image" src="${element.src}" alt="${escapeHTML(element.name)}" style="${positionStyle}" />`

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = element
      throw new Error(`Unknown element type: ${(_exhaustive as ElementConfig).type}`)
  }
}
