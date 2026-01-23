/**
 * File system service for browser-based file operations
 * Uses browser-fs-access for progressive enhancement:
 * - Modern browsers: Native File System Access API
 * - Older browsers: Fallback to traditional download/upload
 */

import { fileSave, fileOpen } from 'browser-fs-access'

/**
 * Save project as .json file using browser save dialog
 * @param jsonContent - Serialized project JSON string
 * @param suggestedName - Suggested filename (default: 'project.json')
 * @throws Error if save fails (caller should handle)
 */
export async function saveProjectFile(
  jsonContent: string,
  suggestedName?: string
): Promise<void> {
  const blob = new Blob([jsonContent], { type: 'application/json' })

  await fileSave(blob, {
    fileName: suggestedName || 'project.json',
    extensions: ['.json'],
    description: 'VST3 WebView UI Project',
    mimeTypes: ['application/json'],
  })
}

/**
 * Load result discriminated union
 */
export type LoadResult =
  | {
      success: true
      content: string
      fileName: string
    }
  | {
      success: false
      error: string
    }

/**
 * Load project file using browser file picker
 * @returns LoadResult with success/error discriminated union
 */
export async function loadProjectFile(): Promise<LoadResult> {
  try {
    const blob = await fileOpen({
      extensions: ['.json'],
      description: 'VST3 WebView UI Project',
      mimeTypes: ['application/json'],
    })

    // Read blob content as text
    const content = await blob.text()

    return {
      success: true,
      content,
      fileName: blob.name,
    }
  } catch (error) {
    // User cancelled (AbortError)
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'File selection cancelled',
      }
    }

    // Other errors
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
