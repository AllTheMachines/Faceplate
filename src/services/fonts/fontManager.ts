/**
 * Font manager orchestration service
 * Orchestrates font operations: directory selection, scanning, storage, and loading into document
 */

// Note: Using native File System Access API for directory handle
// browser-fs-access's directoryOpen returns files, not the handle
import {
  storeFont,
  getAllFonts,
  clearFonts,
  storeDirectoryHandle,
  getDirectoryHandle,
  clearDirectoryHandle,
  type StoredFont,
} from './fontStorage'
import { parseFontMetadata } from './fontParser'
import { scanFontsDirectory } from './fontScanner'
import { AVAILABLE_FONTS, type FontDefinition } from './fontRegistry'

/**
 * Font Manager singleton class
 * Orchestrates all font operations and manages the FontFace registry
 */
export class FontManager {
  private loadedFamilies: Set<string> = new Set()

  /**
   * Request directory selection via File System Access API
   * Stores the handle for future sessions
   */
  async selectFontsDirectory(): Promise<{ handle: FileSystemDirectoryHandle; path: string } | null> {
    try {
      // Use native File System Access API to get directory handle
      // @ts-ignore - showDirectoryPicker may not be in all type definitions
      const handle = await window.showDirectoryPicker({
        mode: 'read',
      } as any)

      // Store handle for persistence
      await storeDirectoryHandle(handle)

      return {
        handle,
        path: handle.name || 'Selected Folder',
      }
    } catch (error) {
      // User cancelled or error occurred
      console.warn('Directory selection cancelled or failed:', error)
      return null
    }
  }

  /**
   * Restore directory access from stored handle
   * Requests permission if needed
   */
  async restoreDirectoryAccess(): Promise<{ handle: FileSystemDirectoryHandle; path: string } | null> {
    try {
      const handle = await getDirectoryHandle()
      if (!handle) {
        return null
      }

      // Check current permission status
      // @ts-ignore - queryPermission may not be in type definitions
      const permission = await handle.queryPermission({ mode: 'read' })

      if (permission === 'granted') {
        return {
          handle,
          path: handle.name || 'Fonts Directory',
        }
      }

      // Need to request permission
      if (permission === 'prompt') {
        // @ts-ignore - requestPermission may not be in type definitions
        const requestedPermission = await handle.requestPermission({ mode: 'read' })
        if (requestedPermission === 'granted') {
          return {
            handle,
            path: handle.name || 'Fonts Directory',
          }
        }
      }

      // Permission denied - clear the stored handle
      await clearDirectoryHandle()
      return null
    } catch (error) {
      console.warn('Failed to restore directory access:', error)
      // Clear invalid handle
      await clearDirectoryHandle()
      return null
    }
  }

  /**
   * Scan directory and process fonts
   * Clears existing fonts, scans directory, parses and stores each font
   */
  async scanAndStoreFonts(
    dirHandle: FileSystemDirectoryHandle
  ): Promise<{ scanned: number; loaded: number; errors: string[] }> {
    const errors: string[] = []

    try {
      // Clear existing fonts
      await clearFonts()

      // Clear loaded FontFace objects
      this.clearLoadedFonts()

      // Scan directory for font files
      const files = await scanFontsDirectory(dirHandle)
      const scanned = files.length

      let loaded = 0

      // Process each font file
      for (const file of files) {
        try {
          // Parse metadata
          const metadata = await parseFontMetadata(file)

          if (!metadata) {
            errors.push(`Failed to parse: ${file.name}`)
            continue
          }

          // Read font data
          const arrayBuffer = await file.arrayBuffer()

          // Store in IndexedDB
          await storeFont({
            family: metadata.family,
            data: arrayBuffer,
            metadata,
            addedAt: Date.now(),
          })

          loaded++
        } catch (error) {
          errors.push(`Error processing ${file.name}: ${error}`)
        }
      }

      return { scanned, loaded, errors }
    } catch (error) {
      console.error('Failed to scan fonts:', error)
      return {
        scanned: 0,
        loaded: 0,
        errors: [`Scan failed: ${error}`],
      }
    }
  }

  /**
   * Load fonts into document.fonts for use in dropdowns and rendering
   * Only loads fonts not already loaded (prevents duplicates)
   */
  async loadFontsIntoDocument(fonts: StoredFont[]): Promise<void> {
    for (const font of fonts) {
      // Skip if already loaded
      if (this.loadedFamilies.has(font.family)) {
        continue
      }

      try {
        // Create FontFace object
        const fontFace = new FontFace(font.family, font.data, {
          display: 'swap',
        })

        // Load the font
        await fontFace.load()

        // Add to document.fonts
        document.fonts.add(fontFace)

        // Track as loaded
        this.loadedFamilies.add(font.family)
      } catch (error) {
        console.warn(`Failed to load font "${font.family}" into document:`, error)
      }
    }
  }

  /**
   * Clear loaded FontFace objects before rescan
   * Removes custom fonts from document.fonts
   */
  clearLoadedFonts(): void {
    // Convert Set to Array for iteration
    const families = Array.from(this.loadedFamilies)

    for (const family of families) {
      // Find and delete FontFace objects with this family
      const fontsArray = Array.from(document.fonts)
      for (const fontFace of fontsArray) {
        if (fontFace.family === family) {
          document.fonts.delete(fontFace)
        }
      }
    }

    // Clear the tracking set
    this.loadedFamilies.clear()
  }

  /**
   * Get combined list of built-in + custom fonts
   * Returns all available fonts for use in font family dropdowns
   */
  async getAvailableFonts(): Promise<FontDefinition[]> {
    // Start with built-in fonts
    const fonts = [...AVAILABLE_FONTS]

    try {
      // Get custom fonts from storage
      const customFonts = await getAllFonts()

      // Convert custom fonts to FontDefinition format
      for (const customFont of customFonts) {
        fonts.push({
          name: customFont.metadata.fullName || customFont.family,
          family: customFont.family,
          file: 'custom', // Marker for custom fonts
          category: 'sans-serif', // Default category for custom fonts
        })
      }
    } catch (error) {
      console.warn('Failed to load custom fonts:', error)
    }

    // Sort: built-in fonts first, then custom fonts alphabetically
    return fonts.sort((a, b) => {
      if (a.file === 'custom' && b.file !== 'custom') return 1
      if (a.file !== 'custom' && b.file === 'custom') return -1
      return a.name.localeCompare(b.name)
    })
  }
}

/**
 * Singleton instance
 */
export const fontManager = new FontManager()
