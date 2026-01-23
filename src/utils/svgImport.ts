import { parse, INode } from 'svgson';

export interface SVGLayer {
  name: string;
  type: 'indicator' | 'thumb' | 'track' | 'fill' | 'glow' | 'unknown';
  element: INode;
}

export interface ParsedSVG {
  layers: SVGLayer[];
  viewBox: string | null;
  width: number;
  height: number;
  svgString: string;
}

/**
 * Detect layer type from name using naming conventions
 * Matches: indicator, pointer (knobs), thumb/handle (sliders), track/background, fill/progress, glow/highlight
 */
function detectLayerType(name: string): SVGLayer['type'] {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('indicator') || lowerName.includes('pointer')) {
    return 'indicator';
  }
  if (lowerName.includes('thumb') || lowerName.includes('handle')) {
    return 'thumb';
  }
  if (lowerName.includes('track') || lowerName.includes('background')) {
    return 'track';
  }
  if (lowerName.includes('fill') || lowerName.includes('progress')) {
    return 'fill';
  }
  if (lowerName.includes('glow') || lowerName.includes('highlight')) {
    return 'glow';
  }

  return 'unknown';
}

/**
 * Traverse SVG tree and extract named layers
 */
function extractLayers(node: INode, layers: SVGLayer[]): void {
  // Check for layer indicators (id or inkscape:label)
  const id = node.attributes?.id || '';
  const inkscapeLabel = node.attributes?.['inkscape:label'] || '';
  const layerName = inkscapeLabel || id;

  if (layerName) {
    const type = detectLayerType(layerName);
    if (type !== 'unknown') {
      layers.push({ name: layerName, type, element: node });
    }
  }

  // Recurse into children
  if (node.children) {
    for (const child of node.children) {
      extractLayers(child, layers);
    }
  }
}

/**
 * Parse SVG file string and extract layer information
 */
export async function parseSVGFile(svgString: string): Promise<ParsedSVG> {
  const parsed = await parse(svgString);

  // Extract viewBox
  const viewBox = parsed.attributes?.viewBox || null;

  // Extract dimensions (from viewBox or explicit width/height)
  let width = 100;
  let height = 100;

  if (viewBox) {
    const parts = viewBox.split(/\s+/);
    if (parts.length >= 4) {
      width = parseFloat(parts[2] ?? '100') || 100;
      height = parseFloat(parts[3] ?? '100') || 100;
    }
  } else {
    const widthAttr = parsed.attributes?.width;
    const heightAttr = parsed.attributes?.height;
    width = parseFloat(widthAttr || '100');
    height = parseFloat(heightAttr || '100');
  }

  // Extract layers
  const layers: SVGLayer[] = [];
  extractLayers(parsed, layers);

  return {
    layers,
    viewBox,
    width,
    height,
    svgString,
  };
}

/**
 * Convert SVG string to data URL for use as image src
 */
export function svgToDataUrl(svgString: string): string {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml,${encoded}`;
}
