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
    const customFonts: CustomFont[] = storedFonts.map(f => ({
      family: f.family,
      name: f.metadata.fullName || f.metadata.family,
      format: f.metadata.format,
      category: 'custom' as const,
    }))
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
