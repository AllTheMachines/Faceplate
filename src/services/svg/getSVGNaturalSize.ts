/**
 * Extract natural dimensions from SVG content
 * @param svgContent - Raw SVG string
 * @returns { width, height } or null if extraction fails
 */
export function getSVGNaturalSize(svgContent: string): { width: number; height: number } | null {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      console.warn('SVG parsing failed')
      return { width: 100, height: 100 }
    }

    const svgEl = doc.querySelector('svg')
    if (!svgEl) {
      return { width: 100, height: 100 }
    }

    // Try viewBox first (most reliable)
    const viewBox = svgEl.getAttribute('viewBox')
    if (viewBox) {
      const parts = viewBox.trim().split(/\s+/)
      if (parts.length === 4) {
        const [, , width, height] = parts.map(Number)
        if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
          return { width, height }
        }
      }
    }

    // Fallback to width/height attributes
    const widthAttr = svgEl.getAttribute('width')
    const heightAttr = svgEl.getAttribute('height')

    if (widthAttr && heightAttr) {
      // Parse numeric value, stripping units like "px"
      const width = parseFloat(widthAttr)
      const height = parseFloat(heightAttr)

      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        return { width, height }
      }
    }

    // Final fallback
    return { width: 100, height: 100 }
  } catch (err) {
    console.error('SVG dimension extraction failed:', err)
    return { width: 100, height: 100 }
  }
}
