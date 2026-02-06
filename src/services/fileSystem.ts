/**
 * File system service for browser-based file operations
 * Uses browser-fs-access for progressive enhancement:
 * - Modern browsers: Native File System Access API
 * - Older browsers: Fallback to traditional download/upload
 */

import { fileSave, fileOpen } from 'browser-fs-access'
import { DIR_KEYS, getFileHandle, storeFileHandle } from './directoryStorage'

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

  // Try to get last used project file as starting point (opens in same folder)
  const lastProjectFile = await getFileHandle(DIR_KEYS.PROJECT_FILE).catch(() => null)

  const fileHandle = await fileSave(blob, {
    fileName: suggestedName || 'project.json',
    extensions: ['.json'],
    description: 'VST3 WebView UI Project',
    mimeTypes: ['application/json'],
    startIn: lastProjectFile || 'documents',
  } as any)

  // Store the file handle for next time (dialog will open in same folder)
  if (fileHandle) {
    await storeFileHandle(DIR_KEYS.PROJECT_FILE, fileHandle).catch(() => {})
  }
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
    // Try to get last used project file as starting point (opens in same folder)
    const lastProjectFile = await getFileHandle(DIR_KEYS.PROJECT_FILE).catch(() => null)

    const blob = await fileOpen({
      extensions: ['.json'],
      description: 'VST3 WebView UI Project',
      mimeTypes: ['application/json'],
      startIn: lastProjectFile || 'documents',
    } as any)

    // Read blob content as text
    const content = await blob.text()

    // Store the file handle for next time (dialog will open in same folder)
    // browser-fs-access adds a 'handle' property when File System Access API is available
    const fileHandle = (blob as any).handle as FileSystemFileHandle | undefined
    if (fileHandle) {
      await storeFileHandle(DIR_KEYS.PROJECT_FILE, fileHandle).catch(() => {})
    }

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
