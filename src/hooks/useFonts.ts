import { useCallback } from 'react'
import { useStore } from '../store'
import { fontManager } from '../services/fonts/fontManager'
import { getAllFonts } from '../services/fonts/fontStorage'
import type { CustomFont } from '../store/fontsSlice'

export interface UseFontsReturn {
  // State from store
  customFonts: CustomFont[]
  fontsDirectoryPath: string | null
  fontsLoading: boolean
  fontsError: string | null
  lastScanTime: number | null

  // Actions
  selectDirectory: () => Promise<void>
  rescanDirectory: () => Promise<void>
  clearDirectory: () => Promise<void>
  restoreOnMount: () => Promise<void>
}

export function useFonts(): UseFontsReturn {
  const {
    customFonts,
    fontsDirectoryPath,
    fontsLoading,
    fontsError,
    lastScanTime,
    setCustomFonts,
    setFontsDirectoryPath,
    setFontsLoading,
    setFontsError,
    setLastScanTime,
    clearFontsState,
  } = useStore()

  // Convert StoredFont[] to CustomFont[] for UI
  const updateFontsFromStorage = useCallback(async () => {
    const storedFonts = await getAllFonts()

    // Group fonts by family to collect all weights
    const fontsByFamily = new Map<string, typeof storedFonts>()
    for (const font of storedFonts) {
      const existing = fontsByFamily.get(font.family) || []
      existing.push(font)
      fontsByFamily.set(font.family, existing)
    }

    // Convert to CustomFont with weight information
    const customFonts: CustomFont[] = Array.from(fontsByFamily.entries()).map(([family, fonts]) => {
      // Use first font for primary metadata
      const primaryFont = fonts[0]!

      // Collect all weights with their actual names
      const weights = fonts
        .filter(f => f.metadata.weight && f.metadata.subfamily)
        .map(f => ({
          value: f.metadata.weight!,
          actualName: f.metadata.subfamily!,
        }))
        // Remove duplicates and sort by weight
        .filter((w, idx, arr) => arr.findIndex(x => x.value === w.value) === idx)
        .sort((a, b) => a.value - b.value)

      return {
        family,
        name: primaryFont.metadata.fullName || primaryFont.metadata.family,
        format: primaryFont.metadata.format,
        category: 'custom' as const,
        weights: weights.length > 0 ? weights : undefined,
      }
    })

    setCustomFonts(customFonts)
  }, [setCustomFonts])

  const selectDirectory = useCallback(async () => {
    setFontsLoading(true)
    setFontsError(null)

    try {
      const result = await fontManager.selectFontsDirectory()
      if (!result) {
        setFontsLoading(false)
        return // User cancelled
      }

      setFontsDirectoryPath(result.path)

      // Scan and store fonts
      const scanResult = await fontManager.scanAndStoreFonts(result.handle)

      // Load fonts into document for preview
      const storedFonts = await getAllFonts()
      await fontManager.loadFontsIntoDocument(storedFonts)

      // Update state
      await updateFontsFromStorage()
      setLastScanTime(Date.now())

      if (scanResult.errors.length > 0) {
        setFontsError(`Loaded ${scanResult.loaded} fonts. ${scanResult.errors.length} files failed to parse.`)
      }
    } catch (error) {
      setFontsError(error instanceof Error ? error.message : 'Failed to select fonts directory')
    } finally {
      setFontsLoading(false)
    }
  }, [setFontsLoading, setFontsError, setFontsDirectoryPath, setLastScanTime, updateFontsFromStorage])

  const rescanDirectory = useCallback(async () => {
    setFontsLoading(true)
    setFontsError(null)

    try {
      const result = await fontManager.restoreDirectoryAccess()
      if (!result) {
        setFontsError('No fonts directory selected. Please select a folder first.')
        setFontsLoading(false)
        return
      }

      const scanResult = await fontManager.scanAndStoreFonts(result.handle)
      const storedFonts = await getAllFonts()
      await fontManager.loadFontsIntoDocument(storedFonts)
      await updateFontsFromStorage()
      setLastScanTime(Date.now())

      if (scanResult.errors.length > 0) {
        setFontsError(`Loaded ${scanResult.loaded} fonts. ${scanResult.errors.length} files failed to parse.`)
      }
    } catch (error) {
      setFontsError(error instanceof Error ? error.message : 'Failed to rescan fonts directory')
    } finally {
      setFontsLoading(false)
    }
  }, [setFontsLoading, setFontsError, setLastScanTime, updateFontsFromStorage])

  const clearDirectory = useCallback(async () => {
    await fontManager.clearLoadedFonts()
    await clearFontsState()
  }, [clearFontsState])

  const restoreOnMount = useCallback(async () => {
    setFontsLoading(true)
    try {
      // Try to restore from stored handle
      const result = await fontManager.restoreDirectoryAccess()
      if (result) {
        setFontsDirectoryPath(result.path)
      }

      // Load fonts from IndexedDB regardless of directory access
      const storedFonts = await getAllFonts()
      if (storedFonts.length > 0) {
        await fontManager.loadFontsIntoDocument(storedFonts)
        await updateFontsFromStorage()
      }
    } catch (error) {
      console.warn('Failed to restore fonts on mount:', error)
    } finally {
      setFontsLoading(false)
    }
  }, [setFontsLoading, setFontsDirectoryPath, updateFontsFromStorage])

  return {
    customFonts,
    fontsDirectoryPath,
    fontsLoading,
    fontsError,
    lastScanTime,
    selectDirectory,
    rescanDirectory,
    clearDirectory,
    restoreOnMount,
  }
}
