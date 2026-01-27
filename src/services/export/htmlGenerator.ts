/**
 * HTML code generator for VST3 WebView UI export
 * Generates index.html with properly positioned and styled elements
 */

import type { ElementConfig, KnobElementConfig, SliderElementConfig, MeterElementConfig, RangeSliderElementConfig, DropdownElementConfig, CheckboxElementConfig, RadioGroupElementConfig, TextFieldElementConfig, ModulationMatrixElementConfig, DbDisplayElementConfig, FrequencyDisplayElementConfig, GainReductionMeterElementConfig, SvgGraphicElementConfig, MultiSliderElementConfig, IconButtonElementConfig, KickButtonElementConfig, ToggleSwitchElementConfig, PowerButtonElementConfig, RockerSwitchElementConfig, RotarySwitchElementConfig, SegmentButtonElementConfig, SegmentConfig, StepperElementConfig, BreadcrumbElementConfig, BreadcrumbItem, MultiSelectDropdownElementConfig, ComboBoxElementConfig, MenuButtonElementConfig, MenuItem, TabBarElementConfig, TabConfig, TagSelectorElementConfig, Tag, TreeViewElementConfig, TreeNode, TooltipElementConfig, HorizontalSpacerElementConfig, VerticalSpacerElementConfig, WindowChromeElementConfig, SteppedKnobElementConfig, CenterDetentKnobElementConfig, DotIndicatorKnobElementConfig, BipolarSliderElementConfig, CrossfadeSliderElementConfig, NotchedSliderElementConfig, ArcSliderElementConfig } from '../../types/elements'
import type { BaseProfessionalMeterConfig, CorrelationMeterElementConfig, StereoWidthMeterElementConfig } from '../../types/elements/displays'
import type { ScrollingWaveformElementConfig, SpectrumAnalyzerElementConfig, SpectrogramElementConfig, GoniometerElementConfig, VectorscopeElementConfig } from '../../types/elements/visualizations'
import type {
  EQCurveElementConfig,
  CompressorCurveElementConfig,
  EnvelopeDisplayElementConfig,
  LFODisplayElementConfig,
  FilterResponseElementConfig,
} from '../../types/elements/curves'
import { toKebabCase, escapeHTML } from './utils'
import { useStore } from '../../store'
import { sanitizeSVG } from '../../lib/svg-sanitizer'
import { extractLayer, applyAllColorOverrides } from '../knobLayers'
import type { KnobStyle } from '../../types/knobStyle'
import { builtInIconSVG, BuiltInIcon } from '../../utils/builtInIcons'
import { formatDisplayValue } from '../../utils/valueFormatters'

// ============================================================================
// Value Formatting Utility
// ============================================================================

function formatValue(
  value: number,
  min: number,
  max: number,
  format: string,
  suffix: string,
  decimals: number
): string {
  const actual = min + value * (max - min)
  switch (format) {
    case 'percentage':
      return `${Math.round(value * 100)}%`
    case 'db':
      return `${actual.toFixed(decimals)} dB`
    case 'hz':
      return actual >= 1000
        ? `${(actual / 1000).toFixed(decimals)} kHz`
        : `${actual.toFixed(decimals)} Hz`
    case 'custom':
      return `${actual.toFixed(decimals)}${suffix}`
    default:
      return actual.toFixed(decimals)
  }
}

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
    .map((element) => {
      const html = generateElementHTML(element)
      console.log(`[HTML] ${element.type} "${element.name}":`, html.substring(0, 100) + '...')
      return html
    })
    .join('\n    ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;">
  <title>JUCE WebView UI</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="plugin-wrapper">
    <div id="plugin-container">
      ${elementsHTML}
    </div>
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

    case 'rangeslider':
      return generateRangeSliderHTML(id, baseClass, positionStyle, element)

    case 'button':
      return `<button id="${id}" class="${baseClass} button-element" data-type="button" data-mode="${element.mode}" style="${positionStyle}">${escapeHTML(element.label)}</button>`

    case 'label':
      return `<span id="${id}" class="${baseClass} label-element" data-type="label" style="${positionStyle}">${escapeHTML(element.text)}</span>`

    case 'meter':
      return generateMeterHTML(id, baseClass, positionStyle, element)

    case 'image': {
      // Convert absolute paths to relative for export
      // /assets/image.png -> assets/image.png
      let src = element.src.trim()
      if (src.startsWith('/assets/')) {
        src = src.slice(1) // Remove leading slash
      }
      return `<img id="${id}" class="${baseClass} image-element" data-type="image" src="${src}" alt="${escapeHTML(element.name)}" style="${positionStyle}" />`
    }

    case 'dropdown':
      return generateDropdownHTML(id, baseClass, positionStyle, element)

    case 'checkbox':
      return generateCheckboxHTML(id, baseClass, positionStyle, element)

    case 'radiogroup':
      return generateRadioGroupHTML(id, baseClass, positionStyle, element)

    case 'textfield':
      return generateTextFieldHTML(id, baseClass, positionStyle, element)

    case 'rectangle': {
      const fillColorWithOpacity = element.fillOpacity < 1
        ? `${element.fillColor}${Math.round(element.fillOpacity * 255).toString(16).padStart(2, '0')}`
        : element.fillColor
      return `<div id="${id}" class="${baseClass} rectangle-element" data-type="rectangle" style="${positionStyle}; background-color: ${fillColorWithOpacity}; border: ${element.borderWidth}px ${element.borderStyle} ${element.borderColor}; border-radius: ${element.borderRadius}px;"></div>`
    }

    case 'line': {
      const isHorizontal = element.width > element.height
      const lineStyle = isHorizontal
        ? `width: 100%; height: ${element.strokeWidth}px; background-color: ${element.strokeStyle === 'solid' ? element.strokeColor : 'transparent'}; border-top: ${element.strokeWidth}px ${element.strokeStyle} ${element.strokeColor};`
        : `width: ${element.strokeWidth}px; height: 100%; background-color: ${element.strokeStyle === 'solid' ? element.strokeColor : 'transparent'}; border-left: ${element.strokeWidth}px ${element.strokeStyle} ${element.strokeColor};`
      return `<div id="${id}" class="${baseClass} line-element" data-type="line" style="${positionStyle}"><div style="${lineStyle}"></div></div>`
    }
    case 'panel':
      return `<div id="${id}" class="${baseClass} panel-element" data-type="panel" style="${positionStyle}"></div>`

    case 'frame':
      return `<div id="${id}" class="${baseClass} frame-element" data-type="frame" style="${positionStyle}"></div>`

    case 'groupbox':
      return `<div id="${id}" class="${baseClass} groupbox-element" data-type="groupbox" data-header="${escapeHTML(element.headerText)}" style="${positionStyle}"><div class="groupbox-border"></div><div class="groupbox-header">${escapeHTML(element.headerText)}</div></div>`

    case 'collapsible':
      return `<div id="${id}" class="${baseClass} collapsible-element" data-type="collapsible" data-collapsed="${element.collapsed}" style="${positionStyle}"><div class="collapsible-header"><span class="collapsible-arrow">▼</span><span>${escapeHTML(element.headerText)}</span></div><div class="collapsible-content"></div></div>`

    case 'dbdisplay':
      return generateDbDisplayHTML(id, baseClass, positionStyle, element)

    case 'frequencydisplay':
      return generateFrequencyDisplayHTML(id, baseClass, positionStyle, element)

    case 'gainreductionmeter':
      return generateGainReductionMeterHTML(id, baseClass, positionStyle, element)

    case 'presetbrowser': {
      const presetsData = element.presets.map(p => escapeHTML(p)).join('|')
      return `<div id="${id}" class="${baseClass} presetbrowser-element" data-type="presetbrowser" data-presets="${presetsData}" data-selected="${element.selectedIndex}" style="${positionStyle}">
    ${element.showSearch ? '<div class="preset-search"><input type="text" placeholder="Search presets..." /></div>' : ''}
    <div class="preset-list"></div>
  </div>`
    }

    case 'waveform':
      return `<div id="${id}" class="${baseClass} waveform-element" data-type="waveform" data-zoom-level="${element.zoomLevel}" style="${positionStyle}">
    <div class="waveform-placeholder">Waveform Display</div>
  </div>`

    case 'oscilloscope':
      return `<div id="${id}" class="${baseClass} oscilloscope-element" data-type="oscilloscope" data-time-div="${element.timeDiv}" data-amplitude-scale="${element.amplitudeScale}" data-trigger-level="${element.triggerLevel}" data-grid-divisions="${element.gridDivisions}" style="${positionStyle}">
    <div class="oscilloscope-grid"></div>
    <div class="oscilloscope-placeholder">Oscilloscope</div>
  </div>`

    case 'modulationmatrix':
      return generateModulationMatrixHTML(id, baseClass, positionStyle, element)

    case 'svggraphic':
      return generateSvgGraphicHTML(id, baseClass, positionStyle, element)

    // Rotary control variants - use same HTML structure as knob
    case 'steppedknob':
      return generateSteppedKnobHTML(id, baseClass, positionStyle, element)

    case 'centerdetentknob':
      return generateCenterDetentKnobHTML(id, baseClass, positionStyle, element)

    case 'dotindicatorknob':
      return generateDotIndicatorKnobHTML(id, baseClass, positionStyle, element)

    case 'multislider':
      return generateMultiSliderHTML(id, baseClass, positionStyle, element)

    case 'bipolarslider':
      return generateBipolarSliderHTML(id, baseClass, positionStyle, element)

    case 'crossfadeslider':
      return generateCrossfadeSliderHTML(id, baseClass, positionStyle, element)

    case 'notchedslider':
      return generateNotchedSliderHTML(id, baseClass, positionStyle, element)

    case 'arcslider':
      return generateArcSliderHTML(id, baseClass, positionStyle, element)

    case 'rockerswitch':
      return generateRockerSwitchHTML(id, baseClass, positionStyle, element)

    case 'rotaryswitch':
      return generateRotarySwitchHTML(id, baseClass, positionStyle, element)

    case 'segmentbutton':
      return generateSegmentButtonHTML(id, baseClass, positionStyle, element)

    case 'iconbutton':
      return generateIconButtonHTML(id, baseClass, positionStyle, element)

    case 'kickbutton':
      return generateKickButtonHTML(id, baseClass, positionStyle, element)

    case 'toggleswitch':
      return generateToggleSwitchHTML(id, baseClass, positionStyle, element)

    case 'powerbutton':
      return generatePowerButtonHTML(id, baseClass, positionStyle, element)

    case 'numericdisplay':
      return generateNumericDisplayHTML(id, baseClass, positionStyle, element)

    case 'timedisplay':
      return generateTimeDisplayHTML(id, baseClass, positionStyle, element)

    case 'percentagedisplay':
      return generatePercentageDisplayHTML(id, baseClass, positionStyle, element)

    case 'ratiodisplay':
      return generateRatioDisplayHTML(id, baseClass, positionStyle, element)

    case 'notedisplay':
      return generateNoteDisplayHTML(id, baseClass, positionStyle, element)

    case 'bpmdisplay':
      return generateBpmDisplayHTML(id, baseClass, positionStyle, element)

    case 'editabledisplay':
      return generateEditableDisplayHTML(id, baseClass, positionStyle, element)

    case 'multivaluedisplay':
      return generateMultiValueDisplayHTML(id, baseClass, positionStyle, element)

    case 'singleled':
      return generateSingleLedHTML(id, baseClass, positionStyle, element)

    case 'bicolorled':
      return generateBiColorLedHTML(id, baseClass, positionStyle, element)

    case 'tricolorled':
      return generateTriColorLedHTML(id, baseClass, positionStyle, element)

    case 'ledarray':
      return generateLedArrayHTML(id, baseClass, positionStyle, element)

    case 'ledring':
      return generateLedRingHTML(id, baseClass, positionStyle, element)

    case 'ledmatrix':
      return generateLedMatrixHTML(id, baseClass, positionStyle, element)

    // Professional Meters - Level Meters (mono)
    case 'rmsmetermo':
    case 'vumetermono':
    case 'ppmtype1mono':
    case 'ppmtype2mono':
    case 'truepeakmetermono':
    case 'lufsmomomo':
    case 'lufsshortmono':
    case 'lufsintmono':
    case 'k12metermono':
    case 'k14metermono':
    case 'k20metermono': {
      const config = element as BaseProfessionalMeterConfig
      const innerHTML = generateSegmentedMeterHTML(config, false)
      return `<div id="${id}" class="${baseClass} ${element.type}-element" data-type="${element.type}" style="${positionStyle}">
  ${innerHTML}
</div>`
    }

    // Professional Meters - Level Meters (stereo)
    case 'rmsmeterstereo':
    case 'vumeterstereo':
    case 'ppmtype1stereo':
    case 'ppmtype2stereo':
    case 'truepeakmeterstereo':
    case 'lufsmomostereo':
    case 'lufsshortstereo':
    case 'lufsintstereo':
    case 'k12meterstereo':
    case 'k14meterstereo':
    case 'k20meterstereo': {
      const config = element as BaseProfessionalMeterConfig
      const innerHTML = generateSegmentedMeterHTML(config, true)
      return `<div id="${id}" class="${baseClass} ${element.type}-element" data-type="${element.type}" style="${positionStyle}">
  ${innerHTML}
</div>`
    }

    // Professional Meters - Analysis Meters
    case 'correlationmeter':
    case 'stereowidthmeter': {
      const innerHTML = generateHorizontalBarMeterHTML(element as CorrelationMeterElementConfig | StereoWidthMeterElementConfig)
      return `<div id="${id}" class="${baseClass} ${element.type}-element" data-type="${element.type}" style="${positionStyle}">
  ${innerHTML}
</div>`
    }

    // Navigation Elements
    case 'stepper':
      return generateStepperHTML(id, baseClass, positionStyle, element as StepperElementConfig)

    case 'breadcrumb':
      return generateBreadcrumbHTML(id, baseClass, positionStyle, element as BreadcrumbElementConfig)

    case 'multiselectdropdown':
      return generateMultiSelectDropdownHTML(id, baseClass, positionStyle, element as MultiSelectDropdownElementConfig)

    case 'combobox':
      return generateComboBoxHTML(id, baseClass, positionStyle, element as ComboBoxElementConfig)

    case 'menubutton':
      return generateMenuButtonHTML(id, baseClass, positionStyle, element as MenuButtonElementConfig)

    case 'tabbar':
      return generateTabBarHTML(id, baseClass, positionStyle, element as TabBarElementConfig)

    case 'tagselector':
      return generateTagSelectorHTML(id, baseClass, positionStyle, element as TagSelectorElementConfig)

    case 'treeview':
      return generateTreeViewHTML(id, baseClass, positionStyle, element as TreeViewElementConfig)

    // Visualization Elements
    case 'scrollingwaveform':
      return generateScrollingWaveformHTML(element as ScrollingWaveformElementConfig)

    case 'spectrumanalyzer':
      return generateSpectrumAnalyzerHTML(element as SpectrumAnalyzerElementConfig)

    case 'spectrogram':
      return generateSpectrogramHTML(element as SpectrogramElementConfig)

    case 'goniometer':
      return generateGoniometerHTML(element as GoniometerElementConfig)

    case 'vectorscope':
      return generateVectorscopeHTML(element as VectorscopeElementConfig)

    // Curve Elements
    case 'eqcurve':
      return generateEQCurveHTML(element as EQCurveElementConfig)

    case 'compressorcurve':
      return generateCompressorCurveHTML(element as CompressorCurveElementConfig)

    case 'envelopedisplay':
      return generateEnvelopeDisplayHTML(element as EnvelopeDisplayElementConfig)

    case 'lfodisplay':
      return generateLFODisplayHTML(element as LFODisplayElementConfig)

    case 'filterresponse':
      return generateFilterResponseHTML(element as FilterResponseElementConfig)

    // Container Elements
    case 'tooltip':
      return generateTooltipHTML(id, baseClass, positionStyle, element as TooltipElementConfig)

    case 'horizontalspacer':
      return generateHorizontalSpacerHTML(id, baseClass, positionStyle, element as HorizontalSpacerElementConfig)

    case 'verticalspacer':
      return generateVerticalSpacerHTML(id, baseClass, positionStyle, element as VerticalSpacerElementConfig)

    case 'windowchrome':
      return generateWindowChromeHTML(id, baseClass, positionStyle, element as WindowChromeElementConfig)

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = element
      throw new Error(`Unknown element type: ${(_exhaustive as ElementConfig).type}`)
  }
}

/**
 * Generate styled knob HTML with custom SVG layers
 */
function generateStyledKnobHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  config: KnobElementConfig,
  style: KnobStyle
): string {
  // Apply color overrides to SVG (if any)
  let svgWithOverrides = style.svgContent
  if (config.colorOverrides) {
    svgWithOverrides = applyAllColorOverrides(
      style.svgContent,
      style.layers,
      config.colorOverrides
    )
  }

  // Re-sanitize before export (SEC-04: defense-in-depth)
  const sanitizedSvg = sanitizeSVG(svgWithOverrides)

  // Extract each layer (if defined)
  const trackSvg = style.layers.track ? extractLayer(sanitizedSvg, style.layers.track) : ''
  const shadowSvg = style.layers.shadow ? extractLayer(sanitizedSvg, style.layers.shadow) : ''
  const arcSvg = style.layers.arc ? extractLayer(sanitizedSvg, style.layers.arc) : ''
  const indicatorSvg = style.layers.indicator ? extractLayer(sanitizedSvg, style.layers.indicator) : ''
  const glowSvg = style.layers.glow ? extractLayer(sanitizedSvg, style.layers.glow) : ''

  // Calculate normalized value for rotation
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Label and value display
  const formattedValue = formatValue(normalizedValue, config.min, config.max, config.valueFormat, config.valueSuffix, config.valueDecimalPlaces)
  const labelHTML = config.showLabel
    ? `<span class="knob-label knob-label-${config.labelPosition}" style="font-size: ${config.labelFontSize}px; color: ${config.labelColor};">${escapeHTML(config.labelText)}</span>`
    : ''
  const valueHTML = config.showValue
    ? `<span class="knob-value knob-value-${config.valuePosition}" style="font-size: ${config.valueFontSize}px; color: ${config.valueColor};">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} knob knob-element styled-knob" data-type="knob" data-value="${normalizedValue}" data-min-angle="${style.minAngle}" data-max-angle="${style.maxAngle}" style="${positionStyle}">
      ${labelHTML}
      ${valueHTML}
      <div class="styled-knob-container">
        ${trackSvg ? `<div class="knob-layer knob-track">${trackSvg}</div>` : ''}
        ${shadowSvg ? `<div class="knob-layer knob-shadow">${shadowSvg}</div>` : ''}
        ${arcSvg ? `<div class="knob-layer knob-arc">${arcSvg}</div>` : ''}
        ${indicatorSvg ? `<div class="knob-layer knob-indicator">${indicatorSvg}</div>` : ''}
        ${glowSvg ? `<div class="knob-layer knob-glow">${glowSvg}</div>` : ''}
      </div>
    </div>`
}

/**
 * Generate knob HTML with SVG arc structure (default CSS knob)
 */
function generateKnobHTML(id: string, baseClass: string, positionStyle: string, config: KnobElementConfig): string {
  // Check if this knob uses a custom SVG style
  if (config.styleId) {
    const knobStyles = useStore.getState().knobStyles
    const style = knobStyles.find((s) => s.id === config.styleId)

    if (style) {
      return generateStyledKnobHTML(id, baseClass, positionStyle, config, style)
    } else {
      // Style deleted - render placeholder
      return `<div id="${id}" class="${baseClass} knob knob-element" data-type="knob" style="${positionStyle}">
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 12px;">
          <!-- Style missing: ${config.styleId} -->
        </div>
      </div>`
    }
  }

  // Default CSS knob rendering
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

  // Label and value display
  const formattedValue = formatValue(normalizedValue, config.min, config.max, config.valueFormat, config.valueSuffix, config.valueDecimalPlaces)
  const labelHTML = config.showLabel
    ? `<span class="knob-label knob-label-${config.labelPosition}" style="font-size: ${config.labelFontSize}px; color: ${config.labelColor};">${escapeHTML(config.labelText)}</span>`
    : ''
  const valueHTML = config.showValue
    ? `<span class="knob-value knob-value-${config.valuePosition}" style="font-size: ${config.valueFontSize}px; color: ${config.valueColor};">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} knob knob-element" data-type="knob" data-value="${normalizedValue}" data-start-angle="${config.startAngle}" data-end-angle="${config.endAngle}" style="${positionStyle}">
      ${labelHTML}
      ${valueHTML}
      <svg width="100%" height="100%" viewBox="0 0 ${config.diameter} ${config.diameter}" style="overflow: visible;">
        <path class="knob-arc-track" d="${trackPath}" fill="none" stroke="${config.trackColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />
        ${valueFillSVG}
        ${indicatorSVG}
      </svg>
    </div>`
}

/**
 * Generate Stepped Knob HTML with SVG arc structure
 */
function generateSteppedKnobHTML(id: string, baseClass: string, positionStyle: string, config: SteppedKnobElementConfig): string {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2

  // Calculate value angle (quantized to steps)
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range
  const stepSize = 1 / (config.stepCount - 1)
  const steppedValue = Math.round(normalizedValue / stepSize) * stepSize
  const valueAngle = config.startAngle + steppedValue * (config.endAngle - config.startAngle)

  // Generate arc paths
  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)
  const valuePath = describeArc(centerX, centerY, radius, config.startAngle, valueAngle)

  // Indicator
  const indicatorStart = polarToCartesian(centerX, centerY, radius * 0.4, valueAngle)
  const indicatorEnd = polarToCartesian(centerX, centerY, radius * 0.9, valueAngle)

  // Step indicators
  let stepIndicatorsSVG = ''
  if (config.showStepIndicators) {
    for (let i = 0; i < config.stepCount; i++) {
      const stepNormalized = i / (config.stepCount - 1)
      const stepAngle = config.startAngle + stepNormalized * (config.endAngle - config.startAngle)
      const pos = polarToCartesian(centerX, centerY, radius, stepAngle)
      const isFilled = i <= Math.round(steppedValue * (config.stepCount - 1))
      stepIndicatorsSVG += `<circle cx="${pos.x}" cy="${pos.y}" r="${config.trackWidth / 3}" fill="${isFilled ? config.fillColor : config.trackColor}" />`
    }
  }

  const valueFillSVG = steppedValue > 0.001
    ? `<path d="${valuePath}" fill="none" stroke="${config.fillColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />`
    : ''

  const formattedValue = formatValue(steppedValue, config.min, config.max, config.valueFormat, config.valueSuffix, config.valueDecimalPlaces)
  const labelHTML = config.showLabel
    ? `<span class="knob-label knob-label-${config.labelPosition}" style="font-size: ${config.labelFontSize}px; color: ${config.labelColor};">${escapeHTML(config.labelText)}</span>`
    : ''
  const valueHTML = config.showValue
    ? `<span class="knob-value knob-value-${config.valuePosition}" style="font-size: ${config.valueFontSize}px; color: ${config.valueColor};">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} knob-element steppedknob-element" data-type="steppedknob" data-value="${steppedValue}" style="${positionStyle}">
      ${labelHTML}
      ${valueHTML}
      <svg width="100%" height="100%" viewBox="0 0 ${config.diameter} ${config.diameter}" style="overflow: visible;">
        <path d="${trackPath}" fill="none" stroke="${config.trackColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />
        ${stepIndicatorsSVG}
        ${valueFillSVG}
        <line x1="${indicatorStart.x}" y1="${indicatorStart.y}" x2="${indicatorEnd.x}" y2="${indicatorEnd.y}" stroke="${config.indicatorColor}" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>`
}

/**
 * Generate Center Detent Knob HTML with SVG arc structure
 */
function generateCenterDetentKnobHTML(id: string, baseClass: string, positionStyle: string, config: CenterDetentKnobElementConfig): string {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2

  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range
  const valueAngle = config.startAngle + normalizedValue * (config.endAngle - config.startAngle)
  const centerAngle = config.startAngle + 0.5 * (config.endAngle - config.startAngle)

  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)

  // Value fill from center
  let valueFillSVG = ''
  if (Math.abs(normalizedValue - 0.5) > 0.01) {
    const fillStart = normalizedValue > 0.5 ? centerAngle : valueAngle
    const fillEnd = normalizedValue > 0.5 ? valueAngle : centerAngle
    const valuePath = describeArc(centerX, centerY, radius, fillStart, fillEnd)
    valueFillSVG = `<path d="${valuePath}" fill="none" stroke="${config.fillColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />`
  }

  // Center marker
  const centerPos = polarToCartesian(centerX, centerY, radius + config.trackWidth, centerAngle)
  const centerMarkerSVG = `<circle cx="${centerPos.x}" cy="${centerPos.y}" r="3" fill="${config.indicatorColor}" />`

  const indicatorStart = polarToCartesian(centerX, centerY, radius * 0.4, valueAngle)
  const indicatorEnd = polarToCartesian(centerX, centerY, radius * 0.9, valueAngle)

  const formattedValue = formatValue(normalizedValue, config.min, config.max, config.valueFormat, config.valueSuffix, config.valueDecimalPlaces)
  const labelHTML = config.showLabel
    ? `<span class="knob-label knob-label-${config.labelPosition}" style="font-size: ${config.labelFontSize}px; color: ${config.labelColor};">${escapeHTML(config.labelText)}</span>`
    : ''
  const valueHTML = config.showValue
    ? `<span class="knob-value knob-value-${config.valuePosition}" style="font-size: ${config.valueFontSize}px; color: ${config.valueColor};">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} knob-element centerdetentknob-element" data-type="centerdetentknob" data-value="${normalizedValue}" style="${positionStyle}">
      ${labelHTML}
      ${valueHTML}
      <svg width="100%" height="100%" viewBox="0 0 ${config.diameter} ${config.diameter}" style="overflow: visible;">
        <path d="${trackPath}" fill="none" stroke="${config.trackColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />
        ${valueFillSVG}
        ${centerMarkerSVG}
        <line x1="${indicatorStart.x}" y1="${indicatorStart.y}" x2="${indicatorEnd.x}" y2="${indicatorEnd.y}" stroke="${config.indicatorColor}" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>`
}

/**
 * Generate Dot Indicator Knob HTML with SVG arc structure
 */
function generateDotIndicatorKnobHTML(id: string, baseClass: string, positionStyle: string, config: DotIndicatorKnobElementConfig): string {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2

  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range
  const valueAngle = config.startAngle + normalizedValue * (config.endAngle - config.startAngle)

  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)
  const valuePath = describeArc(centerX, centerY, radius, config.startAngle, valueAngle)

  const valueFillSVG = normalizedValue > 0.001
    ? `<path d="${valuePath}" fill="none" stroke="${config.fillColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />`
    : ''

  // Dot indicator instead of line
  const indicatorPos = polarToCartesian(centerX, centerY, radius * 0.7, valueAngle)
  const indicatorSVG = `<circle cx="${indicatorPos.x}" cy="${indicatorPos.y}" r="${config.trackWidth / 2}" fill="${config.indicatorColor}" />`

  const formattedValue = formatValue(normalizedValue, config.min, config.max, config.valueFormat, config.valueSuffix, config.valueDecimalPlaces)
  const labelHTML = config.showLabel
    ? `<span class="knob-label knob-label-${config.labelPosition}" style="font-size: ${config.labelFontSize}px; color: ${config.labelColor};">${escapeHTML(config.labelText)}</span>`
    : ''
  const valueHTML = config.showValue
    ? `<span class="knob-value knob-value-${config.valuePosition}" style="font-size: ${config.valueFontSize}px; color: ${config.valueColor};">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} knob-element dotindicatorknob-element" data-type="dotindicatorknob" data-value="${normalizedValue}" style="${positionStyle}">
      ${labelHTML}
      ${valueHTML}
      <svg width="100%" height="100%" viewBox="0 0 ${config.diameter} ${config.diameter}" style="overflow: visible;">
        <path d="${trackPath}" fill="none" stroke="${config.trackColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />
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

  // Label and value display
  const formattedValue = formatValue(normalizedValue, config.min, config.max, config.valueFormat, config.valueSuffix, config.valueDecimalPlaces)
  const labelHTML = config.showLabel
    ? `<span class="slider-label slider-label-${config.labelPosition}" style="font-size: ${config.labelFontSize}px; color: ${config.labelColor};">${escapeHTML(config.labelText)}</span>`
    : ''
  const valueHTML = config.showValue
    ? `<span class="slider-value slider-value-${config.valuePosition}" style="font-size: ${config.valueFontSize}px; color: ${config.valueColor};">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} slider slider-element ${orientationClass}" data-type="slider" data-orientation="${config.orientation}" data-value="${normalizedValue}" style="${positionStyle}">
      ${labelHTML}
      ${valueHTML}
      <div class="slider-track" style="background: ${config.trackColor};"></div>
      <div class="slider-fill" style="background: ${config.trackFillColor}; ${fillStyle}"></div>
      <div class="slider-thumb" style="background: ${config.thumbColor}; ${thumbStyle}"></div>
    </div>`
}

/**
 * Generate Bipolar Slider HTML
 */
function generateBipolarSliderHTML(id: string, baseClass: string, positionStyle: string, config: BipolarSliderElementConfig): string {
  const isVertical = config.orientation === 'vertical'
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const normalizedCenter = (config.centerValue - config.min) / (config.max - config.min)
  const orientationClass = isVertical ? 'vertical' : 'horizontal'

  // Fill from center to value
  const fillStart = Math.min(normalizedCenter, normalizedValue) * 100
  const fillEnd = Math.max(normalizedCenter, normalizedValue) * 100
  const fillStyle = isVertical
    ? `bottom: ${fillStart}%; height: ${fillEnd - fillStart}%`
    : `left: ${fillStart}%; width: ${fillEnd - fillStart}%`
  const thumbStyle = isVertical
    ? `bottom: ${normalizedValue * 100}%`
    : `left: ${normalizedValue * 100}%`
  const centerStyle = isVertical
    ? `bottom: ${normalizedCenter * 100}%`
    : `left: ${normalizedCenter * 100}%`

  const formattedValue = formatValue(normalizedValue, config.min, config.max, config.valueFormat, config.valueSuffix, config.valueDecimalPlaces)
  const labelHTML = config.showLabel
    ? `<span class="slider-label slider-label-${config.labelPosition}" style="font-size: ${config.labelFontSize}px; color: ${config.labelColor};">${escapeHTML(config.labelText)}</span>`
    : ''
  const valueHTML = config.showValue
    ? `<span class="slider-value slider-value-${config.valuePosition}" style="font-size: ${config.valueFontSize}px; color: ${config.valueColor};">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} slider-element bipolarslider-element ${orientationClass}" data-type="bipolarslider" data-orientation="${config.orientation}" style="${positionStyle}">
      ${labelHTML}
      ${valueHTML}
      <div class="slider-track" style="background: ${config.trackColor};"></div>
      <div class="slider-center-mark" style="${centerStyle}; background: ${config.indicatorColor};"></div>
      <div class="slider-fill" style="${fillStyle}; background: ${config.fillColor};"></div>
      <div class="slider-thumb" style="${thumbStyle}; background: ${config.thumbColor};"></div>
    </div>`
}

/**
 * Generate Crossfade Slider HTML
 */
function generateCrossfadeSliderHTML(id: string, baseClass: string, positionStyle: string, config: CrossfadeSliderElementConfig): string {
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const thumbStyle = `left: ${normalizedValue * 100}%`

  const formattedValue = formatValue(normalizedValue, config.min, config.max, config.valueFormat, config.valueSuffix, config.valueDecimalPlaces)
  const labelHTML = config.showLabel
    ? `<span class="slider-label slider-label-${config.labelPosition}" style="font-size: ${config.labelFontSize}px; color: ${config.labelColor};">${escapeHTML(config.labelText)}</span>`
    : ''
  const valueHTML = config.showValue
    ? `<span class="slider-value slider-value-${config.valuePosition}" style="font-size: ${config.valueFontSize}px; color: ${config.valueColor};">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} slider-element crossfadeslider-element" data-type="crossfadeslider" style="${positionStyle}">
      ${labelHTML}
      ${valueHTML}
      <div class="crossfade-labels">
        <span class="label-a" style="color: ${config.labelColor};">${escapeHTML(config.labelA)}</span>
        <span class="label-b" style="color: ${config.labelColor};">${escapeHTML(config.labelB)}</span>
      </div>
      <div class="slider-track" style="background: ${config.trackColor};"></div>
      <div class="slider-fill" style="width: ${normalizedValue >= 0.5 ? (normalizedValue - 0.5) * 200 : (0.5 - normalizedValue) * 200}%; left: ${normalizedValue >= 0.5 ? '50%' : normalizedValue * 100 + '%'}; background: ${config.trackFillColor};"></div>
      <div class="center-detent"></div>
      <div class="slider-thumb" style="${thumbStyle}; background: ${config.thumbColor};"></div>
    </div>`
}

/**
 * Generate Notched Slider HTML
 */
function generateNotchedSliderHTML(id: string, baseClass: string, positionStyle: string, config: NotchedSliderElementConfig): string {
  const isVertical = config.orientation === 'vertical'
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const orientationClass = isVertical ? 'vertical' : 'horizontal'

  const fillStyle = isVertical
    ? `height: ${normalizedValue * 100}%`
    : `width: ${normalizedValue * 100}%`
  const thumbStyle = isVertical
    ? `bottom: ${normalizedValue * 100}%`
    : `left: ${normalizedValue * 100}%`

  // Generate notch marks
  let notchesHTML = ''
  for (let i = 0; i < config.notchCount; i++) {
    const pos = (i / (config.notchCount - 1)) * 100
    const notchStyle = isVertical
      ? `bottom: ${pos}%`
      : `left: ${pos}%`
    notchesHTML += `<div class="notch" style="${notchStyle}; background: ${config.indicatorColor};"></div>`
  }

  const formattedValue = formatValue(normalizedValue, config.min, config.max, config.valueFormat, config.valueSuffix, config.valueDecimalPlaces)
  const labelHTML = config.showLabel
    ? `<span class="slider-label slider-label-${config.labelPosition}" style="font-size: ${config.labelFontSize}px; color: ${config.labelColor};">${escapeHTML(config.labelText)}</span>`
    : ''
  const valueHTML = config.showValue
    ? `<span class="slider-value slider-value-${config.valuePosition}" style="font-size: ${config.valueFontSize}px; color: ${config.valueColor};">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} slider-element notchedslider-element ${orientationClass}" data-type="notchedslider" data-orientation="${config.orientation}" style="${positionStyle}">
      ${labelHTML}
      ${valueHTML}
      <div class="slider-track" style="background: ${config.trackColor};"></div>
      <div class="notches">${notchesHTML}</div>
      <div class="slider-fill" style="${fillStyle}; background: ${config.fillColor};"></div>
      <div class="slider-thumb" style="${thumbStyle}; background: ${config.thumbColor};"></div>
    </div>`
}

/**
 * Arc Slider SVG arc utilities (for arc that goes through bottom of circle)
 */
function describeArcSlider(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  // Handle arc direction (clockwise from startAngle to endAngle)
  // For arc slider: 135 to 45 means going through 180, 270, 0 (clockwise)
  let sweepAngle = endAngle - startAngle
  if (sweepAngle < 0) {
    sweepAngle += 360
  }

  const start = polarToCartesian(x, y, radius, startAngle)
  const end = polarToCartesian(x, y, radius, endAngle)
  const largeArcFlag = sweepAngle > 180 ? '1' : '0'

  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(' ')
}

/**
 * Generate Arc Slider HTML with SVG arc structure
 */
function generateArcSliderHTML(id: string, baseClass: string, positionStyle: string, config: ArcSliderElementConfig): string {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2 - config.thumbRadius

  // Calculate value angle
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Calculate sweep angle (handling wrap-around for arc that goes through bottom)
  let sweepAngle = config.endAngle - config.startAngle
  if (sweepAngle < 0) {
    sweepAngle += 360
  }

  // Value angle interpolates from startAngle toward endAngle
  const valueAngle = config.startAngle + normalizedValue * sweepAngle

  // Generate arc paths
  const trackPath = describeArcSlider(centerX, centerY, radius, config.startAngle, config.endAngle)
  const valuePath = normalizedValue > 0.001
    ? describeArcSlider(centerX, centerY, radius, config.startAngle, valueAngle)
    : ''

  // Thumb position on arc
  const thumbPos = polarToCartesian(centerX, centerY, radius, valueAngle)

  // Value fill SVG
  const valueFillSVG = valuePath
    ? `<path class="arcslider-fill" d="${valuePath}" fill="none" stroke="${config.fillColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />`
    : ''

  // Format value display
  const formattedValue = formatValue(normalizedValue, config.min, config.max, config.valueFormat, config.valueSuffix, config.valueDecimalPlaces)
  const labelHTML = config.showLabel
    ? `<span class="arcslider-label arcslider-label-${config.labelPosition}" style="font-size: ${config.labelFontSize}px; color: ${config.labelColor};">${escapeHTML(config.labelText)}</span>`
    : ''
  const valueHTML = config.showValue
    ? `<span class="arcslider-value arcslider-value-${config.valuePosition}" style="font-size: ${config.valueFontSize}px; color: ${config.valueColor};">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} slider-element arcslider-element" data-type="arcslider" data-min="${config.min}" data-max="${config.max}" data-value="${config.value}" data-start-angle="${config.startAngle}" data-end-angle="${config.endAngle}" style="${positionStyle}">
      ${labelHTML}
      ${valueHTML}
      <svg width="100%" height="100%" viewBox="0 0 ${config.diameter} ${config.diameter}" style="overflow: visible;">
        <path class="arcslider-track" d="${trackPath}" fill="none" stroke="${config.trackColor}" stroke-width="${config.trackWidth}" stroke-linecap="round" />
        ${valueFillSVG}
        <circle class="arcslider-thumb" cx="${thumbPos.x}" cy="${thumbPos.y}" r="${config.thumbRadius}" fill="${config.thumbColor}" />
      </svg>
    </div>`
}

/**
 * Generate range slider HTML with two thumbs
 */
function generateRangeSliderHTML(id: string, baseClass: string, positionStyle: string, config: RangeSliderElementConfig): string {
  const isVertical = config.orientation === 'vertical'
  const range = config.max - config.min
  const normalizedMin = (config.minValue - config.min) / range
  const normalizedMax = (config.maxValue - config.min) / range
  const orientationClass = isVertical ? 'vertical' : 'horizontal'

  // Calculate fill position and size (between min and max thumbs)
  const fillStyle = isVertical
    ? `bottom: ${normalizedMin * 100}%; height: ${(normalizedMax - normalizedMin) * 100}%`
    : `left: ${normalizedMin * 100}%; width: ${(normalizedMax - normalizedMin) * 100}%`

  // Calculate thumb positions
  const minThumbStyle = isVertical
    ? `bottom: ${normalizedMin * 100}%`
    : `left: ${normalizedMin * 100}%`
  const maxThumbStyle = isVertical
    ? `bottom: ${normalizedMax * 100}%`
    : `left: ${normalizedMax * 100}%`

  return `<div id="${id}" class="${baseClass} rangeslider rangeslider-element ${orientationClass}" data-type="rangeslider" data-orientation="${config.orientation}" data-min-value="${normalizedMin}" data-max-value="${normalizedMax}" style="${positionStyle}">
      <div class="rangeslider-track" style="background: ${config.trackColor};"></div>
      <div class="rangeslider-fill" style="background: ${config.fillColor}; ${fillStyle}"></div>
      <div class="rangeslider-thumb rangeslider-thumb-min" data-thumb="min" style="background: ${config.thumbColor}; ${minThumbStyle}"></div>
      <div class="rangeslider-thumb rangeslider-thumb-max" data-thumb="max" style="background: ${config.thumbColor}; ${maxThumbStyle}"></div>
    </div>`
}

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

/**
 * Generate modulation matrix HTML with table structure for JUCE integration
 */
function generateModulationMatrixHTML(id: string, baseClass: string, positionStyle: string, config: ModulationMatrixElementConfig): string {
  const { sources, destinations, previewActiveConnections } = config

  // Generate header row with destination labels
  const headerCells = destinations
    .map((dest) => `<th class="matrix-header">${escapeHTML(dest)}</th>`)
    .join('')

  // Generate matrix rows
  const rows = sources
    .map((source, sourceIdx) => {
      const cells = destinations
        .map((_, destIdx) => {
          const isActive = previewActiveConnections.some(
            ([sIdx, dIdx]) => sIdx === sourceIdx && dIdx === destIdx
          )
          const activeAttr = isActive ? ' data-active="true"' : ''
          return `<td class="matrix-cell"${activeAttr}></td>`
        })
        .join('')

      return `<tr>
        <th class="matrix-row-header">${escapeHTML(source)}</th>
        ${cells}
      </tr>`
    })
    .join('')

  return `<div id="${id}" class="${baseClass} modulationmatrix-element" data-type="modulationmatrix" data-sources="${escapeHTML(JSON.stringify(sources))}" data-destinations="${escapeHTML(JSON.stringify(destinations))}" style="${positionStyle}">
      <table class="modulation-matrix">
        <thead>
          <tr>
            <th class="matrix-corner"></th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`
}

/**
 * Generate dB Display HTML
 */
function generateDbDisplayHTML(id: string, baseClass: string, positionStyle: string, config: DbDisplayElementConfig): string {
  const formattedValue = config.value.toFixed(config.decimalPlaces)
  const displayText = config.showUnit ? `${formattedValue} dB` : formattedValue

  return `<div id="${id}" class="${baseClass} dbdisplay-element" data-type="dbdisplay" data-value="${config.value}" data-min="${config.minDb}" data-max="${config.maxDb}" style="${positionStyle}">${escapeHTML(displayText)}</div>`
}

/**
 * Generate Frequency Display HTML
 */
function generateFrequencyDisplayHTML(id: string, baseClass: string, positionStyle: string, config: FrequencyDisplayElementConfig): string {
  const useKHz = config.autoSwitchKHz && config.value >= 1000
  const displayValue = useKHz ? config.value / 1000 : config.value
  const unit = useKHz ? 'kHz' : 'Hz'
  const formattedValue = displayValue.toFixed(config.decimalPlaces)
  const displayText = config.showUnit ? `${formattedValue} ${unit}` : formattedValue

  return `<div id="${id}" class="${baseClass} frequencydisplay-element" data-type="frequencydisplay" data-value="${config.value}" data-auto-khz="${config.autoSwitchKHz}" style="${positionStyle}">${escapeHTML(displayText)}</div>`
}

/**
 * Generate Gain Reduction Meter HTML
 */
function generateGainReductionMeterHTML(id: string, baseClass: string, positionStyle: string, config: GainReductionMeterElementConfig): string {
  const fillPercent = config.value * 100
  const dbValue = config.value * config.maxReduction
  const isVertical = config.orientation === 'vertical'

  const fillStyle = isVertical
    ? `top: 0; left: 0; right: 0; height: ${fillPercent}%;`
    : `top: 0; right: 0; bottom: 0; width: ${fillPercent}%;`

  const valueDisplay = config.showValue
    ? `<div class="gr-value">${dbValue.toFixed(1)}</div>`
    : ''

  return `<div id="${id}" class="${baseClass} gainreductionmeter-element" data-type="gainreductionmeter" data-value="${config.value}" data-max-reduction="${config.maxReduction}" data-orientation="${config.orientation}" style="${positionStyle}">
      <div class="gr-fill" style="${fillStyle}"></div>
      ${valueDisplay}
    </div>`
}

function generateDropdownHTML(id: string, baseClass: string, positionStyle: string, config: DropdownElementConfig): string {
  const options = config.options
    .map((option, index) => {
      const selected = index === config.selectedIndex ? ' selected' : ''
      return `<option value="${index}"${selected}>${escapeHTML(option)}</option>`
    })
    .join('')

  return `<select id="${id}" class="${baseClass} dropdown-element" data-type="dropdown" style="${positionStyle}">
      ${options}
    </select>`
}

function generateCheckboxHTML(id: string, baseClass: string, positionStyle: string, config: CheckboxElementConfig): string {
  const checked = config.checked ? ' checked' : ''
  const labelId = `${id}-label`

  return `<div id="${id}" class="${baseClass} checkbox-element" data-type="checkbox" data-label-position="${config.labelPosition}" style="${positionStyle}">
      <input type="checkbox" id="${id}-input"${checked} />
      <label id="${labelId}" for="${id}-input">${escapeHTML(config.label)}</label>
    </div>`
}

function generateRadioGroupHTML(id: string, baseClass: string, positionStyle: string, config: RadioGroupElementConfig): string {
  const radios = config.options
    .map((option, index) => {
      const radioId = `${id}-option-${index}`
      const checked = index === config.selectedIndex ? ' checked' : ''
      return `<div class="radio-option">
        <input type="radio" id="${radioId}" name="${id}" value="${index}"${checked} />
        <label for="${radioId}">${escapeHTML(option)}</label>
      </div>`
    })
    .join('')

  return `<div id="${id}" class="${baseClass} radiogroup-element" data-type="radiogroup" data-orientation="${config.orientation}" style="${positionStyle}">
      ${radios}
    </div>`
}

function generateTextFieldHTML(id: string, baseClass: string, positionStyle: string, config: TextFieldElementConfig): string {
  const maxLengthAttr = config.maxLength > 0 ? ` maxlength="${config.maxLength}"` : ''
  const value = config.value ? ` value="${escapeHTML(config.value)}"` : ''
  const placeholder = config.placeholder ? ` placeholder="${escapeHTML(config.placeholder)}"` : ''

  return `<input type="text" id="${id}" class="${baseClass} textfield-element" data-type="textfield"${value}${placeholder}${maxLengthAttr} style="${positionStyle}" />`
}

/**
 * Generate SVG Graphic HTML with inline sanitized SVG
 */
function generateSvgGraphicHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: SvgGraphicElementConfig
): string {
  const getAsset = useStore.getState().getAsset
  const asset = element.assetId ? getAsset(element.assetId) : null

  // Build transform with flip (rotation is in positionStyle already)
  const transformParts: string[] = []
  if (element.flipH) transformParts.push('scaleX(-1)')
  if (element.flipV) transformParts.push('scaleY(-1)')
  const flipTransform = transformParts.length > 0 ? transformParts.join(' ') : ''

  // Combine position style with flip transform and opacity
  // Note: rotation is already in positionStyle from generateElementHTML
  let combinedStyle = positionStyle
  if (flipTransform) {
    // Append flip to existing transform
    combinedStyle = combinedStyle.replace(
      /transform: rotate\(([^)]+)\);/,
      `transform: rotate($1) ${flipTransform}; transform-origin: center center;`
    )
  }
  if (element.opacity !== 1) {
    combinedStyle += ` opacity: ${element.opacity};`
  }

  if (!asset) {
    // Placeholder or missing asset - export as empty div with comment
    return `<div id="${id}" class="${baseClass} svggraphic-element" data-type="svggraphic" style="${combinedStyle}">
  <!-- SVG Graphic: Asset not assigned or missing -->
</div>`
  }

  // Export with re-sanitized SVG content inline (SEC-04: sanitize before export)
  const sanitizedSVG = sanitizeSVG(asset.svgContent)

  return `<div id="${id}" class="${baseClass} svggraphic-element" data-type="svggraphic" style="${combinedStyle}">
  ${sanitizedSVG}
</div>`
}

/**
 * Generate Multi-Slider HTML with parallel vertical sliders
 */
function generateMultiSliderHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: MultiSliderElementConfig
): string {
  const bandValuesData = element.bandValues.join(',')

  // Generate bands with fills
  let bandsHTML = ''
  for (let i = 0; i < element.bandCount; i++) {
    const value = element.bandValues[i] ?? 0.5
    const normalizedValue = (value - element.min) / (element.max - element.min)
    const fillHeight = normalizedValue * 100

    const labelHTML = element.labelStyle !== 'none'
      ? `<span class="multislider-label" style="font-size: ${element.labelFontSize}px; color: ${element.labelColor};">${i + 1}</span>`
      : ''

    bandsHTML += `<div class="multislider-band">
      <div class="multislider-fill" style="height: ${fillHeight}%;"></div>
      <div class="multislider-thumb" style="bottom: ${fillHeight}%;"></div>
      ${labelHTML}
    </div>`
  }

  return `<div id="${id}" class="${baseClass} multislider-element" data-type="multislider" data-band-count="${element.bandCount}" data-band-values="${bandValuesData}" data-min="${element.min}" data-max="${element.max}" data-label-style="${element.labelStyle}" data-link-mode="${element.linkMode}" style="${positionStyle}">
  <div class="multislider-container">${bandsHTML}</div>
</div>`
}

// ============================================================================
// Button/Switch HTML Generation Functions
// ============================================================================

/**
 * Helper to get icon content for segment buttons
 */
function getSegmentIconContent(seg: SegmentConfig): string {
  if (seg.iconSource === 'builtin' && seg.builtInIcon) {
    const icon = seg.builtInIcon as BuiltInIcon
    return builtInIconSVG[icon] || ''
  }
  if (seg.iconSource === 'asset' && seg.assetId) {
    const getAsset = useStore.getState().getAsset
    const asset = getAsset(seg.assetId)
    if (asset) {
      return sanitizeSVG(asset.svgContent)
    }
  }
  return ''
}

/**
 * Generate Icon Button HTML with inline SVG
 */
function generateIconButtonHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: IconButtonElementConfig
): string {
  let iconSvg = ''

  if (element.iconSource === 'builtin' && element.builtInIcon) {
    iconSvg = builtInIconSVG[element.builtInIcon] || ''
  } else if (element.iconSource === 'asset' && element.assetId) {
    const getAsset = useStore.getState().getAsset
    const asset = getAsset(element.assetId)
    if (asset) {
      iconSvg = sanitizeSVG(asset.svgContent)
    }
  }

  return `<button id="${id}" class="${baseClass} iconbutton-element" data-type="iconbutton" data-mode="${element.mode}" data-pressed="${element.pressed}" style="${positionStyle}">
  <span class="icon">${iconSvg}</span>
</button>`
}

/**
 * Generate Kick Button HTML
 */
function generateKickButtonHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: KickButtonElementConfig
): string {
  return `<button id="${id}" class="${baseClass} kickbutton-element" data-type="kickbutton" data-pressed="${element.pressed}" style="${positionStyle}">
  ${escapeHTML(element.label)}
</button>`
}

/**
 * Generate Toggle Switch HTML with track and thumb
 */
function generateToggleSwitchHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ToggleSwitchElementConfig
): string {
  const labelsHTML = element.showLabels
    ? `<span class="label-off">${escapeHTML(element.offLabel)}</span><span class="label-on">${escapeHTML(element.onLabel)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} toggleswitch-element" data-type="toggleswitch" data-on="${element.isOn}" style="${positionStyle}">
  <div class="track"></div>
  <div class="thumb"></div>
  ${labelsHTML}
</div>`
}

/**
 * Generate Power Button HTML with LED indicator
 */
function generatePowerButtonHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: PowerButtonElementConfig
): string {
  return `<button id="${id}" class="${baseClass} powerbutton-element" data-type="powerbutton" data-on="${element.isOn}" data-led-position="${element.ledPosition}" style="${positionStyle}">
  <span class="label">${escapeHTML(element.label)}</span>
  <span class="led"></span>
</button>`
}

/**
 * Generate Rocker Switch HTML with paddle and labels
 */
function generateRockerSwitchHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: RockerSwitchElementConfig
): string {
  // Position indicator symbols matching RockerSwitchRenderer.tsx
  const positionSymbols: Record<0 | 1 | 2, string> = {
    2: '\u2191', // up arrow
    1: '\u2500', // horizontal line (center)
    0: '\u2193', // down arrow
  }

  const labelsHTML = element.showLabels
    ? `<div class="labels">
    <span class="label-up">${escapeHTML(element.upLabel)}</span>
    <span class="label-down">${escapeHTML(element.downLabel)}</span>
  </div>`
    : ''

  return `<div id="${id}" class="${baseClass} rockerswitch-element" data-type="rockerswitch" data-position="${element.position}" data-mode="${element.mode}" style="${positionStyle}">
  <div class="track">
    <div class="paddle">${positionSymbols[element.position]}</div>
  </div>
  ${labelsHTML}
</div>`
}

/**
 * Generate Rotary Switch HTML with SVG body, pointer, and position labels
 * Matches RotarySwitchRenderer.tsx implementation
 */
function generateRotarySwitchHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: RotarySwitchElementConfig
): string {
  // Calculate dimensions matching renderer
  const size = Math.min(element.width, element.height)
  const centerX = size / 2
  const centerY = size / 2
  const radius = size * 0.35
  const pointerLength = radius * 0.7

  // Calculate angle per position
  const anglePerPosition = element.positionCount > 1 ? element.rotationAngle / (element.positionCount - 1) : 0
  const startAngle = -element.rotationAngle / 2
  const currentAngle = startAngle + element.currentPosition * anglePerPosition

  // Generate position labels
  const labels = element.positionLabels || Array.from({ length: element.positionCount }, (_, i) => String(i + 1))

  // Convert degrees to radians
  const degToRad = (deg: number) => (deg * Math.PI) / 180

  // Calculate pointer end position
  const pointerEndX = centerX + pointerLength * Math.sin(degToRad(currentAngle))
  const pointerEndY = centerY - pointerLength * Math.cos(degToRad(currentAngle))

  // Generate position indicator marks
  const positionMarks = Array.from({ length: element.positionCount }, (_, i) => {
    const angle = startAngle + i * anglePerPosition
    const markStartRadius = radius - 6
    const markEndRadius = radius - 2
    const x1 = centerX + markStartRadius * Math.sin(degToRad(angle))
    const y1 = centerY - markStartRadius * Math.cos(degToRad(angle))
    const x2 = centerX + markEndRadius * Math.sin(degToRad(angle))
    const y2 = centerY - markEndRadius * Math.cos(degToRad(angle))
    const isActive = i === element.currentPosition
    const strokeColor = isActive ? element.pointerColor : element.borderColor
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />`
  }).join('')

  let labelsHTML = ''

  if (element.labelLayout === 'radial') {
    // Radial labels (inside SVG as text elements)
    const labelRadius = radius + 20
    const radialLabelsHTML = labels.slice(0, element.positionCount).map((label, i) => {
      const angle = startAngle + i * anglePerPosition
      const x = centerX + labelRadius * Math.sin(degToRad(angle))
      const y = centerY - labelRadius * Math.cos(degToRad(angle))
      const isActive = i === element.currentPosition
      const opacity = isActive ? 1 : 0.6
      const fontWeight = isActive ? 'bold' : 'normal'
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${element.labelFontSize}" fill="${element.labelColor}" font-weight="${fontWeight}" opacity="${opacity}">${escapeHTML(label)}</text>`
    }).join('')
    labelsHTML = radialLabelsHTML
  } else {
    // Legend layout (outside SVG as HTML list)
    const legendLabelsHTML = labels.slice(0, element.positionCount).map((label, i) => {
      const isActive = i === element.currentPosition
      return `<span class="label" data-active="${isActive}">${i + 1}. ${escapeHTML(label)}</span>`
    }).join('')
    labelsHTML = `</svg><div class="labels-legend">${legendLabelsHTML}</div>`
  }

  const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <!-- Switch body -->
    <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${element.backgroundColor}" stroke="${element.borderColor}" stroke-width="2" />
    <!-- Position indicator marks -->
    ${positionMarks}
    <!-- Pointer line -->
    <line x1="${centerX}" y1="${centerY}" x2="${pointerEndX}" y2="${pointerEndY}" stroke="${element.pointerColor}" stroke-width="3" stroke-linecap="round" />
    <!-- Center dot -->
    <circle cx="${centerX}" cy="${centerY}" r="4" fill="${element.pointerColor}" />
    <!-- Radial labels (if applicable) -->
    ${element.labelLayout === 'radial' ? labelsHTML : ''}
  </svg>${element.labelLayout === 'legend' ? labelsHTML.substring(6) : ''}`

  return `<div id="${id}" class="${baseClass} rotaryswitch-element" data-type="rotaryswitch" data-position="${element.currentPosition}" data-count="${element.positionCount}" data-layout="${element.labelLayout}" style="${positionStyle}">
  ${svgContent}
</div>`
}

/**
 * Generate Segment Button HTML with segment structure
 */
function generateSegmentButtonHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: SegmentButtonElementConfig
): string {
  const segmentsHTML = element.segments
    .map((seg, i) => {
      const isSelected = element.selectedIndices.includes(i)
      const iconHTML = seg.displayMode !== 'text'
        ? `<span class="segment-icon">${getSegmentIconContent(seg)}</span>`
        : ''
      const textHTML = seg.displayMode !== 'icon'
        ? `<span class="segment-text">${escapeHTML(seg.text || '')}</span>`
        : ''

      return `<div class="segment" data-index="${i}" data-selected="${isSelected}">
      ${iconHTML}
      ${textHTML}
    </div>`
    })
    .join('')

  return `<div id="${id}" class="${baseClass} segmentbutton-element" data-type="segmentbutton" data-mode="${element.selectionMode}" data-orientation="${element.orientation}" style="${positionStyle}">
  ${segmentsHTML}
</div>`
}

// ============================================================================
// Value Display HTML Generation Functions
// ============================================================================

/**
 * Generate Numeric Display HTML
 */
function generateNumericDisplayHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'numericdisplay' }
): string {
  const formattedValue = formatDisplayValue(element.value, element.min, element.max, 'numeric', { decimals: element.decimalPlaces })
  const ghostPattern = '8'.repeat(formattedValue.replace(/[^0-9.-]/g, '').length)
  const ghostHTML = element.showGhostSegments && element.fontStyle === '7segment'
    ? `<span class="ghost">${ghostPattern}</span>`
    : ''
  const unitHTML = element.unitDisplay === 'label' && element.unit
    ? `<span class="unit">${escapeHTML(element.unit)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} numericdisplay-element" data-type="numericdisplay" data-font-style="${element.fontStyle}" data-bezel="${element.bezelStyle}" style="${positionStyle}">
  ${ghostHTML}
  <span class="value">${escapeHTML(formattedValue)}</span>
  ${unitHTML}
</div>`
}

/**
 * Generate Time Display HTML
 */
function generateTimeDisplayHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'timedisplay' }
): string {
  const formattedTime = formatDisplayValue(element.value, element.min, element.max, 'time', {
    decimals: element.decimalPlaces,
    bpm: element.bpm,
    timeSignature: element.timeSignature
  })
  const ghostHTML = element.showGhostSegments && element.fontStyle === '7segment'
    ? `<span class="ghost">88:88:88</span>`
    : ''

  return `<div id="${id}" class="${baseClass} timedisplay-element" data-type="timedisplay" data-font-style="${element.fontStyle}" data-bezel="${element.bezelStyle}" style="${positionStyle}">
  ${ghostHTML}
  <span class="value">${escapeHTML(formattedTime)}</span>
</div>`
}

/**
 * Generate Percentage Display HTML
 */
function generatePercentageDisplayHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'percentagedisplay' }
): string {
  const formattedPercentage = formatDisplayValue(element.value, 0, 1, 'percentage', { decimals: element.decimalPlaces })
  const ghostHTML = element.showGhostSegments && element.fontStyle === '7segment'
    ? `<span class="ghost">888%</span>`
    : ''

  return `<div id="${id}" class="${baseClass} percentagedisplay-element" data-type="percentagedisplay" data-font-style="${element.fontStyle}" data-bezel="${element.bezelStyle}" style="${positionStyle}">
  ${ghostHTML}
  <span class="value">${escapeHTML(formattedPercentage)}</span>
</div>`
}

/**
 * Generate Ratio Display HTML
 */
function generateRatioDisplayHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'ratiodisplay' }
): string {
  const formattedRatio = formatDisplayValue(element.value, element.min, element.max, 'ratio', { decimals: element.decimalPlaces })
  const ghostHTML = element.showGhostSegments && element.fontStyle === '7segment'
    ? `<span class="ghost">88:1</span>`
    : ''

  return `<div id="${id}" class="${baseClass} ratiodisplay-element" data-type="ratiodisplay" data-font-style="${element.fontStyle}" data-bezel="${element.bezelStyle}" style="${positionStyle}">
  ${ghostHTML}
  <span class="value">${escapeHTML(formattedRatio)}</span>
</div>`
}

/**
 * Generate Note Display HTML
 */
function generateNoteDisplayHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'notedisplay' }
): string {
  // Calculate note from MIDI number
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const midiNumber = Math.round(element.min + element.value * (element.max - element.min))
  const octave = Math.floor(midiNumber / 12) - 1
  const noteName = noteNames[midiNumber % 12]
  const midiHTML = element.showMidiNumber
    ? `<span class="midi">${midiNumber}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} notedisplay-element" data-type="notedisplay" data-bezel="${element.bezelStyle}" style="${positionStyle}">
  <span class="note">${noteName}${octave}</span>
  ${midiHTML}
</div>`
}

/**
 * Generate BPM Display HTML
 */
function generateBpmDisplayHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'bpmdisplay' }
): string {
  const formattedBpm = formatDisplayValue(element.value, element.min, element.max, 'bpm', { decimals: element.decimalPlaces })
  const ghostHTML = element.showGhostSegments && element.fontStyle === '7segment'
    ? `<span class="ghost">888.88</span>`
    : ''
  const labelHTML = element.showLabel
    ? `<span class="label">BPM</span>`
    : ''

  return `<div id="${id}" class="${baseClass} bpmdisplay-element" data-type="bpmdisplay" data-font-style="${element.fontStyle}" data-bezel="${element.bezelStyle}" style="${positionStyle}">
  ${ghostHTML}
  <span class="value">${escapeHTML(formattedBpm.replace(' BPM', ''))}</span>
  ${labelHTML}
</div>`
}

/**
 * Generate Editable Display HTML
 */
function generateEditableDisplayHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'editabledisplay' }
): string {
  // For editable display, we format the value based on its format type
  // db format requires special handling (not in formatDisplayValue)
  let formattedValue: string
  if (element.format === 'db') {
    const actual = element.min + element.value * (element.max - element.min)
    formattedValue = `${actual.toFixed(element.decimalPlaces)} dB`
  } else {
    // Cast format to the union type expected by formatDisplayValue
    const displayFormat = element.format as 'numeric' | 'percentage'
    formattedValue = formatDisplayValue(element.value, element.min, element.max, displayFormat, { decimals: element.decimalPlaces })
  }

  return `<div id="${id}" class="${baseClass} editabledisplay-element" data-type="editabledisplay" data-format="${element.format}" data-min="${element.min}" data-max="${element.max}" style="${positionStyle}">
  <span class="value">${escapeHTML(formattedValue)}</span>
</div>`
}

/**
 * Generate Multi-Value Display HTML
 */
function generateMultiValueDisplayHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'multivaluedisplay' }
): string {
  const valuesHTML = element.values.slice(0, 4).map((v) => {
    // Multi-value format is a generic string, handle known formats
    let formattedValue: string
    const knownFormats = ['numeric', 'time', 'percentage', 'ratio', 'note', 'bpm']
    if (knownFormats.includes(v.format)) {
      formattedValue = formatDisplayValue(v.value, v.min, v.max, v.format as any, { decimals: v.decimalPlaces })
    } else if (v.format === 'db') {
      const actual = v.min + v.value * (v.max - v.min)
      formattedValue = `${actual.toFixed(v.decimalPlaces || 2)} dB`
    } else {
      // Default to numeric
      const actual = v.min + v.value * (v.max - v.min)
      formattedValue = actual.toFixed(v.decimalPlaces || 2)
    }
    const labelHTML = v.label ? `<span class="label">${escapeHTML(v.label)}</span>` : ''
    return `<div class="value-item">
      ${labelHTML}
      <span class="value">${escapeHTML(formattedValue)}</span>
    </div>`
  }).join('')

  return `<div id="${id}" class="${baseClass} multivaluedisplay-element" data-type="multivaluedisplay" data-layout="${element.layout}" style="${positionStyle}">
  ${valuesHTML}
</div>`
}

// ============================================================================
// Professional Meter HTML Generation Functions
// ============================================================================

/**
 * Generate HTML for segmented meters (RMS, VU, PPM, True Peak, LUFS, K-System)
 */
function generateSegmentedMeterHTML(
  element: BaseProfessionalMeterConfig,
  isStereo: boolean
): string {
  const { segmentCount, orientation, showPeakHold, scalePosition, minDb, maxDb } = element
  const isVertical = orientation === 'vertical'

  // Generate segment HTML
  const segments = Array.from({ length: segmentCount }, (_, i) =>
    `<div class="meter-segment" data-segment="${i}"></div>`
  ).join('\n    ')

  const peakHold = showPeakHold
    ? `<div class="peak-hold" data-peak-hold></div>`
    : ''

  // Generate scale marks (simplified for export)
  const scale = scalePosition !== 'none' ? `
  <div class="meter-scale" data-min="${minDb}" data-max="${maxDb}">
    <span>${minDb}</span>
    <span>${maxDb > 0 ? '+' + maxDb : maxDb}</span>
  </div>` : ''

  if (isStereo) {
    const channelL = `
  <div class="meter-channel" data-channel="L">
    ${segments}
    ${peakHold}
  </div>`
    const channelR = `
  <div class="meter-channel" data-channel="R">
    ${segments}
    ${peakHold}
  </div>`

    return `
<div class="stereo-wrapper">
  ${scale}
  ${channelL}
  ${channelR}
  <div class="channel-labels">
    <span>L</span>
    <span>R</span>
  </div>
</div>`
  }

  return `
${scale}
<div class="meter-segments" data-orientation="${orientation}">
  ${segments}
  ${peakHold}
</div>`
}

/**
 * Generate HTML for horizontal bar meters (Correlation, Stereo Width)
 */
function generateHorizontalBarMeterHTML(
  element: CorrelationMeterElementConfig | StereoWidthMeterElementConfig
): string {
  const { showScale, scalePosition, showNumericReadout } = element
  const isCorrelation = element.type === 'correlationmeter'

  const scaleLabels = isCorrelation
    ? ['<span>-1</span>', '<span>0</span>', '<span>+1</span>']
    : ['<span>0%</span>', '<span>100%</span>', '<span>200%</span>']

  const scale = showScale
    ? `<div class="meter-scale" data-position="${scalePosition}">${scaleLabels.join('')}</div>`
    : ''

  const readout = showNumericReadout
    ? `<div class="meter-readout" data-readout></div>`
    : ''

  return `
${scalePosition === 'above' ? scale : ''}
<div class="meter-track">
  <div class="center-marker"></div>
  <div class="meter-indicator" data-indicator></div>
</div>
${scalePosition === 'below' ? scale : ''}
${readout}`
}

// ============================================================================
// LED Indicator HTML Generation Functions
// ============================================================================

/**
 * Generate Single LED HTML with visual content
 */
function generateSingleLedHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'singleled' }
): string {
  const isOn = element.state === 'on'
  const currentColor = isOn ? element.onColor : element.offColor
  const borderRadius = element.shape === 'round' ? '50%' : `${element.cornerRadius}px`
  const boxShadow = isOn && element.glowEnabled
    ? `0 0 ${element.glowRadius}px ${element.glowIntensity}px ${element.onColor}`
    : 'none'

  return `<div id="${id}" class="${baseClass} singleled-element" data-type="singleled" data-state="${element.state}" data-shape="${element.shape}" style="${positionStyle}">
  <div class="led-indicator" style="width: 100%; height: 100%; background-color: ${currentColor}; border-radius: ${borderRadius}; box-shadow: ${boxShadow};"></div>
</div>`
}

/**
 * Generate Bi-Color LED HTML with visual content
 */
function generateBiColorLedHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'bicolorled' }
): string {
  const currentColor = element.state === 'green' ? element.greenColor : element.redColor
  const borderRadius = element.shape === 'round' ? '50%' : `${element.cornerRadius}px`
  const boxShadow = element.glowEnabled
    ? `0 0 ${element.glowRadius}px ${element.glowIntensity}px ${currentColor}`
    : 'none'

  return `<div id="${id}" class="${baseClass} bicolorled-element" data-type="bicolorled" data-state="${element.state}" data-shape="${element.shape}" style="${positionStyle}">
  <div class="led-indicator" style="width: 100%; height: 100%; background-color: ${currentColor}; border-radius: ${borderRadius}; box-shadow: ${boxShadow};"></div>
</div>`
}

/**
 * Generate Tri-Color LED HTML with visual content
 */
function generateTriColorLedHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'tricolorled' }
): string {
  // Determine current color based on state
  let currentColor = element.offColor
  if (element.state === 'yellow') {
    currentColor = element.yellowColor
  } else if (element.state === 'red') {
    currentColor = element.redColor
  }

  const isOn = element.state !== 'off'
  const borderRadius = element.shape === 'round' ? '50%' : `${element.cornerRadius}px`
  const boxShadow = isOn && element.glowEnabled
    ? `0 0 ${element.glowRadius}px ${element.glowIntensity}px ${currentColor}`
    : 'none'

  return `<div id="${id}" class="${baseClass} tricolorled-element" data-type="tricolorled" data-state="${element.state}" data-shape="${element.shape}" style="${positionStyle}">
  <div class="led-indicator" style="width: 100%; height: 100%; background-color: ${currentColor}; border-radius: ${borderRadius}; box-shadow: ${boxShadow};"></div>
</div>`
}

/**
 * Generate LED Array HTML
 */
function generateLedArrayHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'ledarray' }
): string {
  const litCount = Math.round(element.value * element.segmentCount)
  const segmentsHTML = Array.from({ length: element.segmentCount }, (_, i) => {
    const isLit = i < litCount
    return `<div class="led-segment" data-index="${i}" data-lit="${isLit}"></div>`
  }).join('')

  return `<div id="${id}" class="${baseClass} ledarray-element" data-type="ledarray" data-orientation="${element.orientation}" data-count="${element.segmentCount}" style="${positionStyle}">
  ${segmentsHTML}
</div>`
}

/**
 * Generate LED Ring HTML with SVG
 */
function generateLedRingHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'ledring' }
): string {
  const diameter = element.diameter
  const radius = diameter / 2
  const cx = radius
  const cy = radius
  const circleRadius = radius - element.thickness / 2

  // Calculate arc parameters matching the renderer
  const circumference = 2 * Math.PI * circleRadius
  const totalArc = element.endAngle - element.startAngle
  const litArcAngle = element.value * totalArc

  // Calculate dash array for segments
  const segmentLength = circumference / element.segmentCount
  const gapLength = segmentLength * 0.2 // 20% gap between segments
  const dashLength = segmentLength - gapLength

  // Calculate stroke-dashoffset to show only lit portion
  const litSegments = Math.round((litArcAngle / totalArc) * element.segmentCount)
  const totalLitLength = litSegments * segmentLength

  // SVG rotation angle
  const rotationAngle = element.startAngle + 90 // SVG rotation (0° is at top)

  const glowFilter = element.glowEnabled ? `<defs>
    <filter id="led-ring-glow-${id}">
      <feGaussianBlur stdDeviation="${element.glowRadius / 2}" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="1.5" />
      </feComponentTransfer>
    </filter>
  </defs>` : ''

  return `<div id="${id}" class="${baseClass} ledring-element" data-type="ledring" style="${positionStyle}">
  <svg width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}" style="transform: rotate(${rotationAngle}deg);">
    ${glowFilter}
    <circle class="ring-bg" cx="${cx}" cy="${cy}" r="${circleRadius}" fill="none"
      stroke="${element.offColor}" stroke-width="${element.thickness}"
      stroke-dasharray="${dashLength} ${gapLength}" opacity="0.8"/>
    ${litSegments > 0 ? `<circle class="ring-lit" cx="${cx}" cy="${cy}" r="${circleRadius}" fill="none"
      stroke="${element.onColor}" stroke-width="${element.thickness}"
      stroke-dasharray="${totalLitLength} ${circumference - totalLitLength}"
      stroke-dashoffset="0"
      ${element.glowEnabled ? `filter="url(#led-ring-glow-${id})"` : ''}/>` : ''}
  </svg>
</div>`
}

/**
 * Generate LED Matrix HTML
 */
function generateLedMatrixHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ElementConfig & { type: 'ledmatrix' }
): string {
  const cellsHTML = element.states.flat().map((isLit, i) => {
    return `<div class="led-cell" data-index="${i}" data-lit="${isLit}"></div>`
  }).join('')

  return `<div id="${id}" class="${baseClass} ledmatrix-element" data-type="ledmatrix" data-rows="${element.rows}" data-cols="${element.columns}" style="${positionStyle}">
  ${cellsHTML}
</div>`
}

// ============================================================================
// Navigation Element HTML Generation Functions
// ============================================================================

/**
 * Generate Stepper HTML
 */
function generateStepperHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: StepperElementConfig
): string {
  // Format value for display
  const actual = element.min + element.value * (element.max - element.min)
  const formattedValue = element.valueFormat === 'custom'
    ? `${actual.toFixed(element.decimalPlaces)}${element.valueSuffix}`
    : actual.toFixed(element.decimalPlaces)

  const valueDisplay = element.showValue
    ? `<span class="stepper-value">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} stepper-element" data-type="stepper" data-value="${element.value}" data-min="${element.min}" data-max="${element.max}" data-step="${element.step}" data-orientation="${element.orientation}" style="${positionStyle}">
  <button class="stepper-button decrement" aria-label="Decrement"></button>
  ${valueDisplay}
  <button class="stepper-button increment" aria-label="Increment"></button>
</div>`
}

/**
 * Generate Breadcrumb HTML
 */
function generateBreadcrumbHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: BreadcrumbElementConfig
): string {
  let itemsToRender: BreadcrumbItem[] = element.items

  // Handle truncation if maxVisibleItems is set
  if (element.maxVisibleItems > 0 && element.items.length > element.maxVisibleItems) {
    const firstItem = element.items[0]
    const lastItems = element.items.slice(-(element.maxVisibleItems - 1))
    itemsToRender = [firstItem, ...lastItems]
  }

  const itemsHTML = itemsToRender.map((item, index) => {
    const isLast = index === itemsToRender.length - 1
    const needsEllipsis = element.maxVisibleItems > 0 && element.items.length > element.maxVisibleItems && index === 0

    let html = '<li>'

    if (isLast) {
      html += `<span class="breadcrumb-current">${escapeHTML(item.label)}</span>`
    } else {
      html += `<a href="#" data-item-id="${escapeHTML(item.id)}">${escapeHTML(item.label)}</a>`
    }

    if (!isLast) {
      html += `<span class="breadcrumb-separator">${escapeHTML(element.separator)}</span>`
    }

    if (needsEllipsis) {
      html += `<span class="breadcrumb-ellipsis">...</span>`
      html += `<span class="breadcrumb-separator">${escapeHTML(element.separator)}</span>`
    }

    html += '</li>'
    return html
  }).join('')

  return `<nav id="${id}" class="${baseClass} breadcrumb-element" data-type="breadcrumb" aria-label="breadcrumb" style="${positionStyle}">
  <ol>
    ${itemsHTML}
  </ol>
</nav>`
}

/**
 * Generate Multi-Select Dropdown HTML
 */
function generateMultiSelectDropdownHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: MultiSelectDropdownElementConfig
): string {
  const selectedLabels = element.selectedIndices.map(i => element.options[i]).join(', ')
  const displayText = selectedLabels || 'Select options...'

  const itemsHTML = element.options.map((option, index) => {
    const isSelected = element.selectedIndices.includes(index)
    return `<div class="dropdown-item" data-index="${index}">
      <input type="checkbox" ${isSelected ? 'checked' : ''} />
      <span>${escapeHTML(option)}</span>
    </div>`
  }).join('')

  return `<div id="${id}" class="${baseClass} multiselectdropdown-element" data-type="multiselectdropdown" data-max-selections="${element.maxSelections}" role="listbox" aria-multiselectable="true" style="${positionStyle}">
  <div class="dropdown-container">
    <div class="selected-text">${escapeHTML(displayText)}</div>
    <div class="dropdown-menu">
      ${itemsHTML}
    </div>
  </div>
</div>`
}

/**
 * Generate Combo Box HTML
 */
function generateComboBoxHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: ComboBoxElementConfig
): string {
  const itemsHTML = element.options.map((option) => {
    return `<div class="dropdown-item" data-value="${escapeHTML(option)}">${escapeHTML(option)}</div>`
  }).join('')

  return `<div id="${id}" class="${baseClass} combobox-element" data-type="combobox" role="combobox" aria-expanded="false" aria-autocomplete="list" style="${positionStyle}">
  <div class="dropdown-container">
    <input type="text" value="${escapeHTML(element.selectedValue)}" placeholder="${escapeHTML(element.placeholder)}" />
    <div class="dropdown-menu">
      ${itemsHTML}
      <div class="empty-state" style="display: none;">No matching options</div>
    </div>
  </div>
</div>`
}

/**
 * Helper to get built-in icon SVG for tabs
 */
function getBuiltInIconSVG(icon?: BuiltInIcon): string {
  if (!icon) return ''
  return builtInIconSVG[icon] || ''
}

/**
 * Generate Menu Button HTML
 */
function generateMenuButtonHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: MenuButtonElementConfig
): string {
  const itemsHTML = element.menuItems.map((item: MenuItem, index) => {
    if (item.divider) {
      return '<div class="menu-divider"></div>'
    }

    const disabledClass = item.disabled ? ' disabled' : ''
    return `<div class="dropdown-item${disabledClass}" role="menuitem" data-item-id="${escapeHTML(item.id)}" data-index="${index}">${escapeHTML(item.label)}</div>`
  }).join('')

  return `<button id="${id}" class="${baseClass} menubutton-element" data-type="menubutton" aria-haspopup="menu" style="${positionStyle}">
  ${escapeHTML(element.label)}
  <div class="dropdown-container">
    <div class="dropdown-menu" role="menu">
      ${itemsHTML}
    </div>
  </div>
</button>`
}

/**
 * Generate Tab Bar HTML
 */
function generateTabBarHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: TabBarElementConfig
): string {
  const tabsHTML = element.tabs.map((tab: TabConfig, index) => {
    const isActive = index === element.activeTabIndex
    const iconHTML = tab.showIcon && tab.icon
      ? `<span class="tab-icon">${getBuiltInIconSVG(tab.icon)}</span>`
      : ''
    const labelHTML = tab.showLabel && tab.label
      ? `<span class="tab-label">${escapeHTML(tab.label)}</span>`
      : ''

    return `<div class="tab" role="tab" aria-selected="${isActive}" data-tab-index="${index}" data-tab-id="${escapeHTML(tab.id)}">
    ${iconHTML}
    ${labelHTML}
  </div>`
  }).join('')

  // Add indicator divs for underline/accent-bar styles
  const indicatorHTML = element.indicatorStyle === 'underline'
    ? '<div class="indicator-underline"></div>'
    : element.indicatorStyle === 'accent-bar'
    ? '<div class="indicator-underline"></div><div class="indicator-accent"></div>'
    : ''

  return `<div id="${id}" class="${baseClass} tabbar-element" data-type="tabbar" data-active-tab="${element.activeTabIndex}" data-orientation="${element.orientation}" data-indicator-style="${element.indicatorStyle}" role="tablist" style="${positionStyle}">
  ${tabsHTML}
  ${indicatorHTML}
</div>`
}

/**
 * Generate Tag Selector HTML
 */
function generateTagSelectorHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: TagSelectorElementConfig
): string {
  const tagsHTML = element.selectedTags.map((tag: Tag) => {
    return `<div class="tag-chip" data-tag-id="${escapeHTML(tag.id)}">
    <span>${escapeHTML(tag.label)}</span>
    <button class="tag-remove" aria-label="Remove ${escapeHTML(tag.label)}">×</button>
  </div>`
  }).join('')

  const inputHTML = element.showInput ? `
  <div class="tag-input-wrapper">
    <input type="text" placeholder="${escapeHTML(element.inputPlaceholder)}" />
    <div class="tag-dropdown">
      ${element.availableTags.filter((tag: Tag) => !element.selectedTags.find((t: Tag) => t.id === tag.id)).map((tag: Tag) => {
        return `<div class="tag-dropdown-item" data-tag-id="${escapeHTML(tag.id)}">${escapeHTML(tag.label)}</div>`
      }).join('')}
    </div>
  </div>` : ''

  return `<div id="${id}" class="${baseClass} tagselector-element" data-type="tagselector" role="list" style="${positionStyle}">
  <div class="tags-container">
    ${tagsHTML}
  </div>
  ${inputHTML}
</div>`
}

/**
 * Helper to recursively generate tree nodes
 */
function generateTreeNodeHTML(node: TreeNode, level: number, indent: number, selectedId?: string): string {
  const hasChildren = node.children && node.children.length > 0
  const isSelected = node.id === selectedId
  const paddingLeft = level * indent

  let html = `<div class="tree-node" data-node-id="${escapeHTML(node.id)}" data-level="${level}" data-selected="${isSelected}" style="padding-left: ${paddingLeft}px;">
  <span class="tree-arrow ${hasChildren ? '' : 'empty'}"></span>
  <span class="tree-node-name">${escapeHTML(node.name)}</span>
</div>`

  if (hasChildren && node.children) {
    html += node.children.map(child => generateTreeNodeHTML(child, level + 1, indent, selectedId)).join('')
  }

  return html
}

/**
 * Generate Tree View HTML
 */
function generateTreeViewHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: TreeViewElementConfig
): string {
  const nodesHTML = element.data.map(node => generateTreeNodeHTML(node, 0, element.indent, element.selectedId)).join('')

  return `<div id="${id}" class="${baseClass} treeview-element" data-type="treeview" data-selected-id="${element.selectedId || ''}" data-row-height="${element.rowHeight}" data-indent="${element.indent}" style="${positionStyle}">
  ${nodesHTML}
</div>`
}

// ============================================================================
// Visualization HTML Generation Functions
// ============================================================================

/**
 * Generate Scrolling Waveform HTML with JavaScript draw function
 */
function generateScrollingWaveformHTML(config: ScrollingWaveformElementConfig): string {
  const id = toKebabCase(config.name)
  const positionStyle = `position: absolute; left: ${config.x}px; top: ${config.y}px; width: ${config.width}px; height: ${config.height}px; transform: rotate(${config.rotation}deg);`

  return `<div id="${id}" class="element viz-container" data-viz-type="scrollingwaveform" style="${positionStyle}">
  <canvas id="${id}-canvas"></canvas>
</div>
<script>
(function() {
  const canvas = document.getElementById('${id}-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // HiDPI setup
  canvas.width = ${config.width} * dpr;
  canvas.height = ${config.height} * dpr;
  canvas.style.width = '${config.width}px';
  canvas.style.height = '${config.height}px';
  ctx.scale(dpr, dpr);

  // Draw function called by JUCE with waveform data
  window.updateWaveform_${id.replace(/-/g, '_')} = function(waveformData) {
    const width = ${config.width};
    const height = ${config.height};

    // Clear
    ctx.fillStyle = '${config.backgroundColor}';
    ctx.fillRect(0, 0, width, height);

    ${config.showGrid ? `
    // Grid
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ` : ''}

    // Waveform
    ctx.strokeStyle = '${config.waveformColor}';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < waveformData.length; i++) {
      const x = (i / waveformData.length) * width;
      const y = (height / 2) - (waveformData[i] * height * 0.4);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ${config.displayMode === 'fill' ? `
    ctx.lineTo(width, height / 2);
    ctx.closePath();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '${config.waveformColor}';
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ` : 'ctx.stroke();'}
  };

  // Register with JUCE
  if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener('waveform_${id}', (e) => {
      window.updateWaveform_${id.replace(/-/g, '_')}(e.data);
    });
  }
})();
</script>`
}

/**
 * Generate Spectrum Analyzer HTML with JavaScript draw function
 */
function generateSpectrumAnalyzerHTML(config: SpectrumAnalyzerElementConfig): string {
  const id = toKebabCase(config.name)
  const positionStyle = `position: absolute; left: ${config.x}px; top: ${config.y}px; width: ${config.width}px; height: ${config.height}px; transform: rotate(${config.rotation}deg);`

  return `<div id="${id}" class="element viz-container" data-viz-type="spectrumanalyzer" data-fft-size="${config.fftSize}" style="${positionStyle}">
  <canvas id="${id}-canvas"></canvas>
</div>
<script>
(function() {
  const canvas = document.getElementById('${id}-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = ${config.width} * dpr;
  canvas.height = ${config.height} * dpr;
  canvas.style.width = '${config.width}px';
  canvas.style.height = '${config.height}px';
  ctx.scale(dpr, dpr);

  window.updateSpectrum_${id.replace(/-/g, '_')} = function(frequencyData) {
    const width = ${config.width};
    const height = ${config.height};
    const barCount = frequencyData.length;
    const barWidth = width / barCount;
    const gapWidth = ${config.barGap};

    ctx.fillStyle = '${config.backgroundColor}';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < barCount; i++) {
      const magnitude = frequencyData[i];
      const x = i * barWidth;
      const barHeight = magnitude * height * 0.9;
      const y = height - barHeight;

      // Color gradient
      const hue = (1 - magnitude) * 240;
      ctx.fillStyle = \`hsl(\${hue}, 100%, \${40 + magnitude * 20}%)\`;
      ctx.fillRect(x + gapWidth / 2, y, barWidth - gapWidth, barHeight);
    }
  };

  if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener('fftData_${id}', (e) => {
      window.updateSpectrum_${id.replace(/-/g, '_')}(e.data);
    });
  }
})();
</script>`
}

/**
 * Generate Spectrogram HTML with JavaScript draw function
 */
function generateSpectrogramHTML(config: SpectrogramElementConfig): string {
  const id = toKebabCase(config.name)
  const positionStyle = `position: absolute; left: ${config.x}px; top: ${config.y}px; width: ${config.width}px; height: ${config.height}px; transform: rotate(${config.rotation}deg);`

  return `<div id="${id}" class="element viz-container" data-viz-type="spectrogram" data-fft-size="${config.fftSize}" style="${positionStyle}">
  <canvas id="${id}-canvas"></canvas>
</div>
<script>
(function() {
  const canvas = document.getElementById('${id}-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = ${config.width} * dpr;
  canvas.height = ${config.height} * dpr;
  canvas.style.width = '${config.width}px';
  canvas.style.height = '${config.height}px';
  ctx.scale(dpr, dpr);

  window.updateSpectrogram_${id.replace(/-/g, '_')} = function(spectrogramData) {
    const width = ${config.width};
    const height = ${config.height};

    // Shift existing pixel buffer left by 1px
    const imageData = ctx.getImageData(1, 0, width - 1, height);
    ctx.putImageData(imageData, 0, 0);

    // Draw new line at rightmost column
    const x = width - 1;
    for (let y = 0; y < spectrogramData.length; y++) {
      const magnitude = spectrogramData[y];
      const hue = (1 - magnitude) * 240;
      ctx.fillStyle = \`hsl(\${hue}, 100%, \${40 + magnitude * 20}%)\`;
      const pixelY = height - (y / spectrogramData.length) * height;
      ctx.fillRect(x, pixelY, 1, height / spectrogramData.length);
    }
  };

  if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener('spectrogramData_${id}', (e) => {
      window.updateSpectrogram_${id.replace(/-/g, '_')}(e.data);
    });
  }
})();
</script>`
}

/**
 * Generate Goniometer HTML with JavaScript draw function
 */
function generateGoniometerHTML(config: GoniometerElementConfig): string {
  const id = toKebabCase(config.name)
  const positionStyle = `position: absolute; left: ${config.x}px; top: ${config.y}px; width: ${config.width}px; height: ${config.height}px; transform: rotate(${config.rotation}deg);`

  return `<div id="${id}" class="element viz-container" data-viz-type="goniometer" style="${positionStyle}">
  <canvas id="${id}-canvas"></canvas>
</div>
<script>
(function() {
  const canvas = document.getElementById('${id}-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = ${config.width} * dpr;
  canvas.height = ${config.height} * dpr;
  canvas.style.width = '${config.width}px';
  canvas.style.height = '${config.height}px';
  ctx.scale(dpr, dpr);

  window.updateGoniometer_${id.replace(/-/g, '_')} = function(stereoData) {
    const width = ${config.width};
    const height = ${config.height};
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Clear
    ctx.fillStyle = '${config.backgroundColor}';
    ctx.fillRect(0, 0, width, height);

    ${config.showGrid ? `
    // Grid circles
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    for (let r = 0.25; r <= 1.0; r += 0.25) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    ` : ''}

    ${config.showAxisLines ? `
    // L/R and M/S axes
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    // L/R diagonal axes
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.707, cy + radius * 0.707);
    ctx.lineTo(cx + radius * 0.707, cy - radius * 0.707);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.707, cy - radius * 0.707);
    ctx.lineTo(cx + radius * 0.707, cy + radius * 0.707);
    ctx.stroke();
    // M/S axes
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ` : ''}

    // Draw stereo trace
    ctx.strokeStyle = '${config.traceColor}';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let i = 0; i < stereoData.length; i += 2) {
      const l = stereoData[i];
      const r = stereoData[i + 1];
      const x = cx + (l - r) * radius * 0.707;
      const y = cy - (l + r) * radius * 0.707;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  };

  if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener('stereoData_${id}', (e) => {
      window.updateGoniometer_${id.replace(/-/g, '_')}(e.data);
    });
  }
})();
</script>`
}

/**
 * Generate Vectorscope HTML with JavaScript draw function
 */
function generateVectorscopeHTML(config: VectorscopeElementConfig): string {
  const id = toKebabCase(config.name)
  const positionStyle = `position: absolute; left: ${config.x}px; top: ${config.y}px; width: ${config.width}px; height: ${config.height}px; transform: rotate(${config.rotation}deg);`

  return `<div id="${id}" class="element viz-container" data-viz-type="vectorscope" style="${positionStyle}">
  <canvas id="${id}-canvas"></canvas>
</div>
<script>
(function() {
  const canvas = document.getElementById('${id}-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = ${config.width} * dpr;
  canvas.height = ${config.height} * dpr;
  canvas.style.width = '${config.width}px';
  canvas.style.height = '${config.height}px';
  ctx.scale(dpr, dpr);

  window.updateVectorscope_${id.replace(/-/g, '_')} = function(stereoData) {
    const width = ${config.width};
    const height = ${config.height};
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Clear
    ctx.fillStyle = '${config.backgroundColor}';
    ctx.fillRect(0, 0, width, height);

    ${config.showGrid ? `
    // Grid circles
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    for (let r = 0.25; r <= 1.0; r += 0.25) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    ` : ''}

    ${config.showAxisLines ? `
    // L/R axes
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ` : ''}

    // Draw Lissajous trace
    ctx.strokeStyle = '${config.traceColor}';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let i = 0; i < stereoData.length; i += 2) {
      const l = stereoData[i];
      const r = stereoData[i + 1];
      const x = cx + l * radius;
      const y = cy - r * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  };

  if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener('stereoData_${id}', (e) => {
      window.updateVectorscope_${id.replace(/-/g, '_')}(e.data);
    });
  }
})();
</script>`
}

// ============================================================================
// Curve Element HTML Generation Functions
// ============================================================================

/**
 * Generate EQ Curve HTML with JavaScript draw function
 */
function generateEQCurveHTML(config: EQCurveElementConfig): string {
  const id = toKebabCase(config.name)
  const positionStyle = `position: absolute; left: ${config.x}px; top: ${config.y}px; width: ${config.width}px; height: ${config.height}px; transform: rotate(${config.rotation}deg);`

  return `<div id="${id}" class="element curve-container" data-curve-type="eqcurve" style="${positionStyle}">
  <canvas id="${id}-canvas"></canvas>
</div>
<script>
(function() {
  const canvas = document.getElementById('${id}-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = ${config.width} * dpr;
  canvas.height = ${config.height} * dpr;
  canvas.style.width = '${config.width}px';
  canvas.style.height = '${config.height}px';
  ctx.scale(dpr, dpr);

  // Audio math utilities
  function frequencyToX(freq, width, minFreq, maxFreq) {
    const minLog = Math.log10(minFreq);
    const maxLog = Math.log10(maxFreq);
    return ((Math.log10(freq) - minLog) / (maxLog - minLog)) * width;
  }

  function dbToY(db, height, minDb, maxDb) {
    return height - ((db - minDb) / (maxDb - minDb)) * height;
  }

  function calculateBiquadResponse(freq, centerFreq, gain, Q) {
    // Simplified biquad calculation for visualization
    const freqRatio = Math.log10(freq / centerFreq);
    const bellShape = Math.exp(-Math.pow(freqRatio * Q * 3, 2));
    return gain * bellShape;
  }

  window.updateEQCurve_${id.replace(/-/g, '_')} = function(bands) {
    const width = ${config.width};
    const height = ${config.height};

    // Clear
    ctx.fillStyle = '${config.backgroundColor}';
    ctx.fillRect(0, 0, width, height);

    ${config.showGrid ? `
    // Grid lines
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    const freqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    freqs.forEach(freq => {
      const x = frequencyToX(freq, width, ${config.minFreq}, ${config.maxFreq});
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });
    ctx.globalAlpha = 1.0;
    ` : ''}

    // Calculate composite response
    const points = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i / 200) * width;
      const freq = Math.pow(10, Math.log10(${config.minFreq}) + (x / width) * (Math.log10(${config.maxFreq}) - Math.log10(${config.minFreq})));
      let totalDb = 0;
      bands.forEach(band => {
        totalDb += calculateBiquadResponse(freq, band.frequency, band.gain, band.Q);
      });
      const y = dbToY(totalDb, height, ${config.minDb}, ${config.maxDb});
      points.push({x, y});
    }

    // Draw curve
    ctx.strokeStyle = '${config.curveColor}';
    ctx.lineWidth = ${config.lineWidth};
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    ${config.showFill ? `
    // Fill under curve
    ctx.fillStyle = '${config.fillColor}';
    ctx.globalAlpha = ${config.fillOpacity};
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ` : ''}

    // Draw handles
    bands.forEach((band, i) => {
      const hx = frequencyToX(band.frequency, width, ${config.minFreq}, ${config.maxFreq});
      const hy = dbToY(band.gain, height, ${config.minDb}, ${config.maxDb});
      ctx.fillStyle = '${config.handleColor}';
      ctx.fillRect(hx - 4, hy - 4, 8, 8);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(hx - 4, hy - 4, 8, 8);
    });
  };

  if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener('eqData_${id}', (e) => {
      window.updateEQCurve_${id.replace(/-/g, '_')}(e.data);
    });
  }

  // Initial draw
  window.updateEQCurve_${id.replace(/-/g, '_')}(${JSON.stringify(config.bands)});
})();
</script>`
}

/**
 * Generate Compressor Curve HTML with JavaScript draw function
 */
function generateCompressorCurveHTML(config: CompressorCurveElementConfig): string {
  const id = toKebabCase(config.name)
  const positionStyle = `position: absolute; left: ${config.x}px; top: ${config.y}px; width: ${config.width}px; height: ${config.height}px; transform: rotate(${config.rotation}deg);`

  return `<div id="${id}" class="element curve-container" data-curve-type="compressorcurve" style="${positionStyle}">
  <canvas id="${id}-canvas"></canvas>
</div>
<script>
(function() {
  const canvas = document.getElementById('${id}-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = ${config.width} * dpr;
  canvas.height = ${config.height} * dpr;
  canvas.style.width = '${config.width}px';
  canvas.style.height = '${config.height}px';
  ctx.scale(dpr, dpr);

  function dbToX(db, width, minDb, maxDb) {
    return ((db - minDb) / (maxDb - minDb)) * width;
  }

  function dbToY(db, height, minDb, maxDb) {
    return height - ((db - minDb) / (maxDb - minDb)) * height;
  }

  function applyCompression(inputDb, threshold, ratio, knee) {
    const halfKnee = knee / 2;
    if (inputDb < threshold - halfKnee) {
      return inputDb;
    } else if (inputDb > threshold + halfKnee) {
      return threshold + (inputDb - threshold) / ratio;
    } else {
      // Soft knee (quadratic interpolation)
      const x = inputDb - threshold + halfKnee;
      const w = 2 * halfKnee;
      const y = x * x / (2 * w);
      return inputDb + (1 / ratio - 1) * y;
    }
  }

  window.updateCompressorCurve_${id.replace(/-/g, '_')} = function(params) {
    const width = ${config.width};
    const height = ${config.height};
    const threshold = params.threshold || ${config.threshold};
    const ratio = params.ratio || ${config.ratio};
    const knee = params.knee || ${config.knee};

    // Clear
    ctx.fillStyle = '${config.backgroundColor}';
    ctx.fillRect(0, 0, width, height);

    ${config.showGrid ? `
    // Grid lines
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    for (let db = ${config.minDb}; db <= ${config.maxDb}; db += 12) {
      const x = dbToX(db, width, ${config.minDb}, ${config.maxDb});
      const y = dbToY(db, height, ${config.minDb}, ${config.maxDb});
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    ` : ''}

    // 1:1 reference line
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, 0);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Compression curve
    ctx.strokeStyle = '${config.curveColor}';
    ctx.lineWidth = ${config.lineWidth};
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const inputDb = ${config.minDb} + (i / 200) * (${config.maxDb} - ${config.minDb});
      const outputDb = applyCompression(inputDb, threshold, ratio, knee);
      const x = dbToX(inputDb, width, ${config.minDb}, ${config.maxDb});
      const y = dbToY(outputDb, height, ${config.minDb}, ${config.maxDb});
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ${config.showFill ? `
    // Fill under curve
    ctx.fillStyle = '${config.fillColor}';
    ctx.globalAlpha = 0.3;
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ` : ''}

    // Threshold handle
    const tx = dbToX(threshold, width, ${config.minDb}, ${config.maxDb});
    const ty = dbToY(threshold, height, ${config.minDb}, ${config.maxDb});
    ctx.fillStyle = '${config.handleColor}';
    ctx.fillRect(tx - 4, ty - 4, 8, 8);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx - 4, ty - 4, 8, 8);
  };

  if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener('compressorData_${id}', (e) => {
      window.updateCompressorCurve_${id.replace(/-/g, '_')}(e.data);
    });
  }

  // Initial draw
  window.updateCompressorCurve_${id.replace(/-/g, '_')}({threshold: ${config.threshold}, ratio: ${config.ratio}, knee: ${config.knee}});
})();
</script>`
}

/**
 * Generate Envelope Display HTML with JavaScript draw function
 */
function generateEnvelopeDisplayHTML(config: EnvelopeDisplayElementConfig): string {
  const id = toKebabCase(config.name)
  const positionStyle = `position: absolute; left: ${config.x}px; top: ${config.y}px; width: ${config.width}px; height: ${config.height}px; transform: rotate(${config.rotation}deg);`

  return `<div id="${id}" class="element curve-container" data-curve-type="envelopedisplay" style="${positionStyle}">
  <canvas id="${id}-canvas"></canvas>
</div>
<script>
(function() {
  const canvas = document.getElementById('${id}-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = ${config.width} * dpr;
  canvas.height = ${config.height} * dpr;
  canvas.style.width = '${config.width}px';
  canvas.style.height = '${config.height}px';
  ctx.scale(dpr, dpr);

  function calculateEnvelopeCurve(attack, decay, sustain, release, curveType) {
    const points = [];
    const attackTime = attack;
    const decayTime = decay;
    const sustainTime = 0.3; // Fixed for visual display
    const releaseTime = release;
    const totalTime = attackTime + decayTime + sustainTime + releaseTime;

    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * totalTime;
      let level = 0;

      if (t < attackTime) {
        // Attack phase
        const attackProgress = t / attackTime;
        level = curveType === 'exponential' ? Math.pow(attackProgress, 0.3) : attackProgress;
      } else if (t < attackTime + decayTime) {
        // Decay phase
        const decayProgress = (t - attackTime) / decayTime;
        if (curveType === 'exponential') {
          level = sustain + (1 - sustain) * Math.exp(-5 * decayProgress);
        } else {
          level = 1 - (1 - sustain) * decayProgress;
        }
      } else if (t < attackTime + decayTime + sustainTime) {
        // Sustain phase
        level = sustain;
      } else {
        // Release phase
        const releaseProgress = (t - attackTime - decayTime - sustainTime) / releaseTime;
        if (curveType === 'exponential') {
          level = sustain * Math.exp(-5 * releaseProgress);
        } else {
          level = sustain * (1 - releaseProgress);
        }
      }

      points.push({t, level});
    }

    return points;
  }

  window.updateEnvelopeDisplay_${id.replace(/-/g, '_')} = function(params) {
    const width = ${config.width};
    const height = ${config.height};
    const attack = params.attack || ${config.attack};
    const decay = params.decay || ${config.decay};
    const sustain = params.sustain || ${config.sustain};
    const release = params.release || ${config.release};
    const curveType = params.curveType || '${config.curveType}';

    // Clear
    ctx.fillStyle = '${config.backgroundColor}';
    ctx.fillRect(0, 0, width, height);

    ${config.showGrid ? `
    // Grid
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ` : ''}

    const points = calculateEnvelopeCurve(attack, decay, sustain, release, curveType);
    const totalTime = attack + decay + 0.3 + release;

    // Draw envelope curve
    ctx.strokeStyle = '${config.curveColor}';
    ctx.lineWidth = ${config.lineWidth};
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (p.t / totalTime) * width;
      const y = height - p.level * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ${config.showFill ? `
    // Fill under curve
    ctx.fillStyle = '${config.fillColor}';
    ctx.globalAlpha = 0.3;
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ` : ''}

    ${config.showStageMarkers ? `
    // Stage markers
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.setLineDash([4, 4]);
    const attackX = (attack / totalTime) * width;
    const decayX = ((attack + decay) / totalTime) * width;
    const releaseX = ((attack + decay + 0.3) / totalTime) * width;
    [attackX, decayX, releaseX].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;
    ` : ''}
  };

  if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener('envelopeData_${id}', (e) => {
      window.updateEnvelopeDisplay_${id.replace(/-/g, '_')}(e.data);
    });
  }

  // Initial draw
  window.updateEnvelopeDisplay_${id.replace(/-/g, '_')}({attack: ${config.attack}, decay: ${config.decay}, sustain: ${config.sustain}, release: ${config.release}, curveType: '${config.curveType}'});
})();
</script>`
}

/**
 * Generate LFO Display HTML with JavaScript draw function
 */
function generateLFODisplayHTML(config: LFODisplayElementConfig): string {
  const id = toKebabCase(config.name)
  const positionStyle = `position: absolute; left: ${config.x}px; top: ${config.y}px; width: ${config.width}px; height: ${config.height}px; transform: rotate(${config.rotation}deg);`

  return `<div id="${id}" class="element curve-container" data-curve-type="lfodisplay" style="${positionStyle}">
  <canvas id="${id}-canvas"></canvas>
</div>
<script>
(function() {
  const canvas = document.getElementById('${id}-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = ${config.width} * dpr;
  canvas.height = ${config.height} * dpr;
  canvas.style.width = '${config.width}px';
  canvas.style.height = '${config.height}px';
  ctx.scale(dpr, dpr);

  function generateLFOWaveform(shape, pulseWidth, sampleCount) {
    const points = [];
    for (let i = 0; i < sampleCount; i++) {
      const phase = i / sampleCount;
      let value = 0;

      switch (shape) {
        case 'sine':
          value = Math.sin(phase * Math.PI * 2);
          break;
        case 'triangle':
          value = phase < 0.5 ? (4 * phase - 1) : (3 - 4 * phase);
          break;
        case 'saw-up':
          value = 2 * phase - 1;
          break;
        case 'saw-down':
          value = 1 - 2 * phase;
          break;
        case 'square':
          value = phase < 0.5 ? 1 : -1;
          break;
        case 'pulse':
          value = phase < pulseWidth ? 1 : -1;
          break;
        case 'sample-hold':
          value = Math.sin(Math.floor(phase * 8) * 0.7854) * 0.8;
          break;
        case 'smooth-random':
          const t = phase * 4;
          const t0 = Math.floor(t);
          const t1 = t0 + 1;
          const frac = t - t0;
          const v0 = Math.sin(t0 * 2.3456) * 0.7;
          const v1 = Math.sin(t1 * 2.3456) * 0.7;
          value = v0 + (v1 - v0) * (3 - 2 * frac) * frac * frac;
          break;
      }

      points.push(value);
    }
    return points;
  }

  window.updateLFODisplay_${id.replace(/-/g, '_')} = function(params) {
    const width = ${config.width};
    const height = ${config.height};
    const shape = params.shape || '${config.shape}';
    const pulseWidth = params.pulseWidth || ${config.pulseWidth};

    // Clear
    ctx.fillStyle = '${config.backgroundColor}';
    ctx.fillRect(0, 0, width, height);

    ${config.showGrid ? `
    // Grid
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ` : ''}

    const waveform = generateLFOWaveform(shape, pulseWidth, 200);

    // Draw waveform
    ctx.strokeStyle = '${config.waveformColor}';
    ctx.lineWidth = ${config.lineWidth};
    ctx.beginPath();
    waveform.forEach((value, i) => {
      const x = (i / waveform.length) * width;
      const y = height / 2 - (value * height * 0.4);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ${config.showFill ? `
    // Fill
    ctx.fillStyle = '${config.fillColor}';
    ctx.globalAlpha = 0.3;
    ctx.lineTo(width, height / 2);
    ctx.lineTo(0, height / 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ` : ''}
  };

  if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener('lfoData_${id}', (e) => {
      window.updateLFODisplay_${id.replace(/-/g, '_')}(e.data);
    });
  }

  // Initial draw
  window.updateLFODisplay_${id.replace(/-/g, '_')}({shape: '${config.shape}', pulseWidth: ${config.pulseWidth}});
})();
</script>`
}

/**
 * Generate Filter Response HTML with JavaScript draw function
 */
function generateFilterResponseHTML(config: FilterResponseElementConfig): string {
  const id = toKebabCase(config.name)
  const positionStyle = `position: absolute; left: ${config.x}px; top: ${config.y}px; width: ${config.width}px; height: ${config.height}px; transform: rotate(${config.rotation}deg);`

  return `<div id="${id}" class="element curve-container" data-curve-type="filterresponse" style="${positionStyle}">
  <canvas id="${id}-canvas"></canvas>
</div>
<script>
(function() {
  const canvas = document.getElementById('${id}-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = ${config.width} * dpr;
  canvas.height = ${config.height} * dpr;
  canvas.style.width = '${config.width}px';
  canvas.style.height = '${config.height}px';
  ctx.scale(dpr, dpr);

  function frequencyToX(freq, width, minFreq, maxFreq) {
    const minLog = Math.log10(minFreq);
    const maxLog = Math.log10(maxFreq);
    return ((Math.log10(freq) - minLog) / (maxLog - minLog)) * width;
  }

  function dbToY(db, height, minDb, maxDb) {
    return height - ((db - minDb) / (maxDb - minDb)) * height;
  }

  function calculateFilterResponse(freq, filterType, cutoff, resonance, gain) {
    const ratio = freq / cutoff;
    let db = 0;

    switch (filterType) {
      case 'lowpass':
        db = ratio > 1 ? -12 * Math.log2(ratio) : 0;
        db += (resonance - 1) * 6 * Math.exp(-Math.pow(Math.log2(ratio), 2));
        break;
      case 'highpass':
        db = ratio < 1 ? 12 * Math.log2(ratio) : 0;
        db += (resonance - 1) * 6 * Math.exp(-Math.pow(Math.log2(ratio), 2));
        break;
      case 'bandpass':
        db = -6 * Math.abs(Math.log2(ratio));
        db += resonance * 6 * Math.exp(-Math.pow(Math.log2(ratio), 2) * resonance);
        break;
      case 'notch':
        db = -resonance * 24 * Math.exp(-Math.pow(Math.log2(ratio), 2) * resonance * 2);
        break;
      case 'lowshelf':
        db = ratio < 1 ? gain : gain / (1 + Math.pow(ratio - 1, 2));
        break;
      case 'highshelf':
        db = ratio > 1 ? gain : gain / (1 + Math.pow(1 / ratio - 1, 2));
        break;
      case 'peak':
        db = gain * Math.exp(-Math.pow(Math.log2(ratio) * resonance, 2));
        break;
    }

    return db;
  }

  window.updateFilterResponse_${id.replace(/-/g, '_')} = function(params) {
    const width = ${config.width};
    const height = ${config.height};
    const filterType = params.filterType || '${config.filterType}';
    const cutoff = params.cutoffFrequency || ${config.cutoffFrequency};
    const resonance = params.resonance || ${config.resonance};
    const gain = params.gain || ${config.gain};

    // Clear
    ctx.fillStyle = '${config.backgroundColor}';
    ctx.fillRect(0, 0, width, height);

    ${config.showGrid ? `
    // Grid lines
    ctx.strokeStyle = '${config.gridColor}';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    const freqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    freqs.forEach(freq => {
      const x = frequencyToX(freq, width, ${config.minFreq}, ${config.maxFreq});
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });
    ctx.globalAlpha = 1.0;
    ` : ''}

    // Calculate filter response
    const points = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i / 200) * width;
      const freq = Math.pow(10, Math.log10(${config.minFreq}) + (x / width) * (Math.log10(${config.maxFreq}) - Math.log10(${config.minFreq})));
      const db = calculateFilterResponse(freq, filterType, cutoff, resonance, gain);
      const y = dbToY(db, height, ${config.minDb}, ${config.maxDb});
      points.push({x, y});
    }

    // Draw curve
    ctx.strokeStyle = '${config.curveColor}';
    ctx.lineWidth = ${config.lineWidth};
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    ${config.showFill ? `
    // Fill under curve
    ctx.fillStyle = '${config.fillColor}';
    ctx.globalAlpha = 0.3;
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ` : ''}

    // Cutoff frequency handle
    const cutoffX = frequencyToX(cutoff, width, ${config.minFreq}, ${config.maxFreq});
    const cutoffDb = calculateFilterResponse(cutoff, filterType, cutoff, resonance, gain);
    const cutoffY = dbToY(cutoffDb, height, ${config.minDb}, ${config.maxDb});
    ctx.fillStyle = '${config.handleColor}';
    ctx.fillRect(cutoffX - 4, cutoffY - 4, 8, 8);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(cutoffX - 4, cutoffY - 4, 8, 8);
  };

  if (window.__JUCE__) {
    window.__JUCE__.backend.addEventListener('filterData_${id}', (e) => {
      window.updateFilterResponse_${id.replace(/-/g, '_')}(e.data);
    });
  }

  // Initial draw
  window.updateFilterResponse_${id.replace(/-/g, '_')}({filterType: '${config.filterType}', cutoffFrequency: ${config.cutoffFrequency}, resonance: ${config.resonance}, gain: ${config.gain}});
})();
</script>`
}

// ============================================================================
// Container Element HTML Generation Functions
// ============================================================================

/**
 * Generate Tooltip HTML
 */
function generateTooltipHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  config: TooltipElementConfig
): string {
  return `<div id="${id}" class="${baseClass} tooltip-element" data-type="tooltip" data-position="${config.position}" data-hover-delay="${config.hoverDelay}" data-content="${escapeHTML(config.content)}" style="${positionStyle}"></div>`
}

/**
 * Generate Horizontal Spacer HTML
 */
function generateHorizontalSpacerHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  config: HorizontalSpacerElementConfig
): string {
  return `<div id="${id}" class="${baseClass} spacer-element horizontal-spacer" data-type="horizontalspacer" data-sizing-mode="${config.sizingMode}" ${config.sizingMode === 'fixed' ? `data-fixed-width="${config.fixedWidth}"` : `data-flex-grow="${config.flexGrow}" data-min-width="${config.minWidth}" data-max-width="${config.maxWidth}"`} style="${positionStyle}"></div>`
}

/**
 * Generate Vertical Spacer HTML
 */
function generateVerticalSpacerHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  config: VerticalSpacerElementConfig
): string {
  return `<div id="${id}" class="${baseClass} spacer-element vertical-spacer" data-type="verticalspacer" data-sizing-mode="${config.sizingMode}" ${config.sizingMode === 'fixed' ? `data-fixed-height="${config.fixedHeight}"` : `data-flex-grow="${config.flexGrow}" data-min-height="${config.minHeight}" data-max-height="${config.maxHeight}"`} style="${positionStyle}"></div>`
}

/**
 * Generate Window Chrome HTML
 */
function generateWindowChromeHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  config: WindowChromeElementConfig
): string {
  // Generate buttons based on style
  let buttonsHTML = ''

  if (config.buttonStyle === 'macos') {
    // macOS traffic light buttons
    const buttons = []
    if (config.showCloseButton) buttons.push('<div class="chrome-button close" data-action="close" style="background-color: #ff5f57;"></div>')
    if (config.showMinimizeButton) buttons.push('<div class="chrome-button minimize" data-action="minimize" style="background-color: #ffbd2e;"></div>')
    if (config.showMaximizeButton) buttons.push('<div class="chrome-button maximize" data-action="maximize" style="background-color: #28ca42;"></div>')
    buttonsHTML = `<div class="chrome-buttons macos" data-drag-region="no-drag">${buttons.join('')}</div>`
  } else if (config.buttonStyle === 'windows') {
    // Windows icon buttons
    const buttons = []
    if (config.showMinimizeButton) buttons.push('<div class="chrome-button minimize" data-action="minimize">−</div>')
    if (config.showMaximizeButton) buttons.push('<div class="chrome-button maximize" data-action="maximize">□</div>')
    if (config.showCloseButton) buttons.push('<div class="chrome-button close" data-action="close">×</div>')
    buttonsHTML = `<div class="chrome-buttons windows" data-drag-region="no-drag">${buttons.join('')}</div>`
  } else {
    // Neutral circular buttons
    const buttons = []
    if (config.showCloseButton) buttons.push('<div class="chrome-button close" data-action="close"></div>')
    if (config.showMinimizeButton) buttons.push('<div class="chrome-button minimize" data-action="minimize"></div>')
    if (config.showMaximizeButton) buttons.push('<div class="chrome-button maximize" data-action="maximize"></div>')
    buttonsHTML = `<div class="chrome-buttons neutral" data-drag-region="no-drag">${buttons.join('')}</div>`
  }

  const titleHTML = config.showTitle ? `<div class="chrome-title" data-drag-region="drag">${escapeHTML(config.titleText)}</div>` : ''

  return `<div id="${id}" class="${baseClass} windowchrome-element" data-type="windowchrome" data-button-style="${config.buttonStyle}" data-drag-region="drag" style="${positionStyle}">
  ${buttonsHTML}
  ${titleHTML}
</div>`
}
