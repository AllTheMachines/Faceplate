/**
 * HTML code generator for VST3 WebView UI export
 * Generates index.html with properly positioned and styled elements
 */

import type { ElementConfig, KnobElementConfig, SliderElementConfig, MeterElementConfig } from '../../types/elements'
import { toKebabCase, escapeHTML } from './utils'

// ============================================================================
// SVG Arc Utilities (same as KnobRenderer)
// ============================================================================

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? '1' : '0'

  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ')
}

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
  <link rel="stylesheet" href="style.css">
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
      return generateKnobHTML(id, baseClass, positionStyle, element)

    case 'slider':
      return generateSliderHTML(id, baseClass, positionStyle, element)

    case 'button':
      return `<button id="${id}" class="${baseClass} button-element" data-type="button" data-mode="${element.mode}" style="${positionStyle}">${escapeHTML(element.label)}</button>`

    case 'label':
      return `<span id="${id}" class="${baseClass} label-element" data-type="label" style="${positionStyle}">${escapeHTML(element.text)}</span>`

    case 'meter':
      return generateMeterHTML(id, baseClass, positionStyle, element)

    case 'image':
      return `<img id="${id}" class="${baseClass} image-element" data-type="image" src="${element.src}" alt="${escapeHTML(element.name)}" style="${positionStyle}" />`

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = element
      throw new Error(`Unknown element type: ${(_exhaustive as ElementConfig).type}`)
  }
}

/**
 * Generate knob HTML with SVG arc structure
 */
function generateKnobHTML(id: string, baseClass: string, positionStyle: string, config: KnobElementConfig): string {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2

  // Calculate value angle
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range
  const valueAngle = config.startAngle + normalizedValue * (config.endAngle - config.startAngle)

  // Generate arc paths
  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)
  const valuePath = describeArc(centerX, centerY, radius, config.startAngle, valueAngle)

  // For indicator rendering
  const indicatorStart = polarToCartesian(centerX, centerY, radius * 0.4, valueAngle)
  const indicatorEnd = polarToCartesian(centerX, centerY, radius * 0.9, valueAngle)

  // Build indicator SVG based on style
  let indicatorSVG = ''
  if (config.style === 'line') {
    indicatorSVG = `<line class="knob-indicator" x1="${indicatorStart.x}" y1="${indicatorStart.y}" x2="${indicatorEnd.x}" y2="${indicatorEnd.y}" stroke="${config.indicatorColor}" stroke-width="2" stroke-linecap="round" />`
  } else if (config.style === 'dot') {
    indicatorSVG = `<circle class="knob-indicator" cx="${indicatorEnd.x}" cy="${indicatorEnd.y}" r="${config.trackWidth / 2}" fill="${config.indicatorColor}" />`
  }

  // Value fill (only if value > min)
  const valueFillSVG = normalizedValue > 0.001
    ? `<path class="knob-arc-fill" d="${valuePath}" fill="none" stroke="${config.fillColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />`
    : `<path class="knob-arc-fill" d="" fill="none" stroke="${config.fillColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />`

  return `<div id="${id}" class="${baseClass} knob knob-element" data-type="knob" data-value="${normalizedValue}" data-start-angle="${config.startAngle}" data-end-angle="${config.endAngle}" style="${positionStyle}">
      <svg width="100%" height="100%" viewBox="0 0 ${config.diameter} ${config.diameter}" style="overflow: visible;">
        <path class="knob-arc-track" d="${trackPath}" fill="none" stroke="${config.trackColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />
        ${valueFillSVG}
        ${indicatorSVG}
      </svg>
    </div>`
}

/**
 * Generate slider HTML with track, fill, and thumb
 */
function generateSliderHTML(id: string, baseClass: string, positionStyle: string, config: SliderElementConfig): string {
  const isVertical = config.orientation === 'vertical'
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const orientationClass = isVertical ? 'vertical' : 'horizontal'

  // Calculate fill and thumb position
  const fillStyle = isVertical
    ? `height: ${normalizedValue * 100}%`
    : `width: ${normalizedValue * 100}%`
  const thumbStyle = isVertical
    ? `bottom: ${normalizedValue * 100}%`
    : `left: ${normalizedValue * 100}%`

  return `<div id="${id}" class="${baseClass} slider slider-element ${orientationClass}" data-type="slider" data-orientation="${config.orientation}" data-value="${normalizedValue}" style="${positionStyle}">
      <div class="slider-track" style="background: ${config.trackColor};"></div>
      <div class="slider-fill" style="background: ${config.fillColor}; ${fillStyle}"></div>
      <div class="slider-thumb" style="background: ${config.thumbColor}; ${thumbStyle}"></div>
    </div>`
}

/**
 * Generate meter HTML with fill and optional peak hold
 */
function generateMeterHTML(id: string, baseClass: string, positionStyle: string, config: MeterElementConfig): string {
  const isVertical = config.orientation === 'vertical'
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const orientationClass = isVertical ? 'vertical' : 'horizontal'

  // Calculate fill
  const fillStyle = isVertical
    ? `height: ${normalizedValue * 100}%`
    : `width: ${normalizedValue * 100}%`

  // Generate gradient from color stops
  const gradientStops = config.colorStops
    .map(stop => `${stop.color} ${stop.position * 100}%`)
    .join(', ')
  const gradientDirection = isVertical ? 'to top' : 'to right'
  const fillGradient = `linear-gradient(${gradientDirection}, ${gradientStops})`

  return `<div id="${id}" class="${baseClass} meter meter-element ${orientationClass}" data-type="meter" data-orientation="${config.orientation}" data-value="${normalizedValue}" style="${positionStyle}; background: ${config.backgroundColor};">
      <div class="meter-fill" style="background: ${fillGradient}; ${fillStyle}"></div>
    </div>`
}
