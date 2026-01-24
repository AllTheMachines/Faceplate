/**
 * Parse JUCE WebView2 templates back into element configurations
 * Supports HTML exported by this tool (round-trip) and similar structured HTML
 */

import {
  ElementConfig,
  createKnob,
  createSlider,
  createButton,
  createLabel,
  createMeter,
  createImage,
} from '../../types/elements'

interface ParseOptions {
  html: string
  css?: string
  js?: string
}

interface ParseResult {
  elements: ElementConfig[]
  canvasWidth: number
  canvasHeight: number
  errors: string[]
}

/**
 * Extract style value from CSS text for a selector
 */
function extractStyle(css: string, selector: string): Record<string, string> {
  const styles: Record<string, string> = {}

  // Find the rule block for this selector
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'i')
  const match = css.match(regex)

  if (match && match[1]) {
    const rules = match[1].split(';')
    rules.forEach((rule) => {
      const [prop, value] = rule.split(':').map((s) => s.trim())
      if (prop && value) {
        // Convert kebab-case to camelCase
        const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
        styles[camelProp] = value
      }
    })
  }

  return styles
}

/**
 * Parse numeric value from CSS (removes 'px', '%', etc.)
 */
function parseNumeric(value: string | undefined, fallback: number = 0): number {
  if (!value) return fallback
  const num = parseFloat(value)
  return isNaN(num) ? fallback : num
}

/**
 * Parse JUCE template HTML into element configurations
 */
export function parseJUCETemplate(options: ParseOptions): ParseResult {
  const { html, css = '' } = options
  const elements: ElementConfig[] = []
  const errors: string[] = []

  // Parse HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Find plugin container
  const container = doc.getElementById('plugin-container') || doc.body

  // Get canvas dimensions from container
  const containerStyle = extractStyle(css, '#plugin-container')
  const canvasWidth = parseNumeric(containerStyle.width, 800)
  const canvasHeight = parseNumeric(containerStyle.height, 600)

  // Find all elements with data-element-type or class-based detection
  const elementNodes = container.querySelectorAll('[data-element-type], .knob, .slider, .button, .label, .meter, .image')

  elementNodes.forEach((node, index) => {
    const el = node as HTMLElement

    // Determine element type
    const dataType = el.getAttribute('data-element-type')
    const classList = Array.from(el.classList)

    let type: ElementConfig['type'] | null = null
    if (dataType) {
      type = dataType as ElementConfig['type']
    } else if (classList.includes('knob')) {
      type = 'knob'
    } else if (classList.includes('slider')) {
      type = 'slider'
    } else if (classList.includes('button')) {
      type = 'button'
    } else if (classList.includes('label')) {
      type = 'label'
    } else if (classList.includes('meter')) {
      type = 'meter'
    } else if (classList.includes('image')) {
      type = 'image'
    }

    if (!type) {
      errors.push(`Could not determine type for element ${el.id || index}`)
      return
    }

    // Extract position from CSS or inline styles
    const selector = el.id ? `#${el.id}` : `.${classList[0]}`
    const cssStyle = extractStyle(css, selector)
    const inlineStyle = el.style

    const x = parseNumeric(inlineStyle.left || cssStyle.left, 0)
    const y = parseNumeric(inlineStyle.top || cssStyle.top, 0)
    const width = parseNumeric(inlineStyle.width || cssStyle.width, 60)
    const height = parseNumeric(inlineStyle.height || cssStyle.height, 60)

    // Get name from id or generate one
    const name = el.id || el.getAttribute('data-name') || `${type}-${index + 1}`

    // Get parameter ID if present
    const parameterId = el.getAttribute('data-parameter-id') || undefined

    // Create element based on type
    try {
      let element: ElementConfig

      switch (type) {
        case 'knob':
          element = createKnob({
            name,
            x,
            y,
            width,
            height,
            diameter: Math.min(width, height),
            parameterId,
          })
          break

        case 'slider':
          element = createSlider({
            name,
            x,
            y,
            width,
            height,
            orientation: height > width ? 'vertical' : 'horizontal',
            parameterId,
          })
          break

        case 'button':
          element = createButton({
            name,
            x,
            y,
            width,
            height,
            label: el.textContent?.trim() || 'Button',
            parameterId,
          })
          break

        case 'label':
          element = createLabel({
            name,
            x,
            y,
            width,
            height,
            text: el.textContent?.trim() || 'Label',
            fontSize: parseNumeric(cssStyle.fontSize, 14),
          })
          break

        case 'meter':
          element = createMeter({
            name,
            x,
            y,
            width,
            height,
            orientation: height > width ? 'vertical' : 'horizontal',
            parameterId,
          })
          break

        case 'image':
          const img = el.querySelector('img') as HTMLImageElement | null
          element = createImage({
            name,
            x,
            y,
            width,
            height,
            src: img?.src || '',
          })
          break

        default:
          errors.push(`Unknown element type: ${type}`)
          return
      }

      elements.push(element)
    } catch (err) {
      errors.push(`Failed to create ${type}: ${err}`)
    }
  })

  return {
    elements,
    canvasWidth,
    canvasHeight,
    errors,
  }
}
