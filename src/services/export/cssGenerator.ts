/**
 * CSS stylesheet generator for VST3 WebView UI export
 * Generates style.css with element-specific styling
 */

import type { ElementConfig, IconButtonElementConfig, KickButtonElementConfig, ToggleSwitchElementConfig, PowerButtonElementConfig, RockerSwitchElementConfig, RotarySwitchElementConfig, SegmentButtonElementConfig, StepperElementConfig, BreadcrumbElementConfig, MultiSelectDropdownElementConfig, ComboBoxElementConfig, MenuButtonElementConfig, TabBarElementConfig, TagSelectorElementConfig, TreeViewElementConfig, TooltipElementConfig, HorizontalSpacerElementConfig, VerticalSpacerElementConfig, WindowChromeElementConfig } from '../../types/elements'
import type { BaseProfessionalMeterConfig, CorrelationMeterElementConfig, StereoWidthMeterElementConfig } from '../../types/elements/displays'
import type { ScrollingWaveformElementConfig, SpectrumAnalyzerElementConfig, SpectrogramElementConfig, GoniometerElementConfig, VectorscopeElementConfig } from '../../types/elements/visualizations'
import type {
  EQCurveElementConfig,
  CompressorCurveElementConfig,
  EnvelopeDisplayElementConfig,
  LFODisplayElementConfig,
  FilterResponseElementConfig,
} from '../../types/elements/curves'
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

  // Collect unique fonts from label elements and value displays
  const usedFonts = new Set<string>()
  let uses7Segment = false

  elements.forEach(el => {
    if (el.type === 'label' && el.fontFamily) {
      usedFonts.add(el.fontFamily)
    }
    // Check for 7-segment font usage in displays
    if ('fontStyle' in el && el.fontStyle === '7segment') {
      uses7Segment = true
    }
  })

  // Generate @font-face rules for used fonts
  const fontFaces = Array.from(usedFonts)
    .map(family => getFontByFamily(family))
    .filter((f): f is FontDefinition => f !== undefined && f.file !== '')
    .map(generateFontFace)
    .join('\n\n')

  // Add DSEG7 font if any display uses 7-segment style
  const dseg7Font = uses7Segment ? `@font-face {
  font-family: 'DSEG7';
  src: url('./fonts/DSEG7-Classic-MINI.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}` : ''

  const allFonts = [fontFaces, dseg7Font].filter(Boolean).join('\n\n')
  const fontSection = allFonts ? `/* Embedded Fonts */\n${allFonts}\n\n` : ''

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
  cursor: pointer;
  user-select: none;
}`

    case 'centerdetentknob':
      return `${selector} {
  cursor: pointer;
  user-select: none;
}`

    case 'dotindicatorknob':
      return `${selector} {
  cursor: pointer;
  user-select: none;
}`

    case 'multislider':
      return generateMultiSliderCSS(id, element)

    case 'bipolarslider': {
      const slider = element as ElementConfig & { type: 'bipolarslider' }
      const isVertical = slider.orientation === 'vertical'
      return `${selector} {
  cursor: ${isVertical ? 'ns-resize' : 'ew-resize'};
  user-select: none;
  position: relative;
}
${selector} .slider-track {
  position: absolute;
  ${isVertical ? 'left: 50%; top: 0; bottom: 0; width: 6px; transform: translateX(-50%);' : 'top: 50%; left: 0; right: 0; height: 6px; transform: translateY(-50%);'}
  border-radius: 3px;
}
${selector} .slider-center-mark {
  position: absolute;
  ${isVertical ? 'left: 50%; width: 12px; height: 2px; transform: translateX(-50%);' : 'top: 50%; width: 2px; height: 12px; transform: translateY(-50%);'}
}
${selector} .slider-fill {
  position: absolute;
  ${isVertical ? 'left: 50%; width: 6px; transform: translateX(-50%);' : 'top: 50%; height: 6px; transform: translateY(-50%);'}
  border-radius: 3px;
}
${selector} .slider-thumb {
  position: absolute;
  ${isVertical ? 'left: 50%; width: 20px; height: 10px; transform: translate(-50%, 50%);' : 'top: 50%; width: 10px; height: 20px; transform: translate(-50%, -50%);'}
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}`
    }

    case 'crossfadeslider':
      return `${selector} {
  cursor: ew-resize;
  user-select: none;
  position: relative;
}
${selector} .crossfade-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 10px;
}
${selector} .slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 6px;
  transform: translateY(-50%);
  border-radius: 0;
}
${selector} .slider-fill {
  position: absolute;
  top: 50%;
  height: 6px;
  transform: translateY(-50%);
  border-radius: 0;
}
${selector} .center-detent {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2px;
  height: 14px;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
}
${selector} .slider-thumb {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 20px;
  transform: translate(-50%, -50%);
  border-radius: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}`

    case 'notchedslider': {
      const slider = element as ElementConfig & { type: 'notchedslider' }
      const isVertical = slider.orientation === 'vertical'
      return `${selector} {
  cursor: ${isVertical ? 'ns-resize' : 'ew-resize'};
  user-select: none;
  position: relative;
}
${selector} .slider-track {
  position: absolute;
  ${isVertical ? 'left: 50%; top: 0; bottom: 0; width: 6px; transform: translateX(-50%);' : 'top: 50%; left: 0; right: 0; height: 6px; transform: translateY(-50%);'}
  border-radius: 3px;
}
${selector} .notches {
  position: absolute;
  ${isVertical ? 'left: 50%; top: 0; bottom: 0; width: 20px; transform: translateX(-50%);' : 'top: 50%; left: 0; right: 0; height: 20px; transform: translateY(-50%);'}
}
${selector} .notch {
  position: absolute;
  ${isVertical ? 'left: 50%; width: 10px; height: 2px; transform: translateX(-50%);' : 'top: 50%; width: 2px; height: 10px; transform: translateY(-50%);'}
}
${selector} .slider-fill {
  position: absolute;
  ${isVertical ? 'left: 50%; bottom: 0; width: 6px; transform: translateX(-50%);' : 'top: 50%; left: 0; height: 6px; transform: translateY(-50%);'}
  border-radius: 3px;
}
${selector} .slider-thumb {
  position: absolute;
  ${isVertical ? 'left: 50%; width: 20px; height: 10px; transform: translate(-50%, 50%);' : 'top: 50%; width: 10px; height: 20px; transform: translate(-50%, -50%);'}
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}`
    }

    case 'arcslider':
      return `${selector} {
  position: relative;
  cursor: pointer;
  user-select: none;
}

${selector} .arcslider-label,
${selector} .arcslider-value {
  position: absolute;
  white-space: nowrap;
  user-select: none;
}

${selector} .arcslider-label-top,
${selector} .arcslider-value-top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 4px;
}

${selector} .arcslider-label-bottom,
${selector} .arcslider-value-bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
}

${selector} .arcslider-label-left,
${selector} .arcslider-value-left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 4px;
}

${selector} .arcslider-label-right,
${selector} .arcslider-value-right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 4px;
}`

    case 'rockerswitch':
      return generateRockerSwitchCSS(selector, element)

    case 'rotaryswitch':
      return generateRotarySwitchCSS(selector, element)

    case 'segmentbutton':
      return generateSegmentButtonCSS(selector, element)

    case 'iconbutton':
      return generateIconButtonCSS(selector, element)

    case 'kickbutton':
      return generateKickButtonCSS(selector, element)

    case 'toggleswitch':
      return generateToggleSwitchCSS(selector, element)

    case 'powerbutton':
      return generatePowerButtonCSS(selector, element)

    case 'numericdisplay':
      return generateNumericDisplayCSS(selector, element)

    case 'timedisplay':
      return generateTimeDisplayCSS(selector, element)

    case 'percentagedisplay':
      return generatePercentageDisplayCSS(selector, element)

    case 'ratiodisplay':
      return generateRatioDisplayCSS(selector, element)

    case 'notedisplay':
      return generateNoteDisplayCSS(selector, element)

    case 'bpmdisplay':
      return generateBpmDisplayCSS(selector, element)

    case 'editabledisplay':
      return generateEditableDisplayCSS(selector, element)

    case 'multivaluedisplay':
      return generateMultiValueDisplayCSS(selector, element)

    case 'singleled':
      return generateSingleLedCSS(selector, element)

    case 'bicolorled':
      return generateBiColorLedCSS(selector, element)

    case 'tricolorled':
      return generateTriColorLedCSS(selector, element)

    case 'ledarray':
      return generateLedArrayCSS(selector, element)

    case 'ledring':
      return generateLedRingCSS(selector, element)

    case 'ledmatrix':
      return generateLedMatrixCSS(selector, element)

    // Professional Meters - Level Meters (segmented)
    case 'rmsmetermo':
    case 'rmsmeterstereo':
    case 'vumetermono':
    case 'vumeterstereo':
    case 'ppmtype1mono':
    case 'ppmtype1stereo':
    case 'ppmtype2mono':
    case 'ppmtype2stereo':
    case 'truepeakmetermono':
    case 'truepeakmeterstereo':
    case 'lufsmomomo':
    case 'lufsmomostereo':
    case 'lufsshortmono':
    case 'lufsshortstereo':
    case 'lufsintmono':
    case 'lufsintstereo':
    case 'k12metermono':
    case 'k12meterstereo':
    case 'k14metermono':
    case 'k14meterstereo':
    case 'k20metermono':
    case 'k20meterstereo': {
      const config = element as BaseProfessionalMeterConfig
      let css = generateSegmentedMeterCSS(config, selector)

      // For stereo meters, add wrapper styles
      if (element.type.includes('stereo')) {
        css += `
${selector} .stereo-wrapper {
  display: flex;
  gap: 8px;
}

${selector} .channel-label {
  font-size: 10px;
  color: #999999;
  text-align: center;
}
`
      }

      return css
    }

    // Professional Meters - Analysis Meters (horizontal bars)
    case 'correlationmeter': {
      const config = element as CorrelationMeterElementConfig
      return generateHorizontalBarMeterCSS(config, selector)
    }

    case 'stereowidthmeter': {
      const config = element as StereoWidthMeterElementConfig
      return generateHorizontalBarMeterCSS(config, selector)
    }

    // Navigation Elements
    case 'stepper':
      return generateStepperCSS(selector, element as StepperElementConfig)

    case 'breadcrumb':
      return generateBreadcrumbCSS(selector, element as BreadcrumbElementConfig)

    case 'multiselectdropdown':
      return generateMultiSelectDropdownCSS(selector, element as MultiSelectDropdownElementConfig)

    case 'combobox':
      return generateComboBoxCSS(selector, element as ComboBoxElementConfig)

    case 'menubutton':
      return generateMenuButtonCSS(selector, element as MenuButtonElementConfig)

    case 'tabbar':
      return generateTabBarCSS(selector, element as TabBarElementConfig)

    case 'tagselector':
      return generateTagSelectorCSS(selector, element as TagSelectorElementConfig)

    case 'treeview':
      return generateTreeViewCSS(selector, element as TreeViewElementConfig)

    // Visualization Elements
    case 'scrollingwaveform':
    case 'spectrumanalyzer':
    case 'spectrogram':
    case 'goniometer':
    case 'vectorscope':
      return generateVisualizationCSS(element as ScrollingWaveformElementConfig | SpectrumAnalyzerElementConfig | SpectrogramElementConfig | GoniometerElementConfig | VectorscopeElementConfig)

    // Curve Elements
    case 'eqcurve':
    case 'compressorcurve':
    case 'envelopedisplay':
    case 'lfodisplay':
    case 'filterresponse':
      return generateCurveCSS(element as EQCurveElementConfig | CompressorCurveElementConfig | EnvelopeDisplayElementConfig | LFODisplayElementConfig | FilterResponseElementConfig)

    // Container Elements
    case 'tooltip':
      return generateTooltipCSS(selector, element as TooltipElementConfig)

    case 'horizontalspacer':
      return generateHorizontalSpacerCSS(selector, element as HorizontalSpacerElementConfig)

    case 'verticalspacer':
      return generateVerticalSpacerCSS(selector, element as VerticalSpacerElementConfig)

    case 'windowchrome':
      return generateWindowChromeCSS(selector, element as WindowChromeElementConfig)

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

// ============================================================================
// Button/Switch CSS Generation Functions
// ============================================================================

/**
 * Generate Icon Button CSS
 */
function generateIconButtonCSS(selector: string, element: IconButtonElementConfig): string {
  return `/* Icon Button */
${selector} {
  background-color: ${element.backgroundColor};
  border: 2px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: none;
  padding: 0;
  box-sizing: border-box;
}

${selector}[data-pressed="true"] {
  filter: brightness(0.85);
}

${selector} .icon {
  width: 70%;
  height: 70%;
  color: ${element.iconColor};
  display: flex;
  align-items: center;
  justify-content: center;
}

${selector} .icon svg {
  width: 100%;
  height: 100%;
}`
}

/**
 * Generate Kick Button CSS
 */
function generateKickButtonCSS(selector: string, element: KickButtonElementConfig): string {
  return `/* Kick Button */
${selector} {
  background-color: ${element.backgroundColor};
  color: ${element.textColor};
  border: 2px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  font-size: 14px;
  font-weight: 600;
  font-family: Inter, system-ui, sans-serif;
  cursor: pointer;
  transition: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
}

${selector}[data-pressed="true"] {
  filter: brightness(1.2);
}`
}

/**
 * Generate Toggle Switch CSS
 */
function generateToggleSwitchCSS(selector: string, element: ToggleSwitchElementConfig): string {
  const trackHeight = element.height
  const thumbSize = trackHeight - 8
  const thumbTravel = element.width - trackHeight

  return `/* Toggle Switch */
${selector} {
  position: relative;
  border-radius: ${trackHeight / 2}px;
  border: 2px solid ${element.borderColor};
  cursor: pointer;
  transition: none;
  box-sizing: border-box;
}

${selector}[data-on="false"] {
  background-color: ${element.offColor};
}

${selector}[data-on="true"] {
  background-color: ${element.onColor};
}

${selector} .track {
  display: none;
}

${selector} .thumb {
  position: absolute;
  width: ${thumbSize}px;
  height: ${thumbSize}px;
  background-color: ${element.thumbColor};
  border-radius: 50%;
  top: 2px;
  transition: none;
}

${selector}[data-on="false"] .thumb {
  left: 2px;
}

${selector}[data-on="true"] .thumb {
  left: ${thumbTravel + 2}px;
}

${selector} .label-off,
${selector} .label-on {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: ${element.labelColor};
  user-select: none;
}

${selector} .label-off {
  left: -30px;
}

${selector} .label-on {
  right: -30px;
}`
}

/**
 * Generate Power Button CSS
 */
function generatePowerButtonCSS(selector: string, element: PowerButtonElementConfig): string {
  return `/* Power Button */
${selector} {
  background-color: ${element.backgroundColor};
  color: ${element.textColor};
  border: 2px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: none;
  position: relative;
  font-family: Inter, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 0;
  box-sizing: border-box;
}

${selector}[data-on="true"] {
  filter: brightness(1.1);
}

${selector} .label {
  user-select: none;
}

${selector} .led {
  position: absolute;
  width: ${element.ledSize}px;
  height: ${element.ledSize}px;
  border-radius: 50%;
  transition: none;
}

${selector}[data-led-position="top"] .led {
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
}

${selector}[data-led-position="bottom"] .led {
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
}

${selector}[data-led-position="left"] .led {
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
}

${selector}[data-led-position="right"] .led {
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
}

${selector}[data-led-position="center"] .led {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

${selector}[data-on="false"] .led {
  background-color: ${element.ledOffColor};
}

${selector}[data-on="true"] .led {
  background-color: ${element.ledOnColor};
  box-shadow: 0 0 4px ${element.ledOnColor};
}`
}

/**
 * Generate Rocker Switch CSS
 */
function generateRockerSwitchCSS(selector: string, element: RockerSwitchElementConfig): string {
  // Match RockerSwitchRenderer.tsx flexbox layout
  return `/* Rocker Switch */
${selector} {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  user-select: none;
}

${selector} .track {
  position: relative;
  width: 30px;
  min-width: 30px;
  height: 85%;
  background-color: ${element.backgroundColor};
  border: 2px solid ${element.borderColor};
  border-radius: 4px;
}

${selector} .paddle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 4px);
  height: 33.33%;
  background-color: ${element.switchColor};
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
  transition: none;
}

${selector}[data-position="2"] .paddle {
  top: 2px;
}

${selector}[data-position="1"] .paddle {
  top: 33.33%;
}

${selector}[data-position="0"] .paddle {
  bottom: 2px;
}

${selector} .labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 85%;
  font-size: 10px;
  font-family: Inter, system-ui, sans-serif;
  color: ${element.labelColor};
}

${selector} .label-up,
${selector} .label-down {
  user-select: none;
}

${selector}[data-position="2"] .label-up {
  opacity: 1;
}

${selector}[data-position="1"] .label-up,
${selector}[data-position="1"] .label-down {
  opacity: 0.5;
}

${selector}[data-position="0"] .label-down {
  opacity: 1;
}

${selector}:not([data-position="2"]) .label-up {
  opacity: 0.5;
}

${selector}:not([data-position="0"]) .label-down {
  opacity: 0.5;
}`
}

/**
 * Generate Rotary Switch CSS
 */
function generateRotarySwitchCSS(selector: string, element: RotarySwitchElementConfig): string {
  return `/* Rotary Switch */
${selector} {
  position: relative;
}

${selector} .body {
  position: absolute;
  width: 80%;
  height: 80%;
  left: 10%;
  top: 10%;
  border-radius: 50%;
  background-color: ${element.backgroundColor};
  border: 2px solid ${element.borderColor};
  box-sizing: border-box;
}

${selector} .pointer {
  position: absolute;
  width: 4px;
  height: 30%;
  left: calc(50% - 2px);
  top: 10%;
  background-color: ${element.pointerColor};
  transform-origin: center bottom;
  transition: none;
  border-radius: 2px;
}

${selector} .labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

${selector} .labels .label {
  position: absolute;
  font-size: ${element.labelFontSize}px;
  color: ${element.labelColor};
  user-select: none;
  transform: translate(-50%, -50%);
}

/* Legend layout places labels in a list outside the knob */
${selector} .labels[data-layout="legend"] {
  left: 110%;
  width: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

${selector} .labels[data-layout="legend"] .label {
  position: static;
  transform: none;
}`
}

/**
 * Generate Segment Button CSS
 */
function generateSegmentButtonCSS(selector: string, element: SegmentButtonElementConfig): string {
  const isVertical = element.orientation === 'vertical'
  const flexDirection = isVertical ? 'column' : 'row'
  const borderStyle = isVertical
    ? `border-right: none; border-bottom: 1px solid ${element.borderColor};`
    : `border-right: 1px solid ${element.borderColor}; border-bottom: none;`

  return `/* Segment Button */
${selector} {
  display: flex;
  flex-direction: ${flexDirection};
  background-color: ${element.backgroundColor};
  border: 2px solid ${element.borderColor};
  border-radius: 4px;
  overflow: hidden;
  box-sizing: border-box;
}

${selector} .segment {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px;
  color: ${element.textColor};
  ${borderStyle}
  cursor: pointer;
  transition: none;
  user-select: none;
}

${selector} .segment:last-child {
  border-right: none;
  border-bottom: none;
}

${selector} .segment[data-selected="true"] {
  background-color: ${element.selectedColor};
  color: ${element.selectedTextColor};
}

${selector} .segment-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

${selector} .segment-icon svg {
  width: 100%;
  height: 100%;
}

${selector} .segment-text {
  font-size: 12px;
  font-family: Inter, system-ui, sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`
}

// ============================================================================
// Value Display CSS Generation Functions
// ============================================================================

/**
 * Generate base display CSS (shared across display types)
 */
function generateBaseDisplayCSS(
  selector: string,
  element: { fontSize: number; fontFamily: string; fontStyle?: '7segment' | 'modern'; textColor: string; backgroundColor: string; padding: number; bezelStyle?: 'inset' | 'flat' | 'none'; borderColor?: string }
): string {
  const fontFamily = element.fontStyle === '7segment' ? 'DSEG7, monospace' : element.fontFamily

  let bezelCSS = ''
  if (element.bezelStyle === 'inset') {
    bezelCSS = `
${selector}[data-bezel="inset"] {
  box-shadow: inset 2px 2px 4px rgba(0,0,0,0.5);
  border-radius: 4px;
}`
  } else if (element.bezelStyle === 'flat') {
    bezelCSS = `
${selector}[data-bezel="flat"] {
  border: 2px solid ${element.borderColor || '#374151'};
  border-radius: 4px;
}`
  } else if (element.bezelStyle === 'none') {
    bezelCSS = `
${selector}[data-bezel="none"] {
  border: none;
  border-radius: 0;
}`
  }

  const ghostSegmentCSS = element.fontStyle === '7segment' ? `
${selector}[data-font-style="7segment"] {
  position: relative;
}

${selector} .ghost {
  position: absolute;
  opacity: 0.25;
  letter-spacing: 0.05em;
}

${selector} .value {
  position: relative;
  z-index: 1;
  letter-spacing: 0.05em;
}` : `
${selector} .value {
  position: relative;
  z-index: 1;
}`

  return `${selector} {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${fontFamily};
  font-size: ${element.fontSize}px;
  color: ${element.textColor};
  background-color: ${element.backgroundColor};
  padding: ${element.padding}px;
  box-sizing: border-box;
  user-select: none;
}
${bezelCSS}
${ghostSegmentCSS}`
}

/**
 * Generate Numeric Display CSS
 */
function generateNumericDisplayCSS(selector: string, element: ElementConfig & { type: 'numericdisplay' }): string {
  return `/* Numeric Display */
${generateBaseDisplayCSS(selector, element)}

${selector} .unit {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: ${element.fontSize * 0.6}px;
  opacity: 0.7;
}`
}

/**
 * Generate Time Display CSS
 */
function generateTimeDisplayCSS(selector: string, element: ElementConfig & { type: 'timedisplay' }): string {
  return `/* Time Display */
${generateBaseDisplayCSS(selector, element)}`
}

/**
 * Generate Percentage Display CSS
 */
function generatePercentageDisplayCSS(selector: string, element: ElementConfig & { type: 'percentagedisplay' }): string {
  return `/* Percentage Display */
${generateBaseDisplayCSS(selector, element)}`
}

/**
 * Generate Ratio Display CSS
 */
function generateRatioDisplayCSS(selector: string, element: ElementConfig & { type: 'ratiodisplay' }): string {
  return `/* Ratio Display */
${generateBaseDisplayCSS(selector, element)}`
}

/**
 * Generate Note Display CSS
 */
function generateNoteDisplayCSS(selector: string, element: ElementConfig & { type: 'notedisplay' }): string {
  return `/* Note Display */
${generateBaseDisplayCSS(selector, element)}

${selector} {
  flex-direction: column;
}

${selector} .note {
  font-weight: 600;
}

${selector} .midi {
  font-size: ${element.fontSize * 0.5}px;
  opacity: 0.6;
  margin-top: 2px;
}`
}

/**
 * Generate BPM Display CSS
 */
function generateBpmDisplayCSS(selector: string, element: ElementConfig & { type: 'bpmdisplay' }): string {
  return `/* BPM Display */
${generateBaseDisplayCSS(selector, element)}

${selector} .label {
  margin-left: 4px;
  font-size: ${element.fontSize * 0.7}px;
  opacity: 0.7;
}`
}

/**
 * Generate Editable Display CSS
 */
function generateEditableDisplayCSS(selector: string, element: ElementConfig & { type: 'editabledisplay' }): string {
  return `/* Editable Display */
${selector} {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${element.fontFamily};
  font-size: ${element.fontSize}px;
  color: ${element.textColor};
  background-color: ${element.backgroundColor};
  padding: ${element.padding}px;
  box-sizing: border-box;
  user-select: none;
  cursor: pointer;
  border: 2px solid ${element.borderColor};
  border-radius: 4px;
}`
}

/**
 * Generate Multi-Value Display CSS
 */
function generateMultiValueDisplayCSS(selector: string, element: ElementConfig & { type: 'multivaluedisplay' }): string {
  return `/* Multi-Value Display */
${selector} {
  display: flex;
  flex-direction: ${element.layout === 'vertical' ? 'column' : 'row'};
  justify-content: space-around;
  gap: 4px;
  font-family: ${element.fontFamily};
  font-size: ${element.fontSize}px;
  color: ${element.textColor};
  background-color: ${element.backgroundColor};
  padding: ${element.padding}px;
  box-sizing: border-box;
  user-select: none;
}

${selector} .value-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

${selector} .label {
  font-size: ${element.fontSize * 0.7}px;
  opacity: 0.7;
  margin-bottom: 2px;
}`
}

// ============================================================================
// Professional Meter CSS Generation Functions
// ============================================================================

/**
 * Generate CSS for segmented meters (RMS, VU, PPM, True Peak, LUFS, K-System)
 */
function generateSegmentedMeterCSS(
  element: BaseProfessionalMeterConfig,
  selector: string
): string {
  const isVertical = element.orientation === 'vertical'
  const { segmentCount, segmentGap, colorZones, minDb, maxDb } = element

  // Generate color zone CSS variables
  const zoneColors = colorZones.map((zone, i) =>
    `--meter-zone-${i}: ${zone.color};`
  ).join('\n  ')

  // Generate segment styles
  const gridTemplate = isVertical
    ? `grid-template-rows: repeat(${segmentCount}, 1fr);`
    : `grid-template-columns: repeat(${segmentCount}, 1fr);`

  return `
${selector} {
  display: grid;
  ${gridTemplate}
  gap: ${segmentGap}px;
  background-color: #000000;
  ${zoneColors}
}

${selector} .meter-segment {
  border-radius: 1px;
  transition: none;
}

${selector} .meter-segment.off {
  opacity: 0.3;
}

${selector} .meter-segment.on {
  opacity: 1;
}

${selector} .peak-hold {
  position: absolute;
  background-color: #ffffff;
  transition: none;
}
`
}

/**
 * Generate CSS for horizontal bar meters (Correlation, Stereo Width)
 */
function generateHorizontalBarMeterCSS(
  element: CorrelationMeterElementConfig | StereoWidthMeterElementConfig,
  selector: string
): string {
  const { barHeight, colorZones } = element

  // Generate color zone CSS variables
  const zoneColors = colorZones.map((zone, i) =>
    `--meter-zone-${i}: ${zone.color};`
  ).join('\n  ')

  return `
${selector} {
  display: flex;
  flex-direction: column;
  ${zoneColors}
}

${selector} .meter-track {
  width: 100%;
  height: ${barHeight}px;
  background-color: #333333;
  border-radius: 2px;
  position: relative;
}

${selector} .center-marker {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #666666;
  transform: translateX(-50%);
}

${selector} .meter-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 2px;
  transition: none;
}

${selector} .meter-scale {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #999999;
}

${selector} .meter-readout {
  text-align: center;
  font-size: 12px;
}
`
}

// ============================================================================
// LED Indicator CSS Generation Functions
// ============================================================================

/**
 * Generate Single LED CSS
 */
function generateSingleLedCSS(selector: string, element: ElementConfig & { type: 'singleled' }): string {
  return `/* Single LED */
${selector} {
  border-radius: ${element.shape === 'round' ? '50%' : `${element.cornerRadius}px`};
  transition: none;
}

${selector}[data-state="off"] {
  background-color: ${element.offColor};
}

${selector}[data-state="on"] {
  background-color: ${element.onColor};
  ${element.glowEnabled ? `box-shadow: 0 0 ${element.glowRadius}px ${element.glowIntensity}px ${element.onColor};` : ''}
}`
}

/**
 * Generate Bi-Color LED CSS
 */
function generateBiColorLedCSS(selector: string, element: ElementConfig & { type: 'bicolorled' }): string {
  return `/* Bi-Color LED */
${selector} {
  border-radius: ${element.shape === 'round' ? '50%' : `${element.cornerRadius}px`};
  transition: none;
}

${selector}[data-state="green"] {
  background-color: ${element.greenColor};
  ${element.glowEnabled ? `box-shadow: 0 0 ${element.glowRadius}px ${element.glowIntensity}px ${element.greenColor};` : ''}
}

${selector}[data-state="red"] {
  background-color: ${element.redColor};
  ${element.glowEnabled ? `box-shadow: 0 0 ${element.glowRadius}px ${element.glowIntensity}px ${element.redColor};` : ''}
}`
}

/**
 * Generate Tri-Color LED CSS
 */
function generateTriColorLedCSS(selector: string, element: ElementConfig & { type: 'tricolorled' }): string {
  return `/* Tri-Color LED */
${selector} {
  border-radius: ${element.shape === 'round' ? '50%' : `${element.cornerRadius}px`};
  transition: none;
}

${selector}[data-state="off"] {
  background-color: ${element.offColor};
}

${selector}[data-state="yellow"] {
  background-color: ${element.yellowColor};
  ${element.glowEnabled ? `box-shadow: 0 0 ${element.glowRadius}px ${element.glowIntensity}px ${element.yellowColor};` : ''}
}

${selector}[data-state="red"] {
  background-color: ${element.redColor};
  ${element.glowEnabled ? `box-shadow: 0 0 ${element.glowRadius}px ${element.glowIntensity}px ${element.redColor};` : ''}
}`
}

/**
 * Generate LED Array CSS
 */
function generateLedArrayCSS(selector: string, element: ElementConfig & { type: 'ledarray' }): string {
  const isHorizontal = element.orientation === 'horizontal'
  return `/* LED Array */
${selector} {
  display: flex;
  flex-direction: ${isHorizontal ? 'row' : 'column'};
  gap: ${element.spacing}px;
  align-items: center;
  justify-content: space-between;
}

${selector} .led-segment {
  flex: 1;
  max-width: ${isHorizontal ? `${element.width / element.segmentCount - element.spacing}px` : '100%'};
  max-height: ${!isHorizontal ? `${element.height / element.segmentCount - element.spacing}px` : '100%'};
  border-radius: ${element.shape === 'round' ? '50%' : `${element.cornerRadius}px`};
  transition: none;
}

${selector} .led-segment[data-lit="false"] {
  background-color: ${element.offColor};
}

${selector} .led-segment[data-lit="true"] {
  background-color: ${element.onColor};
  ${element.glowEnabled ? `box-shadow: 0 0 ${element.glowRadius}px ${element.glowIntensity}px ${element.onColor};` : ''}
}`
}

/**
 * Generate LED Ring CSS
 */
function generateLedRingCSS(selector: string, element: ElementConfig & { type: 'ledring' }): string {
  return `/* LED Ring */
${selector} {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

${selector} svg {
  overflow: visible;
  width: ${element.diameter}px;
  height: ${element.diameter}px;
}`
}

/**
 * Generate LED Matrix CSS
 */
function generateLedMatrixCSS(selector: string, element: ElementConfig & { type: 'ledmatrix' }): string {
  return `/* LED Matrix */
${selector} {
  display: grid;
  grid-template-rows: repeat(${element.rows}, 1fr);
  grid-template-columns: repeat(${element.columns}, 1fr);
  gap: ${element.spacing}px;
  padding: ${element.spacing}px;
}

${selector} .led-cell {
  border-radius: ${element.shape === 'round' ? '50%' : `${element.cornerRadius}px`};
  justify-self: center;
  align-self: center;
  width: calc(100% - ${element.spacing}px);
  height: calc(100% - ${element.spacing}px);
  transition: none;
}

${selector} .led-cell[data-lit="false"] {
  background-color: ${element.offColor};
}

${selector} .led-cell[data-lit="true"] {
  background-color: ${element.onColor};
  ${element.glowEnabled ? `box-shadow: 0 0 ${element.glowRadius}px ${element.glowIntensity}px ${element.onColor};` : ''}
}`
}

// ============================================================================
// Navigation Element CSS Generation Functions
// ============================================================================

/**
 * Generate Stepper CSS
 */
function generateStepperCSS(selector: string, element: StepperElementConfig): string {
  const isVertical = element.orientation === 'vertical'
  return `/* Stepper */
${selector} {
  display: flex;
  flex-direction: ${isVertical ? 'column' : 'row'};
  align-items: center;
  gap: 8px;
  background-color: ${element.backgroundColor};
  border: 2px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  padding: 4px;
  box-sizing: border-box;
}

${selector} .stepper-button {
  width: ${element.buttonSize}px;
  height: ${element.buttonSize}px;
  background-color: ${element.buttonColor};
  border: none;
  border-radius: 4px;
  color: ${element.textColor};
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: none;
  user-select: none;
}

${selector} .stepper-button:hover {
  background-color: ${element.buttonHoverColor};
}

${selector} .stepper-button.decrement::before {
  content: '−';
}

${selector} .stepper-button.increment::before {
  content: '+';
}

${selector} .stepper-value {
  color: ${element.textColor};
  font-size: 14px;
  font-family: Inter, system-ui, sans-serif;
  font-weight: 500;
  user-select: none;
  min-width: 40px;
  text-align: center;
}`
}

/**
 * Generate Breadcrumb CSS
 */
function generateBreadcrumbCSS(selector: string, element: BreadcrumbElementConfig): string {
  return `/* Breadcrumb */
${selector} {
  font-family: Inter, system-ui, sans-serif;
}

${selector} ol {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
}

${selector} li {
  display: flex;
  align-items: center;
  gap: 8px;
}

${selector} a {
  color: ${element.linkColor};
  text-decoration: none;
  font-size: ${element.fontSize}px;
  transition: none;
}

${selector} a:hover {
  color: ${element.hoverColor};
}

${selector} .breadcrumb-current {
  color: ${element.currentColor};
  font-size: ${element.fontSize}px;
  font-weight: 500;
}

${selector} .breadcrumb-separator {
  color: ${element.separatorColor};
  font-size: ${element.fontSize}px;
  user-select: none;
}

${selector} .breadcrumb-ellipsis {
  color: ${element.separatorColor};
  font-size: ${element.fontSize}px;
  user-select: none;
}`
}

/**
 * Generate shared dropdown base CSS (used by Multi-Select, ComboBox, MenuButton)
 */
function generateDropdownBaseCSS(selector: string): string {
  return `
${selector} .dropdown-container {
  position: relative;
}

${selector} .dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background-color: inherit;
  border: 1px solid;
  border-color: inherit;
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease-in;
  z-index: 1000;
}

${selector}.open .dropdown-menu {
  opacity: 1;
  pointer-events: all;
  transition: opacity 100ms ease-out;
}

${selector} .dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  transition: none;
}

${selector} .dropdown-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

${selector} .dropdown-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

${selector} .dropdown-item.disabled:hover {
  background-color: transparent;
}`
}

/**
 * Generate Multi-Select Dropdown CSS
 */
function generateMultiSelectDropdownCSS(selector: string, element: MultiSelectDropdownElementConfig): string {
  return `/* Multi-Select Dropdown */
${selector} {
  background-color: ${element.backgroundColor};
  color: ${element.textColor};
  border: 2px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  padding: 8px 12px;
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
}
${generateDropdownBaseCSS(selector)}

${selector} .selected-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

${selector} .dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

${selector} .dropdown-item input[type="checkbox"] {
  cursor: pointer;
}`
}

/**
 * Generate Combo Box CSS
 */
function generateComboBoxCSS(selector: string, element: ComboBoxElementConfig): string {
  return `/* Combo Box */
${selector} {
  background-color: ${element.backgroundColor};
  color: ${element.textColor};
  border: 2px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
  box-sizing: border-box;
}
${generateDropdownBaseCSS(selector)}

${selector} input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-size: inherit;
  padding: 8px 12px;
}

${selector} input::placeholder {
  color: currentColor;
  opacity: 0.5;
}

${selector} .empty-state {
  padding: 8px 12px;
  color: currentColor;
  opacity: 0.6;
  font-style: italic;
  user-select: none;
}`
}

/**
 * Generate Menu Button CSS
 */
function generateMenuButtonCSS(selector: string, element: MenuButtonElementConfig): string {
  return `/* Menu Button */
${selector} {
  background-color: ${element.backgroundColor};
  color: ${element.textColor};
  border: 2px solid ${element.borderColor};
  border-radius: ${element.borderRadius}px;
  padding: 8px 16px;
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
${generateDropdownBaseCSS(selector)}

${selector} .dropdown-menu {
  min-width: 150px;
}

${selector} .menu-divider {
  height: 1px;
  background-color: ${element.borderColor};
  margin: 4px 0;
}`
}

/**
 * Generate Tab Bar CSS
 */
function generateTabBarCSS(selector: string, element: TabBarElementConfig): string {
  const isVertical = element.orientation === 'vertical'
  const indicatorCSS = element.indicatorStyle === 'background'
    ? `background-color: ${element.indicatorColor};`
    : element.indicatorStyle === 'underline'
    ? isVertical
      ? `border-right: 3px solid ${element.indicatorColor};`
      : `border-bottom: 3px solid ${element.indicatorColor};`
    : '' // accent-bar handled separately

  return `/* Tab Bar */
${selector} {
  display: flex;
  flex-direction: ${isVertical ? 'column' : 'row'};
  background-color: ${element.backgroundColor};
  border: 1px solid ${element.borderColor};
  border-radius: 4px;
  overflow: hidden;
  box-sizing: border-box;
}

${selector} .tab {
  flex: ${isVertical ? '0 0 auto' : '1'};
  height: ${element.tabHeight}px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 16px;
  color: ${element.textColor};
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: none;
  position: relative;
}

${selector} .tab:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

${selector} .tab[aria-selected="true"] {
  color: ${element.activeTextColor};
  ${indicatorCSS}
}

${selector} .tab-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

${selector} .tab-icon svg {
  width: 100%;
  height: 100%;
}

${element.indicatorStyle === 'accent-bar' ? `
${selector} .indicator-underline,
${selector} .indicator-accent {
  position: absolute;
  background-color: ${element.indicatorColor};
  transition: none;
}

${selector} .indicator-underline {
  ${isVertical ? 'right: 0; top: 0; bottom: 0; width: 3px;' : 'bottom: 0; left: 0; right: 0; height: 3px;'}
}

${selector} .indicator-accent {
  ${isVertical ? 'left: 0; width: 4px;' : 'top: 0; height: 4px;'}
}` : ''}`
}

/**
 * Generate Tag Selector CSS
 */
function generateTagSelectorCSS(selector: string, element: TagSelectorElementConfig): string {
  return `/* Tag Selector */
${selector} {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: Inter, system-ui, sans-serif;
  box-sizing: border-box;
}

${selector} .tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

${selector} .tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background-color: ${element.chipBackgroundColor};
  color: ${element.chipTextColor};
  border-radius: ${element.chipBorderRadius}px;
  font-size: 12px;
  user-select: none;
}

${selector} .tag-remove {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: ${element.chipRemoveColor};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  padding: 0;
  transition: none;
}

${selector} .tag-remove:hover {
  filter: brightness(1.2);
}

${element.showInput ? `
${selector} .tag-input-wrapper {
  position: relative;
}

${selector} input {
  width: 100%;
  padding: 8px 12px;
  background-color: ${element.inputBackgroundColor};
  color: ${element.inputTextColor};
  border: 1px solid ${element.inputBorderColor};
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

${selector} input::placeholder {
  color: currentColor;
  opacity: 0.5;
}

${selector} .tag-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background-color: ${element.dropdownBackgroundColor};
  color: ${element.dropdownTextColor};
  border: 1px solid ${element.inputBorderColor};
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease-in;
  z-index: 1000;
}

${selector}.open .tag-dropdown {
  opacity: 1;
  pointer-events: all;
  transition: opacity 100ms ease-out;
}

${selector} .tag-dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  transition: none;
}

${selector} .tag-dropdown-item:hover {
  background-color: ${element.dropdownHoverColor};
}` : ''}`
}

/**
 * Generate Tree View CSS
 */
function generateTreeViewCSS(selector: string, element: TreeViewElementConfig): string {
  return `/* Tree View */
${selector} {
  background-color: ${element.backgroundColor};
  color: ${element.textColor};
  font-family: Inter, system-ui, sans-serif;
  font-size: ${element.fontSize}px;
  overflow-y: auto;
  user-select: none;
  box-sizing: border-box;
}

${selector} .tree-node {
  display: flex;
  align-items: center;
  height: ${element.rowHeight}px;
  cursor: pointer;
  transition: none;
}

${selector} .tree-node:hover {
  background-color: ${element.hoverBackgroundColor};
}

${selector} .tree-node[data-selected="true"] {
  background-color: ${element.selectedBackgroundColor};
  color: ${element.selectedTextColor};
}

${selector} .tree-arrow {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: none;
}

${selector} .tree-arrow::before {
  content: '▶';
  font-size: 10px;
  transform: rotate(0deg);
  transition: none;
}

${selector} .tree-arrow.expanded::before {
  transform: rotate(90deg);
}

${selector} .tree-arrow.empty {
  visibility: hidden;
}

${selector} .tree-node-name {
  flex: 1;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`
}

// ============================================================================
// Visualization CSS Generation Functions
// ============================================================================

/**
 * Generate CSS for Canvas-based visualization containers
 */
function generateVisualizationCSS(
  config: ScrollingWaveformElementConfig | SpectrumAnalyzerElementConfig | SpectrogramElementConfig | GoniometerElementConfig | VectorscopeElementConfig
): string {
  const id = toKebabCase(config.id)

  return `/* ${config.name || config.type} */
#${id} {
  position: absolute;
  left: ${config.x}px;
  top: ${config.y}px;
  width: ${config.width}px;
  height: ${config.height}px;
  background-color: ${config.backgroundColor};
  overflow: hidden;
}

#${id} canvas {
  display: block;
  width: 100%;
  height: 100%;
}
`
}

// ============================================================================
// Curve Element CSS Generation Functions
// ============================================================================

/**
 * Generate CSS for Canvas-based curve element containers
 */
function generateCurveCSS(
  config: EQCurveElementConfig | CompressorCurveElementConfig | EnvelopeDisplayElementConfig | LFODisplayElementConfig | FilterResponseElementConfig
): string {
  const id = toKebabCase(config.id)

  return `/* ${config.name || config.type} */
#${id} {
  position: absolute;
  left: ${config.x}px;
  top: ${config.y}px;
  width: ${config.width}px;
  height: ${config.height}px;
  background-color: ${config.backgroundColor};
  overflow: hidden;
}

#${id} canvas {
  display: block;
  width: 100%;
  height: 100%;
}
`
}

// ============================================================================
// Container Element CSS Generation Functions
// ============================================================================

/**
 * Generate Tooltip CSS
 */
function generateTooltipCSS(selector: string, element: TooltipElementConfig): string {
  return `/* Tooltip */
${selector} {
  /* Invisible trigger area */
  cursor: help;
  position: relative;
}

${selector} .tooltip-content {
  position: absolute;
  background-color: ${element.backgroundColor};
  color: ${element.textColor};
  font-size: ${element.fontSize}px;
  padding: ${element.padding}px;
  border-radius: ${element.borderRadius}px;
  max-width: ${element.maxWidth}px;
  z-index: 10000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  ${element.position === 'top' ? `bottom: calc(100% + ${element.offset}px); left: 50%; transform: translateX(-50%);` : ''}
  ${element.position === 'bottom' ? `top: calc(100% + ${element.offset}px); left: 50%; transform: translateX(-50%);` : ''}
  ${element.position === 'left' ? `right: calc(100% + ${element.offset}px); top: 50%; transform: translateY(-50%);` : ''}
  ${element.position === 'right' ? `left: calc(100% + ${element.offset}px); top: 50%; transform: translateY(-50%);` : ''}
}

${selector}:hover .tooltip-content {
  opacity: 1;
}

${element.showArrow ? `
${selector} .tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  ${element.position === 'top' ? `top: 100%; left: 50%; transform: translateX(-50%); border-top-color: ${element.backgroundColor};` : ''}
  ${element.position === 'bottom' ? `bottom: 100%; left: 50%; transform: translateX(-50%); border-bottom-color: ${element.backgroundColor};` : ''}
  ${element.position === 'left' ? `left: 100%; top: 50%; transform: translateY(-50%); border-left-color: ${element.backgroundColor};` : ''}
  ${element.position === 'right' ? `right: 100%; top: 50%; transform: translateY(-50%); border-right-color: ${element.backgroundColor};` : ''}
}` : ''}`
}

/**
 * Generate Horizontal Spacer CSS
 */
function generateHorizontalSpacerCSS(selector: string, element: HorizontalSpacerElementConfig): string {
  const sizing = element.sizingMode === 'fixed'
    ? `width: ${element.fixedWidth}px;`
    : `flex-grow: ${element.flexGrow}; min-width: ${element.minWidth}px; max-width: ${element.maxWidth}px;`

  return `/* Horizontal Spacer */
${selector} {
  /* Invisible spacing element */
  ${sizing}
  background: transparent;
}`
}

/**
 * Generate Vertical Spacer CSS
 */
function generateVerticalSpacerCSS(selector: string, element: VerticalSpacerElementConfig): string {
  const sizing = element.sizingMode === 'fixed'
    ? `height: ${element.fixedHeight}px;`
    : `flex-grow: ${element.flexGrow}; min-height: ${element.minHeight}px; max-height: ${element.maxHeight}px;`

  return `/* Vertical Spacer */
${selector} {
  /* Invisible spacing element */
  ${sizing}
  background: transparent;
}`
}

/**
 * Generate Window Chrome CSS
 */
function generateWindowChromeCSS(selector: string, element: WindowChromeElementConfig): string {
  const buttonCSS = element.buttonStyle === 'macos'
    ? `
${selector} .chrome-buttons.macos {
  display: flex;
  gap: 8px;
  padding: 0 12px;
  align-items: center;
}

${selector} .chrome-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: filter 0.2s ease;
}

${selector} .chrome-button:hover {
  filter: brightness(0.9);
}`
    : element.buttonStyle === 'windows'
    ? `
${selector} .chrome-buttons.windows {
  display: flex;
  margin-left: auto;
  height: 100%;
}

${selector} .chrome-button {
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: ${element.titleColor};
  cursor: pointer;
  transition: background-color 0.2s ease;
  user-select: none;
}

${selector} .chrome-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

${selector} .chrome-button.close:hover {
  background-color: #e81123;
  color: white;
}`
    : `
${selector} .chrome-buttons.neutral {
  display: flex;
  gap: 8px;
  padding: 0 12px;
  align-items: center;
}

${selector} .chrome-button {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #666666;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

${selector} .chrome-button.close:hover {
  background-color: #ff5f57;
}

${selector} .chrome-button.minimize:hover {
  background-color: #ffbd2e;
}

${selector} .chrome-button.maximize:hover {
  background-color: #28ca42;
}`

  return `/* Window Chrome */
${selector} {
  display: flex;
  align-items: center;
  background-color: ${element.backgroundColor};
  height: ${element.height}px;
  -webkit-app-region: drag;
  user-select: none;
}

${selector} [data-drag-region="no-drag"] {
  -webkit-app-region: no-drag;
}

${selector} .chrome-title {
  flex: 1;
  text-align: center;
  font-size: ${element.titleFontSize}px;
  color: ${element.titleColor};
  font-family: Inter, system-ui, sans-serif;
  font-weight: 500;
  -webkit-app-region: drag;
}
${buttonCSS}`
}
