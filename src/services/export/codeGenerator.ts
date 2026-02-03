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
import { DIR_KEYS, storeDirectoryHandle, getDirectoryHandle } from '../directoryStorage'

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

export interface MultiWindowExportOptions {
  projectName?: string
  optimizeSVG?: boolean
  enableResponsiveScaling?: boolean
  includeDeveloperWindows?: boolean // Export developer windows (default false)
}

export interface WindowExportData {
  id: string
  name: string
  type: 'release' | 'developer'
  width: number
  height: number
  backgroundColor: string
  elements: ElementConfig[]
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

      const cssContent = await generateCSS(options.elements, {
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

      // Trigger download using browser-fs-access, starting from last export folder
      const filename = `${options.projectName || 'webview-ui'}-juce.zip`
      const lastExportDir = await getDirectoryHandle(DIR_KEYS.EXPORT).catch(() => null)
      await fileSave(blob, {
        fileName: filename,
        extensions: ['.zip'],
        startIn: lastExportDir || 'downloads',
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

      const cssContent = await generateCSS(options.elements, {
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

      // Trigger download using browser-fs-access, starting from last export folder
      const filename = `${options.projectName || 'webview-ui'}-preview.zip`
      const lastExportDir = await getDirectoryHandle(DIR_KEYS.EXPORT).catch(() => null)
      await fileSave(blob, {
        fileName: filename,
        extensions: ['.zip'],
        startIn: lastExportDir || 'downloads',
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
// Multi-Window Export
// ============================================================================

/**
 * Convert window name to folder-safe name
 * E.g., "User Window" -> "user-window"
 */
function toFolderName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'window'
}

/**
 * Export multi-window JUCE bundle
 * Creates a ZIP with separate folders for each window
 *
 * ZIP structure:
 * my-plugin/
 *   README.md
 *   user-window/
 *     index.html, style.css, components.js, bindings.js
 *   dev-debug-panel/    (only with includeDeveloperWindows)
 *     index.html, style.css, components.js, bindings.js
 */
export async function exportMultiWindowBundle(
  windowsData: WindowExportData[],
  options: MultiWindowExportOptions
): Promise<ExportResult> {
  try {
    // Filter windows based on options
    const windowsToExport = options.includeDeveloperWindows
      ? windowsData
      : windowsData.filter(w => w.type === 'release')

    if (windowsToExport.length === 0) {
      return {
        success: false,
        error: 'No windows to export. Add at least one release window.',
      }
    }

    // Validate all windows
    for (const window of windowsToExport) {
      const validationResult = validateForExport(window.elements)
      if (!validationResult.valid && validationResult.errors.length > 0) {
        const errorMessages = validationResult.errors
          .map((err) => `• ${err.elementName}: ${err.message}`)
          .join('\n')
        return {
          success: false,
          error: `Window "${window.name}" has issues:\n\n${errorMessages}`,
        }
      }
    }

    // Collect all SVG assets across all windows
    const allElements = windowsToExport.flatMap(w => w.elements)
    const shouldOptimizeSVG = options.optimizeSVG !== false
    const svgAssets = collectSVGAssets(allElements)
    const { optimizedMap, sizeSavings } = await optimizeSVGAssets(svgAssets, shouldOptimizeSVG)

    // Temporarily apply optimized SVGs
    const restoreSVGs = applyOptimizedSVGs(optimizedMap)

    try {
      const zip = new JSZip()

      // Build window ID to folder path mapping for navigation
      const windowFolderMap: Record<string, string> = {}
      for (const w of windowsToExport) {
        const baseName = toFolderName(w.name)
        const folderName = w.type === 'developer' ? `dev-${baseName}` : baseName
        windowFolderMap[w.id] = folderName
      }

      // Process each window
      for (const window of windowsToExport) {
        // Create folder name with dev- prefix for developer windows
        const baseName = toFolderName(window.name)
        const folderName = window.type === 'developer' ? `dev-${baseName}` : baseName

        // Generate files for this window
        const htmlContent = generateHTML(window.elements, {
          canvasWidth: window.width,
          canvasHeight: window.height,
          backgroundColor: window.backgroundColor,
          isPreviewMode: false,
        })

        const cssContent = await generateCSS(window.elements, {
          canvasWidth: window.width,
          canvasHeight: window.height,
          backgroundColor: window.backgroundColor,
        })

        const componentsJS = generateComponentsJS(window.elements)

        // Build window mapping for navigation (relative paths from this window's folder)
        const windowMapping: Record<string, string> = {}
        for (const [windowId, targetFolder] of Object.entries(windowFolderMap)) {
          if (windowId !== window.id) {
            windowMapping[windowId] = `../${targetFolder}/index.html`
          }
        }

        const bindingsJS = generateBindingsJS(window.elements, {
          isPreviewMode: false,
          windowMapping: Object.keys(windowMapping).length > 0 ? windowMapping : undefined,
        })

        // Add responsive scaling script if enabled
        const shouldIncludeResponsiveScaling = options.enableResponsiveScaling !== false
        const responsiveScaleJS = shouldIncludeResponsiveScaling
          ? generateResponsiveScaleJS(window.width, window.height)
          : ''

        const customScrollbarJS = generateCustomScrollbarJS()

        const bindingsWithScaling = [
          bindingsJS,
          responsiveScaleJS,
          customScrollbarJS
        ].filter(Boolean).join('\n\n')

        // Add files to folder
        const folder = zip.folder(folderName)!
        folder.file('index.html', htmlContent)
        folder.file('style.css', cssContent)
        folder.file('components.js', componentsJS)
        folder.file('bindings.js', bindingsWithScaling)

        // Bundle image assets for this window
        const imageAssets = collectImageAssets(window.elements)
        await bundleImageAssets(folder, imageAssets)
      }

      // Add root README
      const readme = generateMultiWindowREADME(windowsToExport, options.includeDeveloperWindows)
      zip.file('README.md', readme)

      // Generate ZIP blob
      const blob = await zip.generateAsync({ type: 'blob' })

      // Trigger download, starting from last export folder
      const filename = `${options.projectName || 'webview-ui'}-bundle.zip`
      const lastExportDir = await getDirectoryHandle(DIR_KEYS.EXPORT).catch(() => null)
      await fileSave(blob, {
        fileName: filename,
        extensions: ['.zip'],
        startIn: lastExportDir || 'downloads',
      })

      return { success: true, sizeSavings }
    } finally {
      restoreSVGs()
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: true }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during export',
    }
  }
}

/**
 * Generate README for single-window export (direct to folder)
 */
function generateSingleWindowREADME(window: WindowExportData): string {
  return `# VST3 WebView UI

Window: **${window.name}** (${window.width}x${window.height})

## Files

- \`index.html\` - Main HTML file to load in WebView
- \`style.css\` - Styles for all UI elements
- \`components.js\` - UI component implementations
- \`bindings.js\` - JUCE parameter bindings

## Integration

\`\`\`cpp
// In your JUCE editor component
File uiDir = File::getSpecialLocation(File::currentApplicationFile)
                 .getChildFile("Resources")
                 .getChildFile("ui");
webView->goToURL(uiDir.getChildFile("index.html").getFullPathName());
\`\`\`

## Generated by Faceplate

VST3 WebView UI Designer
`
}

/**
 * Generate README for multi-window export
 */
function generateMultiWindowREADME(
  windows: WindowExportData[],
  includedDevWindows?: boolean
): string {
  const devWindows = windows.filter(w => w.type === 'developer')

  const windowList = windows
    .map(w => {
      const folderName = w.type === 'developer'
        ? `dev-${toFolderName(w.name)}`
        : toFolderName(w.name)
      return `- **${w.name}** (${w.width}x${w.height}) - \`${folderName}/\``
    })
    .join('\n')

  return `# VST3 WebView UI Bundle

This bundle contains ${windows.length} window${windows.length > 1 ? 's' : ''} for your plugin UI.

## Windows

${windowList}

${devWindows.length > 0 && includedDevWindows ? `
### Developer Windows

Developer windows (prefixed with \`dev-\`) are for development/debugging purposes.
They should typically not be included in release builds.
` : ''}

## Integration

Each window folder contains:
- \`index.html\` - Main HTML file to load in WebView
- \`style.css\` - Styles for all UI elements
- \`components.js\` - UI component implementations
- \`bindings.js\` - JUCE parameter bindings

### Loading a Window

\`\`\`cpp
// In your JUCE editor component
void loadWindow(const String& windowFolder) {
    File uiDir = File::getSpecialLocation(File::currentApplicationFile)
                     .getChildFile("Resources")
                     .getChildFile(windowFolder);
    webView->goToURL(uiDir.getChildFile("index.html").getFullPathName());
}
\`\`\`

## Generated by Faceplate

VST3 WebView UI Designer
`
}

// ============================================================================
// Direct Folder Export (File System Access API)
// ============================================================================

/**
 * Helper function to write a file to a directory handle
 */
async function writeFileToDirectory(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string,
  content: string | Blob
): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(content)
  await writable.close()
}

/**
 * Export multi-window bundle directly to a folder (no ZIP)
 * Uses File System Access API to write files directly to user-selected directory
 *
 * @param windowsData - Array of windows to export
 * @param options - Export configuration
 * @returns Result with success status and folder name or error
 *
 * @example
 * const result = await exportMultiWindowToFolder(windowsData, {
 *   optimizeSVG: true,
 *   enableResponsiveScaling: true,
 *   includeDeveloperWindows: false
 * })
 *
 * if (result.success) {
 *   console.log(`Exported to ${result.folderName}/`)
 * } else {
 *   console.error(result.error)
 * }
 */
export async function exportMultiWindowToFolder(
  windowsData: WindowExportData[],
  options: MultiWindowExportOptions
): Promise<{ success: boolean; folderName?: string; error?: string }> {
  try {
    // Check for File System Access API support
    if (!('showDirectoryPicker' in window)) {
      return {
        success: false,
        error: 'Folder export requires a Chromium-based browser (Chrome, Edge, or Opera)',
      }
    }

    // Filter windows based on options
    const windowsToExport = options.includeDeveloperWindows
      ? windowsData
      : windowsData.filter(w => w.type === 'release')

    if (windowsToExport.length === 0) {
      return {
        success: false,
        error: 'No windows to export. Add at least one release window.',
      }
    }

    // Validate all windows
    for (const window of windowsToExport) {
      const validationResult = validateForExport(window.elements)
      if (!validationResult.valid && validationResult.errors.length > 0) {
        const errorMessages = validationResult.errors
          .map((err) => `• ${err.elementName}: ${err.message}`)
          .join('\n')
        return {
          success: false,
          error: `Window "${window.name}" has issues:\n\n${errorMessages}`,
        }
      }
    }

    // Show directory picker, starting from last used export folder if available
    let dirHandle: FileSystemDirectoryHandle
    try {
      // Try to get last used export directory
      const lastExportDir = await getDirectoryHandle(DIR_KEYS.EXPORT)

      dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: lastExportDir || 'documents',
      })

      // Remember this directory for next time
      await storeDirectoryHandle(DIR_KEYS.EXPORT, dirHandle)
    } catch (e) {
      // User cancelled the picker
      if (e instanceof Error && e.name === 'AbortError') {
        return { success: false, error: 'Export cancelled' }
      }
      throw e
    }

    // Collect all SVG assets across all windows
    const allElements = windowsToExport.flatMap(w => w.elements)
    const shouldOptimizeSVG = options.optimizeSVG !== false
    const svgAssets = collectSVGAssets(allElements)
    const { optimizedMap } = await optimizeSVGAssets(svgAssets, shouldOptimizeSVG)

    // Temporarily apply optimized SVGs
    const restoreSVGs = applyOptimizedSVGs(optimizedMap)

    try {
      // Check for single-window case - write directly to selected folder (no subfolder)
      const isSingleWindow = windowsToExport.length === 1

      if (isSingleWindow) {
        const window = windowsToExport[0]

        // Generate files for single window
        const htmlContent = generateHTML(window.elements, {
          canvasWidth: window.width,
          canvasHeight: window.height,
          backgroundColor: window.backgroundColor,
          isPreviewMode: false,
        })

        const cssContent = await generateCSS(window.elements, {
          canvasWidth: window.width,
          canvasHeight: window.height,
          backgroundColor: window.backgroundColor,
        })

        const componentsJS = generateComponentsJS(window.elements)

        // NO window mapping for single window (no navigation needed - nowhere to navigate to)
        const bindingsJS = generateBindingsJS(window.elements, {
          isPreviewMode: false,
          // No windowMapping - single window has no other windows to navigate to
        })

        // Add responsive scaling script if enabled
        const shouldIncludeResponsiveScaling = options.enableResponsiveScaling !== false
        const responsiveScaleJS = shouldIncludeResponsiveScaling
          ? generateResponsiveScaleJS(window.width, window.height)
          : ''

        const customScrollbarJS = generateCustomScrollbarJS()

        const bindingsWithScaling = [
          bindingsJS,
          responsiveScaleJS,
          customScrollbarJS
        ].filter(Boolean).join('\n\n')

        // Write files directly to selected folder (no subfolder)
        await writeFileToDirectory(dirHandle, 'index.html', htmlContent)
        await writeFileToDirectory(dirHandle, 'style.css', cssContent)
        await writeFileToDirectory(dirHandle, 'components.js', componentsJS)
        await writeFileToDirectory(dirHandle, 'bindings.js', bindingsWithScaling)

        // Write simple README for single window
        const readme = generateSingleWindowREADME(window)
        await writeFileToDirectory(dirHandle, 'README.md', readme)

        // Copy image assets directly to selected folder
        const imageAssets = collectImageAssets(window.elements)
        for (const asset of imageAssets) {
          try {
            const response = await fetch(asset.srcUrl)
            if (response.ok) {
              const blob = await response.blob()

              // Create nested directory structure if needed (e.g., assets/)
              const pathParts = asset.path.split('/')
              let currentDir: FileSystemDirectoryHandle = dirHandle

              // Navigate/create parent directories
              for (let i = 0; i < pathParts.length - 1; i++) {
                currentDir = await currentDir.getDirectoryHandle(pathParts[i], { create: true })
              }

              // Write the file in the final directory
              const fileName = pathParts[pathParts.length - 1]
              await writeFileToDirectory(currentDir, fileName, blob)
            }
          } catch (error) {
            console.error(`Failed to copy image asset: ${asset.path}`, error)
          }
        }

        return { success: true, folderName: dirHandle.name }
      }

      // Multi-window case: create subfolders per window

      // Build window ID to folder path mapping for navigation
      const windowFolderMap: Record<string, string> = {}
      for (const w of windowsToExport) {
        const baseName = toFolderName(w.name)
        const folderName = w.type === 'developer' ? `dev-${baseName}` : baseName
        windowFolderMap[w.id] = folderName
      }

      // Process each window
      for (const window of windowsToExport) {
        // Create folder name with dev- prefix for developer windows
        const baseName = toFolderName(window.name)
        const folderName = window.type === 'developer' ? `dev-${baseName}` : baseName

        // Create window directory
        const windowDir = await dirHandle.getDirectoryHandle(folderName, { create: true })

        // Generate files for this window
        const htmlContent = generateHTML(window.elements, {
          canvasWidth: window.width,
          canvasHeight: window.height,
          backgroundColor: window.backgroundColor,
          isPreviewMode: false,
        })

        const cssContent = await generateCSS(window.elements, {
          canvasWidth: window.width,
          canvasHeight: window.height,
          backgroundColor: window.backgroundColor,
        })

        const componentsJS = generateComponentsJS(window.elements)

        // Build window mapping for navigation (relative paths from this window's folder)
        const windowMapping: Record<string, string> = {}
        for (const [windowId, targetFolder] of Object.entries(windowFolderMap)) {
          if (windowId !== window.id) {
            windowMapping[windowId] = `../${targetFolder}/index.html`
          }
        }

        const bindingsJS = generateBindingsJS(window.elements, {
          isPreviewMode: false,
          windowMapping: Object.keys(windowMapping).length > 0 ? windowMapping : undefined,
        })

        // Add responsive scaling script if enabled
        const shouldIncludeResponsiveScaling = options.enableResponsiveScaling !== false
        const responsiveScaleJS = shouldIncludeResponsiveScaling
          ? generateResponsiveScaleJS(window.width, window.height)
          : ''

        const customScrollbarJS = generateCustomScrollbarJS()

        const bindingsWithScaling = [
          bindingsJS,
          responsiveScaleJS,
          customScrollbarJS
        ].filter(Boolean).join('\n\n')

        // Write files to directory
        await writeFileToDirectory(windowDir, 'index.html', htmlContent)
        await writeFileToDirectory(windowDir, 'style.css', cssContent)
        await writeFileToDirectory(windowDir, 'components.js', componentsJS)
        await writeFileToDirectory(windowDir, 'bindings.js', bindingsWithScaling)

        // Copy image assets for this window
        const imageAssets = collectImageAssets(window.elements)
        for (const asset of imageAssets) {
          try {
            const response = await fetch(asset.srcUrl)
            if (response.ok) {
              const blob = await response.blob()

              // Create nested directory structure if needed (e.g., assets/)
              const pathParts = asset.path.split('/')
              let currentDir = windowDir

              // Navigate/create parent directories
              for (let i = 0; i < pathParts.length - 1; i++) {
                currentDir = await currentDir.getDirectoryHandle(pathParts[i], { create: true })
              }

              // Write the file in the final directory
              const fileName = pathParts[pathParts.length - 1]
              await writeFileToDirectory(currentDir, fileName, blob)
            }
          } catch (error) {
            console.error(`Failed to copy image asset: ${asset.path}`, error)
          }
        }
      }

      // Write root README
      const readme = generateMultiWindowREADME(windowsToExport, options.includeDeveloperWindows)
      await writeFileToDirectory(dirHandle, 'README.md', readme)

      return { success: true, folderName: dirHandle.name }
    } finally {
      restoreSVGs()
    }
  } catch (error) {
    // User cancelled is not an error
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Export cancelled' }
    }

    // Permission denied
    if (error instanceof Error && error.name === 'NotAllowedError') {
      return {
        success: false,
        error: 'Permission denied. Please allow access to the selected folder.',
      }
    }

    // Other errors are failures
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during folder export',
    }
  }
}
