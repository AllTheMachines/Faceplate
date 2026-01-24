/**
 * Code generator orchestrator for VST3 WebView UI export
 * Coordinates all generators and produces ZIP bundles
 */

import JSZip from 'jszip'
import { fileSave } from 'browser-fs-access'
import type { ElementConfig } from '../../types/elements'
import { validateForExport } from './validators'
import { generateHTML } from './htmlGenerator'
import { generateCSS } from './cssGenerator'
import { generateBindingsJS, generateComponentsJS, generateMockJUCE } from './jsGenerator'
import { generateCPP } from './cppGenerator'

// ============================================================================
// Types
// ============================================================================

export interface ExportOptions {
  elements: ElementConfig[]
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  projectName?: string // Used for ZIP filename
}

export type ExportResult =
  | { success: true }
  | { success: false; error: string }

// ============================================================================
// JUCE Bundle Export
// ============================================================================

/**
 * Export complete JUCE WebView2 bundle
 * Generates 5-file ZIP: index.html, styles.css, components.js, bindings.js, bindings.cpp
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

    // Generate all files
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

    const cppContent = generateCPP(options.elements)

    // Create ZIP bundle
    const zip = new JSZip()
    zip.file('index.html', htmlContent)
    zip.file('styles.css', cssContent)
    zip.file('components.js', componentsJS)
    zip.file('bindings.js', bindingsJS)
    zip.file('bindings.cpp', cppContent)

    // Generate ZIP blob
    const blob = await zip.generateAsync({ type: 'blob' })

    // Trigger download using browser-fs-access
    const filename = `${options.projectName || 'webview-ui'}-juce.zip`
    await fileSave(blob, {
      fileName: filename,
      extensions: ['.zip'],
    })

    return { success: true }
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
 * Generates 4-file ZIP (no C++): index.html, styles.css, components.js, bindings.js with mock JUCE
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

    // Generate all files (preview mode)
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
    const bindingsWithMock = `${mockJUCE}\n\n${bindingsJS}`

    // Create ZIP bundle (4 files, no C++)
    const zip = new JSZip()
    zip.file('index.html', htmlContent)
    zip.file('styles.css', cssContent)
    zip.file('components.js', componentsJS)
    zip.file('bindings.js', bindingsWithMock)

    // Generate ZIP blob
    const blob = await zip.generateAsync({ type: 'blob' })

    // Trigger download using browser-fs-access
    const filename = `${options.projectName || 'webview-ui'}-preview.zip`
    await fileSave(blob, {
      fileName: filename,
      extensions: ['.zip'],
    })

    return { success: true }
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
