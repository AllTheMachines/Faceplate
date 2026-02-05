/**
 * SVG Element Export Service
 *
 * Exports individual UI elements as SVG with meaningful layer names
 * for re-import workflow. Layer naming conventions:
 *
 * Knob: knob-body, knob-track, knob-indicator, knob-arc, knob-glow, knob-shadow
 * Slider: slider-track, slider-fill, slider-thumb
 * Button: button-body, button-label, button-icon
 * Meter: meter-body, meter-fill, meter-scale, meter-peak
 * Display: display-body, display-text, display-unit
 */

import type { ElementConfig } from '../../types/elements'

// Layer naming conventions per element category
export const LAYER_CONVENTIONS = {
  knob: ['knob-body', 'knob-track', 'knob-indicator', 'knob-arc', 'knob-glow', 'knob-shadow'],
  slider: ['slider-body', 'slider-track', 'slider-fill', 'slider-thumb'],
  rangeslider: ['slider-body', 'slider-track', 'slider-fill', 'thumb-low', 'thumb-high'],
  button: [
    'button-body', 'button-label', 'button-icon',
    'button-normal', 'button-pressed',
    'button-on', 'button-off',
    'button-indicator', 'button-led',
    'button-position-0', 'button-position-1', 'button-position-2',
    'button-base', 'button-selector',
    'button-highlight',
  ],
  meter: [
    'meter-body',
    'meter-fill',
    'meter-fill-green',
    'meter-fill-yellow',
    'meter-fill-red',
    'meter-scale',
    'meter-peak',
    'meter-segments',
  ],
  display: ['display-body', 'display-text', 'display-unit'],
  led: ['led-body', 'led-glow', 'led-ring'],
  switch: [
    'switch-body', 'switch-toggle', 'switch-label',
    'switch-normal', 'switch-pressed',
    'switch-on', 'switch-off',
    'switch-indicator', 'switch-led',
    'switch-position-0', 'switch-position-1', 'switch-position-2',
    'switch-base', 'switch-selector',
    'switch-highlight',
  ],
} as const

/**
 * Generate SVG arc path (used for knobs and arc sliders)
 */
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ')
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  }
}

/**
 * Export a knob element as SVG
 */
function exportKnobAsSVG(element: ElementConfig): string {
  const { width, height } = element
  const config = element as ElementConfig & {
    trackColor?: string
    fillColor?: string
    indicatorColor?: string
    value?: number
    minAngle?: number
    maxAngle?: number
    indicatorType?: string
  }

  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(width, height) / 2 - 4
  const trackRadius = radius - 4
  const indicatorLength = radius - 8

  const trackColor = config.trackColor || '#374151'
  const fillColor = config.fillColor || '#3b82f6'
  const indicatorColor = config.indicatorColor || '#ffffff'
  const value = config.value ?? 0.5
  const minAngle = config.minAngle ?? -135
  const maxAngle = config.maxAngle ?? 135
  const indicatorType = config.indicatorType || 'line'

  const currentAngle = minAngle + value * (maxAngle - minAngle)

  // Build SVG with named layers
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Knob Body -->
  <g id="knob-body">
    <circle cx="${cx}" cy="${cy}" r="${radius}" fill="#1f2937" stroke="#4b5563" stroke-width="2"/>
  </g>

  <!-- Knob Track (background arc) -->
  <g id="knob-track">
    <path d="${describeArc(cx, cy, trackRadius, minAngle, maxAngle)}"
          fill="none" stroke="${trackColor}" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- Knob Arc (value fill) -->
  <g id="knob-arc">
    <path d="${describeArc(cx, cy, trackRadius, minAngle, currentAngle)}"
          fill="none" stroke="${fillColor}" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- Knob Indicator -->
  <g id="knob-indicator" transform="rotate(${currentAngle}, ${cx}, ${cy})">
    ${indicatorType === 'line'
      ? `<line x1="${cx}" y1="${cy - indicatorLength}" x2="${cx}" y2="${cy - radius + 8}" stroke="${indicatorColor}" stroke-width="2" stroke-linecap="round"/>`
      : indicatorType === 'dot'
      ? `<circle cx="${cx}" cy="${cy - indicatorLength + 4}" r="3" fill="${indicatorColor}"/>`
      : `<line x1="${cx}" y1="${cy - indicatorLength}" x2="${cx}" y2="${cy - radius + 8}" stroke="${indicatorColor}" stroke-width="2" stroke-linecap="round"/>`
    }
  </g>
</svg>`
}

/**
 * Export a slider element as SVG
 */
function exportSliderAsSVG(element: ElementConfig): string {
  const { width, height } = element
  const config = element as ElementConfig & {
    trackColor?: string
    fillColor?: string
    thumbColor?: string
    value?: number
    orientation?: 'horizontal' | 'vertical'
  }

  const trackColor = config.trackColor || '#374151'
  const fillColor = config.fillColor || '#3b82f6'
  const thumbColor = config.thumbColor || '#ffffff'
  const value = config.value ?? 0.5
  const isVertical = config.orientation === 'vertical'

  const trackThickness = 6
  const thumbSize = 16

  if (isVertical) {
    const trackX = width / 2 - trackThickness / 2
    const fillHeight = height * value
    const thumbY = height - fillHeight - thumbSize / 2

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Slider Body -->
  <g id="slider-body">
    <rect x="0" y="0" width="${width}" height="${height}" fill="transparent"/>
  </g>

  <!-- Slider Track -->
  <g id="slider-track">
    <rect x="${trackX}" y="0" width="${trackThickness}" height="${height}" rx="3" fill="${trackColor}"/>
  </g>

  <!-- Slider Fill -->
  <g id="slider-fill">
    <rect x="${trackX}" y="${height - fillHeight}" width="${trackThickness}" height="${fillHeight}" rx="3" fill="${fillColor}"/>
  </g>

  <!-- Slider Thumb -->
  <g id="slider-thumb">
    <rect x="${width / 2 - thumbSize / 2}" y="${thumbY}" width="${thumbSize}" height="${thumbSize}" rx="2" fill="${thumbColor}" stroke="#9ca3af" stroke-width="1"/>
  </g>
</svg>`
  } else {
    const trackY = height / 2 - trackThickness / 2
    const fillWidth = width * value
    const thumbX = fillWidth - thumbSize / 2

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Slider Body -->
  <g id="slider-body">
    <rect x="0" y="0" width="${width}" height="${height}" fill="transparent"/>
  </g>

  <!-- Slider Track -->
  <g id="slider-track">
    <rect x="0" y="${trackY}" width="${width}" height="${trackThickness}" rx="3" fill="${trackColor}"/>
  </g>

  <!-- Slider Fill -->
  <g id="slider-fill">
    <rect x="0" y="${trackY}" width="${fillWidth}" height="${trackThickness}" rx="3" fill="${fillColor}"/>
  </g>

  <!-- Slider Thumb -->
  <g id="slider-thumb">
    <rect x="${thumbX}" y="${height / 2 - thumbSize / 2}" width="${thumbSize}" height="${thumbSize}" rx="2" fill="${thumbColor}" stroke="#9ca3af" stroke-width="1"/>
  </g>
</svg>`
  }
}

/**
 * Export a range slider element as SVG
 */
function exportRangeSliderAsSVG(element: ElementConfig): string {
  const { width, height } = element
  const config = element as ElementConfig & {
    trackColor?: string
    fillColor?: string
    thumbColor?: string
    minValue?: number
    maxValue?: number
    min?: number
    max?: number
    orientation?: 'horizontal' | 'vertical'
  }

  const trackColor = config.trackColor || '#374151'
  const fillColor = config.fillColor || '#3b82f6'
  const thumbColor = config.thumbColor || '#ffffff'
  const min = config.min ?? 0
  const max = config.max ?? 1
  const minValue = config.minValue ?? 0.3
  const maxValue = config.maxValue ?? 0.7
  const isVertical = config.orientation === 'vertical'

  const trackThickness = 6
  const thumbSize = 16

  // Normalize values to 0-1 range
  const normalizedMin = (minValue - min) / (max - min)
  const normalizedMax = (maxValue - min) / (max - min)

  if (isVertical) {
    const trackX = width / 2 - trackThickness / 2
    const fillStart = height * (1 - normalizedMax)
    const fillEnd = height * (1 - normalizedMin)
    const fillHeight = fillEnd - fillStart
    const thumbLowY = fillEnd - thumbSize / 2
    const thumbHighY = fillStart - thumbSize / 2

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Slider Body -->
  <g id="slider-body">
    <rect x="0" y="0" width="${width}" height="${height}" fill="transparent"/>
  </g>

  <!-- Slider Track -->
  <g id="slider-track">
    <rect x="${trackX}" y="0" width="${trackThickness}" height="${height}" rx="3" fill="${trackColor}"/>
  </g>

  <!-- Slider Fill -->
  <g id="slider-fill">
    <rect x="${trackX}" y="${fillStart}" width="${trackThickness}" height="${fillHeight}" rx="3" fill="${fillColor}"/>
  </g>

  <!-- Thumb Low (bottom/min) -->
  <g id="thumb-low">
    <rect x="${width / 2 - thumbSize / 2}" y="${thumbLowY}" width="${thumbSize}" height="${thumbSize}" rx="2" fill="${thumbColor}" stroke="#9ca3af" stroke-width="1"/>
  </g>

  <!-- Thumb High (top/max) -->
  <g id="thumb-high">
    <rect x="${width / 2 - thumbSize / 2}" y="${thumbHighY}" width="${thumbSize}" height="${thumbSize}" rx="2" fill="${thumbColor}" stroke="#9ca3af" stroke-width="1"/>
  </g>
</svg>`
  } else {
    const trackY = height / 2 - trackThickness / 2
    const fillStart = width * normalizedMin
    const fillEnd = width * normalizedMax
    const fillWidth = fillEnd - fillStart
    const thumbLowX = fillStart - thumbSize / 2
    const thumbHighX = fillEnd - thumbSize / 2

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Slider Body -->
  <g id="slider-body">
    <rect x="0" y="0" width="${width}" height="${height}" fill="transparent"/>
  </g>

  <!-- Slider Track -->
  <g id="slider-track">
    <rect x="0" y="${trackY}" width="${width}" height="${trackThickness}" rx="3" fill="${trackColor}"/>
  </g>

  <!-- Slider Fill -->
  <g id="slider-fill">
    <rect x="${fillStart}" y="${trackY}" width="${fillWidth}" height="${trackThickness}" rx="3" fill="${fillColor}"/>
  </g>

  <!-- Thumb Low (left/min) -->
  <g id="thumb-low">
    <rect x="${thumbLowX}" y="${height / 2 - thumbSize / 2}" width="${thumbSize}" height="${thumbSize}" rx="2" fill="${thumbColor}" stroke="#9ca3af" stroke-width="1"/>
  </g>

  <!-- Thumb High (right/max) -->
  <g id="thumb-high">
    <rect x="${thumbHighX}" y="${height / 2 - thumbSize / 2}" width="${thumbSize}" height="${thumbSize}" rx="2" fill="${thumbColor}" stroke="#9ca3af" stroke-width="1"/>
  </g>
</svg>`
  }
}

/**
 * Export a button element as SVG
 */
function exportButtonAsSVG(element: ElementConfig): string {
  const { width, height } = element
  const config = element as ElementConfig & {
    backgroundColor?: string
    textColor?: string
    label?: string
    borderRadius?: number
    fontSize?: number
  }

  const backgroundColor = config.backgroundColor || '#3b82f6'
  const textColor = config.textColor || '#ffffff'
  const label = config.label || 'Button'
  const borderRadius = config.borderRadius ?? 4
  const fontSize = config.fontSize ?? 14

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Button Body -->
  <g id="button-body">
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${borderRadius}" fill="${backgroundColor}" stroke="#1f2937" stroke-width="1"/>
  </g>

  <!-- Button Label -->
  <g id="button-label">
    <text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="central"
          fill="${textColor}" font-family="Inter, system-ui, sans-serif" font-size="${fontSize}" font-weight="500">
      ${escapeXml(label)}
    </text>
  </g>
</svg>`
}

/**
 * Export a meter element as SVG
 */
function exportMeterAsSVG(element: ElementConfig): string {
  const { width, height } = element
  const config = element as ElementConfig & {
    backgroundColor?: string
    fillColor?: string
    value?: number
    orientation?: 'horizontal' | 'vertical'
    showPeak?: boolean
    peakValue?: number
  }

  const backgroundColor = config.backgroundColor || '#1f2937'
  const fillColor = config.fillColor || '#22c55e'
  const value = config.value ?? 0.7
  const isVertical = config.orientation === 'vertical'
  const showPeak = config.showPeak ?? true
  const peakValue = config.peakValue ?? 0.85

  if (isVertical) {
    const fillHeight = (height - 4) * value
    const peakY = height - 2 - (height - 4) * peakValue

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Meter Body -->
  <g id="meter-body">
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="2" fill="${backgroundColor}" stroke="#374151" stroke-width="1"/>
  </g>

  <!-- Meter Fill -->
  <g id="meter-fill">
    <rect x="3" y="${height - 2 - fillHeight}" width="${width - 6}" height="${fillHeight}" fill="${fillColor}"/>
  </g>

  ${showPeak ? `<!-- Meter Peak -->
  <g id="meter-peak">
    <rect x="3" y="${peakY}" width="${width - 6}" height="2" fill="#ef4444"/>
  </g>` : ''}
</svg>`
  } else {
    const fillWidth = (width - 4) * value
    const peakX = 2 + (width - 4) * peakValue

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Meter Body -->
  <g id="meter-body">
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="2" fill="${backgroundColor}" stroke="#374151" stroke-width="1"/>
  </g>

  <!-- Meter Fill -->
  <g id="meter-fill">
    <rect x="3" y="3" width="${fillWidth}" height="${height - 6}" fill="${fillColor}"/>
  </g>

  ${showPeak ? `<!-- Meter Peak -->
  <g id="meter-peak">
    <rect x="${peakX}" y="3" width="2" height="${height - 6}" fill="#ef4444"/>
  </g>` : ''}
</svg>`
  }
}

/**
 * Export a generic element as SVG (fallback for unsupported types)
 */
function exportGenericAsSVG(element: ElementConfig): string {
  const { width, height, type } = element

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- ${type} placeholder -->
  <g id="${type}-body">
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="4" fill="#374151" stroke="#4b5563" stroke-width="1"/>
  </g>
  <g id="${type}-label">
    <text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="central"
          fill="#9ca3af" font-family="Inter, system-ui, sans-serif" font-size="12">
      ${escapeXml(type)}
    </text>
  </g>
</svg>`
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Export any UI element as SVG with named layers
 */
export function exportElementAsSVG(element: ElementConfig): string {
  const type = element.type.toLowerCase()

  // Route to specific exporters based on element type
  if (type.includes('knob')) {
    return exportKnobAsSVG(element)
  }
  if (type === 'rangeslider') {
    return exportRangeSliderAsSVG(element)
  }
  if (type.includes('slider')) {
    return exportSliderAsSVG(element)
  }
  if (type === 'button' || type === 'iconbutton') {
    return exportButtonAsSVG(element)
  }
  if (type === 'meter' || type.includes('meter')) {
    return exportMeterAsSVG(element)
  }

  // Fallback for unsupported types
  return exportGenericAsSVG(element)
}

/**
 * Download SVG as file
 */
export function downloadElementSVG(element: ElementConfig): void {
  const svg = exportElementAsSVG(element)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  // Format: Type-Library-ID.svg (e.g., "knob-Faceplate-6430bfb6.svg")
  // Library is "Faceplate" for built-in designs, future: "Vintage", "Minimal", etc.
  const library = (element as ElementConfig & { library?: string }).library || 'Faceplate'
  const shortId = element.id.slice(0, 8)

  const link = document.createElement('a')
  link.href = url
  link.download = `${element.type}-${library}-${shortId}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Check if an element type supports SVG export with named layers
 */
export function canExportElementAsSVG(type: string): boolean {
  const normalizedType = type.toLowerCase()

  // Knobs support SVG export
  if (normalizedType.includes('knob')) return true

  // All sliders support SVG export (including rangeslider)
  if (normalizedType.includes('slider')) return true

  // Buttons support SVG export
  if (normalizedType.includes('button')) return true

  // Switches support SVG export
  if (normalizedType.includes('switch')) return true

  // Meters support SVG export
  if (normalizedType.includes('meter')) return true

  return false
}

/**
 * Get layer names for a given element type
 */
export function getLayerNamesForType(type: string): string[] {
  const normalizedType = type.toLowerCase()

  if (normalizedType.includes('knob')) return [...LAYER_CONVENTIONS.knob]
  if (normalizedType === 'rangeslider') return [...LAYER_CONVENTIONS.rangeslider]
  if (normalizedType.includes('slider')) return [...LAYER_CONVENTIONS.slider]
  if (normalizedType.includes('button')) return [...LAYER_CONVENTIONS.button]
  if (normalizedType.includes('meter')) return [...LAYER_CONVENTIONS.meter]
  if (normalizedType.includes('display')) return [...LAYER_CONVENTIONS.display]
  if (normalizedType.includes('led')) return [...LAYER_CONVENTIONS.led]
  if (normalizedType.includes('switch')) return [...LAYER_CONVENTIONS.switch]

  return [`${normalizedType}-body`, `${normalizedType}-label`]
}
