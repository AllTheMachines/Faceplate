/**
 * Extract layers from SVG for Design Mode
 */

import { parse, INode, stringify } from 'svgson'
import { SVGLayer, SVGLayerType } from '../../types/svg'

/**
 * Infer layer type from group ID/name using naming conventions
 */
function inferLayerType(name: string): SVGLayerType {
  const lower = name.toLowerCase()

  if (lower.includes('indicator') || lower.includes('pointer') || lower.includes('needle')) {
    return 'indicator'
  }
  if (lower.includes('track') || lower.includes('bg') || lower.includes('base')) {
    return 'track'
  }
  if (lower.includes('thumb') || lower.includes('handle') || lower.includes('grip')) {
    return 'thumb'
  }
  if (lower.includes('fill') || lower.includes('progress') || lower.includes('value')) {
    return 'fill'
  }
  if (lower.includes('glow') || lower.includes('highlight') || lower.includes('hover')) {
    return 'glow'
  }
  if (lower.includes('background') || lower.includes('backdrop')) {
    return 'background'
  }

  return 'unknown'
}

/**
 * Extract layers from SVG content
 * Looks for elements with id attributes (especially <g> groups)
 */
export async function extractSVGLayers(svgContent: string): Promise<SVGLayer[]> {
  const ast = await parse(svgContent)
  const layers: SVGLayer[] = []

  function traverse(node: INode) {
    // Check for layer indicators (id or inkscape:label)
    const id = node.attributes?.id || ''
    const inkscapeLabel = node.attributes?.['inkscape:label'] || ''
    const layerName = inkscapeLabel || id

    // If this node has an ID, it's a potential layer
    if (layerName) {
      layers.push({
        id: id || `layer-${layers.length}`,
        name: layerName,
        svgContent: stringify(node),
        suggestedType: inferLayerType(layerName),
      })
    }

    // Recurse into children
    if (node.children) {
      for (const child of node.children) {
        traverse(child)
      }
    }
  }

  traverse(ast)
  return layers
}

/**
 * Get SVG dimensions from viewBox or width/height attributes
 */
export async function getSVGDimensions(svgContent: string): Promise<{ width: number; height: number }> {
  const ast = await parse(svgContent)

  // Try viewBox first
  const viewBox = ast.attributes?.viewBox
  if (viewBox) {
    const parts = String(viewBox).split(/[\s,]+/)
    if (parts.length >= 4) {
      return {
        width: parseFloat(parts[2] || '100') || 100,
        height: parseFloat(parts[3] || '100') || 100,
      }
    }
  }

  // Fall back to width/height attributes
  return {
    width: parseFloat(String(ast.attributes?.width || '100')),
    height: parseFloat(String(ast.attributes?.height || '100')),
  }
}
