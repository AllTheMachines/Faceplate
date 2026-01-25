import DOMPurify from 'isomorphic-dompurify';

/**
 * DOMPurify configuration for SVG sanitization.
 *
 * Security-critical configuration that defines what SVG elements and attributes
 * are allowed. This config is used at all sanitization points: upload, load,
 * render, and export.
 *
 * CRITICAL NOTES from RESEARCH.md:
 * - DO NOT use USE_PROFILES with ALLOWED_TAGS (causes override conflicts)
 * - ALLOWED_URI_REGEXP blocks ALL external URLs (only fragment refs like #id allowed)
 * - style attribute included but DOMPurify sanitizes CSS automatically
 */
export const SANITIZE_CONFIG = {
  // Strict allowlist of safe SVG elements
  ALLOWED_TAGS: [
    // Core SVG structure
    'svg',
    'g',
    'defs',
    'symbol',
    'use',
    'a', // Anchor/link element (href sanitized by ALLOWED_URI_REGEXP)

    // Basic shapes
    'circle',
    'ellipse',
    'line',
    'path',
    'polygon',
    'polyline',
    'rect',

    // Text
    'text',
    'tspan',
    'textPath',

    // Gradients and patterns
    'linearGradient',
    'radialGradient',
    'stop',
    'pattern',

    // Clipping and masking
    'clipPath',
    'mask',

    // Filters (safe subset)
    'filter',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feDropShadow',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',

    // Metadata (safe, can be useful)
    'title',
    'desc',
    'metadata',

    // Image (will be sanitized by ALLOWED_URI_REGEXP)
    'image',

    // Marker
    'marker',

    // Style (content sanitized by DOMPurify)
    'style',
  ],

  // Strict allowlist of safe SVG attributes
  ALLOWED_ATTR: [
    // Core SVG attributes
    'id',
    'class',
    'xmlns',
    'xmlns:xlink',
    'version',
    'viewBox',
    'preserveAspectRatio',

    // Geometric attributes
    'x',
    'y',
    'x1',
    'y1',
    'x2',
    'y2',
    'cx',
    'cy',
    'r',
    'rx',
    'ry',
    'width',
    'height',
    'd',
    'points',

    // Presentation attributes
    'fill',
    'fill-opacity',
    'fill-rule',
    'stroke',
    'stroke-dasharray',
    'stroke-dashoffset',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'stroke-opacity',
    'stroke-width',
    'opacity',
    'visibility',
    'display',
    'overflow',

    // Transform
    'transform',
    'transform-origin',

    // Gradient attributes
    'gradientUnits',
    'gradientTransform',
    'spreadMethod',
    'offset',
    'stop-color',
    'stop-opacity',

    // Pattern attributes
    'patternUnits',
    'patternContentUnits',
    'patternTransform',

    // Clip/mask attributes
    'clip-path',
    'clip-rule',
    'mask',
    'mask-type',

    // Text attributes
    'font-family',
    'font-size',
    'font-style',
    'font-variant',
    'font-weight',
    'text-anchor',
    'text-decoration',
    'letter-spacing',
    'word-spacing',
    'dominant-baseline',
    'alignment-baseline',
    'baseline-shift',
    'dx',
    'dy',
    'rotate',
    'textLength',
    'lengthAdjust',

    // Filter attributes
    'filter',
    'flood-color',
    'flood-opacity',
    'lighting-color',
    'in',
    'in2',
    'result',
    'stdDeviation',
    'edgeMode',
    'kernelMatrix',
    'divisor',
    'bias',
    'targetX',
    'targetY',
    'operator',
    'k1',
    'k2',
    'k3',
    'k4',
    'surfaceScale',
    'specularConstant',
    'specularExponent',
    'diffuseConstant',
    'azimuth',
    'elevation',
    'limitingConeAngle',
    'pointsAtX',
    'pointsAtY',
    'pointsAtZ',
    'z',
    'mode',
    'type',
    'values',
    'tableValues',
    'slope',
    'intercept',
    'amplitude',
    'exponent',
    'scale',
    'xChannelSelector',
    'yChannelSelector',
    'numOctaves',
    'seed',
    'stitchTiles',
    'baseFrequency',
    'radius',

    // Reference attributes (sanitized by ALLOWED_URI_REGEXP)
    'href',
    'xlink:href',

    // Marker attributes
    'marker-start',
    'marker-mid',
    'marker-end',
    'markerUnits',
    'markerWidth',
    'markerHeight',
    'orient',
    'refX',
    'refY',

    // Style attribute (CSS content sanitized by DOMPurify)
    'style',
  ],

  /**
   * Block ALL external URLs - only allow fragment references (e.g., url(#id)).
   * This regex matches strings that DO NOT contain a colon, which blocks:
   * - http:// and https:// URLs
   * - javascript: URLs
   * - data: URLs
   * - Any other protocol
   *
   * Allows:
   * - #fragment (internal references)
   * - url(#fragment) (CSS-style references)
   */
  ALLOWED_URI_REGEXP: /^(?!.*:)/,

  /**
   * Keep namespace declarations and XML structure intact.
   * Required for proper SVG rendering.
   */
  KEEP_CONTENT: true, // Preserve text content in elements
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  IN_PLACE: false,

  /**
   * Force XML output for proper SVG structure
   */
  NAMESPACE: 'http://www.w3.org/2000/svg',

  /**
   * Additional security settings
   */
  FORBID_TAGS: [
    // Explicitly block dangerous elements
    'script',
    'foreignObject',
    'iframe',
    'embed',
    'object',

    // Block SMIL animation elements (can be used for timing attacks)
    'animate',
    'animateColor',
    'animateMotion',
    'animateTransform',
    'set',
  ],

  FORBID_ATTR: [
    // Block event handlers
    'onload',
    'onerror',
    'onclick',
    'onmouseover',
    'onmouseout',
    'onmousemove',
    'onmousedown',
    'onmouseup',
    'onfocus',
    'onblur',
    'onchange',
    'onsubmit',
    'onreset',
    'onselect',
    'onkeydown',
    'onkeypress',
    'onkeyup',
  ],
} as const;

/**
 * Sanitizes SVG content using DOMPurify with strict security configuration.
 *
 * This function is the core security boundary for all SVG content in the application.
 * It removes dangerous elements (script, foreignObject, animations) and blocks
 * external URL references while preserving safe SVG structure and styling.
 *
 * @param svgContent - Raw SVG content string (potentially malicious)
 * @returns Sanitized SVG content safe for rendering
 *
 * @example
 * ```typescript
 * const maliciousSVG = '<svg><script>alert("XSS")</script><circle r="10"/></svg>';
 * const safeSVG = sanitizeSVG(maliciousSVG);
 * // Result: '<svg><circle r="10"></circle></svg>' (script removed)
 * ```
 */
export function sanitizeSVG(svgContent: string): string {
  // DOMPurify.sanitize returns a string by default (when RETURN_DOM* options are false)
  const sanitized = DOMPurify.sanitize(svgContent, SANITIZE_CONFIG);

  // Ensure we always return a string
  return typeof sanitized === 'string' ? sanitized : '';
}
