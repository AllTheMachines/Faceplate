/**
 * Code generator orchestrator for VST3 WebView UI export
 * Coordinates all generators and produces ZIP bundles
 */

import JSZip from 'jszip'
import { fileSave } from 'browser-fs-access'
import type { ElementConfig, KnobElementConfig } from '../../types/elements'
import { validateForExport } from './validators'
import { generateHTML } from './htmlGenerator'
import { generateCSS } from './cssGenerator'
import { generateBindingsJS, generateComponentsJS, generateMockJUCE, generateResponsiveScaleJS, generateCustomScrollbarJS } from './jsGenerator'
import { generateReadme, generateREADME } from './documentationGenerator'
import { optimizeSVG } from './svgOptimizer'
import { useStore } from '../../store'

// ============================================================================
// Types
// ============================================================================

export interface ExportOptions {
  elements: ElementConfig[]
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  projectName?: string // Used for ZIP filename
  optimizeSVG?: boolean // Optimize SVG assets (default true)
  enableResponsiveScaling?: boolean // Include responsive scaling script (default true)
}

interface ImageAsset {
  path: string    // Path in ZIP (e.g., "assets/image.png")
  srcUrl: string  // URL to fetch from (e.g., "/assets/image.png")
}

// ============================================================================
// Image Asset Collection
// ============================================================================

/**
 * Collect image assets that need to be bundled
 * Only collects images with relative paths (starting with /assets/)
 * Base64 embedded and external URLs don't need bundling
 */
function collectImageAssets(elements: ElementConfig[]): ImageAsset[] {
  const assets: ImageAsset[] = []
  const seen = new Set<string>()

  for (const element of elements) {
    if (element.type === 'image' && element.src) {
      const src = element.src.trim()
      // Only bundle relative paths from /assets/
      if (src.startsWith('/assets/')) {
        if (!seen.has(src)) {
          seen.add(src)
          assets.push({
            path: src.slice(1), // Remove leading slash: "/assets/img.png" -> "assets/img.png"
            srcUrl: src,
          })
        }
      }
    }
  }

  return assets
}

/**
 * Fetch image assets and add them to ZIP
 */
async function bundleImageAssets(zip: JSZip, assets: ImageAsset[]): Promise<void> {
  console.log('[Export] Bundling images:', assets.map(a => a.path))

  for (const asset of assets) {
    try {
      console.log(`[Export] Fetching: ${asset.srcUrl}`)
      const response = await fetch(asset.srcUrl)
      if (response.ok) {
        const blob = await response.blob()
        console.log(`[Export] Adding to ZIP: ${asset.path} (${blob.size} bytes)`)
        zip.file(asset.path, blob)
      } else {
        console.error(`[Export] Failed to fetch image: ${asset.srcUrl} (${response.status})`)
      }
    } catch (error) {
      console.error(`[Export] Failed to fetch image: ${asset.srcUrl}`, error)
    }
  }
}

// ============================================================================
// SVG Asset Collection and Optimization
// ============================================================================

interface SVGAssetInfo {
  type: 'graphic' | 'knob-style'
  id: string
  svgContent: string
}

/**
 * Collect all SVG content from library assets and knob styles
 * Returns array of SVG strings that can be optimized
 */
function collectSVGAssets(elements: ElementConfig[]): SVGAssetInfo[] {
  const svgAssets: SVGAssetInfo[] = []
  const store = useStore.getState()

  // Collect SVG Graphics (library assets used in SvgGraphic elements)
  const svgGraphicElements = elements.filter((el) => el.type === 'svggraphic')
  for (const element of svgGraphicElements) {
    const asset = store.assets.find((a) => a.id === element.assetId)
    if (asset && asset.svgContent) {
      svgAssets.push({
        type: 'graphic',
        id: asset.id,
        svgContent: asset.svgContent,
      })
    }
  }

  // Collect Knob Styles (used in styled knobs)
  const styledKnobs = elements.filter((el) => el.type === 'knob' && el.styleId) as KnobElementConfig[]
  for (const knob of styledKnobs) {
    const style = store.knobStyles.find((s) => s.id === knob.styleId!)
    if (style && style.svgContent) {
      // Only add if not already collected
      if (!svgAssets.find((a) => a.type === 'knob-style' && a.id === style.id)) {
        svgAssets.push({
          type: 'knob-style',
          id: style.id,
          svgContent: style.svgContent,
        })
      }
    }
  }

  return svgAssets
}

/**
 * Optimize SVG assets and return mapping of original to optimized content
 * Also calculates total size savings
 */
async function optimizeSVGAssets(
  svgAssets: SVGAssetInfo[],
  shouldOptimize: boolean
): Promise<{ optimizedMap: Map<string, string>; sizeSavings: SizeSavings | undefined }> {
  const optimizedMap = new Map<string, string>()

  if (!shouldOptimize || svgAssets.length === 0) {
    // No optimization - return original content
    for (const asset of svgAssets) {
      optimizedMap.set(asset.id, asset.svgContent)
    }
    return { optimizedMap, sizeSavings: undefined }
  }

  // Optimize each SVG and track sizes
  let totalOriginalSize = 0
  let totalOptimizedSize = 0

  for (const asset of svgAssets) {
    const result = await optimizeSVG(asset.svgContent)
    optimizedMap.set(asset.id, result.optimizedSvg)
    totalOriginalSize += result.originalSize
    totalOptimizedSize += result.optimizedSize
  }

  // Calculate savings percentage
  const savingsPercent = totalOriginalSize > 0
    ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100
    : 0

  const sizeSavings: SizeSavings = {
    original: totalOriginalSize,
    optimized: totalOptimizedSize,
    percent: savingsPercent,
  }

  console.log(`[Export] SVG optimization: ${totalOriginalSize} → ${totalOptimizedSize} bytes (${savingsPercent.toFixed(1)}% saved)`)

  return { optimizedMap, sizeSavings }
}

/**
 * Apply optimized SVG content to store temporarily for export generation
 * Returns a cleanup function to restore original content
 */
function applyOptimizedSVGs(optimizedMap: Map<string, string>): () => void {
  const store = useStore.getState()
  const originalAssets = new Map<string, string>()
  const originalStyles = new Map<string, string>()

  // Replace asset SVG content
  for (const asset of store.assets) {
    if (optimizedMap.has(asset.id) && asset.svgContent) {
      originalAssets.set(asset.id, asset.svgContent)
      // Directly mutate for temporary export (will be restored)
      asset.svgContent = optimizedMap.get(asset.id)!
    }
  }

  // Replace knob style SVG content
  for (const style of store.knobStyles) {
    if (optimizedMap.has(style.id) && style.svgContent) {
      originalStyles.set(style.id, style.svgContent)
      // Directly mutate for temporary export (will be restored)
      style.svgContent = optimizedMap.get(style.id)!
    }
  }

  // Return cleanup function to restore originals
  return () => {
    for (const asset of store.assets) {
      if (originalAssets.has(asset.id)) {
        asset.svgContent = originalAssets.get(asset.id)!
      }
    }
    for (const style of store.knobStyles) {
      if (originalStyles.has(style.id)) {
        style.svgContent = originalStyles.get(style.id)!
      }
    }
  }
}

export interface SizeSavings {
  original: number
  optimized: number
  percent: number
}

export type ExportResult =
  | { success: true; sizeSavings?: SizeSavings }
  | { success: false; error: string }

// ============================================================================
// JUCE Bundle Export
// ============================================================================

/**
 * Export complete JUCE WebView2 bundle
 * Generates 4-file ZIP: index.html, style.css, components.js, bindings.js
 *
 * @param options - Export configuration
 * @returns Result indicating success or error
 *
 * @example
 * const result = await exportJUCEBundle({
 *   elements,
 *   canvasWidth: 800,
 *   canvasHeight: 600,
 *   backgroundColor: '#1a1a1a',
 *   projectName: 'my-plugin'
 * })
 *
 * if (result.success) {
 *   console.log('Export successful')
 * } else {
 *   console.error('Export failed:', result.error)
 * }
 */
export async function exportJUCEBundle(options: ExportOptions): Promise<ExportResult> {
  try {
    // Validate design before generating code
    const validationResult = validateForExport(options.elements)
    if (!validationResult.valid) {
      // Format validation errors into user-friendly message
      const errorMessages = validationResult.errors
        .map((err) => `• ${err.elementName}: ${err.message}`)
        .join('\n')
      return {
        success: false,
        error: `Please fix these issues before exporting:\n\n${errorMessages}`,
      }
    }

    // Collect and optimize SVG assets (default: enabled)
    const shouldOptimizeSVG = options.optimizeSVG !== false
    const svgAssets = collectSVGAssets(options.elements)
    const { optimizedMap, sizeSavings } = await optimizeSVGAssets(svgAssets, shouldOptimizeSVG)

    // Temporarily apply optimized SVGs to store for export generation
    const restoreSVGs = applyOptimizedSVGs(optimizedMap)

    try {
      // Generate all files (with optimized SVGs if enabled)
      const htmlContent = generateHTML(options.elements, {
        canvasWidth: options.canvasWidth,
        canvasHeight: options.canvasHeight,
        backgroundColor: options.backgroundColor,
        isPreviewMode: false,
      })

      const cssContent = generateCSS(options.elements, {
        canvasWidth: options.canvasWidth,
        canvasHeight: options.canvasHeight,
        backgroundColor: options.backgroundColor,
      })

      const componentsJS = generateComponentsJS(options.elements)

      const bindingsJS = generateBindingsJS(options.elements, {
        isPreviewMode: false,
      })

      // Add responsive scaling script if enabled (default: enabled)
      const shouldIncludeResponsiveScaling = options.enableResponsiveScaling !== false
      const responsiveScaleJS = shouldIncludeResponsiveScaling
        ? generateResponsiveScaleJS(options.canvasWidth, options.canvasHeight)
        : ''

      // Add custom scrollbar JavaScript
      const customScrollbarJS = generateCustomScrollbarJS()

      const bindingsWithScaling = [
        bindingsJS,
        responsiveScaleJS,
        customScrollbarJS
      ].filter(Boolean).join('\n\n')

      // Generate README with integration instructions
      const readme = generateREADME()

      // Create ZIP bundle (4 web files + README + assets, no C++)
      const zip = new JSZip()
      zip.file('index.html', htmlContent)
      zip.file('style.css', cssContent)
      zip.file('components.js', componentsJS)
      zip.file('bindings.js', bindingsWithScaling)
      zip.file('README.md', readme)

      // Bundle image assets
      const imageAssets = collectImageAssets(options.elements)
      await bundleImageAssets(zip, imageAssets)

      // Generate ZIP blob
      const blob = await zip.generateAsync({ type: 'blob' })

      // Trigger download using browser-fs-access
      const filename = `${options.projectName || 'webview-ui'}-juce.zip`
      await fileSave(blob, {
        fileName: filename,
        extensions: ['.zip'],
      })

      return { success: true, sizeSavings }
    } finally {
      // Always restore original SVG content
      restoreSVGs()
    }
  } catch (error) {
    // User cancelled save dialog is not an error
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: true }
    }

    // Other errors are failures
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during export',
    }
  }
}

// ============================================================================
// HTML Preview Export
// ============================================================================

/**
 * Export standalone HTML preview bundle
 * Generates 4-file ZIP: index.html, style.css, components.js, bindings.js with mock JUCE
 *
 * Preview mode includes mock JUCE backend for standalone testing without JUCE runtime.
 *
 * @param options - Export configuration
 * @returns Result indicating success or error
 *
 * @example
 * const result = await exportHTMLPreview({
 *   elements,
 *   canvasWidth: 800,
 *   canvasHeight: 600,
 *   backgroundColor: '#1a1a1a',
 *   projectName: 'my-plugin'
 * })
 */
export async function exportHTMLPreview(options: ExportOptions): Promise<ExportResult> {
  try {
    // Validate design before generating code
    const validationResult = validateForExport(options.elements)
    if (!validationResult.valid) {
      // Format validation errors into user-friendly message
      const errorMessages = validationResult.errors
        .map((err) => `• ${err.elementName}: ${err.message}`)
        .join('\n')
      return {
        success: false,
        error: `Please fix these issues before exporting:\n\n${errorMessages}`,
      }
    }

    // Collect and optimize SVG assets (default: enabled)
    const shouldOptimizeSVG = options.optimizeSVG !== false
    const svgAssets = collectSVGAssets(options.elements)
    const { optimizedMap, sizeSavings } = await optimizeSVGAssets(svgAssets, shouldOptimizeSVG)

    // Temporarily apply optimized SVGs to store for export generation
    const restoreSVGs = applyOptimizedSVGs(optimizedMap)

    try {
      // Generate all files (preview mode, with optimized SVGs if enabled)
      const htmlContent = generateHTML(options.elements, {
        canvasWidth: options.canvasWidth,
        canvasHeight: options.canvasHeight,
        backgroundColor: options.backgroundColor,
        isPreviewMode: true,
      })

      const cssContent = generateCSS(options.elements, {
        canvasWidth: options.canvasWidth,
        canvasHeight: options.canvasHeight,
        backgroundColor: options.backgroundColor,
      })

      const componentsJS = generateComponentsJS(options.elements)

      // Bindings.js with mock JUCE backend prepended
      const mockJUCE = generateMockJUCE()
      const bindingsJS = generateBindingsJS(options.elements, {
        isPreviewMode: true,
      })

      // Add responsive scaling script if enabled (default: enabled)
      const shouldIncludeResponsiveScaling = options.enableResponsiveScaling !== false
      const responsiveScaleJS = shouldIncludeResponsiveScaling
        ? generateResponsiveScaleJS(options.canvasWidth, options.canvasHeight)
        : ''

      // Add custom scrollbar JavaScript
      const customScrollbarJS = generateCustomScrollbarJS()

      const bindingsWithMockAndScaling = [
        mockJUCE,
        bindingsJS,
        responsiveScaleJS,
        customScrollbarJS
      ].filter(Boolean).join('\n\n')

      // Generate README documentation
      const readme = generateReadme({
        projectName: options.projectName || 'Plugin UI',
        elements: options.elements,
        includeHtmlPreview: true,
        includeJuceBundle: false,
      })

      // Create ZIP bundle (4 web files + README + assets)
      const zip = new JSZip()
      zip.file('index.html', htmlContent)
      zip.file('style.css', cssContent)
      zip.file('components.js', componentsJS)
      zip.file('bindings.js', bindingsWithMockAndScaling)
      zip.file('README.md', readme)

      // Bundle image assets
      const imageAssets = collectImageAssets(options.elements)
      await bundleImageAssets(zip, imageAssets)

      // Generate ZIP blob
      const blob = await zip.generateAsync({ type: 'blob' })

      // Trigger download using browser-fs-access
      const filename = `${options.projectName || 'webview-ui'}-preview.zip`
      await fileSave(blob, {
        fileName: filename,
        extensions: ['.zip'],
      })

      return { success: true, sizeSavings }
    } finally {
      // Always restore original SVG content
      restoreSVGs()
    }
  } catch (error) {
    // User cancelled save dialog is not an error
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: true }
    }

    // Other errors are failures
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during export',
    }
  }
}
