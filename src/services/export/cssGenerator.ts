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

  // Responsive scaling wrapper
  const responsiveScaling = `/* Responsive Scaling */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #000;
}

#plugin-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}`

  // Container styles
  const container = `/* Container */
#plugin-container {
  position: relative;
  width: ${canvasWidth}px;
  height: ${canvasHeight}px;
  background-color: ${backgroundColor};
  overflow: hidden;
  transform-origin: center center;
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

  // Styled Knob Layers CSS
  const styledKnobStyles = `/* Styled Knob Layers */
.styled-knob {
  position: relative;
  width: 100%;
  height: 100%;
}

.styled-knob-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.knob-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.knob-layer svg {
  width: 100%;
  height: 100%;
}

.knob-indicator {
  transform-origin: center center;
  transition: transform 0.05s ease-out;
}

.knob-arc,
.knob-glow {
  transition: opacity 0.05s ease-out;
}`

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

${responsiveScaling}

${container}

${baseElement}

${styledKnobStyles}

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

    case 'textfield':
      return `${selector} {
  /* Text field */
  width: 100%;
  height: 100%;
  background-color: ${element.backgroundColor};
  color: ${element.textColor};
  border: ${element.borderWidth}px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  padding: ${element.padding}px;
  font-family: ${element.fontFamily};
  font-size: ${element.fontSize}px;
  text-align: ${element.textAlign};
  outline: none;
  box-sizing: border-box;
}

${selector}::placeholder {
  color: ${element.textColor}80; /* 50% opacity */
  opacity: 1;
}

${selector}:focus {
  border-color: ${element.borderColor};
  outline: 2px solid ${element.borderColor}40; /* 25% opacity */
  outline-offset: -1px;
}`

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

    case 'collapsible':
      return `${selector} {
  /* Collapsible Container */
  position: relative;
  border: ${element.borderWidth}px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

${selector} .collapsible-header {
  height: ${element.headerHeight}px;
  min-height: ${element.headerHeight}px;
  background-color: ${element.headerBackground};
  color: ${element.headerColor};
  font-size: ${element.headerFontSize}px;
  font-family: Inter, system-ui, sans-serif;
  font-weight: 500;
  display: flex;
  align-items: center;
  padding: 0 12px;
  user-select: none;
  cursor: pointer;
  border-bottom: ${element.collapsed ? 'none' : `${element.borderWidth}px solid ${element.borderColor}`};
}

${selector} .collapsible-arrow {
  margin-right: 8px;
  font-size: 10px;
  transition: transform 0.2s ease;
  transform: ${element.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};
}

${selector} .collapsible-content {
  flex: 1;
  background-color: ${element.contentBackground};
  overflow: ${element.scrollBehavior};
  max-height: ${element.collapsed ? '0px' : `${element.maxContentHeight}px`};
  opacity: ${element.collapsed ? 0 : 1};
  transition: max-height 0.3s ease, opacity 0.3s ease;
}`

    case 'dbdisplay':
      return `${selector} {
  /* dB Display */
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${element.fontFamily};
  font-size: ${element.fontSize}px;
  color: ${element.textColor};
  background-color: ${element.backgroundColor};
  padding: 0 ${element.padding}px;
  border-radius: 4px;
  box-sizing: border-box;
  user-select: none;
}`

    case 'frequencydisplay':
      return `${selector} {
  /* Frequency Display */
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${element.fontFamily};
  font-size: ${element.fontSize}px;
  color: ${element.textColor};
  background-color: ${element.backgroundColor};
  padding: 0 ${element.padding}px;
  border-radius: 4px;
  box-sizing: border-box;
  user-select: none;
}`

    case 'gainreductionmeter':
      return `${selector} {
  /* Gain Reduction Meter */
  position: relative;
  background-color: ${element.backgroundColor};
  border-radius: 2px;
  overflow: hidden;
}

${selector} .gr-fill {
  position: absolute;
  background-color: ${element.meterColor};
  border-radius: 2px;
}

${selector} .gr-value {
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: ${element.fontSize}px;
  color: ${element.textColor};
  font-family: 'Roboto Mono', monospace;
  user-select: none;
}`

    case 'presetbrowser':
      return `${selector} {
  /* Preset Browser */
  overflow: hidden;
}

${selector} .preset-search {
  padding: 8px;
  border-bottom: 1px solid ${element.borderColor};
}

${selector} .preset-search input {
  width: 100%;
  background-color: #111827;
  border: 1px solid ${element.borderColor};
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  color: #6b7280;
  outline: none;
}

${selector} .preset-list {
  overflow-y: auto;
  height: ${element.showSearch ? 'calc(100% - 50px)' : '100%'};
}

${selector} .preset-item {
  height: ${element.itemHeight}px;
  display: flex;
  align-items: center;
  padding-left: 8px;
  padding-right: 8px;
  background-color: ${element.itemColor};
  color: ${element.textColor};
  font-size: ${element.fontSize}px;
  font-family: Inter, system-ui, sans-serif;
  cursor: pointer;
  user-select: none;
}

${selector} .preset-item.selected {
  background-color: ${element.selectedColor};
  color: ${element.selectedTextColor};
}

${selector} .preset-item:hover:not(.selected) {
  background-color: rgba(59, 130, 246, 0.1);
}`

    case 'waveform':
      return `${selector} {
  /* Waveform Display */
  position: relative;
  background-color: ${element.backgroundColor};
  border: ${element.borderWidth}px solid ${element.borderColor};
  border-radius: 4px;
  overflow: hidden;
}

${selector} .waveform-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${element.waveformColor};
  opacity: 0.7;
  font-size: 12px;
  font-weight: 500;
  user-select: none;
}`

    case 'oscilloscope':
      const divPercent = 100 / element.gridDivisions
      return `${selector} {
  /* Oscilloscope Display */
  position: relative;
  background-color: ${element.backgroundColor};
  border: ${element.borderWidth}px solid ${element.borderColor};
  border-radius: 4px;
  overflow: hidden;
}

${selector} .oscilloscope-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(${element.gridColor} 1px, transparent 1px),
    linear-gradient(90deg, ${element.gridColor} 1px, transparent 1px);
  background-size: ${divPercent}% ${divPercent}%;
  opacity: ${element.showGrid ? 1 : 0};
}

${selector} .oscilloscope-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${element.traceColor};
  opacity: 0.7;
  font-size: 12px;
  font-weight: 500;
  user-select: none;
}`

    case 'svggraphic':
      return generateSvgGraphicCSS(id)

    case 'steppedknob':
      return `${selector} {
  /* Stepped Knob styles - SVG handles visual rendering */
  cursor: pointer;
  user-select: none;
}`

    case 'centerdetentknob':
      return `${selector} {
  /* Center Detent Knob styles - SVG handles visual rendering */
  cursor: pointer;
  user-select: none;
}`

    case 'dotindicatorknob':
      return `${selector} {
  /* Dot Indicator Knob styles - SVG handles visual rendering */
  cursor: pointer;
  user-select: none;
}`

    case 'multislider':
      return generateMultiSliderCSS(id, element)

    case 'bipolarslider':
      return `${selector} {
  /* Bipolar Slider styles - SVG handles visual rendering */
  cursor: ${element.orientation === 'vertical' ? 'ns-resize' : 'ew-resize'};
  user-select: none;
}`

    case 'crossfadeslider':
      return `${selector} {
  /* Crossfade Slider styles - SVG handles visual rendering */
  cursor: ew-resize;
  user-select: none;
}`

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = element
      throw new Error(`Unknown element type: ${(_exhaustive as ElementConfig).type}`)
  }
}

/**
 * Generate SVG Graphic CSS with containment styles
 */
function generateSvgGraphicCSS(id: string): string {
  return `/* SVG Graphic: ${id} */
#${id} {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

#${id} svg {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: contain;
}`
}

/**
 * Generate Multi-Slider CSS
 */
function generateMultiSliderCSS(id: string, element: ElementConfig & { type: 'multislider' }): string {
  const selector = `#${id}`
  return `/* Multi-Slider: ${id} */
${selector} {
  cursor: pointer;
  user-select: none;
}

${selector} .multislider-container {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 100%;
  gap: ${element.bandGap}px;
}

${selector} .multislider-band {
  flex: 1;
  background: ${element.trackColor};
  position: relative;
}

${selector} .multislider-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${element.fillColor};
}

${selector} .multislider-thumb {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: ${element.thumbColor};
}

${selector} .multislider-label {
  position: absolute;
  bottom: -${element.labelFontSize + 4}px;
  left: 50%;
  transform: translateX(-50%);
  font-size: ${element.labelFontSize}px;
  color: ${element.labelColor};
  white-space: nowrap;
}`
}
